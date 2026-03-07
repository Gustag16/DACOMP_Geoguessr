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
import { useCallback, useState } from "react";
import { useSessionSocket } from "../api/ws";
import type { LatLngExpression } from "leaflet";

export default function GameSession() {
    const { code } = useParams();

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
    const [playerScore, setPlayerScore] = useState<number>(0);

    // escuta as mensagens do servidor
    const handleWebSocketMessage = useCallback((data: any) => {
        // se a rodada começou
        if (data.type === 'new_round') { // VER MELHOR O QUE O BACK VAI MANDAR
            // puxa a url que veio do PostgreSQL (por backend)
            setCurrentImageUrl(data.location.image_url);
        
            // reseta a rodada
            setGuessPosition(null);
            setAlreadyGuessed(false);
            setCorrectPosition(null);
            setIsRoundActive(true);
        }
        else if (data.type === 'round_ended') { // VER MELHOR O QUE O BACK VAI MANDAR
            const posicaoReal: LatLngExpression = [data.location.latitude, data.location.longitude];
            setCorrectPosition(posicaoReal);
            setIsRoundActive(false); // desativa o cronometro

            if (data.my_score !== undefined) { // VER MELHOR O QUE O BACK VAI MANDAR
                setPlayerScore(data.my_score);
            }
        } 
    }, []);

    // extrai o sendGuess do hook
    const {sendGuess} = useSessionSocket(code!, handleWebSocketMessage);

    // função chamada quando o player clica no botão de guess
    const handleConfirmGuess = () => {
        if (guessPosition && !alreadyGuessed) {
            const position = guessPosition as any;
            sendGuess(position.lat, position.lng); // envia para o back por websocket
            setAlreadyGuessed(true); // seta para true para desabilitar o botão
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center">
                <Timer initialSeconds={30} isActive={isRoundActive} />

                <Score score={playerScore} />

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
            <div className="w-full h-125 flex flex-col items-center justify-center gap-4 relative">
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