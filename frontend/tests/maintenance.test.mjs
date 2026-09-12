import {afterEach, test} from 'node:test'
import assert from 'node:assert/strict'
import {maintenanceIdentity, maintenanceErrorMessage} from '../src/components/maintenance/maintenanceUtils.js'
import {createMaintenanceRequest, getMaintenanceRequests, getMaintenanceNames, getReportableAssets, startMaintenanceRequest, resolveMaintenanceRequest} from '../src/services/maintenanceService.js'

const originalFetch = globalThis.fetch
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
afterEach(() => {
    globalThis.fetch = originalFetch
    if (originalStorage) Object.defineProperty(globalThis, 'sessionStorage', originalStorage)
    else delete globalThis.sessionStorage
})
const jwt = (roles, sub = 'employee@example.com') => 'header.' + Buffer.from(JSON.stringify({roles, sub})).toString('base64url') + '.signature'
const json = (body, status = 200) => new Response(JSON.stringify(body), {status})
function mockFetch(handler) {
    Object.defineProperty(globalThis, 'sessionStorage', {configurable: true, value: {getItem: () => 'test-token'}})
    globalThis.fetch = handler
}

test('maintenance role matrix matches controller, including admin without IT actions', () => {
    for (const [role, view, create, manage, employee] of [
        ['ADMIN', true, true, false, false],
        ['MANAGER', true, false, false, false],
        ['IT_SUPPORT', true, false, true, false],
        ['EMPLOYEE', false, true, false, true],
    ]) {
        assert.deepEqual(maintenanceIdentity(jwt([role])), {email: 'employee@example.com', view, create, manage, employee})
    }
    for (const token of [null, '', 'bad.token', jwt('ADMIN'), jwt(['ROLE_ADMIN'])]) {
        const identity = maintenanceIdentity(token)
        assert.equal(identity.view || identity.create || identity.manage, false)
    }
    assert.equal(maintenanceIdentity(jwt(['EMPLOYEE'], ' Émployee@EXAMPLE.com ')).email, 'émployee@example.com')
})

test('list uses actual pageable parameters, JWT, cancellation, and normalizes Page or PagedModel', async () => {
    const page = {number: 2, size: 8, totalPages: 3, totalElements: 19}
    const signal = new AbortController().signal
    for (const body of [{content: [], ...page}, {content: [], page}]) {
        mockFetch(async (url, options) => {
            assert.equal(new URL(url).pathname, '/api/maintenance-requests')
            assert.deepEqual(Object.fromEntries(new URL(url).searchParams), {page: '2', size: '8', sort: 'requestDate,desc'})
            assert.equal(options.headers.Authorization, 'Bearer test-token')
            assert.equal(options.signal, signal)
            return json(body)
        })
        assert.deepEqual(await getMaintenanceRequests({page: 2}, signal), {content: [], page})
    }
})

test('mutations send exact DTO fields and PUT actions, including both resolution outcomes', async () => {
    const calls = []
    mockFetch(async (url, options) => {
        calls.push({url, ...options})
        return json({id: 4, status: 'OPEN'})
    })
    await createMaintenanceRequest({assetId: 7, issueDescription: ' Screen flickers ', reportedById: 99})
    await startMaintenanceRequest(4)
    await resolveMaintenanceRequest(4, false)
    await resolveMaintenanceRequest(4, true)
    assert.equal(calls[0].method, 'POST')
    assert.deepEqual(JSON.parse(calls[0].body), {assetId: 7, issueDescription: 'Screen flickers'})
    assert.match(calls[1].url, /maintenance-requests\/4\/start$/)
    assert.equal(calls[1].body, undefined)
    for (const call of calls.slice(1)) assert.equal(call.method, 'PUT')
    for (const [index, damaged] of [[2, false], [3, true]]) {
        assert.match(calls[index].url, /maintenance-requests\/4\/resolve$/)
        assert.deepEqual(JSON.parse(calls[index].body), {damaged})
        assert.equal(calls[index].headers['Content-Type'], 'application/json')
    }
})

test('employee selection resolves email to ID and pages only their assigned assets', async () => {
    const paths = []
    mockFetch(async (url) => {
        paths.push(new URL(url).pathname + new URL(url).search)
        if (url.endsWith('/users?role=EMPLOYEE')) return json([{id: 9, email: 'EMPLOYEE@example.com'}])
        return json({content: [{id: 42}], number: 1, size: 8, totalPages: 2, totalElements: 9})
    })
    const data = await getReportableAssets(maintenanceIdentity(jwt(['EMPLOYEE'])), 1)
    assert.deepEqual(paths, ['/api/users?role=EMPLOYEE', '/api/users/9/assets?page=1&size=8'])
    assert.equal(data.page.number, 1)
    assert.deepEqual(data.content, [{id: 42}])
})

test('admin selection uses paginated assets and missing employee never falls back to all assets', async () => {
    mockFetch(async (url) => {
        assert.match(url, /\/assets\?page=3&size=8$/)
        return json({content: [], page: {number: 3}})
    })
    await getReportableAssets(maintenanceIdentity(jwt(['ADMIN'])), 3)
    mockFetch(async (url) => {
        assert.match(url, /\/users\?role=EMPLOYEE$/)
        return json([])
    })
    await assert.rejects(getReportableAssets(maintenanceIdentity(jwt(['EMPLOYEE'])), 0), /employee could not be found/)
})

test('name failures preserve requests and successful names; repeated assets load once', async () => {
    let assetCalls = 0
    mockFetch(async (url) => {
        if (url.endsWith('/assets/7')) { assetCalls++; return json({name: 'Laptop'}) }
        if (url.endsWith('/assets/8')) return json({}, 404)
        if (url.endsWith('role=IT_SUPPORT')) return json({}, 403)
        return json([{id: 9, name: 'Reporter'}])
    })
    const names = await getMaintenanceNames([{assetId: 7}, {assetId: 7}, {assetId: 8}])
    assert.equal(assetCalls, 1)
    assert.deepEqual(names.assets, {7: 'Laptop'})
    assert.equal(names.users[9], 'Reporter')
    assert.equal(names.failed, true)
})

test('401 lookup errors propagate for session expiry, validation details survive, and unknown writes are not claimed failed', async () => {
    mockFetch(async () => json({}, 401))
    await assert.rejects(getMaintenanceNames([{assetId: 7}]), (error) => error.status === 401)
    mockFetch(async () => json({message: 'Validation failed', fieldErrors: {issueDescription: 'must not be blank'}}, 400))
    await assert.rejects(createMaintenanceRequest({assetId: 7, issueDescription: ''}), (error) => error.status === 400 && error.fieldErrors.issueDescription === 'must not be blank')
    assert.match(maintenanceErrorMessage({status: 403}), /Access denied/)
    assert.match(maintenanceErrorMessage({status: 500}, true), /Unable to confirm/)
})
