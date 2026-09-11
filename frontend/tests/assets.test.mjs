import {afterEach, test} from 'node:test'
import assert from 'node:assert/strict'
import {assetPermissions, availablePage, deletionRestriction, validateAsset, assetErrorMessage} from '../src/components/assets/assetUtils.js'
import {createAsset, updateAsset, deleteAsset, getAsset, getAssets, getAssetUserNames} from '../src/services/assetService.js'

const originalFetch = globalThis.fetch
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
afterEach(() => {
    globalThis.fetch = originalFetch
    if (originalStorage) Object.defineProperty(globalThis, 'sessionStorage', originalStorage)
    else delete globalThis.sessionStorage
})
function mockFetch(handler) {
    Object.defineProperty(globalThis, 'sessionStorage', {configurable: true, value: {getItem: () => 'test-token'}})
    globalThis.fetch = handler
}
const jwt = (roles) => `header.${Buffer.from(JSON.stringify({roles})).toString('base64url')}.signature`
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json'}})

test('UI permissions match controller role claims; malformed claims fail closed', () => {
    assert.deepEqual(assetPermissions(jwt(['MANAGER'])), {create: true, edit: true, delete: true, view: true})
    assert.deepEqual(assetPermissions(jwt(['ADMIN'])), {create: false, edit: true, delete: false, view: true})
    for (const role of ['IT_SUPPORT', 'EMPLOYEE']) assert.deepEqual(assetPermissions(jwt([role])), {create: false, edit: false, delete: false, view: true})
    for (const token of [null, '', 'bad.token', jwt('MANAGER'), jwt(['ROLE_MANAGER']), jwt([])]) {
        assert.deepEqual(assetPermissions(token), {create: false, edit: false, delete: false, view: false})
    }
})

test('page recovery handles deleting the final row on any page, including the only asset', () => {
    assert.equal(availablePage(2, 2), 1)
    assert.equal(availablePage(1, 0), 0)
    assert.equal(availablePage(0, 0), 0)
    assert.equal(availablePage(1, 4), 1)
})

test('validation matches required fields, length limits, optional date, and immutable serial on edit', () => {
    const valid = {name: 'Asset', category: 'Any free text', serialNumber: 'SERIAL', purchaseDate: ''}
    assert.deepEqual(validateAsset(valid, true), {})
    assert.deepEqual(validateAsset({...valid, serialNumber: ''}, false), {})
    assert.deepEqual(Object.keys(validateAsset({...valid, name: '  ', category: 'x'.repeat(101), serialNumber: '', purchaseDate: '2027-01-01'}, true, '2026-09-11')), ['name', 'category', 'serialNumber', 'purchaseDate'])
    assert.deepEqual(validateAsset({...valid, purchaseDate: '2026-09-11'}, true, '2026-09-11'), {})
})

test('deletion restrictions and missing/denied/conflict messages remain explicit', () => {
    for (const status of ['ASSIGNED', 'UNDER_MAINTENANCE']) assert.ok(deletionRestriction({status}))
    for (const status of ['AVAILABLE', 'DAMAGED']) assert.equal(deletionRestriction({status}), '')
    assert.match(assetErrorMessage({status: 403}), /Access denied/)
    assert.match(assetErrorMessage({status: 404}), /no longer exists/)
    assert.equal(assetErrorMessage({status: 409, message: 'Assigned asset cannot be deleted'}), 'Assigned asset cannot be deleted')
})

test('list sends encoded server filters, page size 8, Bearer token and cancellation signal', async () => {
    const signal = new AbortController().signal
    const data = {content: [], page: {number: 2, size: 8, totalElements: 20, totalPages: 3}}
    mockFetch(async (url, options) => {
        const params = new URL(url).searchParams
        assert.equal(params.get('search'), 'Dell & HP')
        assert.equal(params.get('category'), 'Office / AC')
        assert.equal(params.get('status'), 'DAMAGED')
        assert.equal(params.get('page'), '2')
        assert.equal(params.get('size'), '8')
        assert.equal(options.headers.Authorization, 'Bearer test-token')
        assert.equal(options.signal, signal)
        return json(data)
    })
    assert.deepEqual(await getAssets({search: ' Dell & HP ', category: 'Office / AC', status: 'DAMAGED', page: 2}, signal), data)
})

test('create/update send only allowed DTO fields; delete accepts 204 and empty 200', async () => {
    const calls = []
    mockFetch(async (url, options) => {
        calls.push({url, ...options})
        return options.method === 'DELETE' ? new Response(null, {status: 204}) : json({id: 1})
    })
    const values = {name: 'Asset', category: 'Category', serialNumber: 'TEST', purchaseDate: null, status: 'ASSIGNED', currentUserId: 7}
    await createAsset(values)
    await updateAsset(1, values)
    assert.equal(await deleteAsset(1), null)
    assert.deepEqual(JSON.parse(calls[0].body), {name: 'Asset', category: 'Category', serialNumber: 'TEST', purchaseDate: null})
    assert.equal(calls[0].method, 'POST')
    assert.equal(calls[0].headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(calls[1].body), {name: 'Asset', category: 'Category', purchaseDate: null})
    assert.equal(calls[1].method, 'PUT')
    assert.equal(calls[2].method, 'DELETE')
    assert.equal(calls[2].body, undefined)
    mockFetch(async () => new Response(null, {status: 200}))
    assert.equal(await deleteAsset(1), null)
})

test('mutation errors preserve validation fields, duplicate serial, conflicts and HTTP status', async () => {
    for (const status of [400, 401, 403, 404, 409, 500]) {
        mockFetch(async () => json({message: 'Failure', fieldErrors: {name: 'Name is required'}}, status))
        for (const call of [() => createAsset({}), () => updateAsset(1, {}), () => deleteAsset(1)]) {
            await assert.rejects(call(), (error) => error.status === status && error.fieldErrors.name === 'Name is required')
        }
    }
    mockFetch(async () => json({message: 'Serial number already exists'}, 409))
    await assert.rejects(createAsset({}), (error) => error.status === 409 && error.message === 'Serial number already exists')
    mockFetch(async () => new Response('', {status: 403}))
    await assert.rejects(getAsset(1), (error) => error.status === 403)
})

test('partial user lookup preserves successful names and 401 remains session expiry', async () => {
    mockFetch(async (url) => new URL(url).searchParams.get('role') === 'EMPLOYEE' ? json({}, 403) : json([{id: 1, name: 'Manager'}]))
    assert.deepEqual(await getAssetUserNames(), {names: {1: 'Manager'}, failed: true, denied: true})
    mockFetch(async () => json({}, 401))
    await assert.rejects(getAssetUserNames(), (error) => error.status === 401)
})

test('aborted reads do not return results', async () => {
    const controller = new AbortController()
    controller.abort()
    mockFetch(async (_url, {signal}) => {signal.throwIfAborted()})
    await assert.rejects(getAssets({}, controller.signal), {name: 'AbortError'})
    await assert.rejects(getAsset(1, controller.signal), {name: 'AbortError'})
    await assert.rejects(getAssetUserNames(controller.signal), {name: 'AbortError'})
})
