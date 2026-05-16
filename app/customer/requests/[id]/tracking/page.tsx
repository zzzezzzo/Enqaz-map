"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Navigation, Route } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import { useCustomerServiceRequests } from "../../useCustomerServiceRequests";
import echo, { syncEchoBroadcastAuth } from "@/lib/echo";

const RequestsMap = dynamic(() => import("@/components/map/RequestsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
      Loading map...
    </div>
  ),
});

export default function RequestTrackingPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { requests, loading } = useCustomerServiceRequests();
  const request = useMemo(
    () => requests.find((item) => item.id === id) ?? null,
    [id, requests]
  );

  const [liveCustomerCoords, setLiveCustomerCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const [liveWorkshopCoords, setLiveWorkshopCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    setLiveCustomerCoords({
      lat: request?.customerLatitude ?? null,
      lng: request?.customerLongitude ?? null,
    });
    setLiveWorkshopCoords({
      lat: request?.workshopLatitude ?? null,
      lng: request?.workshopLongitude ?? null,
    });
  }, [request]);

  useEffect(() => {
    if (!request) return;
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsError(null);
        setLiveCustomerCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setGpsError("Could not watch your live location. Please allow GPS access.");
      },
      { enableHighAccuracy: true, maximumAge: 1500, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [request]);

  useEffect(() => {
    if (!request) return;
    syncEchoBroadcastAuth();

    const channelPrefix =
      (process.env.NEXT_PUBLIC_CUSTOMER_TRACKING_WS_CHANNEL_PREFIX?.trim() ||
        "service-request").replace(/^private-/, "");
    const channelName = `${channelPrefix}.${request.id}`;
    const privateChannelName = `private-${channelName}`;

    const parseNum = (value: unknown): number | null => {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    const extractLatLng = (
      payload: unknown,
      kind: "customer" | "workshop"
    ): { lat: number | null; lng: number | null } => {
      if (!payload || typeof payload !== "object") {
        return { lat: null, lng: null };
      }
      const p = payload as Record<string, unknown>;
      const data =
        p.data && typeof p.data === "object"
          ? (p.data as Record<string, unknown>)
          : p;

      const section =
        kind === "customer"
          ? (data.customer_location as Record<string, unknown> | undefined)
          : ((data.workshop_location ??
              data.provider_location ??
              data.workShop_location) as Record<string, unknown> | undefined);

      const lat =
        parseNum(
          kind === "customer" ? data.customer_latitude : data.workshop_latitude
        ) ??
        parseNum(data.latitude) ??
        parseNum(data.lat) ??
        parseNum(section?.latitude) ??
        parseNum(section?.lat);
      const lng =
        parseNum(
          kind === "customer"
            ? data.customer_longitude
            : data.workshop_longitude
        ) ??
        parseNum(data.longitude) ??
        parseNum(data.lng) ??
        parseNum(section?.longitude) ??
        parseNum(section?.lng);

      return { lat, lng };
    };

    const channel = echo.private(channelName) as unknown as {
      listenToAll?: (cb: (eventName: string, payload: unknown) => void) => void;
      stopListeningToAll?: (cb: (eventName: string, payload: unknown) => void) => void;
    };

    const onAnyEvent = (_eventName: string, payload: unknown) => {
      const customer = extractLatLng(payload, "customer");
      const workshop = extractLatLng(payload, "workshop");

      if (customer.lat != null && customer.lng != null) {
        setLiveCustomerCoords(customer);
      }
      if (workshop.lat != null && workshop.lng != null) {
        setLiveWorkshopCoords(workshop);
      }
    };

    channel.listenToAll?.(onAnyEvent);

    return () => {
      channel.stopListeningToAll?.(onAnyEvent);
      echo.leaveChannel(privateChannelName);
    };
  }, [request]);

  const customerLat = liveCustomerCoords.lat ?? request?.customerLatitude ?? null;
  const customerLng = liveCustomerCoords.lng ?? request?.customerLongitude ?? null;
  const workshopLat = liveWorkshopCoords.lat ?? request?.workshopLatitude ?? null;
  const workshopLng = liveWorkshopCoords.lng ?? request?.workshopLongitude ?? null;

  const hasCustomerPoint = customerLat != null && customerLng != null;
  const hasWorkshopPoint = workshopLat != null && workshopLng != null;
  const hasMapRoute = hasCustomerPoint && hasWorkshopPoint;
  const canRenderMap = hasCustomerPoint || hasWorkshopPoint;

  const mapsDirectionsUrl = useMemo(() => {
    if (
      customerLat == null ||
      customerLng == null ||
      workshopLat == null ||
      workshopLng == null
    ) {
      return null;
    }
    const origin = `${customerLat},${customerLng}`;
    const destination = `${workshopLat},${workshopLng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  }, [customerLat, customerLng, workshopLat, workshopLng]);

  const uberDirectionsUrl = useMemo(() => {
    if (
      customerLat == null ||
      customerLng == null ||
      workshopLat == null ||
      workshopLng == null
    ) {
      return null;
    }
    return `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${customerLat}&pickup[longitude]=${customerLng}&dropoff[latitude]=${workshopLat}&dropoff[longitude]=${workshopLng}`;
  }, [customerLat, customerLng, workshopLat, workshopLng]);

  const mapCenter = useMemo<[number, number] | null>(() => {
    if (hasCustomerPoint) return [customerLat!, customerLng!];
    if (hasWorkshopPoint) return [workshopLat!, workshopLng!];
    return null;
  }, [customerLat, customerLng, hasCustomerPoint, hasWorkshopPoint, workshopLat, workshopLng]);

  const mapMarkers = useMemo(() => {
    const markers: Array<{
      id: number;
      lat: number;
      lng: number;
      label: string;
      subtitle: string;
      type: "customer" | "workshop";
    }> = [];

    if (hasCustomerPoint) {
      markers.push({
        id: 1,
        lat: customerLat!,
        lng: customerLng!,
        label: "Your Location",
        subtitle: "Live GPS",
        type: "customer",
      });
    }

    if (hasWorkshopPoint) {
      markers.push({
        id: 2,
        lat: workshopLat!,
        lng: workshopLng!,
        label: request?.serviceProvider ?? "Workshop",
        subtitle: "Workshop",
        type: "workshop",
      });
    }

    return markers;
  }, [
    customerLat,
    customerLng,
    hasCustomerPoint,
    hasWorkshopPoint,
    request?.serviceProvider,
    workshopLat,
    workshopLng,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <CustomerNav />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-gray-500">Loading tracking details...</p>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <CustomerNav />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Request not found.</p>
            <Link
              href="/customer/requests"
              className="text-orange-500 hover:underline font-medium"
            >
              Back to Request History
            </Link>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <Link
          href="/customer/requests"
          className="text-orange-500 hover:underline font-medium mb-6 inline-block"
        >
          ← Back to Request History
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-gray-900">Tracking: {request.serviceName}</h1>
            <p className="text-gray-600">Request ID: {request.requestId}</p>
            <p className="text-sm text-gray-500">
              Status: <span className="font-medium text-gray-700">{request.statusLabel ?? request.status}</span>
            </p>
            {gpsError ? <p className="text-xs text-amber-700">{gpsError}</p> : null}
          </div>

          <div className="h-72 overflow-hidden rounded-2xl border border-gray-100">
            {canRenderMap && mapCenter ? (
              <RequestsMap
                center={mapCenter}
                zoom={12}
                markers={mapMarkers}
                route={
                  hasMapRoute
                    ? {
                        from: [customerLat!, customerLng!],
                        to: [workshopLat!, workshopLng!],
                      }
                    : undefined
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-50 px-6 text-center text-sm text-gray-500">
                Waiting for your live location. Please allow browser location access to show the map.
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Live coords - You: {customerLat?.toFixed(5) ?? "—"}, {customerLng?.toFixed(5) ?? "—"} | Workshop:{" "}
            {workshopLat?.toFixed(5) ?? "—"}, {workshopLng?.toFixed(5) ?? "—"}
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href={mapsDirectionsUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                mapsDirectionsUrl
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-200 text-gray-500 pointer-events-none"
              }`}
            >
              <Route className="h-4 w-4" />
              Open in Google Maps
            </a>
            <a
              href={uberDirectionsUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                uberDirectionsUrl
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "bg-gray-200 text-gray-500 pointer-events-none"
              }`}
            >
              <Navigation className="h-4 w-4" />
              Open in Uber
            </a>
          </div>
        </div>
      </main>
      <CustomerFooter />
    </div>
  );
}
