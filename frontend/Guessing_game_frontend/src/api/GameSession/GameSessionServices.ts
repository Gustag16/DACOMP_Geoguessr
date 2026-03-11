import { api } from "../api"


export async function fetchRoundUrl(sessionCode: string , roundNumber: number, ) {
    const response = await api.get(`/rounds/current-image/?session_code=${sessionCode}&round_number=${roundNumber}`)
    console.log(response)
    return response.data
}

