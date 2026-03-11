"use client";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

interface MapProps {
  position: LatLngExpression | null;
  setPosition: (pos: LatLngExpression) => void;
  correctPosition: LatLngExpression | null;
}

// ator que escuta os cliques
function LocationMarker({ position, setPosition }: 
  {position: LatLngExpression | null, setPosition: (pos: LatLngExpression) => void}) {

  useMapEvents({
    click(e) {
      setPosition(e.latlng); // e.latlng contém exatamente as coordenadas onde o mouse clicou
      console.log("Posição do clique:", e.latlng);
      console.log("position", position)
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        Your Guess:<br/>{position.toString()}
      </Popup>
    </Marker>
  );
}

const MapComponent = ({position, setPosition, correctPosition}: MapProps) => {

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

        <LocationMarker position={position} setPosition={setPosition} />

        {/*desenha o marker da resposta correta quando a rodada acaba*/}
        {correctPosition && (
          <Marker position={correctPosition}>
            <Popup>Resposta Correta!</Popup>
          </Marker>
        )}

        {/*desenha uma linha vermelha tracejada que liga as duas respostas*/}
        {position && correctPosition && (
          <Polyline 
            positions={[position, correctPosition]} 
            pathOptions={{ color: 'red', dashArray: '10, 10', weight: 3 }}
          />
        )}
      
      </MapContainer>
    </div>
  )
}

export default MapComponent