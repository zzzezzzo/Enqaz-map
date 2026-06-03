"use client";

import { CalendarClock, Clock, Loader2, RefreshCw } from "lucide-react";
import type { AvailableSlot, SelectedAppointment } from "@/lib/workshopBooking";
import {
  formatSlotRange12h,
  formatWorkshopHoursLabel,
} from "@/lib/workshopBooking";
import type { WorkshopHours } from "@/lib/workshopBooking";
import type { RequestTimingMode } from "@/hooks/useWorkshopAppointmentBooking";

export type WorkshopAppointmentPickerProps = {
  requestTiming: RequestTimingMode;
  onRequestTimingChange: (mode: RequestTimingMode) => void;
  appointmentDate: string;
  onAppointmentDateChange: (date: string) => void;
  minDate: string;
  slots: AvailableSlot[];
  slotsLoading: boolean;
  slotsError: string | null;
  selectedSlot: SelectedAppointment | null;
  onSelectSlot: (slot: AvailableSlot) => void;
  onReloadSlots: () => void;
  workshopHours: WorkshopHours;
  hoursFromBackend: boolean;
  /** Local device time, e.g. "3:45 PM". */
  currentTimeLabel: string;
};

export default function WorkshopAppointmentPicker({
  requestTiming,
  onRequestTimingChange,
  appointmentDate,
  onAppointmentDateChange,
  minDate,
  slots,
  slotsLoading,
  slotsError,
  selectedSlot,
  onSelectSlot,
  onReloadSlots,
  workshopHours,
  hoursFromBackend,
  currentTimeLabel,
}: WorkshopAppointmentPickerProps) {
  const availableCount = slots.filter((s) => s.available).length;
  const bookingToday = appointmentDate === minDate;

  const slotTitle = (slot: AvailableSlot) => {
    if (slot.available) return "Available";
    if (slot.unavailableReason === "past") return "Past time — not available";
    return "Already booked";
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5 text-orange-600" aria-hidden />
        <h3 className="text-sm font-bold text-slate-900">Visit timing</h3>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label
          className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition ${
            requestTiming === "immediate"
              ? "border-orange-400 bg-orange-50 font-semibold text-orange-950"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <input
            type="radio"
            name="request_timing"
            className="sr-only"
            checked={requestTiming === "immediate"}
            onChange={() => onRequestTimingChange("immediate")}
          />
          As soon as possible
          <span className="mt-0.5 block text-xs font-normal opacity-80">
            Roadside / urgent request
          </span>
        </label>
        <label
          className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition ${
            requestTiming === "scheduled"
              ? "border-orange-400 bg-orange-50 font-semibold text-orange-950"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <input
            type="radio"
            name="request_timing"
            className="sr-only"
            checked={requestTiming === "scheduled"}
            onChange={() => onRequestTimingChange("scheduled")}
          />
          Book a workshop visit
          <span className="mt-0.5 block text-xs font-normal opacity-80">
            Choose date and time at the workshop
          </span>
        </label>
      </div>

      {requestTiming === "scheduled" && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[10rem] flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Date
              </label>
              <input
                type="date"
                min={minDate}
                value={appointmentDate}
                onChange={(e) => onAppointmentDateChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Current time
              </p>
              <p className="flex items-center gap-1.5 font-semibold text-slate-900 tabular-nums">
                <Clock className="h-3.5 w-3.5 text-orange-600" aria-hidden />
                {currentTimeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onReloadSlots}
              disabled={slotsLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${slotsLoading ? "animate-spin" : ""}`}
                aria-hidden
              />
              Refresh
            </button>
          </div>

          {slotsError && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {slotsError}
            </p>
          )}

          <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            {hoursFromBackend ? (
              <>
                <span className="font-semibold text-slate-800">
                  Workshop hours from server:
                </span>{" "}
                {formatWorkshopHoursLabel(workshopHours)}
              </>
            ) : (
              <>
                <span className="font-semibold text-amber-800">Default hours:</span>{" "}
                {formatWorkshopHoursLabel(workshopHours)}
                <span className="mt-1 block text-amber-700">
                  Could not load this workshop&apos;s hours from the API yet.
                </span>
              </>
            )}
            <span className="mt-1 block text-slate-500">
              Split into {workshopHours.slotDurationMinutes}-minute booking slots
              between open and close.
            </span>
          </p>

          {slotsLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              Loading available times…
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                {availableCount > 0
                  ? `${availableCount} time${availableCount === 1 ? "" : "s"} available.${
                      bookingToday
                        ? " Times before now are disabled."
                        : " Booked slots are disabled."
                    }`
                  : bookingToday
                    ? "No times left today — try a later time or another day."
                    : "No open slots — pick another day."}
              </p>
              <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                {slots.map((slot) => {
                  const selected =
                    selectedSlot?.starts_at === slot.starts_at &&
                    selectedSlot?.ends_at === slot.ends_at;
                  const label = formatSlotRange12h(
                    slot.starts_at,
                    slot.ends_at
                  );

                  return (
                    <button
                      key={`${slot.starts_at}-${slot.ends_at}`}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => onSelectSlot(slot)}
                      className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                        !slot.available
                          ? slot.unavailableReason === "past"
                            ? "cursor-not-allowed border-amber-100 bg-amber-50/90 text-amber-700/80 line-through"
                            : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400 line-through"
                          : selected
                            ? "border-orange-500 bg-orange-500 text-white shadow-md"
                            : "border-slate-200 bg-white text-slate-800 hover:border-orange-300 hover:bg-orange-50"
                      }`}
                      title={slotTitle(slot)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedSlot && (
            <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-900">
              Selected:{" "}
              {formatSlotRange12h(
                selectedSlot.starts_at,
                selectedSlot.ends_at
              )}{" "}
              on {selectedSlot.date}
            </p>
          )}
        </>
      )}
    </div>
  );
}
