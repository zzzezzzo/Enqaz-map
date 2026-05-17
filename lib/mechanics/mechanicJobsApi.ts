import { mechanicApi, mechanicAuthService } from "@/services/mechanicAuth";
import type {
  MechanicDispatchStatus,
  MechanicJob,
  MechanicLocationPayload,
} from "./types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object";
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatVehicleDetails(vehicle: unknown): string {
  if (!isRecord(vehicle)) return "-";
  const parts = [vehicle.brand, vehicle.model, vehicle.plate_number].filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0
  );
  return parts.length > 0 ? parts.join(" · ") : "-";
}

function normalizeDispatchStatus(
  value: unknown,
  dispatchStatus?: unknown
): MechanicDispatchStatus {
  const dispatch = String(dispatchStatus ?? "").toLowerCase().trim();
  if (
    dispatch === "unassigned" ||
    dispatch === "assigned" ||
    dispatch === "en_route" ||
    dispatch === "arrived" ||
    dispatch === "in_service" ||
    dispatch === "completed"
  ) {
    return dispatch;
  }
  if (dispatch === "en route") return "en_route";
  if (dispatch === "in service") return "in_service";

  const s = String(value ?? "assigned").toLowerCase().trim();
  if (
    s === "unassigned" ||
    s === "assigned" ||
    s === "en_route" ||
    s === "arrived" ||
    s === "in_service" ||
    s === "completed"
  ) {
    return s;
  }
  if (s === "en route") return "en_route";
  if (s === "in service") return "in_service";
  if (s === "accepted" || s === "pending") return "assigned";
  if (s === "in_progress") return "in_service";
  if (s === "completed") return "completed";
  return "assigned";
}

function normalizeJob(row: unknown): MechanicJob | null {
  if (!isRecord(row)) return null;

  const requestId = Number(row.request_id ?? row.service_request_id ?? row.id);
  if (!Number.isFinite(requestId) || requestId <= 0) return null;

  const customer = isRecord(row.customer) ? row.customer : null;
  const location = isRecord(row.location) ? row.location : null;
  const service = isRecord(row.service) ? row.service : null;

  const requestStatus =
    typeof row.status === "string"
      ? row.status
      : typeof row.request_status === "string"
        ? row.request_status
        : undefined;

  const customerPhone =
    customer?.phone != null
      ? String(customer.phone)
      : row.customer_phone != null
        ? String(row.customer_phone)
        : undefined;

  const description =
    typeof row.problem_description === "string" && row.problem_description.trim()
      ? row.problem_description.trim()
      : typeof row.description === "string" && row.description.trim()
        ? row.description.trim()
        : typeof service?.description === "string" && service.description.trim()
          ? service.description.trim()
          : "-";

  return {
    id: requestId,
    service_request_id: requestId,
    service_name: String(
      service?.name ?? row.service_name ?? "Service"
    ),
    customer_name: String(customer?.name ?? row.customer_name ?? "Customer"),
    customer_phone: customerPhone,
    vehicle_details:
      typeof row.vehicle_details === "string" && row.vehicle_details.trim()
        ? row.vehicle_details
        : formatVehicleDetails(row.vehicle),
    description,
    customer_latitude: toNumber(
      location?.latitude ?? row.customer_latitude ?? row.latitude
    ),
    customer_longitude: toNumber(
      location?.longitude ?? row.customer_longitude ?? row.longitude
    ),
    dispatch_status: normalizeDispatchStatus(requestStatus, row.dispatch_status),
    request_status: requestStatus,
    assigned_at:
      typeof row.created_at === "string"
        ? row.created_at
        : typeof row.assigned_at === "string"
          ? row.assigned_at
          : undefined,
  };
}

function extractJobs(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (!isRecord(body)) return [];
  if (Array.isArray(body.jobs)) return body.jobs;
  if (Array.isArray(body.data)) return body.data;
  const inner = body.data;
  if (isRecord(inner)) {
    if (Array.isArray(inner.jobs)) return inner.jobs;
    if (Array.isArray(inner.data)) return inner.data;
    if (Array.isArray(inner.active_jobs)) return inner.active_jobs;
  }
  if (Array.isArray(body.active_jobs)) return body.active_jobs;
  return [];
}

async function resolveWorkshopId(workshopId?: number): Promise<number> {
  if (workshopId != null && Number.isFinite(workshopId) && workshopId > 0) {
    return workshopId;
  }
  const fromCache = mechanicAuthService.getWorkshopId();
  if (fromCache != null) return fromCache;
  const profile = await mechanicAuthService.getCurrentMechanic();
  const id = profile?.workshop_id;
  if (id != null && Number.isFinite(id) && id > 0) return id;
  throw new Error(
    "Workshop id is missing from your mechanic profile. Sign out and sign in again."
  );
}

/** GET /api/mechanic/jobs/{workshop_id} — active jobs (auth:api). */
export async function fetchMechanicJobs(workshopId?: number): Promise<MechanicJob[]> {
  const wsId = await resolveWorkshopId(workshopId);
  const res = await mechanicApi.get(`/mechanic/jobs/${wsId}`, {
    skipAuthRedirect: true,
  });
  return extractJobs(res.data)
    .map(normalizeJob)
    .filter((j): j is MechanicJob => j != null);
}

/** Load one job by service request id from the workshop jobs list. */
export async function fetchMechanicJob(
  requestId: number,
  workshopId?: number
): Promise<MechanicJob | null> {
  if (!Number.isFinite(requestId) || requestId <= 0) return null;
  const list = await fetchMechanicJobs(workshopId);
  return (
    list.find((j) => j.id === requestId || j.service_request_id === requestId) ?? null
  );
}

export async function updateMechanicJobStatus(
  jobId: number,
  status: MechanicDispatchStatus
): Promise<MechanicJob | null> {
  const res = await mechanicApi.patch(`/mechanic/jobs/${jobId}/status`, {
    dispatch_status: status,
    status,
  });
  const body = res.data;
  const row = isRecord(body) && isRecord(body.data) ? body.data : body;
  return normalizeJob(row);
}

export async function postMechanicLocation(
  payload: MechanicLocationPayload
): Promise<void> {
  await mechanicApi.post("/mechanic/location", {
    latitude: payload.latitude,
    longitude: payload.longitude,
    service_request_id: payload.service_request_id,
    heading: payload.heading,
  });
}
