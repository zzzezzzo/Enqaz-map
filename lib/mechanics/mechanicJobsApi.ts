import { mechanicApi } from "@/services/mechanicAuth";
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

function normalizeDispatchStatus(value: unknown): MechanicDispatchStatus {
  const s = String(value ?? "assigned").toLowerCase();
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
  return "assigned";
}

function normalizeJob(row: unknown): MechanicJob | null {
  if (!isRecord(row)) return null;
  const id = Number(row.id ?? row.service_request_id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    service_request_id: Number(row.service_request_id ?? row.id ?? id),
    service_name: String(
      row.service_name ??
        (isRecord(row.service) ? row.service.name : undefined) ??
        "Service"
    ),
    customer_name: String(row.customer_name ?? "Customer"),
    vehicle_details: String(row.vehicle_details ?? "-"),
    description: String(row.description ?? "-"),
    customer_latitude: toNumber(row.customer_latitude ?? row.latitude),
    customer_longitude: toNumber(row.customer_longitude ?? row.longitude),
    dispatch_status: normalizeDispatchStatus(row.dispatch_status),
    assigned_at:
      typeof row.assigned_at === "string" ? row.assigned_at : undefined,
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

/** GET /api/mechanic/jobs — active jobs for logged-in mechanic (auth:api). */
export async function fetchMechanicJobs(): Promise<MechanicJob[]> {
  const res = await mechanicApi.get("/mechanic/jobs");
  return extractJobs(res.data)
    .map(normalizeJob)
    .filter((j): j is MechanicJob => j != null);
}

export async function fetchMechanicJob(jobId: number): Promise<MechanicJob | null> {
  const res = await mechanicApi.get(`/mechanic/jobs/${jobId}`);
  const body = res.data;
  const row =
    isRecord(body) && isRecord(body.data)
      ? body.data
      : isRecord(body) && body.job
        ? body.job
        : body;
  return normalizeJob(row);
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
