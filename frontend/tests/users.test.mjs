import {afterEach, test} from 'node:test'
import assert from 'node:assert/strict'
import {userRoles, userIdentity, canViewUserAssets, validateUser, userErrorMessage} from '../src/components/users/userUtils.js'
import {getUsersByRole, createUser, getUserAssets} from '../src/services/userService.js'

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
const jwt = (roles, sub = 'employee@example.com') => `header.${Buffer.from(JSON.stringify({roles, sub})).toString('base64url')}.signature`
const json = (body, status = 200) => new Response(JSON.stringify(body), {status})
const valid = {name: 'New User', email: 'new@example.com', password: 'password123', role: 'EMPLOYEE'}

test('creation and asset permissions match all roles, including mixed employee roles', () => {
    for (const role of userRoles) {
        const identity = userIdentity(jwt([role]))
        assert.equal(identity.create, ['MANAGER', 'ADMIN'].includes(role))
        assert.equal(canViewUserAssets(identity, {email: 'EMPLOYEE@example.com'}), true)
        assert.equal(canViewUserAssets(identity, {email: 'other@example.com'}), role !== 'EMPLOYEE')
    }
    assert.equal(canViewUserAssets(userIdentity(jwt(['EMPLOYEE', 'ADMIN'])), {email: 'other@example.com'}), false)
    assert.equal(canViewUserAssets(userIdentity(jwt(['EMPLOYEE'], '')), {email: ''}), false)
    assert.equal(userIdentity(jwt(['EMPLOYEE'], 'Émployee@example.com')).email, 'émployee@example.com')
    for (const token of [null, '', 'bad.token', jwt('ADMIN'), jwt(['ROLE_ADMIN'])]) {
        assert.equal(userIdentity(token).create, false)
        assert.equal(canViewUserAssets(userIdentity(token), {email: 'employee@example.com'}), false)
    }
})

test('role filtering uses exact GET query, list response, JWT and cancellation', async () => {
    const signal = new AbortController().signal
    for (const role of userRoles) {
        const users = [{id: 1, name: 'User', email: 'user@example.com', role}]
        mockFetch(async (url, options) => {
            assert.equal(url, `http://localhost:8080/api/users?role=${role}`)
            assert.equal(options.method, 'GET')
            assert.equal(options.headers.Authorization, 'Bearer test-token')
            assert.equal(options.signal, signal)
            return json(users)
        })
        assert.deepEqual(await getUsersByRole(role, signal), users)
    }
    mockFetch(async () => json([]))
    assert.deepEqual(await getUsersByRole('ADMIN'), [])
})

test('create sends only DTO fields, preserves password and returns role for refresh', async () => {
    for (const role of userRoles) {
        mockFetch(async (url, options) => {
            assert.equal(url, 'http://localhost:8080/api/users')
            assert.equal(options.method, 'POST')
            assert.equal(options.headers['Content-Type'], 'application/json')
            assert.deepEqual(JSON.parse(options.body), {...valid, password: ' password123 ', role})
            return json({id: 4, name: valid.name, email: valid.email, role}, 201)
        })
        const saved = await createUser({...valid, name: ' New User ', email: ' new@example.com ', password: ' password123 ', role, id: 99})
        assert.equal(saved.id, 4)
        assert.equal(saved.role, role)
    }
})

test('validation covers required fields, DTO boundaries and role selection', () => {
    assert.deepEqual(validateUser(valid), {})
    assert.deepEqual(Object.keys(validateUser({name: ' ', email: '', password: ' ', role: 'OWNER'})), ['name', 'email', 'password', 'role'])
    for (const [field, value] of [['name', 'n'.repeat(101)], ['email', 'invalid'], ['email', 'x'.repeat(250) + '@example.com'], ['password', '1234567'], ['password', 'x'.repeat(73)]]) assert.ok(validateUser({...valid, [field]: value})[field])
    for (const role of userRoles) assert.deepEqual(validateUser({...valid, role, name: 'n'.repeat(100), password: 'x'.repeat(72)}), {})
    assert.deepEqual(validateUser({...valid, password: '12345678'}), {})
})

test('assets use existing paginated endpoint and normalize Page and PagedModel', async () => {
    const content = [{id: 5, name: 'Laptop', category: 'IT', serialNumber: 'ABC', status: 'ASSIGNED', purchaseDate: '2026-01-01', currentUserId: 3}]
    const page = {number: 1, size: 8, totalPages: 2, totalElements: 9}
    const signal = new AbortController().signal
    for (const data of [{content, ...page}, {content, page}]) {
        mockFetch(async (url, options) => {
            assert.equal(new URL(url).pathname, '/api/users/3/assets')
            assert.deepEqual(Object.fromEntries(new URL(url).searchParams), {page: '1', size: '8', sort: 'assignedAt,desc'})
            assert.equal(options.method, 'GET')
            assert.equal(options.signal, signal)
            return json(data)
        })
        assert.deepEqual(await getUserAssets(3, 1, signal), {content, page})
    }
    mockFetch(async () => json({content: [], number: 0, size: 8, totalPages: 0, totalElements: 0}))
    assert.equal((await getUserAssets(3)).page.totalElements, 0)
})

test('validation errors, duplicate email, session expiry and access denial propagate', async () => {
    for (const status of [400, 401, 403, 404, 409, 500]) {
        mockFetch(async () => json({message: 'Email already exists', fieldErrors: {email: 'Invalid email'}}, status))
        for (const call of [() => createUser(valid), () => getUsersByRole('ADMIN'), () => getUserAssets(1)]) {
            await assert.rejects(call(), (error) => error.status === status && error.message === 'Email already exists' && error.fieldErrors.email === 'Invalid email')
        }
    }
    assert.equal(userErrorMessage({status: 409, message: 'Email already exists'}, true), 'Email already exists')
    assert.match(userErrorMessage({status: 403}), /Access denied/)
    assert.match(userErrorMessage({status: 500}, true), /Unable to confirm creation/)
    mockFetch(async () => new Response('', {status: 403}))
    await assert.rejects(getUsersByRole('ADMIN'), (error) => error.status === 403)
})

test('cancelled list and asset reads propagate AbortError', async () => {
    const controller = new AbortController()
    controller.abort()
    mockFetch(async (_url, {signal}) => signal.throwIfAborted())
    await assert.rejects(getUsersByRole('EMPLOYEE', controller.signal), {name: 'AbortError'})
    await assert.rejects(getUserAssets(1, 0, controller.signal), {name: 'AbortError'})
})
