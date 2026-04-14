"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { MapMarkers, type RequestMarker } from "./MapMarkers";

type LeafletModule = typeof import("leaflet");
let L: LeafletModule | null = null;

if (typeof window !== "undefined") {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  L = require("leaflet");
  // Load routing machine only in the browser
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  require("leaflet-routing-machine");
}

interface RequestsMapProps {
  center: [number, number];
  zoom?: number;
  setview?: boolean;
  markers: RequestMarker[];
  className?: string;
  route?: {
    from: [number, number];
    to: [number, number];
  };
}

export default function RequestsMap({
  center,
  zoom = 12,
  markers,
  className = "",
  route,
}: RequestsMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid rendering Leaflet on the server to prevent "window is not defined"
  if (!mounted) {
    return (
      <div
        className={className}
        style={{
          height: "100%",
          width: "100%",
          minHeight: "240px",
          borderRadius: "0.75rem",
        }}
      >
        <div className="flex h-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{
        height: "100%",
        width: "100%",
        minHeight: "240px",
        borderRadius: "0.75rem",
        zIndex: 0,
      }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapMarkers markers={markers} />
      {route && L && (
        <RoutingLayer from={route.from} to={route.to} leaflet={L} />
      )}
    </MapContainer>
  );
}

interface RoutingLayerProps {
  from: [number, number];
  to: [number, number];
  leaflet: LeafletModule;
}

function RoutingLayer({ from, to, leaflet }: RoutingLayerProps) {
  const map = useMap();
  const routingRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !leaflet || !(leaflet as any).Routing) return;

    if (routingRef.current) {
      try {
        map.removeControl(routingRef.current);
      } catch {
        // ignore
      }
    }

    const routingControl = (leaflet as any).Routing.control({
      waypoints: [
        leaflet.latLng(from[0], from[1]),
        leaflet.latLng(to[0], to[1]),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [
          { color: "#e5e7eb", weight: 8, opacity: 0.8 },
          { color: "#38bdf8", weight: 4, opacity: 0.9 },
        ],
      },
    }).addTo(map);

    routingRef.current = routingControl;

    return () => {
      if (routingRef.current) {
        try {
          map.removeControl(routingRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, [map, from, to, leaflet]);

  return null;
}


