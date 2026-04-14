"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/auth";
import { useServiceRequest } from "./useServiceRequest";
import type { ApiService, CustomerVehicleOption } from "./types";

const serviceAccent = [
  "from-orange-500 to-amber-500 shadow-orange-500/25",
  "from-sky-500 to-blue-600 shadow-sky-500/25",
  "from-emerald-500 to-teal-600 shadow-emerald-500/25",
  "from-violet-500 to-purple-600 shadow-violet-500/25",
] as const;

function parsePositiveInt(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeService(item: unknown): ApiService | null {
  const s =
    item && typeof item === "object"
      ? (item as Record<string, unknown>)
      : {};
  const id = Number(s.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  return {
    id,
    name: String(s.name ?? s.service_name ?? "Service"),
    description: String(s.description ?? ""),
  };
}

function normalizeProviderService(item: unknown): ApiService | null {
  const s =
    item && typeof item === "object"
      ? (item as Record<string, unknown>)
      : {};
  const pivot =
    s.pivot && typeof s.pivot === "object"
      ? (s.pivot as Record<string, unknown>)
      : {};
  const id = Number(pivot.service_id ?? s.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  return {
    id,
    name: String(s.name ?? "Service"),
    description: String(s.description ?? ""),
  };
}

/**
 * Turn many API envelope shapes into a flat list of row objects.
 * Handles: array root, { data: [] }, { data: { id } } (single vehicle),
 * Laravel paginator { data: { data: [], current_page } }, { vehicles: [] }, etc.
 */
function coerceVehicleRows(input: unknown, depth = 0): unknown[] {
  if (input == null || depth > 8) return [];
  if (Array.isArray(input)) return input;
  if (typeof input !== "object") return [];

  const o = input as Record<string, unknown>;

  for (const k of ["vehicles", "items", "results", "records"] as const) {
    const v = o[k];
    if (Array.isArray(v)) return v;
  }

  if (Array.isArray(o.data)) return o.data;

  if (o.data != null && typeof o.data === "object" && !Array.isArray(o.data)) {
    const inner = o.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) return inner.data;
    return coerceVehicleRows(o.data, depth + 1);
  }

  const id = Number(o.id ?? o.vehicle_id);
  if (Number.isFinite(id) && id > 0) return [input];

  return [];
}

function rowToVehicleOption(item: unknown): CustomerVehicleOption | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...raw };
  if (raw.attributes && typeof raw.attributes === "object") {
    Object.assign(merged, raw.attributes as Record<string, unknown>);
  }

  const id = Number(merged.id ?? merged.vehicle_id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const plate = String(
    merged.plate_number ?? merged.plate ?? merged.license_plate ?? ""
  ).trim();
  const model = String(
    merged.model ?? merged.vehicle_model ?? merged.name ?? ""
  ).trim();
  const brand = String(
    merged.brand ?? merged.make ?? merged.manufacturer ?? ""
  ).trim();
  const parts = [brand, model].filter(Boolean);
  const label =
    parts.length > 0
      ? `${parts.join(" ")}${plate ? ` · ${plate}` : ""}`
      : plate || `Vehicle #${id}`;

  return { id, label };
}

function extractVehiclesFromResponse(responseBody: unknown): CustomerVehicleOption[] {
  const rows = coerceVehicleRows(responseBody, 0);
  const out: CustomerVehicleOption[] = [];
  for (const row of rows) {
    const opt = rowToVehicleOption(row);
    if (opt) out.push(opt);
  }
  return out;
}

export function useCustomerRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [allServices, setAllServices] = useState<ApiService[]>([]);
  const [allServicesLoading, setAllServicesLoading] = useState(false);

  const [providerServices, setProviderServices] = useState<ApiService[]>([]);
  const [providerServicesLoading, setProviderServicesLoading] =
    useState(false);
  const [providerServicesError, setProviderServicesError] = useState<
    string | null
  >(null);

  const [vehicles, setVehicles] = useState<CustomerVehicleOption[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );

  const providerId = useMemo(() => {
    const raw =
      searchParams.get("provider_id") ?? searchParams.get("providerId");
    return parsePositiveInt(raw);
  }, [searchParams]);

  const {
    location,
    problem,
    setProblem,
    displayAddress,
    displayCoords,
    submitError,
    handleSubmit,
    serviceName,
  } = useServiceRequest({
    serviceParam: "",
    externalServiceId: selectedServiceId,
    externalServiceName: selectedServiceName,
    providerIdParam: providerId,
    requireProviderFromParams: true,
    selectedVehicleId,
    skipCreatingVehicle: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const num = parsePositiveInt(searchParams.get("service"));
    if (num) setSelectedServiceId(num);
  }, [mounted, searchParams]);

  useEffect(() => {
    if (selectedServiceId == null) return;
    const hit =
      allServices.find((s) => s.id === selectedServiceId) ??
      providerServices.find((s) => s.id === selectedServiceId);
    if (hit) setSelectedServiceName(hit.name);
  }, [selectedServiceId, allServices, providerServices]);

  useEffect(() => {
    if (!mounted) return;

    const loadServices = async () => {
      setAllServicesLoading(true);
      try {
        const response = await api.get("/services");
        const raw: unknown[] = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
        const normalized = raw
          .map(normalizeService)
          .filter((s: ApiService | null): s is ApiService => s != null);
        setAllServices(normalized);
      } catch {
        setAllServices([]);
      } finally {
        setAllServicesLoading(false);
      }
    };

    void loadServices();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!providerId) {
      setProviderServices([]);
      setProviderServicesError(null);
      return;
    }

    const loadProviderServices = async () => {
      setProviderServicesLoading(true);
      setProviderServicesError(null);
      try {
        const response = await api.get(
          `/customer/services-provider/${providerId}`
        );
        const raw: unknown[] = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        const normalized = raw
          .map(normalizeProviderService)
          .filter((s: ApiService | null): s is ApiService => s != null);
        setProviderServices(normalized);
      } catch {
        setProviderServices([]);
        setProviderServicesError("Unable to load provider services.");
      } finally {
        setProviderServicesLoading(false);
      }
    };

    void loadProviderServices();
  }, [mounted, providerId]);

  useEffect(() => {
    if (!mounted) return;

    const loadVehicles = async () => {
      setVehiclesLoading(true);
      setVehiclesError(null);
      try {
        const response = await api.get("/customer/vehicles");
        const list = extractVehiclesFromResponse(response.data);
        setVehicles(list);
        if (list.length === 1) {
          setSelectedVehicleId(list[0].id);
        }
      } catch {
        setVehicles([]);
        setVehiclesError("Unable to load your vehicles.");
      } finally {
        setVehiclesLoading(false);
      }
    };

    void loadVehicles();
  }, [mounted]);

  const showProviderMode = Boolean(providerId);
  const quickAccessServices = useMemo(() => {
    return providerId ? providerServices : allServices;
  }, [providerId, providerServices, allServices]);

  const selectService = useCallback((service: ApiService) => {
    setSelectedServiceId(service.id);
    setSelectedServiceName(service.name);
  }, []);

  const clearService = useCallback(() => {
    setSelectedServiceId(null);
    setSelectedServiceName("");
    const next = new URLSearchParams(searchParams.toString());
    next.delete("service");
    const q = next.toString();
    router.replace(q ? `/customer/request?${q}` : "/customer/request");
  }, [router, searchParams]);

  return {
    mounted,
    providerId,
    showProviderMode,
    allServices,
    allServicesLoading,
    providerServices,
    providerServicesLoading,
    providerServicesError,
    vehicles,
    vehiclesLoading,
    vehiclesError,
    selectedServiceId,
    selectedVehicleId,
    setSelectedVehicleId,
    selectService,
    clearService,
    quickAccessServices,
    serviceAccent,
    location,
    problem,
    setProblem,
    displayAddress,
    displayCoords,
    submitError,
    handleSubmit,
    serviceName,
  };
}

export type CustomerRequestPageViewModel = ReturnType<
  typeof useCustomerRequestPage
>;
