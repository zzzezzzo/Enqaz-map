"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/services/auth";
import type { RequestStatus, ServiceRequest } from "@/lib/requests";
import { formatSlotRange12h } from "@/lib/workshopBooking";

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
  customer_latitude?: string | number;
  customer_longitude?: string | number;
  workshop_latitude?: string | number;
  workshop_longitude?: string | number;
  description?: string;
  status_id?: number;
  created_at?: string;
  updated_at?: string;
  provider?: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
    workshop_location?: {
      latitude?: string | number;
      longitude?: string | number;
      lat?: string | number;
      lng?: string | number;
    };
    workShop_location?: {
      latitude?: string | number;
      longitude?: string | number;
      lat?: string | number;
      lng?: string | number;
    };
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
  workshop_location?: {
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
  };
  workShop_location?: {
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
  };
  workShopLocation?: {
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
  };
  workshop?: {
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
  };
  assigned_mechanic_id?: number;
  mechanic_id?: number;
  mechanic_latitude?: string | number;
  mechanic_longitude?: string | number;
  mechanic_name?: string;
  dispatch_status?: string;
  request_type?: string;
  requestTiming?: string;
  request_timing?: string;
  scheduled_date?: string;
  scheduled_starts_at?: string;
  scheduled_ends_at?: string;
  assigned_mechanic?: {
    id?: number;
    name?: string;
    phone?: string;
    phone_number?: string;
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
  };
  mechanic?: {
    id?: number;
    name?: string;
    phone?: string;
    phone_number?: string;
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
  };
};

function mapApiStatus(name: string | undefined): {
  status: RequestStatus;
  statusLabel: string;
} {
  const raw = (name ?? "pending").trim();
  const lower = raw.toLowerCase();
  if (lower === "accepted") {
    return { status: "accepted", statusLabel: raw || "Accepted" };
  }
  if (lower === "in_progress" || lower === "in progress") {
    return { status: "in_progress", statusLabel: raw || "In Progress" };
  }
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

function parseCoord(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
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

  const workshopLocation =
    r.provider?.workshop_location ??
    r.provider?.workShop_location ??
    r.workshop_location ??
    r.workShop_location ??
    r.workShopLocation ??
    r.workshop;
  const customerLatitude =
    parseCoord(r.customer_latitude) ?? parseCoord(r.latitude);
  const customerLongitude =
    parseCoord(r.customer_longitude) ?? parseCoord(r.longitude);
  const workshopLatitude =
    parseCoord(r.workshop_latitude) ??
    parseCoord(r.provider?.latitude) ??
    parseCoord(r.provider?.lat) ??
    parseCoord(workshopLocation?.latitude) ??
    parseCoord(workshopLocation?.lat);
  const workshopLongitude =
    parseCoord(r.workshop_longitude) ??
    parseCoord(r.provider?.longitude) ??
    parseCoord(r.provider?.lng) ??
    parseCoord(workshopLocation?.longitude) ??
    parseCoord(workshopLocation?.lng);

  const mechanic =
    r.assigned_mechanic ?? r.mechanic ?? null;
  const mechanicLatitude =
    parseCoord(r.mechanic_latitude) ??
    parseCoord(mechanic?.latitude) ??
    parseCoord(mechanic?.lat);
  const mechanicLongitude =
    parseCoord(r.mechanic_longitude) ??
    parseCoord(mechanic?.longitude) ??
    parseCoord(mechanic?.lng);

  const isScheduled =
    String(r.requestTiming ?? r.request_timing ?? r.request_type ?? "")
      .toLowerCase() === "scheduled";

  return {
    id: String(id),
    serviceName: String(r.service?.name ?? "Service"),
    status,
    statusLabel,
    requestId: `SR-${id}`,
    dateTime:
      isScheduled &&
      r.scheduled_date &&
      r.scheduled_starts_at &&
      r.scheduled_ends_at
        ? `${String(r.scheduled_date).slice(0, 10)} · ${formatSlotRange12h(
            String(r.scheduled_starts_at).slice(0, 5),
            String(r.scheduled_ends_at).slice(0, 5)
          )}`
        : formatWhen(r.created_at),
    location: formatCoords(r.latitude, r.longitude),
    customerName: "Your request",
    serviceProvider: String(r.provider?.name ?? "—"),
    description: r.description ? String(r.description) : undefined,
    providerPhone: r.provider?.phone ? String(r.provider.phone) : undefined,
    vehicleSummary:
      vehicleParts.length > 0 ? vehicleParts.join(" · ") : undefined,
    customerLatitude,
    customerLongitude,
    workshopLatitude,
    workshopLongitude,
    mechanicLatitude,
    mechanicLongitude,
    assignedMechanicId:
      r.assigned_mechanic_id != null
        ? Number(r.assigned_mechanic_id)
        : r.mechanic_id != null
          ? Number(r.mechanic_id)
          : mechanic?.id != null
            ? Number(mechanic.id)
            : undefined,
    assignedMechanicName: mechanic?.name
      ? String(mechanic.name)
      : r.mechanic_name
        ? String(r.mechanic_name)
        : undefined,
    assignedMechanicPhone:
      mechanic?.phone != null
        ? String(mechanic.phone)
        : mechanic?.phone_number != null
          ? String(mechanic.phone_number)
          : undefined,
    dispatchStatus: r.dispatch_status ? String(r.dispatch_status) : undefined,
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

  const load = useCallback(async (cancelledRef?: { value: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/customer/service-requests");
      const list = extractList(response.data);
      const mapped = list
        .map(mapApiRowToServiceRequest)
        .filter((x): x is ServiceRequest => x != null);
      if (!cancelledRef?.value) {
        setRequests(mapped);
      }
    } catch {
      if (!cancelledRef?.value) {
        setRequests([]);
        setError("Unable to load your request history.");
      }
    } finally {
      if (!cancelledRef?.value) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cancelledRef = { value: false };
    void load(cancelledRef);
    return () => {
      cancelledRef.value = true;
    };
  }, [load]);

  return { requests, loading, error, refetch: load };
}
