import { api } from "../api"


export async function fetchSessions() {
    const response = await api.get('/sessions')
    console.log(response)
    return response.data

}

export async function startSession(sessionCode: string) {
    /* Da update no atributo "status" da sessão */
    const response = await api.post(`/sessions/${sessionCode}/update_status/`, { status: 'PLAYING' })
    console.log(response)
    return response.data
}

export async function deactivateSession(sessionCode: string) {
    /* Da update no atributo "status" da sessão */
    
    const response = await api.post(`/sessions/${sessionCode}/update_status/`, { status: 'INACTIVE' })
    console.log(response)
    return response.data
}

export async function lobbySession(sessionCode: string) {
    /* Da update no atributo "status" da sessão */
    
    const response = await api.post(`/sessions/${sessionCode}/update_status/`, { status: 'LOBBY' })
    console.log(response)
    return response.data
}

export async function startRoundManual(sessionCode: string) {
    /* Da update no atributo "status" da sessão */
    
    const response = await api.post(`/sessions/${sessionCode}/initialize_rounds/`, {nickname: "ULTRAHOST"})
    console.log(response)
    return response.data
}