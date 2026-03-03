"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
const customIcon = L.divIcon({
  html: `
    <div style="width:30px;height:30px;">
      <img src="/car.png" width="30" height="30"
        style="width:100%;height:100%;" />
    </div>
  `,
  className: "",
  iconSize: [50, 30],
  iconAnchor: [26, 33],
  popupAnchor: [0, -30],
});
const workShopIcon = L.divIcon({
  html: `
    <div style="width:30px;height:30px;">
      <svg viewBox="0 0 24 24" width="30" height="30">
        <path fill="red" d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
}); 

function Routing({ point1, point2 }) {
  const map = useMap();
  const routingRef = useRef(null);
  useEffect(() => {
    if (!map) return;
    if (routingRef.current) {
      try {
        map.removeControl(routingRef.current);
      } catch (e) {
        console.log("remove skipped");
      }
    }
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(point1[0], point1[1]),
        L.latLng(point2[0], point2[1]),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      addWaypoints: false,
      createMarker: () => null
    }).addTo(map);

    routingRef.current = routingControl;

    return () => {
      if (routingRef.current) {
        try {
          map.removeControl(routingRef.current);
        } catch (e) {
          console.log("cleanup skipped");
        }
      }
    };
  }, [map, point1, point2]);

  return null;
}
export default function Map() {
  const point1 = [30.3608801, 31.3793398]; 
  const point2 = [30.3700000, 31.3900000];
  return (
    <MapContainer
      center={point1}
      zoom={35}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        // attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={point1} icon={customIcon} />
      <Marker position={point2} icon={workShopIcon} />
      <Routing point1={point1} point2={point2} />
    </MapContainer>
  );
}