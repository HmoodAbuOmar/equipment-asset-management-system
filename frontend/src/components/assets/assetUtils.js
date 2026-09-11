// Decoding controls presentation only. The backend verifies the JWT and permissions.
export function assetPermissions(token) {
    let roles = []
    try {
        const payload = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
        const claims = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')))
        if (Array.isArray(claims.roles)) roles = claims.roles
    } catch { /* Missing or malformed claims grant no UI actions. */ }
    return {
        create: roles.includes('MANAGER'),
        edit: roles.some((role) => ['MANAGER', 'ADMIN'].includes(role)),
        delete: roles.includes('MANAGER'),
        view: roles.some((role) => ['MANAGER', 'ADMIN', 'IT_SUPPORT', 'EMPLOYEE'].includes(role)),
    }
}

export function availablePage(requested, totalPages) {
    return Math.max(0, Math.min(requested, totalPages - 1))
}

export function deletionRestriction(asset) {
    if (asset.status === 'ASSIGNED') return 'Assigned assets cannot be deleted. Return the asset before deleting it.'
    if (asset.status === 'UNDER_MAINTENANCE') return 'Assets under maintenance cannot be deleted. Complete maintenance before deleting the asset.'
    return ''
}

export function todayDate() {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function validateAsset(values, creating, today = todayDate()) {
    const errors = {}
    for (const [field, label] of Object.entries({name: 'Name', category: 'Category', ...(creating ? {serialNumber: 'Serial number'} : {})})) {
        if (!values[field]?.trim()) errors[field] = `${label} is required.`
        else if (values[field].length > 100) errors[field] = `${label} must not exceed 100 characters.`
    }
    if (values.purchaseDate && values.purchaseDate > today) errors.purchaseDate = 'Purchase date must not be in the future.'
    return errors
}

export function assetErrorMessage(error, mutation = false) {
    if (error.status === 403) return 'Access denied. You do not have permission to perform this action.'
    if (error.status === 404) return 'This asset no longer exists. Close this dialog and refresh the list.'
    if (error.status === 400) return 'Please check the fields below and try again.'
    if (error.status === 409) return error.message || 'This action conflicts with the asset’s current state.'
    return mutation
        ? 'Unable to confirm the change. Check the asset list before retrying, as the server may have received the request.'
        : 'Unable to load asset details. Please try again.'
}
