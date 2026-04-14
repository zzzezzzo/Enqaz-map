"use client";

import { useEffect, useState } from "react";
import api from "@/services/auth";
import type { RequestStatus, ServiceRequest } from "@/lib/requests";

type ApiNested = Record<string, unknown>;

function isRecord(v: unknown): v is ApiNested {
  return v != null && typeof v === "object";
}

export type ApiCustomerServiceRequest = {
  id: number;
  customer_id?: number;
  provider_id?: number;
  vehicle_id?: number;
  service_id?: number;
  latitude?: string | number;
  longitude?: string | number;
  description?: string;
  status_id?: number;
  created_at?: string;
  updated_at?: string;
  provider?: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
  };
  vehicle?: {
    id?: number;
    plate_number?: string;
    model?: string;
    brand?: string;
  };
  service?: {
    id?: number;
    name?: string;
    description?: string;
  };
  status?: {
    id?: number;
    name?: string;
  };
};

function mapApiStatus(name: string | undefined): {
  status: RequestStatus;
  statusLabel: string;
} {
  const raw = (name ?? "pending").trim();
  const lower = raw.toLowerCase();
  if (lower === "completed") {
    return { status: "completed", statusLabel: raw || "Completed" };
  }
  if (lower === "cancelled" || lower === "canceled") {
    return { status: "cancelled", statusLabel: raw || "Cancelled" };
  }
  if (lower === "pending") {
    return { status: "pending", statusLabel: raw || "Pending" };
  }
  return { status: "pending", statusLabel: raw || "Pending" };
}

function formatCoords(lat: unknown, lng: unknown): string {
  const la = Number(lat);
  const lo = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return "—";
  return `${la.toFixed(4)}°, ${lo.toFixed(4)}°`;
}

function formatWhen(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function mapApiRowToServiceRequest(
  item: unknown
): ServiceRequest | null {
  if (!isRecord(item)) return null;
  const r = item as ApiCustomerServiceRequest;
  const id = Number(r.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const { status, statusLabel } = mapApiStatus(r.status?.name);

  const v = r.vehicle;
  const vehicleParts = [v?.brand, v?.model, v?.plate_number].filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0
  );

  return {
    id: String(id),
    serviceName: String(r.service?.name ?? "Service"),
    status,
    statusLabel,
    requestId: `SR-${id}`,
    dateTime: formatWhen(r.created_at),
    location: formatCoords(r.latitude, r.longitude),
    customerName: "Your request",
    serviceProvider: String(r.provider?.name ?? "—"),
    description: r.description ? String(r.description) : undefined,
    providerPhone: r.provider?.phone ? String(r.provider.phone) : undefined,
    vehicleSummary:
      vehicleParts.length > 0 ? vehicleParts.join(" · ") : undefined,
  };
}

function extractList(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (!isRecord(body)) return [];
  if (Array.isArray(body.data)) return body.data;
  const inner = body.data;
  if (isRecord(inner) && Array.isArray(inner.data)) return inner.data;
  return [];
}

export function useCustomerServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/customer/service-requests");
        const list = extractList(response.data);
        const mapped = list
          .map(mapApiRowToServiceRequest)
          .filter((x): x is ServiceRequest => x != null);
        if (!cancelled) {
          setRequests(mapped);
        }
      } catch {
        if (!cancelled) {
          setRequests([]);
          setError("Unable to load your request history.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { requests, loading, error };
}
