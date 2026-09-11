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

    if (response.status === 204) return null
    const text = await response.text()
    return text ? JSON.parse(text) : null
}

export function getAssets({search = '', status = '', category = '', page = 0} = {}, signal) {
    const params = new URLSearchParams({page: String(page), size: '8'})
    for (const [key, value] of Object.entries({search, status, category})) {
        if (value.trim()) params.set(key, value.trim())
    }
    return request(`/assets?${params}`, {signal})
}

// The Users API requires a role; all authenticated users may read these lists.
// Keep successful lookups when another role's request fails.
export async function getAssetUserNames(signal) {
    const results = await Promise.allSettled(
        ['ADMIN', 'MANAGER', 'EMPLOYEE', 'IT_SUPPORT'].map((role) => request(`/users?role=${role}`, {signal}))
    )
    const unauthorized = results.find((result) => result.status === 'rejected' && result.reason.status === 401)
    if (unauthorized) throw unauthorized.reason
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    return {
        names: Object.fromEntries(results.flatMap((result) =>
            result.status === 'fulfilled' ? result.value.map((user) => [user.id, user.name]) : []
        )),
        failed: results.some((result) => result.status === 'rejected'),
        denied: results.some((result) => result.status === 'rejected' && result.reason.status === 403),
    }
}

export function getAsset(id, signal) {
    return request(`/assets/${encodeURIComponent(id)}`, {signal})
}

export function createAsset({name, category, serialNumber, purchaseDate}) {
    return request('/assets', {method: 'POST', body: {name, category, serialNumber, purchaseDate}})
}

export function updateAsset(id, {name, category, purchaseDate}) {
    return request(`/assets/${encodeURIComponent(id)}`, {method: 'PUT', body: {name, category, purchaseDate}})
}

export function deleteAsset(id) {
    return request(`/assets/${encodeURIComponent(id)}`, {method: 'DELETE'})
}
