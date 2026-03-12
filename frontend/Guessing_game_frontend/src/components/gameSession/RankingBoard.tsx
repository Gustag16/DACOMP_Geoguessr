import PlayerAvatar from '../Lobby/PlayerAvatar';

interface RankingPlayer {
    id: string;
    nickname: string;
    score: number;
    last_round_score: number;
    avatar_config: any;
}

interface RankingBoardProps {
    players: RankingPlayer[];
}

export default function RankingBoard({players}: RankingBoardProps) {
    if (!players || players.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-900/90 border-2 border-purple-500 rounded-xl p-4 shadow-2xl flex flex-col 
        gap-3 w-72 h-170 pointer-events-auto">
            <h2 className="text-white font-['Audiowide'] text-xl text-center border-b border-purple-500/50 pb-2">
                Ranking da Sala
            </h2>

            <div className="flex flex-col gap-2 max-h-170 overflow-y-auto pr-2">
                {players.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between bg-gray-800/80 
                    p-2 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                            
                            {/* POSIÇÃO DO JOGADOR */}
                            <span className="text-purple-400 font-bold w-4">{index + 1}º</span>
                            
                            {/* AVATAR DO JOGADOR */}
                            {player.avatar_config && (
                                <PlayerAvatar 
                                    head={player.avatar_config.head} 
                                    face={player.avatar_config.face} 
                                    acc={player.avatar_config.acc} 
                                    color={player.avatar_config.color} 
                                    size="sm" 
                                />
                            )}

                            {/* NOME */}
                            <span className="text-white font-['Silkscreen'] text-sm truncate w-20">
                                {player.nickname}
                            </span>
                        </div>

                        {/* SCORE */}
                        <div className="flex flex-col items-end">
                            <span className="text-green-400 font-bold">{player.score} pts</span>
                            <span className="text-green-600 text-xs">+{player.last_round_score}</span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}