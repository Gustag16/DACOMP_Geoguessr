// Parte central do projeto
// Integração do openstreetmap, interface de jogo, etc
// Deve ter uns elementos pra mostrar pontos e tals
// Uma parte pra exibir o rank atual tb é interessante
import Image, { resolveMediaUrl } from "../components/gameSession/Image";
import MapComponent from "../components/gameSession/MapComponent"
import 'leaflet/dist/leaflet.css';
import Timer from "../components/gameSession/Timer";
import GuessButton from "../components/gameSession/GuessButton";
import Score from "../components/gameSession/Score";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import { useSessionSocket } from "../api/ws";
import type { LatLngExpression } from "leaflet";
import { fetchSession } from "../api/Lobby/LobbyServices";
import type { Player } from '../utils/interfaces/playerInterface'
import type { Guess } from '../utils/interfaces/guessInterface'
import { LatLng } from "leaflet";
import RankingBoard from "../components/gameSession/RankingBoard";
import CurrentRound from "../components/gameSession/CurrentRound";

export default function GameSession() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(0);

    // estado para guardar a imagem da rodada atual e a fila de preload (N+1 e N+2)
    const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
    const [preloadUrls, setPreloadUrls] = useState<string[]>([]);

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
    const [guesses, setGuesses] = useState<Guess[] | null> (null)
    const playerId = localStorage.getItem('playerId');
    const [timeLimit, setTimeLimit] = useState<number>(60);
    const [roundStartedAt, setRoundStartedAt] = useState<number | null>(null);
    const [serverOffset, setServerOffset] = useState<number>(0);
    // estado para o ranking
    const [rankingPlayers, setRankingPlayers] = useState<any[]>([]);
    const [showRank, setShowRank] = useState<boolean>(false);

    // escuta as mensagens do servidor
    const handleWebSocketMessage = useCallback((data: any) => {
        if (data.type === 'session_status_update') {
            if (data.status === 'FINISHED') {
                navigate(`/results/${code}`, { state: { rankingFinal: data.players } });
            } 
            else if (data.location) {
                setCurrentImageUrl(data.location.image_url);
                console.log("URL da imagem:", data.location.image_url);
                setGuessPosition(null);
                setAlreadyGuessed(false);
                setCorrectPosition(null);
                setIsRoundActive(false);
            }
        }

        else if (data.type === 'round_start') {
            setGuessPosition(null);
            setAlreadyGuessed(false);
            setCorrectPosition(null);
            setShowRank(false);
            setCurrentRoundNumber(data.round_number);
            if (data.time_limit) setTimeLimit(data.time_limit);
            if (data.server_now) setServerOffset(data.server_now - Date.now());
            if (data.round_started_at) setRoundStartedAt(data.round_started_at);
            if (data.current_image_url) setCurrentImageUrl(data.current_image_url);
            setPreloadUrls(Array.isArray(data.preload_urls) ? data.preload_urls : []);
            setIsRoundActive(true);
        }

        else if (data.type === 'round_timeout') { 
            const posicaoReal: LatLngExpression = [data.correct_lat, data.correct_lon];
            setCorrectPosition(posicaoReal);
            setIsRoundActive(false);

            setPlayer(data.players.find((p: any) => p.id === playerId));

            setRankingPlayers(data.players);
            setShowRank(true);
            setGuesses(data.guesses);
        }

        else if (data.type === 'time_update') {
            if (data.server_now) setServerOffset(data.server_now - Date.now());
            if (data.round_started_at) setRoundStartedAt(data.round_started_at);
            if (data.time_limit) setTimeLimit(data.time_limit);
        }

        else if (data.type === 'sync_state') {
            if (data.session_status === 'FINISHED') {
                navigate(`/results/${code}`);
                return;
            }
            if (data.current_round) setCurrentRoundNumber(data.current_round);
            if (data.time_limit) setTimeLimit(data.time_limit);
            if (data.server_now) setServerOffset(data.server_now - Date.now());
            if (data.round_started_at) setRoundStartedAt(data.round_started_at);
            if (data.image_url) setCurrentImageUrl(data.image_url);
            if (Array.isArray(data.preload_urls)) setPreloadUrls(data.preload_urls);
            setAlreadyGuessed(Boolean(data.already_guessed));
            setIsRoundActive(data.session_status === 'PLAYING' && data.remaining_time > 0);
            if (typeof data.player_score === 'number') {
                setPlayer((prev) => prev ? { ...prev, score: data.player_score } : ({ id: playerId || '', score: data.player_score } as Player));
            }
        }
    }, [playerId, navigate, code]);

    const { sendGuess, requestSync, isConnected } = useSessionSocket(code!, handleWebSocketMessage);

    // Garante a sincronização de imagem, round e cronômetro assim que o WebSocket abrir
    useEffect(() => {
        if (isConnected) {
            requestSync(playerId);
        }
    }, [isConnected, playerId]);

    // Busca inicial apenas do time_limit da sessão (o estado ativo e relógio vêm via WebSocket)
    useEffect(() => {
        if (code) {
            fetchSession(code)
                .then((sessionData) => {
                    if (sessionData.time_limit) {
                        setTimeLimit(sessionData.time_limit);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching session data:", error);
                });
        }
    }, [code]);

    // Assim que a imagem da rodada N terminar de carregar, faz o preload em segundo plano de N+1 e N+2
    const handleCurrentImageLoaded = useCallback(() => {
        preloadUrls.forEach((url) => {
            const img = new window.Image();
            img.src = resolveMediaUrl(url);
        });
    }, [preloadUrls]);

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
        <div className="w-screen h-screen relative overflow-hidden bg-gray-900">
            <div className="absolute inset-0 z-0">
                <MapComponent 
                    position={guessPosition} 
                    setPosition={setGuessPosition}
                    correctPosition={correctPosition}
                    alreadyGuessed={alreadyGuessed}
                    guesses={guesses}
                />
            </div>
            
            <div className="absolute top-4 left-0 right-0 z-10 flex flex-col items-center gap-4 pointer-events-none">
                
                <div className="flex gap-8 pointer-events-auto">
                    <Timer 
                        key={currentRoundNumber} 
                        roundStartedAt={roundStartedAt} 
                        timeLimit={timeLimit} 
                        serverOffset={serverOffset} 
                        isActive={isRoundActive} 
                    />
                    <Score score={player?.score || 0} />
                    <CurrentRound currentRoundNumber={currentRoundNumber} />
                </div>

                <div className="pointer-events-auto fixed bottom-10 left-0 right-0 flex justify-center ">
                    {!alreadyGuessed ? (
                        <GuessButton 
                            onGuess={handleConfirmGuess}
                            // O botão só fica desativado se não tiver posição ou não estiver ativo
                            disabled={guessPosition === null || !isRoundActive}
                        />
                    ) : (
                        <span className="text-green-400 bg-gray-900/80 px-6 py-3 rounded-xl border-2 border-green-500 font-bold shadow-lg">
                            Palpite enviado! A aguardar outros jogadores...
                        </span>
                    )}
                </div>
            </div>

            <div className="absolute bottom-4 left-4 z-10 pointer-events-auto transition-transform duration-300 
            ease-in-out origin-bottom-left scale-50 hover:scale-145 rounded-xl shadow-2xl">
                <Image imageUrl={currentImageUrl} onLoad={handleCurrentImageLoaded} />
            </div>

            {showRank && (
                <div className="absolute top-4 right-4">
                    <RankingBoard players={rankingPlayers} />
                </div>
            )}
            
            
        </div>
    )
}