import {request} from './apiClient.js'
import {normalizePage} from '../components/maintenance/maintenanceUtils.js'

export function getUsersByRole(role, signal) {
    return request(`/users?${new URLSearchParams({role})}`, {signal})
}

export function createUser({name, email, password, role}) {
    return request('/users', {method: 'POST', body: {name: name.trim(), email: email.trim(), password, role}})
}

export async function getUserAssets(id, page = 0, signal) {
    const params = new URLSearchParams({page: String(page), size: '8', sort: 'assignedAt,desc'})
    return normalizePage(await request(`/users/${encodeURIComponent(id)}/assets?${params}`, {signal}))
}
