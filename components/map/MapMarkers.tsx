 "use client";

import { Marker, Tooltip } from "react-leaflet";
import {
  customerIcon,
  driverIcon,
  requestIcon,
  workshopIcon,
} from "./MapIcons";

export type RequestMarker = {
  id: number;
  lat: number;
  lng: number;
  label: string;
  subtitle?: string;
  type?: "workshop" | "customer" | "driver";
};

interface MapMarkersProps {
  markers: RequestMarker[];
}

export function MapMarkers({ markers }: MapMarkersProps) {
  const getIcon = (type?: RequestMarker["type"]) => {
    switch (type) {
      case "workshop":
        return workshopIcon || undefined;
      case "customer":
        return customerIcon || undefined;
      case "driver":
        return driverIcon || undefined;
      default:
        return requestIcon || undefined;
    }
  };

  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={getIcon(marker.type)}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-900">
                {marker.label}
              </p>
              {marker.subtitle && (
                <p className="text-[11px] text-slate-600">{marker.subtitle}</p>
              )}
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

