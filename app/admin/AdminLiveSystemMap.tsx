"use client";

import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { DashboardLiveSystemMap } from "./dashboardTypes";

type AdminLiveSystemMapProps = {
  data: DashboardLiveSystemMap;
};

const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357];
const DEFAULT_ZOOM = 11;

export default function AdminLiveSystemMap({ data }: AdminLiveSystemMapProps) {
  const allPoints = useMemo(
    () => [...data.active_requests, ...data.workshops, ...data.winches],
    [data.active_requests, data.workshops, data.winches]
  );

  const center = useMemo<[number, number]>(() => {
    if (!allPoints.length) return DEFAULT_CENTER;
    const sum = allPoints.reduce(
      (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
      { lat: 0, lng: 0 }
    );
    return [sum.lat / allPoints.length, sum.lng / allPoints.length];
  }, [allPoints]);

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
      style={{ minHeight: 280 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {data.active_requests.map((point) => (
        <CircleMarker
          key={`req-${point.id}`}
          center={[point.lat, point.lng]}
          radius={7}
          pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.9 }}
        >
          <Popup>Active Request #{point.id}</Popup>
        </CircleMarker>
      ))}

      {data.workshops.map((point) => (
        <CircleMarker
          key={`workshop-${point.id}`}
          center={[point.lat, point.lng]}
          radius={7}
          pathOptions={{ color: "#0284c7", fillColor: "#0284c7", fillOpacity: 0.9 }}
        >
          <Popup>
            Workshop #{point.id}
            <br />
            {point.name}
          </Popup>
        </CircleMarker>
      ))}

      {data.winches.map((point) => (
        <CircleMarker
          key={`winch-${point.id}`}
          center={[point.lat, point.lng]}
          radius={7}
          pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.9 }}
        >
          <Popup>Winch #{point.id}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
