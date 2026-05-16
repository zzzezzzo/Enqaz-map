"use client";

import type { ReactNode } from "react";
import {
  formatMinutesAs12h,
  minutesToTwelveHour,
  twelveHourToMinutes,
} from "@/lib/workshopHours";

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MINUTES_0_59 = Array.from({ length: 60 }, (_, i) => i);

export type AmPmTimePickerProps = {
  label: string;
  icon?: ReactNode;
  valueMinutes: number;
  onChangeMinutes: (minutes: number) => void;
  /** `slate` matches provider profile card; `gray` matches auth register fields. */
  tone?: "slate" | "gray";
};

export function AmPmTimePicker({
  label,
  icon,
  valueMinutes,
  onChangeMinutes,
  tone = "slate",
}: AmPmTimePickerProps) {
  const { hour12, minute, isPm } = minutesToTwelveHour(valueMinutes);
  const isGray = tone === "gray";

  const emit = (next: { hour12?: number; minute?: number; isPm?: boolean }) => {
    onChangeMinutes(
      twelveHourToMinutes({
        hour12: next.hour12 ?? hour12,
        minute: next.minute ?? minute,
        isPm: next.isPm ?? isPm,
      })
    );
  };

  const rowClass = isGray
    ? "mt-1 flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm"
    : "mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm";

  const labelClass = isGray
    ? "block text-sm font-medium text-gray-700"
    : "text-xs font-semibold text-slate-700";

  const selectClass = isGray
    ? "min-w-[4.25rem] rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
    : "min-w-[4.25rem] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800";

  const previewClass = isGray
    ? "ml-auto text-xs font-medium text-gray-500 tabular-nums"
    : "ml-auto text-xs font-medium text-slate-500 tabular-nums";

  const colonClass = isGray ? "text-sm text-gray-500" : "text-sm text-slate-500";

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className={rowClass}>
        {icon}
        <select
          aria-label={`${label} hour`}
          value={hour12}
          onChange={(e) => emit({ hour12: Number(e.target.value) })}
          className={selectClass}
        >
          {HOURS_12.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className={colonClass}>:</span>
        <select
          aria-label={`${label} minute`}
          value={minute}
          onChange={(e) => emit({ minute: Number(e.target.value) })}
          className={selectClass}
        >
          {MINUTES_0_59.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} AM or PM`}
          value={isPm ? "PM" : "AM"}
          onChange={(e) => emit({ isPm: e.target.value === "PM" })}
          className={selectClass}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
        <span className={previewClass}>{formatMinutesAs12h(valueMinutes)}</span>
      </div>
    </div>
  );
}
