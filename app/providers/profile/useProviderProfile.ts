"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/services/auth";
import { fetchServicesCatalog } from "@/lib/servicesCatalog";
import type {
  ProviderProfileApiData,
  ProviderProfileApiResponse,
  ServiceOption,
} from "./types";

export { normalizeServicesCatalogPayload } from "@/lib/servicesCatalog";

export function uniqueServiceIdsFromProfile(
  services: ProviderProfileApiData["services"] | undefined
): number[] {
  if (!Array.isArray(services)) return [];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const s of services) {
    const id = Number(s?.id);
    if (!Number.isFinite(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function useProviderProfile() {
  const [profile, setProfile] = useState<ProviderProfileApiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allServices, setAllServices] = useState<ServiceOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<ProviderProfileApiResponse>("/provider/profile");
      const data = response.data?.data ?? null;
      setProfile(data);
      setError(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || (err instanceof Error ? err.message : "Failed to load provider profile"));
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllServices = useCallback(async () => {
    setServicesLoading(true);
    const { services, error } = await fetchServicesCatalog(api);
    setAllServices(services);
    setServicesError(error);
    setServicesLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchAllServices();
  }, [fetchAllServices]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    allServices,
    servicesLoading,
    servicesError,
    refetchServices: fetchAllServices,
  };
}
