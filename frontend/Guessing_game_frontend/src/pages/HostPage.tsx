// Somente acessível pelo "admin". Precisa de uma senha e tals
// Aqui escolhe qual sessão vai ser iniciada, lim de players e lim de tempo
// Também decide quando vai a sessão vai sair do lobby, e começar a partida

export default function HostPage() {
    const fetchSessions = () => {
        // Aqui a gente faria uma chamada pra API pra pegar as sessões disponíveis
        // Por enquanto, vamos usar um mock
        return [
            { id: 'session1', name: 'Session 1' },
            { id: 'session2', name: 'Session 2' },
        ]
    }

    const sessions = fetchSessions()
    return (
        <>
        <div className="flex flex-col justify-center items-center gap-4">
        <h2 className="font-bold">Host Page</h2>
        <div className ="flex flex-col items-center gap-4">
           <h3 className="flex">Select Session</h3>
            <select className="flex">
                {sessions.map((session) => (
                    <option key={session.id} className="flex" value={session.id}>{session.name}</option>
                ))}
            </select>
            <button className="flex justify-center items-center bg-green-500 hover:bg-green-600
                             text-white font-bold py-2 px-4 rounded"
                    onClick={() => alert("Game started!")}>
                        Start Game
            </button>       
        </div>      
        </div>
        
        </>
    );
}
