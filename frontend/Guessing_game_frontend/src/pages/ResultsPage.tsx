import { useLocation, useParams } from "react-router-dom"
import PlayerAvatar from "../components/Lobby/PlayerAvatar";

export default function ResultsPage() {
    const location = useLocation();
    const { code } = useParams(); // pega o código da URL
    const rankingFinal = location.state?.rankingFinal || [];

    return (
        <div className="w-screen h-screen relative bg-gradient-to-b from-fuchsia-800 via-purple-950 to-slate-950 overflow-hidden text-white flex flex-col items-center justify-center relative">
            <h1 className="text-6xl font-['Silkscreen'] text-white mb-3 mt-4 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                Fim de Jogo!
            </h1>

            <h2 className="top-8 mb-10 text-xl font-['Audiowide'] text-white">Sala: {code}</h2>
            
            <div className="flex flex-col gap-3 w-200 h-170 pointer-events-auto overflow-y-auto pr-4">
                {rankingFinal.map((jogador: any, index: number) => (
                    <div key={jogador.id} 
                         className={`flex items-center justify-between p-4 rounded-xl border ${
                            index === 0 ? 'bg-yellow-500/60 border-yellow-500' : 
                            index === 1 ? 'bg-gray-400/60 border-gray-400' :
                            index === 2 ? 'bg-amber-700/60 border-amber-700' :
                            'bg-purple-800/40 border-gray-700'
                         }`}>
                        
                        <div className="flex items-center gap-6">
                            <span className={`text-3xl font-bold ${
                                index === 0 ? 'text-yellow-500' : 
                                index === 1 ? 'text-gray-400' :
                                index === 2 ? 'text-amber-700' : 'text-gray-500'
                            }`}>
                                {index + 1}º
                            </span>
                            
                            {jogador.avatar_config && (
                                <PlayerAvatar 
                                    head={jogador.avatar_config.head} 
                                    face={jogador.avatar_config.face} 
                                    acc={jogador.avatar_config.acc} 
                                    color={jogador.avatar_config.color} 
                                    size="sm" 
                                />
                            )}
                            
                            <span className="text-2xl font-['Silkscreen']">{jogador.nickname}</span>
                        </div>
                        
                        <span className={`text-3xl font-bold font-['Audiowide'] ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' :
                            index === 2 ? 'text-amber-700' : 'text-green-400'
                        }`}>
                            {jogador.score} 
                        pts
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}