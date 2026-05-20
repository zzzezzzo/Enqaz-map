import axios from "axios";
import api from "@/services/auth";
import {
  apiTimeToMinutes,
  DEFAULT_CLOSING_MINUTES,
  DEFAULT_OPENING_MINUTES,
  formatMinutesAs12h,
  hhmmToMinutes,
  minutesToHHMM,
} from "@/lib/workshopHours";

export type AvailableSlot = {
  starts_at: string;
  ends_at: string;
  available: boolean;
};

export type WorkshopHours = {
  openingMinutes: number;
  closingMinutes: number;
  slotDurationMinutes: number;
};

export type SelectedAppointment = {
  date: string;
  starts_at: string;
  ends_at: string;
};

export type FetchSlotsResult = {
  slots: AvailableSlot[];
  hours: WorkshopHours;
  hoursFromBackend: boolean;
};

const DEFAULT_SLOT_DURATION = 30;

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object";
}

function normalizeTimeHHMM(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const parsed = hhmmToMinutes(value);
    if (parsed != null) return minutesToHHMM(parsed);
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return minutesToHHMM(apiTimeToMinutes(value, 0));
  }
  return null;
}

/** e.g. "9:00 AM – 5:00 PM" */
export function formatWorkshopHoursLabel(hours: WorkshopHours): string {
  return `${formatMinutesAs12h(hours.openingMinutes)} – ${formatMinutesAs12h(
    hours.closingMinutes
  )}`;
}

/** Build slot list between opening and closing (24h `HH:MM`). */
export function generateSlotsFromHours(
  hours: WorkshopHours,
  booked: { starts_at: string; ends_at: string }[] = []
): AvailableSlot[] {
  const { openingMinutes, closingMinutes, slotDurationMinutes } = hours;
  if (closingMinutes <= openingMinutes) return [];

  const slots: AvailableSlot[] = [];
  let cursor = openingMinutes;

  while (cursor + slotDurationMinutes <= closingMinutes) {
    const start = minutesToHHMM(cursor);
    const end = minutesToHHMM(cursor + slotDurationMinutes);
    const startMin = cursor;
    const endMin = cursor + slotDurationMinutes;

    const overlaps = booked.some((b) => {
      const bStart = hhmmToMinutes(b.starts_at) ?? 0;
      const bEnd = hhmmToMinutes(b.ends_at) ?? 0;
      return bStart < endMin && bEnd > startMin;
    });

    slots.push({ starts_at: start, ends_at: end, available: !overlaps });
    cursor += slotDurationMinutes;
  }

  return slots;
}

function parseHoursFromRecord(
  p: Record<string, unknown>
): WorkshopHours | null {
  const openRaw =
    p.opening_time ??
    p.openingTime ??
    p.open_time;
  const closeRaw =
    p.closeing_time ?? p.closing_time ?? p.closingTime ?? p.close_time;

  if (openRaw == null && closeRaw == null) return null;

  const open = apiTimeToMinutes(openRaw, DEFAULT_OPENING_MINUTES);
  const close = apiTimeToMinutes(closeRaw, DEFAULT_CLOSING_MINUTES);
  const duration = Number(
    p.slot_duration_minutes ?? p.slot_duration ?? DEFAULT_SLOT_DURATION
  );

  return {
    openingMinutes: open,
    closingMinutes: close,
    slotDurationMinutes:
      Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_SLOT_DURATION,
  };
}

/** Parse workshop hours from many Laravel envelope shapes. */
export function parseHoursFromProvider(data: unknown): WorkshopHours | null {
  if (!isRecord(data)) return null;

  const candidates: unknown[] = [
    data,
    data.data,
    data.provider,
    data.workshop,
    data.workShop,
    isRecord(data.data) ? data.data.provider : null,
    isRecord(data.data) ? data.data.workshop : null,
    isRecord(data.data) ? data.data.workShop : null,
    isRecord(data.data) ? data.data.workshop_profile : null,
  ];

  for (const c of candidates) {
    if (!isRecord(c)) continue;
    const parsed = parseHoursFromRecord(c);
    if (parsed) return parsed;
  }

  return null;
}

function parseSlotsArray(raw: unknown): AvailableSlot[] | null {
  if (!Array.isArray(raw)) return null;
  const slots: AvailableSlot[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const starts_at = normalizeTimeHHMM(item.starts_at ?? item.start);
    const ends_at = normalizeTimeHHMM(item.ends_at ?? item.end);
    if (!starts_at || !ends_at) continue;
    slots.push({
      starts_at,
      ends_at,
      available: item.available !== false,
    });
  }
  return slots.length ? slots : null;
}

function parseAvailableSlotsResponse(data: unknown): {
  slots: AvailableSlot[] | null;
  hours: WorkshopHours | null;
} {
  if (!isRecord(data)) return { slots: null, hours: null };
  const inner = isRecord(data.data) ? data.data : data;
  const hours = parseHoursFromProvider(data);
  const slots =
    parseSlotsArray(inner.slots) ??
    parseSlotsArray(data.slots) ??
    null;
  return { slots, hours };
}

/** Booked windows from existing service_requests. */
export function extractBookedSlotsFromRequests(
  rows: unknown[],
  providerId: number,
  date: string
): { starts_at: string; ends_at: string }[] {
  const booked: { starts_at: string; ends_at: string }[] = [];

  for (const row of rows) {
    if (!isRecord(row)) continue;
    const pid = Number(row.provider_id);
    if (!Number.isFinite(pid) || pid !== providerId) continue;

    const reqType = String(row.request_type ?? "").toLowerCase();
    const schedDate = String(
      row.scheduled_date ?? row.appointment_date ?? ""
    ).slice(0, 10);
    if (reqType !== "scheduled" && !schedDate) continue;
    if (schedDate && schedDate !== date) continue;

    const statusRaw = row.status;
    const statusName = String(
      isRecord(statusRaw) && statusRaw.name != null
        ? statusRaw.name
        : statusRaw ?? ""
    ).toLowerCase();
    if (statusName === "cancelled" || statusName === "canceled") continue;

    const starts_at = normalizeTimeHHMM(
      row.scheduled_starts_at ?? row.starts_at
    );
    const ends_at = normalizeTimeHHMM(row.scheduled_ends_at ?? row.ends_at);
    if (starts_at && ends_at) booked.push({ starts_at, ends_at });
  }

  return booked;
}

async function loadBookedForDate(
  providerId: number,
  date: string
): Promise<{ starts_at: string; ends_at: string }[]> {
  try {
    const res = await api.get("/customer/service-requests");
    const raw: unknown[] = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
    return extractBookedSlotsFromRequests(raw, providerId, date);
  } catch {
    return [];
  }
}

const DEFAULT_HOURS: WorkshopHours = {
  openingMinutes: DEFAULT_OPENING_MINUTES,
  closingMinutes: DEFAULT_CLOSING_MINUTES,
  slotDurationMinutes: DEFAULT_SLOT_DURATION,
};

/**
 * Loads `opening_time` / `closeing_time` (and optional slot duration) from the API.
 * Tries several customer/public routes used in this project.
 */
export async function fetchWorkshopHoursFromBackend(
  providerId: number
): Promise<{ hours: WorkshopHours; fromBackend: boolean }> {
  const paths = [
    `/customer/providers/${providerId}`,
    `/customer/provider/${providerId}`,
    `/customer/workshop/${providerId}`,
    `/providers/${providerId}`,
    `/customer/services-provider/${providerId}`,
  ];

  for (const path of paths) {
    try {
      const res = await api.get(path);
      const parsed = parseHoursFromProvider(res.data);
      if (parsed) return { hours: parsed, fromBackend: true };
    } catch {
      /* next path */
    }
  }

  return { hours: DEFAULT_HOURS, fromBackend: false };
}

/**
 * Loads slots for a date: hours from backend → split into intervals → mark booked.
 * Uses `GET .../available-slots` when present; otherwise generates slots client-side.
 */
export async function fetchAvailableSlots(
  providerId: number,
  date: string
): Promise<FetchSlotsResult> {
  const booked = await loadBookedForDate(providerId, date);
  const { hours: backendHours, fromBackend } =
    await fetchWorkshopHoursFromBackend(providerId);

  const slotPaths = [
    `/providers/${providerId}/available-slots`,
    `/customer/providers/${providerId}/available-slots`,
  ];

  for (const path of slotPaths) {
    try {
      const res = await api.get(path, { params: { date } });
      const { slots: apiSlots, hours: apiHours } = parseAvailableSlotsResponse(
        res.data
      );
      const hours = apiHours ?? backendHours;

      if (apiSlots && apiSlots.length > 0) {
        return {
          slots: apiSlots,
          hours,
          hoursFromBackend: fromBackend || apiHours != null,
        };
      }

      const generated = generateSlotsFromHours(hours, booked);
      if (generated.length > 0) {
        return {
          slots: generated,
          hours,
          hoursFromBackend: fromBackend || apiHours != null,
        };
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) continue;
    }
  }

  const slots = generateSlotsFromHours(backendHours, booked);
  return {
    slots,
    hours: backendHours,
    hoursFromBackend: fromBackend,
  };
}

export function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatSlotRange12h(starts_at: string, ends_at: string): string {
  const s = hhmmToMinutes(starts_at);
  const e = hhmmToMinutes(ends_at);
  if (s == null || e == null) return `${starts_at} – ${ends_at}`;
  return `${formatMinutesAs12h(s)} – ${formatMinutesAs12h(e)}`;
}
