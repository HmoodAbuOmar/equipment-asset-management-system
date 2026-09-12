import {request} from './apiClient.js'

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
