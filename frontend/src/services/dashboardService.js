const API_BASE_URL = 'http://localhost:8080/api'

function getAuthorizationHeaders() {
    const accessToken = sessionStorage.getItem('accessToken')

    return {
        Authorization: `Bearer ${accessToken}`,
    }
}

async function handleResponse(response, errorMessage) {
    if (response.status === 401) {
        const error = new Error('Unauthorized')
        error.status = 401
        throw error
    }

    if (!response.ok) {
        throw new Error(errorMessage)
    }

    return response.json()
}

export async function getAssets(status = null, size = 20) {
    const params = new URLSearchParams({
        page: '0',
        size: String(size),
    })

    if (status) {
        params.set('status', status)
    }

    const response = await fetch(
        `${API_BASE_URL}/assets?${params}`,
        {
            headers: getAuthorizationHeaders(),
        }
    )

    return handleResponse(response, 'Failed to load assets')
}

export async function getMaintenanceRequests(size = 20) {
    const response = await fetch(
        `${API_BASE_URL}/maintenance-requests?page=0&size=${size}&sort=requestDate,desc`,
        {
            headers: getAuthorizationHeaders(),
        }
    )

    return handleResponse(
        response,
        'Failed to load maintenance requests'
    )
}

export async function getUsersByRole(role) {
    const response = await fetch(
        `${API_BASE_URL}/users?role=${role}`,
        {
            headers: getAuthorizationHeaders(),
        }
    )

    return handleResponse(
        response,
        `Failed to load ${role} users`
    )
}

export async function getAllUsers() {
    const roles = [
        'ADMIN',
        'MANAGER',
        'EMPLOYEE',
        'IT_SUPPORT'
    ]

    const usersByRole = await Promise.all(
        roles.map((role) => getUsersByRole(role))
    )

    return usersByRole.flat()
}