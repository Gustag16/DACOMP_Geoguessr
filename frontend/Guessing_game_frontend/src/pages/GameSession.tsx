// Parte central do projeto
// Integração do openstreetmap, interface de jogo, etc
// Deve ter uns elementos pra mostrar pontos e tals
// Uma parte pra exibir o rank atual tb é interessante
import Image from "../components/gameSession/Image";
import MapComponent from "../components/gameSession/MapComponent"
import 'leaflet/dist/leaflet.css';
import Timer from "../components/gameSession/Timer";
import GuessButton from "../components/gameSession/GuessButton";
import Score from "../components/gameSession/Score";
import { useParams } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import { useSessionSocket } from "../api/ws";
import type { LatLngExpression } from "leaflet";
import type { Session } from '../utils/interfaces/sessionInterface'
import { fetchSession } from "../api/Lobby/LobbyServices";
import { fetchRoundUrl } from "../api/GameSession/GameSessionServices";
import type { Player } from '../utils/interfaces/playerInterface'
import { LatLng } from "leaflet";

export default function GameSession() {
    const { code } = useParams();
    const [session, setSession] = useState<Session | null>(null)
    const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(0);
    // estado para guardar a imagem da rodada atual
    const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
    // estado para guardar latitude / longitude do guess atual
    const [guessPosition, setGuessPosition] = useState<LatLngExpression | null>(null);
    // estado para guardar a posição real de latitude e longitude
    const [correctPosition, setCorrectPosition] = useState<LatLngExpression | null>(null)
    // estado para saber se o jogador já clicou no botão de guess
    const [alreadyGuessed, setAlreadyGuessed] = useState<boolean>(false);
    // estado de interruptor do cronometro
    const [isRoundActive, setIsRoundActive] = useState<boolean>(false);
    // estado para saber a pontuação do jogador nesta sessão
    const [player, setPlayer] = useState<Player | null> (null)
    const [playerId, setPlayerId] = useState<string | null>(() => {
        // Inicializa com o localStorage
        return localStorage.getItem('playerId');
    });
    const [time, setTime] = useState<number>(0);


    // escuta as mensagens do servidor
    const handleWebSocketMessage = useCallback((data: any) => {
        // se a rodada começou
        if (data.type === 'session_status_update') {
            // puxa a url que veio do PostgreSQL (por backend)
            setCurrentImageUrl(data.location.image_url);
            console.log("URL da imagem:", data.location.image_url);

            setGuessPosition(null);
            setAlreadyGuessed(false);
            setCorrectPosition(null);;
            setIsRoundActive(false);
         }

        else if(data.type === 'round_start') {
            setGuessPosition(null);
            setAlreadyGuessed(false);
            setCorrectPosition(null);
            setIsRoundActive(false);
            setCurrentRoundNumber((prev) => prev + 1);
            setIsRoundActive(true);
         }
              
        else if (data.type === 'round_timeout') { 
            const posicaoReal: LatLngExpression = [data.correct_lat, data.correct_lon];
            setCorrectPosition(posicaoReal);
            setIsRoundActive(false); // desativa o cronometro

            setPlayer(data.players.find((p: any) => p.id === playerId));

        }
    }, [playerId]);

    // extrai o sendGuess do hook
    const {sendGuess, reconnect} = useSessionSocket(code!, handleWebSocketMessage);

    useEffect(() => {
        if (code) {
            fetchSession(code)
                .then((sessionData) => {
                    setSession(sessionData)
                    setTime(sessionData.time_limit);
                    setCurrentRoundNumber(sessionData.current_round_number);
                    console.log("Dados da sessão:", sessionData);
                    // Pega a url da imagem do round atual
                    return fetchRoundUrl(code, sessionData.current_round_number);
                })
                .then((roundData) => {
                    setCurrentImageUrl(roundData.image_url);
                    console.log("URL da imagem:", roundData.image_url);
                })
                .catch((error) => {
                    console.error("Error fetching session data:", error);
                });
        }
    }, [code, currentRoundNumber]);

    useEffect(() => {
    // Verifica se já tentou reconectar antes para evitar loops
    const hasReconnected = sessionStorage.getItem('has_reconnected');
    
    if (playerId && !hasReconnected) {
        // Marca que já tentou reconectar
        sessionStorage.setItem('has_reconnected', 'true');
        reconnect(playerId);
    }
    
    // Limpeza quando o componente desmontar
    return () => {
        sessionStorage.removeItem('has_reconnected');
    };
}, [playerId]); 


    // função chamada quando o player clica no botão de guess
    const handleConfirmGuess = () => {
        if (guessPosition && !alreadyGuessed) {
            console.log("guess pos", guessPosition)
            const position = guessPosition as LatLng;
            console.log("sending guess", position.lat, position.lng);
            sendGuess(position.lat, position.lng, Date.now()); // envia para o back por websocket
            setAlreadyGuessed(true); // seta para true para desabilitar o botão
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center">
                <Timer key={currentRoundNumber} initialSeconds={time} isActive={isRoundActive} />

                <Score score={player?.score || 0} />

                <Image imageUrl={currentImageUrl} />

                <GuessButton 
                    onGuess={handleConfirmGuess}
                    disabled={guessPosition === null || alreadyGuessed || !isRoundActive}
                />

                {alreadyGuessed && (
                    <span className="text-green-500 font-bold">
                        Palpite enviado! A aguardar outros jogadores...
                    </span>
                )}
            </div>
            <div className="w-[80%] h-[70%] flex flex-col items-center justify-center gap-4  mb-6 mx-auto relative">
                {alreadyGuessed && (
                    <div className="absolute inset-0 z-[1000] bg-black/10 cursor-not-allowed rounded"></div>
                )}

                <MapComponent 
                    position={guessPosition} 
                    setPosition={setGuessPosition}
                    correctPosition={correctPosition}
                />
            </div>
        </div>
    )
}