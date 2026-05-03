"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

// Workshop: same “key” on-map style as your location (circle, white ring, shadow) — orange + key glyph
const workshopIcon = L.divIcon({
  html: `
    <div style="
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #f97316;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    " aria-hidden="true">
      <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="white" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5"/>
        <path d="m21 2-9.6 9.6"/>
        <path d="m15.5 7.5 3 3L22 7l-3-3"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
});

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

export type WorkshopMapPoint = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  description: string;
};

const EMPTY_WORKSHOPS: WorkshopMapPoint[] = [];

function MapViewController({
  userCenter,
  zoom,
  workshops,
}: {
  userCenter: [number, number];
  zoom: number;
  workshops: WorkshopMapPoint[];
}) {
  const map = useMap();

  useEffect(() => {
    const validWorkshops = workshops.filter(
      (w) => Number.isFinite(w.lat) && Number.isFinite(w.lng)
    );

    if (validWorkshops.length > 0) {
      const corners: L.LatLngExpression[] = [
        userCenter,
        ...validWorkshops.map((w) => [w.lat, w.lng] as [number, number]),
      ];
      const bounds = L.latLngBounds(corners);
      map.fitBounds(bounds, { padding: [52, 52], maxZoom: 14 });
      return;
    }

    map.setView(userCenter, zoom);
  }, [map, userCenter[0], userCenter[1], zoom, workshops]);

  return null;
}

interface CustomerLocationMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  showMarker?: boolean;
  /** Nearby workshops with coordinates (shown as pins, map fits to include user + workshops) */
  workshops?: WorkshopMapPoint[] | undefined;
}

export default function CustomerLocationMap({
  lat,
  lng,
  zoom = 16,
  className = "",
  showMarker = true,
  workshops,
}: CustomerLocationMapProps) {
  const center: [number, number] = [lat, lng];
  const workshopMarkers = workshops ?? EMPTY_WORKSHOPS;

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
      <MapViewController userCenter={center} zoom={zoom} workshops={workshopMarkers} />
      {showMarker && <Marker position={center} icon={locationIcon} />}
      {workshopMarkers.map((w) => (
        <Marker key={w.id} position={[w.lat, w.lng]} icon={workshopIcon}>
          <Popup>
            <span className="text-sm font-semibold text-gray-900">{w.name}</span>
            <p className="text-xs text-gray-500">{w.description}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
