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
import { useCallback, useState, useEffect, use } from "react";
import { useSessionSocket } from "../api/ws";
import type { Session } from '../utils/interfaces/sessionInterface'
import { fetchSession } from "../api/Lobby/LobbyServices";
import { fetchRoundUrl } from "../api/GameSession/GameSessionServices";

export default function GameSession() {
    const { code } = useParams();
    const [session, setSession] = useState<Session | null>(null)
    // estado para guardar a imagem da rodada atual
    const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

    useEffect(() => {
        if (code) {
            fetchSession(code)
                .then((sessionData) => {
                    setSession(sessionData)
                    // Pega a url da imagem do round atual
                    return fetchRoundUrl(code, 1);
                })
                .then((roundData) => {
                    setCurrentImageUrl(roundData.image_url);
                    console.log("URL da imagem:", roundData.image_url);
                })
                .catch((error) => {
                    console.error("Error fetching session data:", error);
                });
        }
    }, [code]);

    // Obtém sessão, pega imagem do round atual.

    // escuta as mensagens do servidor
    const handleWebSocketMessage = useCallback((data: any) => {
        // se a rodada começou
        if (data.type === 'session_round_update') {
            // puxa a url que veio do PostgreSQL (por backend)
            setCurrentImageUrl(data.location.image_url);
            console.log("URL da imagem:", data.location.image_url);
         }
            
            // salvar as coordenadas corretas futuramente em outro estado
    }, []);

    // conecta no ws da partida
    useSessionSocket(code!, handleWebSocketMessage);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center">
                <Timer />
                <Score />
                <Image imageUrl={currentImageUrl} />
                <GuessButton />
            </div>
            <div className="w-full h-125 flex flex-col items-center justify-center gap-4">
                <MapComponent />
            </div>
        </div>
    )
}