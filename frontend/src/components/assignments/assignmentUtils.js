export function assignmentPermissions(token) {
    let roles = []
    try {
        const payload = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
        const claims = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')))
        if (Array.isArray(claims.roles)) roles = claims.roles
    } catch { /* Missing or malformed claims grant no UI actions. */ }
    return {view: roles.some((role) => ['MANAGER', 'ADMIN'].includes(role)), manage: roles.includes('ADMIN')}
}

export function assignmentErrorMessage(error, mutation = false) {
    if (error.status === 403) return 'Access denied. You do not have permission to perform this action.'
    if (error.status === 404) return mutation ? 'This assignment is no longer active. Refresh the list and try again.' : 'Assignments could not be found.'
    if (error.status === 400) return 'Please check the fields below and try again.'
    if (error.status === 409) return error.message || 'This assignment conflicts with the asset’s current state.'
    return mutation
        ? 'Unable to confirm the change. Refresh the list before retrying, as the server may have received the request.'
        : 'Unable to load assignments. Please try again.'
}
