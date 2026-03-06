"use client";
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

// ator que escuta os cliques
function LocationMarker({ position, setPosition }: { position: LatLngExpression, setPosition: any }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng); // e.latlng contém exatamente as coordenadas onde o mouse clicou
    },
  });

  return (
    <Marker position={position}>
      <Popup>Your Guess.</Popup>
    </Marker>
  );
}

const MapComponent = () => {
  const [position, setPosition] = useState<LatLngExpression>([-21.985, -47.881])

  return (
    <div className="w-full h-full"> 
      <MapContainer id="map" center={[-21.985, -47.881]} 
        zoom={15} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker position={position} setPosition={setPosition} />
      
      </MapContainer>
    </div>
  )
}

export default MapComponent