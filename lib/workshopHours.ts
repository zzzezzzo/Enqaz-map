/** Minutes since midnight (0–1439). */

export const DEFAULT_OPENING_MINUTES = 9 * 60;
export const DEFAULT_CLOSING_MINUTES = 17 * 60;

export function clampMinutes(m: number, fallback: number): number {
  if (!Number.isFinite(m)) return fallback;
  return Math.min(1439, Math.max(0, Math.round(m)));
}

function legacyHourOrMinutes(n: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback;
  if (Number.isInteger(n) && n >= 0 && n <= 23) return n * 60;
  if (Number.isInteger(n) && n >= 0 && n <= 1439) return n;
  return fallback;
}

/**
 * Reads API `opening_time` / `closeing_time`:
 * - integers `0–23` → hour-only legacy → converted to minutes (e.g. `9` → 540)
 * - integers `24–1439` → minutes since midnight
 * - `"HH:MM"` strings supported when the API returns times as strings
 */
export function apiTimeToMinutes(value: unknown, fallback: number): number {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") {
    const parsed = hhmmToMinutes(value);
    if (parsed != null) return clampMinutes(parsed, fallback);
    const n = parseInt(value.trim(), 10);
    return clampMinutes(legacyHourOrMinutes(n, fallback), fallback);
  }
  const n = Number(value);
  return clampMinutes(legacyHourOrMinutes(n, fallback), fallback);
}

export function minutesToHHMM(total: number): string {
  const clamped = clampMinutes(total, 0);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 24-hour parts for persistence (5 PM → hour24 17, not 5). */
export function minutesTo24HourParts(total: number): {
  hour24: number;
  minute: number;
  /** `HH:MM` always on a 24-hour clock (suitable for Laravel `time` / string columns). */
  time24: string;
} {
  const clamped = clampMinutes(total, 0);
  const hour24 = Math.floor(clamped / 60);
  const minute = clamped % 60;
  return { hour24, minute, time24: minutesToHHMM(clamped) };
}

export function hhmmToMinutes(s: string): number | null {
  const trimmed = s.trim();
  const parts = trimmed.split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export type TwelveHourParts = { hour12: number; minute: number; isPm: boolean };

/** Decompose minutes since midnight into 12h clock parts (hour 1–12). */
export function minutesToTwelveHour(total: number): TwelveHourParts {
  const clamped = clampMinutes(total, 0);
  const h24 = Math.floor(clamped / 60);
  const minute = clamped % 60;
  if (h24 === 0) return { hour12: 12, minute, isPm: false };
  if (h24 < 12) return { hour12: h24, minute, isPm: false };
  if (h24 === 12) return { hour12: 12, minute, isPm: true };
  return { hour12: h24 - 12, minute, isPm: true };
}

/** Compose minutes from 12h clock parts. */
export function twelveHourToMinutes(parts: TwelveHourParts): number {
  const h = Math.min(12, Math.max(1, Math.round(parts.hour12)));
  const m = Math.min(59, Math.max(0, Math.round(parts.minute)));
  const { isPm } = parts;
  let h24: number;
  if (!isPm && h === 12) h24 = 0;
  else if (!isPm) h24 = h;
  else if (isPm && h === 12) h24 = 12;
  else h24 = h + 12;
  return clampMinutes(h24 * 60 + m, 0);
}

/** e.g. 540 → "9:00 AM" */
export function formatMinutesAs12h(total: number): string {
  const clamped = clampMinutes(total, 0);
  const h24 = Math.floor(clamped / 60);
  const m = clamped % 60;
  const d = new Date(2000, 0, 1, h24, m, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
