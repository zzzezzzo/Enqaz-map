export type ServiceRequestTiming = "immediate" | "scheduled";

export type ScheduledAppointmentFields = {
  date: string;
  starts_at: string;
  ends_at: string;
};

export type CreateServiceRequestCoreFields = {
  provider_id: number;
  vehicle_id: number;
  service_id: number;
  latitude: number;
  longitude: number;
  description: string;
};

/** Detect Laravel/PHP 8 "Undefined array key" for request timing. */
export function isBackendRequestTimingKeyError(message: string): boolean {
  return /undefined array key ["']requestTiming["']/i.test(message);
}

/**
 * Body for POST /customer/service-requests.
 * Always includes timing under camelCase, snake_case, and legacy keys.
 */
export function buildCreateServiceRequestPayload(
  core: CreateServiceRequestCoreFields,
  timing: ServiceRequestTiming,
  scheduled?: ScheduledAppointmentFields | null
): Record<string, unknown> {
  const normalized: ServiceRequestTiming =
    timing === "scheduled" ? "scheduled" : "immediate";

  const payload: Record<string, unknown> = {
    ...core,
    requestTiming: normalized,
    request_timing: normalized,
    request_type: normalized,
  };

  if (normalized === "scheduled" && scheduled) {
    payload.scheduled_date = scheduled.date;
    payload.scheduled_starts_at = scheduled.starts_at;
    payload.scheduled_ends_at = scheduled.ends_at;
  }

  return payload;
}

/** @deprecated Prefer buildCreateServiceRequestPayload */
export function appendServiceRequestTimingFields(
  payload: Record<string, unknown>,
  timing: ServiceRequestTiming,
  scheduled?: ScheduledAppointmentFields | null
): Record<string, unknown> {
  const normalized: ServiceRequestTiming =
    timing === "scheduled" ? "scheduled" : "immediate";

  payload.requestTiming = normalized;
  payload.request_timing = normalized;
  payload.request_type = normalized;

  if (normalized === "scheduled" && scheduled) {
    payload.scheduled_date = scheduled.date;
    payload.scheduled_starts_at = scheduled.starts_at;
    payload.scheduled_ends_at = scheduled.ends_at;
  }

  return payload;
}
