
// Default com caixa pra colocar o código da sala

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
    const [roomCode, setRoomCode] = useState('')
    const navigate = useNavigate()

    // função chamada quando o usuário aperta enter
    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault() // não recarrega a página
        
        // se o código não está vazio
        if (roomCode.trim() !== '') {
            // redireciona o jogador para o lobby da sala correta
            navigate(`lobby/${roomCode.trim()}`)
        }
    }

    return (
        <div className="w-screen h-screen relative bg-gradient-to-b from-fuchsia-800 via-purple-950 to-slate-950 overflow-hidden">
            <h1 className="justify-center flex text-white text-8xl font-normal font-['Silkscreen']">
                GEOGUESSR_DACOMP
                </h1>
            <h2 className="justify-center flex mb-30 text-white text-5xl font-normal font-['Silkscreen'] m-7">
                -=ROME=-
            </h2>
            
            <form 
                onSubmit={handleJoinRoom} 
                className="flex flex-col items-center w-100 m-auto gap-6-900/80 p-5 
                shadow-[0px_0px_4px_4px_rgba(184,184,184,0.25)] backdrop-blur-sm"
            >
                <h2 className="text-2xl mb-5 font-['Silkscreen'] text-white">ENTRAR EM UMA SALA</h2>
                
                <input 
                    type="text" 
                    placeholder="code" 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="text-center text-xl font-['Audiowide'] mb-3 text-white bg-transparent border-b-2 
                    border-fuchsia-500 focus:border-white focus:outline-none placeholder:text-fuchsia-200/40 
                    focus:placeholder-transparent w-64 pb-2 transition-colors"
                    maxLength={4}
                />
                
                <button 
                    type="submit"
                    // desativa o botão visualmente se não houver código digitado
                    disabled={!roomCode.trim()} 
                    className="mt-2 bg-fuchsia-700 hover:bg-fuchsia-500 disabled:bg-purple-700/40 
                    disabled:border-purple-800/40 disabled:cursor-not-allowed text-white text-xl font-['Audiowide'] 
                    py-2 px-5 border-2 border-fuchsia-400 rounded-xl transition-all hover:cursor-pointer
                    shadow-[0_0_10px_rgba(217,70,239,0.4)] hover:shadow-[0_0_20px_rgba(217,70,239,0.8)]"
                >
                    Join
                </button>
            </form>

            <h3 className="absolute bottom-4 w-full flex justify-center text-white text-xs font-normal 
            font-['Audiowide']">
                &copy; DAComp UFSCar 2026
            </h3>
        </div>
    )
}

