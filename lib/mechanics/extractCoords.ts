export function parseCoord(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Pull mechanic lat/lng from API rows or WebSocket payloads. */
export function extractMechanicLatLng(payload: unknown): {
  lat: number | null;
  lng: number | null;
  name?: string;
  dispatchStatus?: string;
} {
  if (!payload || typeof payload !== "object") {
    return { lat: null, lng: null };
  }

  const p = payload as Record<string, unknown>;
  const data =
    p.data && typeof p.data === "object"
      ? (p.data as Record<string, unknown>)
      : p;

  const mechanic =
    (data.mechanic && typeof data.mechanic === "object"
      ? (data.mechanic as Record<string, unknown>)
      : null) ??
    (data.assigned_mechanic && typeof data.assigned_mechanic === "object"
      ? (data.assigned_mechanic as Record<string, unknown>)
      : null);

  const section =
    (data.mechanic_location as Record<string, unknown> | undefined) ??
    (data.mechanicLocation as Record<string, unknown> | undefined);

  const lat =
    parseCoord(data.mechanic_latitude) ??
    parseCoord(data.mechanic_lat) ??
    parseCoord(mechanic?.latitude) ??
    parseCoord(mechanic?.lat) ??
    parseCoord(section?.latitude) ??
    parseCoord(section?.lat);

  const lng =
    parseCoord(data.mechanic_longitude) ??
    parseCoord(data.mechanic_lng) ??
    parseCoord(mechanic?.longitude) ??
    parseCoord(mechanic?.lng) ??
    parseCoord(section?.longitude) ??
    parseCoord(section?.lng);

  const name =
    typeof mechanic?.name === "string"
      ? mechanic.name
      : typeof data.mechanic_name === "string"
        ? data.mechanic_name
        : undefined;

  const dispatchStatus =
    typeof data.dispatch_status === "string"
      ? data.dispatch_status
      : typeof mechanic?.dispatch_status === "string"
        ? mechanic.dispatch_status
        : undefined;

  return { lat, lng, name, dispatchStatus };
}
