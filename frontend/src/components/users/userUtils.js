export const userRoles = ['MANAGER', 'ADMIN', 'EMPLOYEE', 'IT_SUPPORT']
export const roleLabels = {MANAGER: 'Manager', ADMIN: 'Admin', EMPLOYEE: 'Employee', IT_SUPPORT: 'IT Support'}

// Presentation only: the existing JWT and backend authorization remain authoritative.
export function userIdentity(token) {
    try {
        const payload = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
        const bytes = Uint8Array.from(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')), (character) => character.charCodeAt(0))
        const claims = JSON.parse(new TextDecoder().decode(bytes))
        const roles = Array.isArray(claims.roles) ? claims.roles.filter((role) => userRoles.includes(role)) : []
        return {roles, email: typeof claims.sub === 'string' ? claims.sub.toLowerCase() : '', create: roles.some((role) => ['ADMIN', 'MANAGER'].includes(role))}
    } catch {
        return {roles: [], email: '', create: false}
    }
}

export function canViewUserAssets(identity, user) {
    if (!identity.roles.length) return false
    // AssignmentService restricts any principal with EMPLOYEE, even with additional roles.
    return !identity.roles.includes('EMPLOYEE') || Boolean(identity.email && user.email?.toLowerCase() === identity.email)
}

export function validateUser(values) {
    const errors = {}
    if (!values.name.trim()) errors.name = 'Name is required.'
    else if (values.name.length > 100) errors.name = 'Name must not exceed 100 characters.'
    if (!values.email.trim()) errors.email = 'Email is required.'
    else if (values.email.length > 255) errors.email = 'Email must not exceed 255 characters.'
    else if (!/^[^\s@]+@[^\s@]+$/.test(values.email.trim())) errors.email = 'Email must be valid.'
    if (!values.password.trim()) errors.password = 'Password is required.'
    else if (values.password.length < 8 || values.password.length > 72) errors.password = 'Password must be between 8 and 72 characters.'
    if (!userRoles.includes(values.role)) errors.role = 'Select a valid role.'
    return errors
}

export function userErrorMessage(error, mutation = false) {
    if (error.status === 403) return 'Access denied. You do not have permission to perform this action.'
    if ([400, 404, 409].includes(error.status)) return error.message
    return mutation ? 'Unable to confirm creation. Refresh the user list before retrying; the server may have received the request.' : 'Unable to load users or assets. Please try again.'
}
