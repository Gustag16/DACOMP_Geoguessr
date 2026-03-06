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

interface WebSocketMessage {
    type: string;
    id?: string;
    avatar_config?: PlayerAvatarProps;
    players?: Array<any>;
    player?: any;
}

export default function Lobby() {

    // lista para teste
    /*
    const outrosJogadores = [
        { id: 1, name: "Possebon", head: "redonda", face: "triste", acc: "oculos", color: "verde" },
        { id: 2, name: "Nicole", head: "redonda", face: "medo", acc: "nenhum", color: "vermelho" },
        { id: 3, name: "Maykon", head: "quadrada", face: "feliz", acc: "chapeu", color: "azul" }    
    ];
    */

        const [avatarConfig, setAvatarConfig] = useState<PlayerAvatarProps>
    ({
        head: 'redonda',
        face: 'feliz',
        acc: 'nenhum',
        color: 'azul'
    });

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

    const [ownName, setOwnName] = useState("Gustavo");
    const [playerId, setPlayerId] = useState<string | null>(() => {
        // Inicializa com o localStorage
        return localStorage.getItem('playerId');
    });
    const [hasJoined, setHasJoined] = useState(false);
    const [session, setSession] = useState<Session | null>(null)
    const { code } = useParams();
    

    const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    switch (data.type) {
        case 'join_success':
            if (!hasJoined) {
            setPlayerId(data.id!);
            localStorage.setItem('playerId', data.id!);
            setHasJoined(true);
            setAvatarConfig({
                head: data.avatar_config!.head,
                face: data.avatar_config!.face,
                acc: data.avatar_config!.acc,
                color: data.avatar_config!.color
            });
            }

            break;

        case 'players_list':
            console.log("Recebida lista de jogadores:", data.players);
            setSessionPlayers(
            data.players!.map((p: any) => ({
            id: p.id,
            nickname: p.nickname,
            avatar: {
                head: p.avatar_config.head,
                face: p.avatar_config.face,
                acc: p.avatar_config.acc,
                color: p.avatar_config.color,
            },
            score: p.score,
            last_round_score: p.last_round_score,
            session: p.session,
            is_connected: p.is_connected,
            }))
            );
            break;

        case 'player_updated':
        case 'player_update': {
            const newPlayer: Player = {
            id: data.player!.id,
            nickname: data.player!.nickname,
            avatar: {
                head: data.player!.avatar_config.head,
                face: data.player!.avatar_config.face,
                acc: data.player!.avatar_config.acc,
                color: data.player!.avatar_config.color
            },
            score: data.player!.score,
            last_round_score: data.player!.last_round_score,
            session: data.player!.session,
            is_connected: data.player!.is_connected
            };
            setSessionPlayers((prevPlayers) => {
            const existingIndex = prevPlayers.findIndex(p => p.id === newPlayer.id);
            if (existingIndex !== -1) {
                // Atualiza o jogador existente
                const updatedPlayers = [...prevPlayers];
                updatedPlayers[existingIndex] = newPlayer;
                return updatedPlayers;
            } else {
                // Adiciona um novo jogador
                return [...prevPlayers, newPlayer];
            }
            });
            break;
        }
        }}, [hasJoined]
    );
    const { join, isConnected, updateAvatar, listPlayers } = useSessionSocket(code!, handleWebSocketMessage); 

    useEffect(() => {
        const savedPlayerId = localStorage.getItem('playerId');
        if (savedPlayerId) {
            setPlayerId(savedPlayerId);
            listPlayers();
        }
    }, []);

    useEffect(() => {
        if (isConnected && !hasJoined) {
            // Primeiro, entra no lobby
            join(ownName, avatarConfig, playerId);
            listPlayers();
        }
    }, [isConnected, hasJoined, join, listPlayers, ownName, avatarConfig, playerId]);

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
            <CodeBox code={session?.code || ""} numPlayers={sessionPlayers.length} />
            
            <PlayerEdit ownName={ownName} onStyleChange={handleStyleChange}>
                <PlayerAvatar 
                    head={avatarConfig.head} 
                    face={avatarConfig.face} 
                    acc={avatarConfig.acc} 
                    color={avatarConfig.color} 
                />
            </PlayerEdit>
            <button onClick={() => updateAvatar(playerId!, avatarConfig)}>Salvar Mudanças</button>

            <div className="player-list flex flex-row gap-4 justify-center mt-8">
                {sessionPlayers.filter(jogador => jogador.id !== playerId).map((jogador) => (
                    <PlayerCard key={jogador.id} name={jogador.nickname}>
                        <PlayerAvatar 
                            head={jogador.avatar?.head} 
                            face={jogador.avatar?.face} 
                            acc={jogador.avatar?.acc} 
                            color={jogador.avatar?.color} 
                        />
                    </PlayerCard>
                ))}
            </div>
        </div>
    )
}