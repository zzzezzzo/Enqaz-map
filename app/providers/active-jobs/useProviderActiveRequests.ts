"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/auth";

interface ApiWorkshopLocation {
  latitude?: string;
  longitude?: string;
}

interface ApiActiveRequest {
  id: number;
  vehicle_details?: string;
  latitude?: string;
  longitude?: string;
  customer_name?: string;
  description?: string;
  service_name?: string;
  status?: string;
}

interface ActiveRequestsPayload {
  workShopLocation?: ApiWorkshopLocation;
  active_requests?: ApiActiveRequest[];
}

interface ActiveRequestsApiResponse {
  data?: ActiveRequestsPayload;
}

export interface ProviderActiveRequest {
  id: number;
  vehicleDetails: string;
  latitude: number;
  longitude: number;
  customerName: string;
  description: string;
  serviceName: string;
  status: string;
}

export interface ProviderWorkshopLocation {
  latitude: number;
  longitude: number;
}

export type ActiveRequestStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected";

function toNumber(value?: string): number {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRequests(data?: ApiActiveRequest[]): ProviderActiveRequest[] {
  if (!Array.isArray(data)) return [];
  return data.map((request) => ({
    id: request.id,
    vehicleDetails: request.vehicle_details ?? "-",
    latitude: toNumber(request.latitude),
    longitude: toNumber(request.longitude),
    customerName: request.customer_name ?? "Unknown customer",
    description: request.description ?? "-",
    serviceName: request.service_name ?? "-",
    status: request.status ?? "accepted",
  }));
}

export function useProviderActiveRequests() {
  const [requests, setRequests] = useState<ProviderActiveRequest[]>([]);
  const [workshopLocation, setWorkshopLocation] = useState<ProviderWorkshopLocation>({
    latitude: 0,
    longitude: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null);

  const fetchActiveRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/provider/active-requests");
      const payload = (response.data as ActiveRequestsApiResponse)?.data;

      setRequests(normalizeRequests(payload?.active_requests));
      setWorkshopLocation({
        latitude: toNumber(payload?.workShopLocation?.latitude),
        longitude: toNumber(payload?.workShopLocation?.longitude),
      });
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load active jobs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveRequests();
  }, [fetchActiveRequests]);

  const hasMapCenter = useMemo(
    () => workshopLocation.latitude !== 0 || workshopLocation.longitude !== 0,
    [workshopLocation.latitude, workshopLocation.longitude]
  );

  const updateRequestStatus = useCallback(
    async (requestId: number, status: ActiveRequestStatus) => {
      try {
        setUpdatingRequestId(requestId);
        setActionError(null);
        await api.post(`/provider/active-requests/${requestId}`, { status });
        await fetchActiveRequests();
        return true;
      } catch (err: any) {
        setActionError(err?.response?.data?.message || err?.message || "Failed to update job status");
        return false;
      } finally {
        setUpdatingRequestId(null);
      }
    },
    [fetchActiveRequests]
  );

  return {
    requests,
    workshopLocation,
    hasMapCenter,
    isLoading,
    error,
    actionError,
    updatingRequestId,
    updateRequestStatus,
    refetch: fetchActiveRequests,
  };
}
