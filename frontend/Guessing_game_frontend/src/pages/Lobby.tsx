import CodeBox from '../components/Lobby/CodeBox'
import PlayerCard from '../components/Lobby/PlayerCard'
import PlayerEdit from '../components/Lobby/PlayerEdit'
import PlayerAvatar from '../components/Lobby/PlayerAvatar'
import { useState, useEffect, useCallback } from 'react'
import type { PlayerAvatarProps } from '../components/Lobby/PlayerAvatar' // utiliza as props do avatar como o tipo
import { facesList, headsList, accsList, colorsList } from '../components/Lobby/PlayerAvatar'
import type { Player } from '../utils/interfaces/playerInterface'
import { fetchSession } from '../api/Lobby/LobbyServices'
import type { Session } from '../utils/interfaces/sessionInterface'
import { useParams } from 'react-router-dom';
import { useSessionSocket } from '../api/ws';

export default function Lobby() {
    // variaveis para teste
    const numPlayers = 15
    const ownName = "Gustavo"

    // lista para teste
    const outrosJogadores = [
        { id: 1, name: "Possebon", head: "redonda", face: "triste", acc: "oculos", color: "verde" },
        { id: 2, name: "Nicole", head: "redonda", face: "medo", acc: "nenhum", color: "vermelho" },
        { id: 3, name: "Maykon", head: "quadrada", face: "feliz", acc: "chapeu", color: "azul" }    
    ];

    // criando o estado como um objeto e tipando ele
    const [avatarConfig, setAvatarConfig] = useState<PlayerAvatarProps>({
        head: 'redonda',
        face: 'feliz',
        acc: 'chapeu',
        color: 'azul'
    })

    function handleStyleChange(categoria: keyof PlayerAvatarProps, direcao: 'next' | 'prev') {
        // decidir a lista correta de acordo com o parametro
        let listaAtual: string[] = [];
        if (categoria === 'face') listaAtual = facesList;
        if (categoria === 'head') listaAtual = headsList;
        if (categoria === 'acc') listaAtual = accsList;
        if (categoria === 'color') listaAtual = colorsList;

        const valorAtual = avatarConfig[categoria];
        const indexAtual = listaAtual.indexOf(valorAtual);
        let novoIndex = 0; 
        // calcular o prox index
        if (direcao === 'next') {
            novoIndex = indexAtual + 1;
            // se passar do limite, volta pro zero (dá a volta)
            if (novoIndex >= listaAtual.length) {
                novoIndex = 0;
            }
        } else if (direcao === 'prev') {
            novoIndex = indexAtual - 1;
            // se for menor que zero, vai pro último item da lista (dá a volta)
            if (novoIndex < 0) {
                novoIndex = listaAtual.length - 1;
            }
        }

        // atualiza o estado do React com o novo valor
        setAvatarConfig({
            ...avatarConfig, // mantém as outras configurações iguais
            [categoria]: listaAtual[novoIndex] // atualiza só a categoria que mudou
        });

    }

    const [sessionPlayers, setSessionPlayers] = useState<Player[]>([])
    const [hasJoined, setHasJoined] = useState(false);
    const [session, setSession] = useState<Session | null>(null)
    const { code } = useParams();

    const handleWebSocketMessage = useCallback((data: any) => {
        if (data.type === 'player_list') {
            setSessionPlayers(data.players.map((p: any) => ({
                id: p.id,
                name: p.nickname,
                head: p.avatar_config.head,
                face: p.avatar_config.face,
                acc: p.avatar_config.acc,
                color: p.avatar_config.color
            })));
        } else if (data.type === 'player_update') {
            const newPlayer: Player = {
                id: data.player.id,
                nickname: data.player.nickname,
                avatar: {
                    head: data.player.avatar_config.head,
                    face: data.player.avatar_config.face,
                    acc: data.player.avatar_config.acc,
                    color: data.player.avatar_config.color
                },
                score: data.player.score,
                last_round_score: data.player.last_round_score,
                session: data.player.session,
                is_connected: data.player.is_connected
            
            };
            setSessionPlayers(prev => [...prev, newPlayer]);
        }
    }, []);


    const { join, isConnected, listPlayers } = useSessionSocket(code!, handleWebSocketMessage); 



    useEffect(() => {
        if (isConnected && !hasJoined) {
            // Primeiro, entra no lobby
            join(ownName, avatarConfig);
            setHasJoined(true);
            
            // Depois pede a lista de jogadores
            setTimeout(() => {
                listPlayers();
            }, 500); // Pequeno delay para garantir que o join foi processado
        }
    }, [isConnected, hasJoined, join, listPlayers, ownName, avatarConfig]);

        useEffect(() => {
        if (code) {
            fetchSession(code)
                .then((sessionData) => {
                    setSession(sessionData)
                })
                .catch((error) => {
                    console.error("Error fetching session data:", error);
                });
        }
    }, [code]);

    useEffect(() => {
        console.log("Jogadores na sessão:", sessionPlayers);
    }, [sessionPlayers]);

    
    return (
        <div>
            <CodeBox code={session?.code || ""} numPlayers={numPlayers} />
            
            <PlayerEdit ownName={ownName} onStyleChange={handleStyleChange}>
                <PlayerAvatar 
                    head={avatarConfig.head} 
                    face={avatarConfig.face} 
                    acc={avatarConfig.acc} 
                    color={avatarConfig.color} 
                />
            </PlayerEdit>

            {/*no futuro, 'outrosJogadores' vai ser puxado do backend*/}
            <div className="player-list">
                {outrosJogadores.map((jogador) => (
                    <PlayerCard key={jogador.id} name={jogador.name}>
                        <PlayerAvatar 
                            head={jogador.head} 
                            face={jogador.face} 
                            acc={jogador.acc} 
                            color={jogador.color} 
                        />
                    </PlayerCard>
                ))}
            </div>
        </div>
    )
}