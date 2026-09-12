const API_BASE_URL = 'http://localhost:8080/api'

export async function request(path, {signal, method = 'GET', body} = {}) {
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
