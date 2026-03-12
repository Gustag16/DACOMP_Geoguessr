interface Guess {
    id: string,
    latitude_guess: number,
    longitude_guess: number,
    distance_in_meters: number,
    points_awarded: number,
    timestamp: number,
    player_id: string,
    round_id: string,
    session_id: string,
}

export type {Guess}