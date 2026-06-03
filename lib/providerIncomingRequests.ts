import api from "@/services/auth";
import { formatSlotRange12h } from "@/lib/workshopBooking";

export type ProviderRequestTiming = "immediate" | "scheduled";

export type RawProviderIncomingRequest = {
  id?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  customer_name?: unknown;
  description?: unknown;
  service_name?: unknown;
  scheduled_date?: unknown;
  scheduled_starts_at?: unknown;
  scheduled_ends_at?: unknown;
  distance?: unknown;
  minutes_ago?: unknown;
  phone?: unknown;
  car?: unknown;
  vehicle_details?: unknown;
  requestTiming?: unknown;
  request_timing?: unknown;
  request_type?: unknown;
};

export type ProviderIncomingRequest = {
  id: number;
  customer_name: string;
  service_name: string;
  description: string;
  distance: string;
  phone?: string;
  car?: string;
  latitude?: number;
  longitude?: number;
  timing: ProviderRequestTiming;
  /** e.g. "May 31, 2026 · 8:00 PM – 8:30 PM" */
  appointmentLabel?: string;
  /** e.g. "in 7 min" or "12 min ago" */
  relativeTimeLabel: string;
  requestLabel: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object";
}

function parseCoord(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function readString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

/** Parses values like `-7.05756005 min`, `12`, or `"5 min ago"`. */
export function parseRelativeMinutes(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = String(value ?? "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number.parseFloat(match[0]);
  return Number.isFinite(n) ? n : null;
}

export function formatRelativeMinutes(minutes: number): string {
  const abs = Math.round(Math.abs(minutes));
  if (abs === 0) return "just now";

  if (minutes < 0) {
    if (abs < 60) return `in ${abs} min`;
    const hours = Math.round(abs / 60);
    if (hours < 24) return `in ${hours} ${hours === 1 ? "hour" : "hours"}`;
    const days = Math.round(hours / 24);
    return `in ${days} ${days === 1 ? "day" : "days"}`;
  }

  if (abs < 60) return `${abs} min ago`;
  const hours = Math.round(abs / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function formatScheduleDate(dateStr: string): string {
  const iso = dateStr.slice(0, 10);
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function isScheduledRow(row: RawProviderIncomingRequest): boolean {
  const timing = String(
    row.requestTiming ?? row.request_timing ?? row.request_type ?? ""
  ).toLowerCase();
  if (timing === "scheduled") return true;
  return Boolean(
    readString(row.scheduled_date) &&
      readString(row.scheduled_starts_at) &&
      readString(row.scheduled_ends_at)
  );
}

export function mapProviderIncomingRequest(
  item: unknown
): ProviderIncomingRequest | null {
  if (!isRecord(item)) return null;
  const row = item as RawProviderIncomingRequest;
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const timing: ProviderRequestTiming = isScheduledRow(row)
    ? "scheduled"
    : "immediate";

  const scheduledDate = readString(row.scheduled_date);
  const startsAt = readString(row.scheduled_starts_at).slice(0, 8);
  const endsAt = readString(row.scheduled_ends_at).slice(0, 8);

  let appointmentLabel: string | undefined;
  if (timing === "scheduled" && scheduledDate && startsAt && endsAt) {
    appointmentLabel = `${formatScheduleDate(scheduledDate)} · ${formatSlotRange12h(
      startsAt.slice(0, 5),
      endsAt.slice(0, 5)
    )}`;
  }

  const relativeMinutes = parseRelativeMinutes(row.minutes_ago);
  const relativeTimeLabel =
    relativeMinutes != null
      ? formatRelativeMinutes(relativeMinutes)
      : readString(row.minutes_ago, "—");

  const car =
    readString(row.car) ||
    readString(row.vehicle_details) ||
    undefined;

  return {
    id,
    customer_name: readString(row.customer_name, "Customer"),
    service_name: readString(row.service_name, "Service"),
    description: readString(row.description, "—"),
    distance: readString(row.distance, "—"),
    phone: readString(row.phone) || undefined,
    car,
    latitude: parseCoord(row.latitude),
    longitude: parseCoord(row.longitude),
    timing,
    appointmentLabel,
    relativeTimeLabel,
    requestLabel: `SR-${id}`,
  };
}

export async function postProviderIncomingRequestStatus(
  requestId: number,
  status: "accepted" | "rejected"
): Promise<void> {
  await api.post(`/provider/service-requests/${requestId}`, { status });
}

export function extractProviderIncomingRequestList(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (!isRecord(body)) return [];

  if (Array.isArray(body.requests)) return body.requests;

  const data = body.data;
  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.requests)) return data.requests;

  return [];
}
