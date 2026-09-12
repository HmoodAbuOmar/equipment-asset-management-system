const API_BASE_URL = 'http://localhost:8080/api'

async function request(path, {signal, method = 'GET', body} = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            ...(body ? {'Content-Type': 'application/json'} : {}),
        },
        ...(body ? {body: JSON.stringify(body)} : {}),
        signal,
    })

    if (!response.ok) {
        const details = await response.json().catch(() => null)
        const error = new Error(details?.message || 'The request could not be completed')
        error.fieldErrors = details?.fieldErrors ?? {}
        error.status = response.status
        throw error
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
}

export function getAssignments({search = '', status = '', page = 0} = {}, signal) {
    const params = new URLSearchParams({page: String(page), size: '8'})
    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('status', status)
    return request(`/assignments?${params}`, {signal})
}

export function createAssignment({assetId, userId}) {
    return request('/assignments', {method: 'POST', body: {assetId, userId}})
}

export function returnAssignment(id) {
    return request(`/assignments/${encodeURIComponent(id)}/return`, {method: 'PUT'})
}

export function getAvailableAssets(signal) {
    return request('/assets?status=AVAILABLE&page=0&size=100', {signal})
}

export function getAssignmentEmployees(signal) {
    return request('/users?role=EMPLOYEE', {signal})
}
