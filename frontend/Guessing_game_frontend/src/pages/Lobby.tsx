// Fica no lobby antes da partida começar. tem o id da sala, 
// Mostra os jogadores e permite customização da aparencia e nome
import CodeBox from '../components/Lobby/CodeBox'


export default function Lobby() {
    const code = "ABCD1234" // 
    return (
        <div>
            <CodeBox code={code} />
        </div>
    )
}