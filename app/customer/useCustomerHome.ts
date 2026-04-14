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

            const normalized: NearestProvider[] = raw.map((item: any) => {
              const provider = item?.data ?? item;
              console.log(provider);

            //   const services: ServiceOption[] = servicesRaw
            //     .map((s: any) => {
            //       const service_id =
            //         s?.pivot?.service_id != null
            //           ? Number(s.pivot.service_id)
            //           : s?.service_id != null
            //             ? Number(s.service_id)
            //             : s?.id != null
            //               ? Number(s.id)
            //               : NaN;

            //       const id = Number.isFinite(service_id) ? service_id : NaN;

            //       const name =
            //         s?.name != null ? String(s.name) : s?.title != null ? String(s.title) : "";

            //       return {
            //         id,
            //         name,
            //       };
            //     })
            //     .filter((s: ServiceOption) => Number.isFinite(s.id) && s.name);

              return {
                id: String(provider?.id ?? item?.id ?? ""),
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
                phone: provider?.phone ?? provider?.provider_phone ?? provider?.user?.phone ?? null,
              };
            });

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

