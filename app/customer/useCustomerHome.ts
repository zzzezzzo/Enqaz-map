"use client";

import { useEffect, useState } from "react";
import api from "@/services/auth";
import { useRouter } from "next/navigation";

export interface LocationState {
  lat: number | null;
  lng: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export interface NearestProvider {
  id: number;
  name: string;
  description: string;
  distanceKm: number | null;
  phone: string | null;
  services: ServiceOption[];
  /** Workshop coordinates when the API returns them */
  latitude: number | null;
  longitude: number | null;
}

function parseCoord(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

export interface ServiceOption {
  id: number;
  name: string;
}

export function useCustomerHome() {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    address: null,
    loading: true,
    error: null,
  });
  const [nearestProviders, setNearestProviders] = useState<NearestProvider[]>(
    []
  );
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser.",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation((prev) => ({
          ...prev,
          lat,
          lng,
          address: null,
          loading: false,
          error: null,
        }));

        setProvidersLoading(true);
        setProvidersError(null);

        api
          .post("/customer/nearest-providers", {
            latitude: lat,
            longitude: lng,
          })
          .then((response) => {
            const raw = Array.isArray(response.data)
              ? response.data
              : Array.isArray(response.data?.data)
                ? response.data.data
                : [];

            const normalized: NearestProvider[] = raw
              .map((item: any) => {
                const provider = item?.data ?? item;
                const loc =
                  provider?.workShop_location ??
                  provider?.workshop_location ??
                  provider?.workShopLocation ??
                  provider?.workshopLocation;

                const latitude =
                  parseCoord(provider?.latitude) ??
                  parseCoord(provider?.lat) ??
                  parseCoord(loc?.latitude) ??
                  parseCoord(loc?.lat) ??
                  parseCoord(item?.latitude) ??
                  parseCoord(item?.lat);

                const longitude =
                  parseCoord(provider?.longitude) ??
                  parseCoord(provider?.lng) ??
                  parseCoord(loc?.longitude) ??
                  parseCoord(loc?.lng) ??
                  parseCoord(item?.longitude) ??
                  parseCoord(item?.lng);

                const rawId = provider?.id ?? item?.id;
                const id = typeof rawId === "number" ? rawId : Number(rawId);

                return {
                  id: Number.isFinite(id) ? id : NaN,
                  name: String(
                    provider?.workShopName ??
                      provider?.workshopName ??
                      provider?.provider_name ??
                      provider?.name ??
                      "Provider"
                  ),
                  description: String(provider?.description ?? ""),
                  distanceKm:
                    item?.distance != null
                      ? Number(item.distance)
                      : item?.distance_km != null
                        ? Number(item.distance_km)
                        : null,
                  phone:
                    provider?.phone ??
                    provider?.provider_phone ??
                    provider?.user?.phone ??
                    null,
                  services: [] as ServiceOption[],
                  latitude,
                  longitude,
                };
              })
              .filter((p: NearestProvider) => Number.isFinite(p.id));

            setNearestProviders(normalized);
          })
          .catch(() => {
            setProvidersError("Unable to load nearest providers.");
          })
          .finally(() => setProvidersLoading(false));

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "ENQAZ-Roadside-Assistance/1.0",
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            const displayName = data?.address?.road
              ? `${data.address.road}${data.address.city ? ", " + data.address.city : ""}${data.address.country ? ", " + data.address.country : ""}`
              : data?.display_name ?? null;
            setLocation((prev) => ({ ...prev, address: displayName }));
          })
          .catch(() => {});
      },
      () => {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: "Unable to retrieve your location. Please enable location access.",
        }));
      },
      // { enableHighAccuracy: true }
    );
  }, []);

  const displayAddress =
    location.address ??
    (location.lat != null && location.lng != null
      ? "Your current position"
      : "—");

  const displayCoords =
    location.lat != null && location.lng != null
      ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
      : "—";

      const router = useRouter();
    const onSelectProvider = (providerId: number) => {
      router.push(`/customer/request?provider_id=${providerId}`);
    };

  return {
    location,
    displayAddress,
    displayCoords,
    nearestProviders,
    providersLoading,
    providersError,
    onSelectProvider,
  };
}

