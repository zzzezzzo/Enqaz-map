"use client";

import { useEffect, useRef } from "react";
import { postMechanicLocation } from "@/lib/mechanics/mechanicJobsApi";

const INTERVAL_MS = 10_000;

type Options = {
  enabled: boolean;
  serviceRequestId: number;
};

/** Watch GPS and POST location to the API while enabled. */
export function useMechanicLocationBroadcast({ enabled, serviceRequestId }: Options) {
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!enabled || serviceRequestId <= 0) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const send = (lat: number, lng: number) => {
      const now = Date.now();
      if (now - lastSentRef.current < INTERVAL_MS) return;
      lastSentRef.current = now;
      void postMechanicLocation({
        latitude: lat,
        longitude: lng,
        service_request_id: serviceRequestId,
      }).catch(() => {
        /* network blips — next tick retries */
      });
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        send(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        /* permission denied — UI should show message */
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, serviceRequestId]);
}
