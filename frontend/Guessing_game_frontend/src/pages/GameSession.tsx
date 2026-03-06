// Parte central do projeto
// Integração do openstreetmap, interface de jogo, etc
// Deve ter uns elementos pra mostrar pontos e tals
// Uma parte pra exibir o rank atual tb é interessante
import MapComponent from "../components/gameSession/MapComponent"
import 'leaflet/dist/leaflet.css';

export default function GameSession() {
    return (

        <div className="w-full h-125 flex flex-col items-center justify-center gap-4">
            <MapComponent />
        </div>
    )
}