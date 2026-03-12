"use client";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

interface MapProps {
  position: LatLngExpression | null;
  setPosition: (pos: LatLngExpression) => void;
  correctPosition: LatLngExpression | null;
  alreadyGuessed: boolean;
}

// ator que escuta os cliques
function LocationMarker({ position, setPosition, alreadyGuessed }: 
  {position: LatLngExpression | null, setPosition: (pos: LatLngExpression) => void, alreadyGuessed: boolean}) {

  const purpleIcon = new L.Icon.Default({
    className: 'hue-rotate-[45deg] brightness-100 saturate-[300%]' 
  });

  useMapEvents({
    click(e) {
      if (!alreadyGuessed)
        setPosition(e.latlng); // e.latlng contém exatamente as coordenadas onde o mouse clicou
        console.log("Posição do clique:", e.latlng);
        console.log("position", position)
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={purpleIcon}>
      <Popup>
        Your Guess:<br/>{position.toString()}
      </Popup>
    </Marker>
  );
}

function FitBounds({ guess, correct }: { guess: LatLngExpression | null, correct: LatLngExpression | null }) {
  const map = useMap(); // acessa a instância real do mapa do Leaflet

  useEffect(() => {
    // se temos os dois pontos (rodada acabou), calcula a "caixa" que envolve os dois
    if (guess && correct) {
      const bounds = L.latLngBounds(guess as any, correct as any);
      // flyToBounds faz uma animação suave dando zoom in ou zoom out até caber tudo
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [guess, correct, map]);

  return null;
}

// definindo o ícone de 'correctPosition' com classes Tailwind
const greenIcon = new L.Icon.Default({
  className: 'hue-rotate-[260deg] brightness-110 saturate-[200%]' 
});

const MapComponent = ({position, setPosition, correctPosition, alreadyGuessed}: MapProps) => {

  return (
    <div className="w-full h-full"> 
      <MapContainer id="map" center={[-21.985, -47.881]} 
        zoom={15} 
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker position={position} setPosition={setPosition} alreadyGuessed={alreadyGuessed} />

        {/*desenha o marker da resposta correta quando a rodada acaba*/}
        {correctPosition && (
          <Marker position={correctPosition} icon={greenIcon}>
            <Popup>Resposta Correta:<br/>{correctPosition.toString()}</Popup>
          </Marker>
        )}

        {/*desenha uma linha vermelha tracejada que liga as duas respostas*/}
        {position && correctPosition && (
          <Polyline 
            positions={[position, correctPosition]} 
            pathOptions={{ color: 'red', dashArray: '10, 10', weight: 3 }}
          />
        )}

        <FitBounds guess={position} correct={correctPosition} />
      
      </MapContainer>
    </div>
  )
}

export default MapComponent