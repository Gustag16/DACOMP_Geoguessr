import {api} from "../api";


export async function fetchSession(id: string) {
    const response = await api.get(`/sessions/${id}/`)
    console.log(response)
    return response.data
}

export async function playerJoin(sessionCode: string, playerName: string) {
    const response = await api.post(`/sessions/${sessionCode}/join/`, { name: playerName })
    return response.data
}