
interface Session {
    id: string;
    code: string;
    name: string;
    total_rounds: number;
    current_round_number: number;
    player_limit: number;
    time_limit: number; // em segundos
    status: 'INACTIVE' | 'LOBBY' | 'PLAYING' | 'FINISHED';
}

export type { Session }