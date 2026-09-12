// Claims control presentation only; Spring Security remains the authority.
export function maintenanceIdentity(token) {
    try {
        const payload = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
        const bytes = Uint8Array.from(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')), (character) => character.charCodeAt(0))
        const claims = JSON.parse(new TextDecoder().decode(bytes))
        const roles = Array.isArray(claims.roles) ? claims.roles : []
        return {
            email: typeof claims.sub === 'string' ? claims.sub.trim().toLowerCase() : '',
            view: roles.some((role) => ['ADMIN', 'MANAGER', 'IT_SUPPORT'].includes(role)),
            create: roles.some((role) => ['ADMIN', 'EMPLOYEE'].includes(role)),
            manage: roles.includes('IT_SUPPORT'),
            employee: roles.includes('EMPLOYEE') && !roles.includes('ADMIN'),
        }
    } catch {
        return {email: '', view: false, create: false, manage: false, employee: false}
    }
}

// Maintenance and user-assets controllers return Page; Assets returns PagedModel.
export function normalizePage(data) {
    return {
        content: data.content,
        page: data.page ?? {number: data.number, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages},
    }
}

export function maintenanceErrorMessage(error, mutation = false) {
    if (error.status === 403) return 'Access denied. You may not perform this action. Employees can report only their own assigned assets.'
    if (error.status === 400) return 'Please check your input and try again.'
    if (error.status === 404 || error.status === 409) return 'The request or asset may have changed. Refresh and try again.'
    return mutation
        ? 'Unable to confirm the change. Refresh before retrying; the server may have received the request.'
        : 'Unable to load maintenance data. Please try again.'
}
