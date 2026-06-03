"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/services/auth";
import {
  extractProviderIncomingRequestList,
  mapProviderIncomingRequest,
  postProviderIncomingRequestStatus,
  type ProviderIncomingRequest,
} from "@/lib/providerIncomingRequests";

const REQUESTS_PER_PAGE = 10;

export type ProviderServiceRequest = ProviderIncomingRequest;

type ProviderRequestStatus = "accepted" | "rejected";

interface ServiceRequestsApiResponse {
  requests?: unknown[];
  data?: unknown[] | { requests?: unknown[] };
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

function normalizeRequests(
  payload: ServiceRequestsApiResponse | unknown[] | null | undefined
): ProviderIncomingRequest[] {
  const rows = extractProviderIncomingRequestList(payload);
  return rows
    .map(mapProviderIncomingRequest)
    .filter((row): row is ProviderIncomingRequest => row != null);
}

export function useProviderServiceRequests() {
  const [requests, setRequests] = useState<ProviderIncomingRequest[]>([]);
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
      const payload = response.data as ServiceRequestsApiResponse | unknown[];
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
        setPerPage(
          typeof resolvedPerPage === "number"
            ? resolvedPerPage
            : normalized.length || REQUESTS_PER_PAGE
        );
        setTotal(
          typeof resolvedTotal === "number" ? resolvedTotal : normalized.length
        );
      } else {
        setServerPaginated(false);
        setCurrentPage(page);
        setLastPage(page);
        setPerPage(REQUESTS_PER_PAGE);
        setTotal(page === 1 ? normalized.length : 0);
        setHasMoreFallback(normalized.length >= REQUESTS_PER_PAGE);
      }

      setError(null);
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
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
      void fetchRequests(safePage);
    },
    [currentPage, fetchRequests, hasMoreFallback, isLoading, lastPage, serverPaginated]
  );

  const updateRequestStatus = useCallback(
    async (requestId: number, status: ProviderRequestStatus) => {
      try {
        setUpdatingRequestId(requestId);
        setActionError(null);
        await postProviderIncomingRequestStatus(requestId, status);
        await fetchRequests(currentPage);
      } catch (err: unknown) {
        const message =
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "data" in err.response &&
          err.response.data &&
          typeof err.response.data === "object" &&
          "message" in err.response.data &&
          typeof err.response.data.message === "string"
            ? err.response.data.message
            : err instanceof Error
              ? err.message
              : "Failed to update request status";
        setActionError(message);
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
    hasPagination:
      (serverPaginated && lastPage > 1) ||
      (!serverPaginated && (currentPage > 1 || hasMoreFallback)),
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
