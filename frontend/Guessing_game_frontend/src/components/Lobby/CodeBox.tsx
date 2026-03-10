

export default function CodeBox({ code, numPlayers } : { code: string, numPlayers: number}) {
    return (
        <div className="w-72 h-48 ml-13" >
            <div className="w-72 h-20 flex items-center justify-center shadow-[0px_4px_4px_0px_rgba(184,184,184,0.25)] outline outline-[10px] outline-white">
                <h1 className="text-white text-2xl font-normal font-['Audiowide']">Code: {code}</h1>
            </div>
            <div className="w-72 h-20 mt-8 flex items-center justify-center shadow-[0px_4px_4px_0px_rgba(184,184,184,0.25)] outline outline-[10px] outline-white">
                <h2 className="text-white text-2xl font-normal font-['Audiowide']">Players in Lobby: {numPlayers}</h2>
            </div>
        </div>   
    )
}