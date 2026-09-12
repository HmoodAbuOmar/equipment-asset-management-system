import {afterEach, test} from 'node:test'
import assert from 'node:assert/strict'
import {assignmentErrorMessage, assignmentPermissions} from '../src/components/assignments/assignmentUtils.js'
import {createAssignment, getAssignmentEmployees, getAssignments, getAvailableAssets, returnAssignment} from '../src/services/assignmentService.js'

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

test('assignment list sends server-side search, status, pagination and authorization', async () => {
    const signal = new AbortController().signal
    const data = {content: [], page: {number: 2, size: 8, totalElements: 20, totalPages: 3}}
    mockFetch(async (url, options) => {
        const params = new URL(url).searchParams
        assert.equal(params.get('search'), 'Dell & HP')
        assert.equal(params.get('status'), 'ACTIVE')
        assert.equal(params.get('page'), '2')
        assert.equal(params.get('size'), '8')
        assert.equal(options.headers.Authorization, 'Bearer test-token')
        assert.equal(options.signal, signal)
        return json(data)
    })
    assert.deepEqual(await getAssignments({search: ' Dell & HP ', status: 'ACTIVE', page: 2}, signal), data)
})

test('assignment mutations and dialog lookups use the assignment and existing selection APIs', async () => {
    const calls = []
    mockFetch(async (url, options) => {
        calls.push({url, ...options})
        return json({id: 1})
    })
    await createAssignment({assetId: 4, userId: 9})
    await returnAssignment(3)
    await getAvailableAssets()
    await getAssignmentEmployees()
    assert.deepEqual(JSON.parse(calls[0].body), {assetId: 4, userId: 9})
    assert.equal(calls[0].method, 'POST')
    assert.equal(calls[1].method, 'PUT')
    assert.match(calls[1].url, /\/assignments\/3\/return$/)
    assert.match(calls[2].url, /\/assets\?status=AVAILABLE&page=0&size=100$/)
    assert.match(calls[3].url, /\/users\?role=EMPLOYEE$/)
})

test('assignment permissions fail closed and errors retain API conflict messages', async () => {
    assert.deepEqual(assignmentPermissions(jwt(['ADMIN'])), {view: true, manage: true})
    assert.deepEqual(assignmentPermissions(jwt(['MANAGER'])), {view: true, manage: false})
    assert.deepEqual(assignmentPermissions(jwt(['EMPLOYEE'])), {view: false, manage: false})
    assert.deepEqual(assignmentPermissions('malformed'), {view: false, manage: false})
    assert.equal(assignmentErrorMessage({status: 409, message: 'Asset is not available for assignment'}, true), 'Asset is not available for assignment')
    mockFetch(async () => json({message: 'Asset ID is required', fieldErrors: {assetId: 'Asset ID is required'}}, 400))
    await assert.rejects(createAssignment({}), (error) => error.status === 400 && error.fieldErrors.assetId === 'Asset ID is required')
})
