"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon in Next.js (Leaflet looks for icon in wrong path)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// "You are here" style marker
const locationIcon = L.divIcon({
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #0ea5e9;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

interface CustomerLocationMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  showMarker?: boolean;
  zIndex?: number;
}

export default function CustomerLocationMap({
  lat,
  lng,
  zoom = 16,
  className = "",
  showMarker = true,
}: CustomerLocationMapProps) {
  const center: [number, number] = [lat, lng];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ height: "100%", width: "100%", minHeight: "280px", borderRadius: "1rem" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {showMarker && <Marker position={center} icon={locationIcon} />}
      <MapUpdater center={center} zoom={zoom} />
    </MapContainer>
  );
}
