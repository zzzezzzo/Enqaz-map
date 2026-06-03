"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AvailableSlot,
  SelectedAppointment,
  WorkshopHours,
} from "@/lib/workshopBooking";
import {
  DEFAULT_CLOSING_MINUTES,
  DEFAULT_OPENING_MINUTES,
} from "@/lib/workshopHours";
import {
  applyPastSlotCutoff,
  fetchAvailableSlots,
  fetchWorkshopHoursFromBackend,
  formatLocalNow12h,
  todayDateString,
} from "@/lib/workshopBooking";

export type RequestTimingMode = "immediate" | "scheduled";

const CLOCK_TICK_MS = 60_000;

export function useWorkshopAppointmentBooking(providerId: number | null) {
  const [requestTiming, setRequestTiming] =
    useState<RequestTimingMode>("immediate");
  const [appointmentDate, setAppointmentDate] = useState(todayDateString);
  const [fetchedSlots, setFetchedSlots] = useState<AvailableSlot[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [selectedSlot, setSelectedSlot] = useState<SelectedAppointment | null>(
    null
  );
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [workshopHours, setWorkshopHours] = useState<WorkshopHours>({
    openingMinutes: DEFAULT_OPENING_MINUTES,
    closingMinutes: DEFAULT_CLOSING_MINUTES,
    slotDurationMinutes: 30,
  });
  const [hoursFromBackend, setHoursFromBackend] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const slots = useMemo(
    () => applyPastSlotCutoff(fetchedSlots, appointmentDate, now),
    [fetchedSlots, appointmentDate, now]
  );

  const currentTimeLabel = useMemo(() => formatLocalNow12h(now), [now]);

  const loadSlots = useCallback(async () => {
    if (providerId == null || requestTiming !== "scheduled") {
      setFetchedSlots([]);
      setSelectedSlot(null);
      return;
    }

    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedSlot(null);

    try {
      const result = await fetchAvailableSlots(providerId, appointmentDate);
      setWorkshopHours(result.hours);
      setHoursFromBackend(result.hoursFromBackend);
      const withPastCutoff = applyPastSlotCutoff(
        result.slots,
        appointmentDate,
        new Date()
      );
      setFetchedSlots(result.slots);
      if (withPastCutoff.length === 0) {
        setSlotsError(
          result.hoursFromBackend
            ? "No time slots for this day (workshop may be closed). Try another date."
            : "No time slots for this day. Try another date."
        );
      } else if (withPastCutoff.every((s) => !s.available)) {
        setSlotsError(
          "No times left today — pick a later slot tomorrow or another day."
        );
      }
    } catch {
      setFetchedSlots([]);
      setSlotsError("Could not load available times. Try again.");
    } finally {
      setSlotsLoading(false);
    }
  }, [providerId, appointmentDate, requestTiming]);

  useEffect(() => {
    if (providerId == null) return;
    void fetchWorkshopHoursFromBackend(providerId).then(
      ({ hours, fromBackend }) => {
        setWorkshopHours(hours);
        setHoursFromBackend(fromBackend);
      }
    );
  }, [providerId]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    if (!selectedSlot || requestTiming !== "scheduled") return;
    const [cutoff] = applyPastSlotCutoff(
      [
        {
          starts_at: selectedSlot.starts_at,
          ends_at: selectedSlot.ends_at,
          available: true,
        },
      ],
      selectedSlot.date,
      now
    );
    if (!cutoff?.available) setSelectedSlot(null);
  }, [now, selectedSlot, requestTiming]);

  const selectSlot = useCallback(
    (slot: AvailableSlot) => {
      if (!slot.available) return;
      setSelectedSlot({
        date: appointmentDate,
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
      });
    },
    [appointmentDate]
  );

  const clearSlot = useCallback(() => setSelectedSlot(null), []);

  return {
    requestTiming,
    setRequestTiming,
    appointmentDate,
    setAppointmentDate,
    slots,
    selectedSlot,
    selectSlot,
    clearSlot,
    slotsLoading,
    slotsError,
    reloadSlots: loadSlots,
    workshopHours,
    hoursFromBackend,
    currentTimeLabel,
  };
}
