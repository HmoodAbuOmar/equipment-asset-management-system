import {request} from './apiClient.js'
import {getAsset, getAssets, getAssetUserNames} from './assetService.js'
import {normalizePage} from '../components/maintenance/maintenanceUtils.js'

export async function getMaintenanceRequests({page = 0} = {}, signal) {
    const params = new URLSearchParams({page: String(page), size: '8', sort: 'requestDate,desc'})
    return normalizePage(await request(`/maintenance-requests?${params}`, {signal}))
}

export function createMaintenanceRequest({assetId, issueDescription}) {
    return request('/maintenance-requests', {method: 'POST', body: {assetId, issueDescription: issueDescription.trim()}})
}

export function startMaintenanceRequest(id) {
    return request(`/maintenance-requests/${encodeURIComponent(id)}/start`, {method: 'PUT'})
}

export function resolveMaintenanceRequest(id, damaged) {
    return request(`/maintenance-requests/${encodeURIComponent(id)}/resolve`, {method: 'PUT', body: {damaged}})
}

export async function getReportableAssets(identity, page, signal) {
    if (!identity.employee) return getAssets({page}, signal)
    // JWT subject is email, not a user ID; there is no /me endpoint.
    const users = await request('/users?role=EMPLOYEE', {signal})
    const user = users.find((user) => user.email.trim().toLowerCase() === identity.email)
    if (!user) throw new Error('Current employee could not be found')
    return normalizePage(await request(`/users/${user.id}/assets?page=${page}&size=8`, {signal}))
}

export async function getMaintenanceNames(requests, signal) {
    const ids = [...new Set(requests.map((item) => item.assetId))]
    const results = await Promise.allSettled([
        getAssetUserNames(signal),
        ...ids.map((id) => getAsset(id, signal)),
    ])
    const unauthorized = results.find((result) => result.status === 'rejected' && result.reason.status === 401)
    if (unauthorized) throw unauthorized.reason
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const users = results[0].status === 'fulfilled' ? results[0].value : {names: {}, failed: true}
    return {
        users: users.names,
        assets: Object.fromEntries(results.slice(1).flatMap((result, index) => result.status === 'fulfilled' ? [[ids[index], result.value.name]] : [])),
        failed: users.failed || results.some((result) => result.status === 'rejected'),
    }
}
