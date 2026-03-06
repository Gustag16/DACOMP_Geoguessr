interface Player {
    id: string;
    nickname: string;
    avatar: {
        head: string;
        face: string;
        acc: string;
        color: string;
    };
    session: string;
    score: number;
    last_round_score: number;
    is_connected: boolean;
}


export type { Player }