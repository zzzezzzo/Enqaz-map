"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/auth";

/** Pull Laravel / common API error text from an axios failure. */
function readRequestSubmitError(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return "Failed to submit request. Please try again.";
  }

  const status = err.response?.status;
  const data = err.response?.data;

  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    const msg = rec.message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();

    const errStr = rec.error;
    if (typeof errStr === "string" && errStr.trim()) return errStr.trim();

    const errors = rec.errors;
    if (errors && typeof errors === "object" && !Array.isArray(errors)) {
      const lines: string[] = [];
      for (const [key, val] of Object.entries(errors)) {
        if (Array.isArray(val)) {
          for (const v of val) {
            if (typeof v === "string" && v.trim()) lines.push(`${key}: ${v}`);
          }
        } else if (val != null && String(val).trim()) {
          lines.push(`${key}: ${String(val)}`);
        }
      }
      if (lines.length) return lines.join(" ");
    }
  }

  if (status === 401) return "You are not signed in. Please log in again.";
  if (status === 403) return "You are not allowed to create this request.";
  if (status === 404)
    return "Request API was not found. Check that POST /customer/service-requests exists on the server.";
  if (status === 422)
    return "The server rejected the data (validation). See details above or check required fields.";
  if (status) return `Request failed (HTTP ${status}).`;

  if (typeof err.message === "string" && err.message.trim()) {
    return err.message.trim();
  }

  return "Failed to submit request. Please try again.";
}

export interface LocationState {
  lat: number | null;
  lng: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export type CarDetails = {
  plate_number: string;
  model: string;
  brand: string;
};

type ServiceRequestUseServiceRequestArgs = {
  /** Dynamic route `[service]` slug or id string; optional when `externalServiceId` is set */
  serviceParam?: string;
  initialServiceName?: string;
  /** Unified request page: selected service id from parent state */
  externalServiceId?: number | null;
  externalServiceName?: string;
  /** When set with `requireProviderFromParams`, submit uses this `provider_id` (no localStorage). */
  providerIdParam?: number | null;
  /** When true, `provider_id` must come from `providerIdParam` (URL-driven flow). */
  requireProviderFromParams?: boolean;
  /** When `skipCreatingVehicle` is true, submit uses this `vehicle_id` (no POST /customer/vehicles). */
  selectedVehicleId?: number | null;
  /** When true, use `selectedVehicleId` for submit instead of creating a vehicle from `carDetails`. */
  skipCreatingVehicle?: boolean;
};

const INACTIVE_LOCATION: LocationState = {
  lat: null,
  lng: null,
  address: null,
  loading: false,
  error: null,
};

type RawService = {
  id?: unknown;
  service_id?: unknown;
  slug?: unknown;
  name?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object";
}

export function useServiceRequest({
  serviceParam = "",
  initialServiceName,
  externalServiceId,
  externalServiceName,
  providerIdParam,
  requireProviderFromParams = false,
  selectedVehicleId,
  skipCreatingVehicle = false,
}: ServiceRequestUseServiceRequestArgs) {
  const router = useRouter();

  const [geoLocation, setGeoLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    address: null,
    loading: false,
    error: null,
  });

  const [carDetails, setCarDetails] = useState<CarDetails>({
    plate_number: "",
    model: "",
    brand: "",
  });
  const [problem, setProblem] = useState("");

  const [apiResolved, setApiResolved] = useState<{
    serviceId: number | null;
    serviceName: string;
  }>({ serviceId: null, serviceName: initialServiceName ?? "" });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const externalIdValid =
    externalServiceId != null &&
    Number.isFinite(externalServiceId) &&
    externalServiceId > 0;

  const serviceId = externalIdValid
    ? (externalServiceId as number)
    : apiResolved.serviceId;

  const serviceName = externalIdValid
    ? String(externalServiceName ?? "Service")
    : apiResolved.serviceName;

  useEffect(() => {
    if (externalIdValid) return;

    let cancelled = false;

    const loadServiceId = async () => {
      if (!serviceParam?.trim()) {
        if (!cancelled) {
          setApiResolved({
            serviceId: null,
            serviceName: initialServiceName ?? "",
          });
        }
        return;
      }

      try {
        const response = await api.get("/customer/");
        const raw = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
        const numericParam = Number(serviceParam);
        const match = raw.find((item: unknown) => {
          if (!isRecord(item)) return false;
          const s = item as RawService;
          const idMatch =
            Number.isFinite(numericParam) &&
            (Number(s.id) === numericParam ||
              Number(s.service_id) === numericParam);
          const slugMatch =
            typeof s.slug === "string" ? s.slug === serviceParam : false;
          const nameMatch =
            typeof s.name === "string"
              ? s.name.toLowerCase() ===
                (initialServiceName ?? "").toLowerCase()
              : false;
          return idMatch || slugMatch || nameMatch;
        });

        const m = isRecord(match) ? (match as RawService) : null;
        const id =
          m?.id != null
            ? Number(m.id)
            : m?.service_id != null
              ? Number(m.service_id)
              : null;

        if (!cancelled) {
          setApiResolved({
            serviceId: Number.isFinite(id) ? id : null,
            serviceName: String(
              (m?.name as string | undefined) ??
                initialServiceName ??
                "Service"
            ),
          });
        }
      } catch {
        if (!cancelled) {
          setApiResolved({
            serviceId: null,
            serviceName: initialServiceName ?? "Service",
          });
        }
      }
    };

    void loadServiceId();
    return () => {
      cancelled = true;
    };
  }, [externalIdValid, serviceParam, initialServiceName]);

  const shouldUseLocation = externalIdValid || Boolean(serviceParam?.trim());

  const location = useMemo(
    () => (shouldUseLocation ? geoLocation : INACTIVE_LOCATION),
    [shouldUseLocation, geoLocation]
  );

  useEffect(() => {
    if (!shouldUseLocation) return;

    const run = () => {
      if (!navigator.geolocation) {
        setGeoLocation((prev) => ({
          ...prev,
          loading: false,
          error: "Geolocation is not supported by your browser.",
        }));
        return;
      }

      setGeoLocation((prev) => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setGeoLocation((prev) => ({
            ...prev,
            lat,
            lng,
            address: null,
            loading: false,
            error: null,
          }));

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

              setGeoLocation((prev) => ({ ...prev, address: displayName }));
            })
            .catch(() => {});
        },
        () => {
          setGeoLocation((prev) => ({
            ...prev,
            loading: false,
            error:
              "Unable to retrieve your location. Please enable location access.",
          }));
        },
        { enableHighAccuracy: true }
      );
    };

    queueMicrotask(run);
  }, [shouldUseLocation]);

  const displayAddress = useMemo(() => {
    return (
      location.address ??
      (location.lat != null && location.lng != null
        ? "Your current position"
        : "—")
    );
  }, [location.address, location.lat, location.lng]);

  const displayCoords = useMemo(() => {
    if (location.lat == null || location.lng == null) return "—";
    return `${location.lat.toFixed(5)}° N ${location.lng.toFixed(5)}° E`;
  }, [location.lat, location.lng]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    let provider_id: number | null = null;

    if (requireProviderFromParams) {
      if (
        providerIdParam != null &&
        Number.isFinite(providerIdParam) &&
        providerIdParam > 0
      ) {
        provider_id = providerIdParam;
      }
    } else {
      if (
        providerIdParam != null &&
        Number.isFinite(providerIdParam) &&
        providerIdParam > 0
      ) {
        provider_id = providerIdParam;
      } else {
        try {
          const raw = localStorage.getItem("selected_provider_id");
          provider_id = raw ? Number(raw) : null;
          if (provider_id != null && Number.isNaN(provider_id))
            provider_id = null;
        } catch {
          provider_id = null;
        }
      }
    }

    if (!provider_id) {
      setSubmitError(
        requireProviderFromParams
          ? "Missing provider. Use a link that includes provider_id in the URL."
          : "Please select a workshop as your provider."
      );
      return;
    }

    if (geoLocation.lat == null || geoLocation.lng == null) {
      setSubmitError("Location is not ready yet.");
      return;
    }

    if (!serviceId) {
      setSubmitError("Service is not ready yet. Please try again.");
      return;
    }

    if (!problem.trim()) {
      setSubmitError("Please add a short description of what you need.");
      return;
    }

    let vehicle_id: number;

    if (skipCreatingVehicle) {
      if (
        selectedVehicleId == null ||
        !Number.isFinite(selectedVehicleId) ||
        selectedVehicleId <= 0
      ) {
        setSubmitError("Please select one of your vehicles.");
        return;
      }
      vehicle_id = selectedVehicleId;
    } else {
      const createVehicleId = async (): Promise<number> => {
        try {
          const response = await api.post("/customer/vehicles", carDetails);
          const data = response.data;
          const id = data?.vehicle_id ?? data?.id;
          return id != null ? Number(id) : 0;
        } catch {
          return 0;
        }
      };
      vehicle_id = await createVehicleId();
    }

    const payload = {
      provider_id,
      vehicle_id,
      service_id: serviceId,
      latitude: Number(geoLocation.lat.toFixed(6)),
      longitude: Number(geoLocation.lng.toFixed(6)),
      description: problem.trim(),
    };

    try {
      await api.post("/customer/service-requests", payload);
      router.push("/customer/requests");
    } catch (err) {
      setSubmitError(readRequestSubmitError(err));
    }
  };

  return {
    location,
    carDetails,
    setCarDetails,
    problem,
    setProblem,
    displayAddress,
    displayCoords,
    handleSubmit,
    submitError,
    serviceId,
    serviceName,
  };
}
