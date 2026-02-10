// Fica no lobby antes da partida começar. tem o id da sala, 
// Mostra os jogadores e permite customização da aparencia e nome

export default function Lobby() {
    const code = "123456"
    return (
        <div>
            <h1>Code: {code}</h1>
            <h2>Total Players</h2>            
        </div>
    )
}