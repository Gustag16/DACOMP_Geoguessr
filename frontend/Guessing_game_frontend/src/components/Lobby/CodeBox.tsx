

export default function CodeBox({ code, numPlayers } : { code: string, numPlayers: number}) {
    return (
        <div className='flex flex-col items-center gap-2'>
            <h1>Code: {code}</h1>
            <h2>Players in Lobby: {numPlayers}</h2>
        </div>   
    )
}