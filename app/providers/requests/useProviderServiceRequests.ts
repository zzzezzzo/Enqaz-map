"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/services/auth";
const REQUESTS_PER_PAGE = 10;

export interface ProviderServiceRequest {
  id: number;
  customer_name: string;
  service_name: string;
  distance: string;
  minutes_ago: string | number;
  description: string;
  phone?: string;
  car?: string;
}

type ProviderRequestStatus = "accepted" | "rejected";

interface ServiceRequestsApiResponse {
  requests?: ProviderServiceRequest[];
  data?: ProviderServiceRequest[] | { requests?: ProviderServiceRequest[] };
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

function normalizeRequests(payload: ServiceRequestsApiResponse | ProviderServiceRequest[] | null | undefined): ProviderServiceRequest[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.requests)) return payload.requests;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && typeof payload.data === "object" && Array.isArray(payload.data.requests)) {
    return payload.data.requests;
  }
  return [];
}

export function useProviderServiceRequests() {
  const [requests, setRequests] = useState<ProviderServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(REQUESTS_PER_PAGE);
  const [serverPaginated, setServerPaginated] = useState(false);
  const [hasMoreFallback, setHasMoreFallback] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get("/provider/service-requests", {
        params: { page, per_page: REQUESTS_PER_PAGE },
      });
      const payload = response.data as ServiceRequestsApiResponse | ProviderServiceRequest[];
      const normalized = normalizeRequests(payload);
      setRequests(normalized);

      const payloadObj =
        payload && typeof payload === "object" && !Array.isArray(payload)
          ? payload
          : null;
      const meta = payloadObj?.meta;
      const resolvedCurrentPage = meta?.current_page ?? payloadObj?.current_page;
      const resolvedLastPage = meta?.last_page ?? payloadObj?.last_page;
      const resolvedPerPage = meta?.per_page ?? payloadObj?.per_page;
      const resolvedTotal = meta?.total ?? payloadObj?.total;
      const hasServerMeta =
        typeof resolvedCurrentPage === "number" &&
        typeof resolvedLastPage === "number";

      if (hasServerMeta) {
        setServerPaginated(true);
        setHasMoreFallback(false);
        setCurrentPage(resolvedCurrentPage);
        setLastPage(Math.max(resolvedLastPage, 1));
        setPerPage(typeof resolvedPerPage === "number" ? resolvedPerPage : normalized.length || 10);
        setTotal(typeof resolvedTotal === "number" ? resolvedTotal : normalized.length);
      } else {
        setServerPaginated(false);
        setCurrentPage(page);
        setLastPage(page);
        setPerPage(REQUESTS_PER_PAGE);
        setTotal(page === 1 ? normalized.length : 0);
        setHasMoreFallback(normalized.length >= REQUESTS_PER_PAGE);
      }

      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const goToPage = useCallback(
    (page: number) => {
      if (isLoading) return;
      const safePage = serverPaginated
        ? Math.max(1, Math.min(page, lastPage))
        : Math.max(1, page);
      if (serverPaginated && safePage === currentPage) return;
      if (!serverPaginated && page > currentPage && !hasMoreFallback) return;
      if (!serverPaginated && page < 1) return;
      fetchRequests(safePage);
    },
    [currentPage, fetchRequests, hasMoreFallback, isLoading, lastPage, serverPaginated]
  );

  const updateRequestStatus = useCallback(
    async (requestId: number, status: ProviderRequestStatus) => {
      try {
        setUpdatingRequestId(requestId);
        setActionError(null);
        await api.post(`/provider/service-requests/${requestId}`, {
          status,
        });
        await fetchRequests(currentPage);
      } catch (err: any) {
        setActionError(err?.response?.data?.message || err?.message || "Failed to update request status");
      } finally {
        setUpdatingRequestId(null);
      }
    },
    [currentPage, fetchRequests]
  );

  return {
    requests,
    isLoading,
    error,
    refetch: () => fetchRequests(currentPage),
    currentPage,
    lastPage,
    total,
    perPage,
    hasPagination: (serverPaginated && lastPage > 1) || (!serverPaginated && (currentPage > 1 || hasMoreFallback)),
    canGoNext: serverPaginated ? currentPage < lastPage : hasMoreFallback,
    canGoPrev: currentPage > 1,
    knowsLastPage: serverPaginated,
    updatingRequestId,
    actionError,
    updateRequestStatus,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  };
}

