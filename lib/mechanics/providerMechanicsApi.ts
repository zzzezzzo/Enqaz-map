import axios from "axios";
import api from "@/services/auth";
import type { WorkshopMechanic } from "./types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object";
}

function extractList(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (!isRecord(body)) return [];
  if (Array.isArray(body.mechanics)) return body.mechanics;
  if (Array.isArray(body.data)) return body.data;
  const inner = body.data;
  if (isRecord(inner)) {
    if (Array.isArray(inner.mechanics)) return inner.mechanics;
    if (Array.isArray(inner.data)) return inner.data;
  }
  return [];
}

function normalizeMechanic(row: unknown): WorkshopMechanic | null {
  if (!isRecord(row)) return null;
  const id = Number(row.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    name: String(row.name ?? ""),
    username: String(row.username ?? row.user_name ?? ""),
    phone:
      row.phone != null
        ? String(row.phone)
        : row.phone_number != null
          ? String(row.phone_number)
          : null,
    is_active: row.is_active === false || row.is_active === 0 ? false : true,
    status: typeof row.status === "string" ? row.status : undefined,
    workshop_id:
      row.workshop_id != null && Number.isFinite(Number(row.workshop_id))
        ? Number(row.workshop_id)
        : undefined,
    is_available:
      row.is_available === false || row.is_available === 0
        ? false
        : typeof row.status === "string"
          ? row.status.toLowerCase() === "available"
          : true,
    current_job_id:
      row.current_job_id != null ? Number(row.current_job_id) : null,
  };
}

function extractMechanicRow(body: unknown): unknown {
  if (!isRecord(body)) return body;
  if (body.mechanic && isRecord(body.mechanic)) return body.mechanic;
  if (body.data && isRecord(body.data)) return body.data;
  return body;
}

function buildMechanicFieldsBody(fields: {
  name?: string;
  username?: string;
  phone?: string;
  password?: string;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (fields.name != null) body.name = fields.name;
  if (fields.username != null) {
    body.username = fields.username;
    body.user_name = fields.username;
  }
  if (fields.phone != null) {
    body.phone = fields.phone;
    body.phone_number = fields.phone;
  }
  if (fields.password) {
    body.password = fields.password;
    body.password_confirmation = fields.password;
  }
  return body;
}

export async function fetchProviderMechanics(
  workshopId: number
): Promise<WorkshopMechanic[]> {
  if (!Number.isFinite(workshopId) || workshopId <= 0) {
    throw new Error("Workshop id is required to load mechanics.");
  }
  const res = await api.get(`/provider/workshop/${workshopId}/mechanics`);
  return extractList(res.data)
    .map(normalizeMechanic)
    .filter((m): m is WorkshopMechanic => m != null);
}

export type CreateMechanicPayload = {
  name: string;
  username: string;
  password: string;
  phone: string;
  /** Provider / workshop record id from GET /provider/profile `data.id`. */
  workshop_id: number;
  /** Alias some Laravel endpoints expect. */
  provider_id?: number;
};

/** Body keys aligned with Laravel validation on POST /provider/add-mechanic. */
function buildCreateMechanicBody(payload: CreateMechanicPayload): Record<string, unknown> {
  const workshopId = payload.provider_id ?? payload.workshop_id;
  return {
    name: payload.name,
    username: payload.username,
    user_name: payload.username,
    password: payload.password,
    password_confirmation: payload.password,
    phone: payload.phone,
    phone_number: payload.phone,
    workshop_id: payload.workshop_id,
    workShop_id: payload.workshop_id,
    provider_id: workshopId,
  };
}

export async function createProviderMechanic(
  payload: CreateMechanicPayload
): Promise<WorkshopMechanic> {
  const res = await api.post("/provider/add-mechanic", buildCreateMechanicBody(payload));
  const body = res.data;
  const row =
    isRecord(body) && isRecord(body.data)
      ? body.data
      : isRecord(body) && body.mechanic
        ? body.mechanic
        : body;
  const mechanic = normalizeMechanic(row);
  if (!mechanic) throw new Error("Invalid mechanic response from server.");
  return mechanic;
}

/** GET /provider/mechanic/{id} — load one mechanic for edit. */
export async function fetchProviderMechanic(id: number): Promise<WorkshopMechanic | null> {
  const res = await api.get(`/provider/mechanic/${id}`);
  return normalizeMechanic(extractMechanicRow(res.data));
}

export type EditMechanicPayload = {
  name?: string;
  username?: string;
  phone?: string;
  password?: string;
};

/** PUT /provider/edit-mechanic/{id} */
export async function editProviderMechanic(
  id: number,
  payload: EditMechanicPayload
): Promise<WorkshopMechanic> {
  const res = await api.put(`/provider/edit-mechanic/${id}`, buildMechanicFieldsBody(payload));
  const mechanic = normalizeMechanic(extractMechanicRow(res.data));
  if (!mechanic) throw new Error("Invalid mechanic response from server.");
  return mechanic;
}

/** PUT /provider/update-mechanic-status/{id} */
export async function updateMechanicStatus(
  id: number,
  status: string
): Promise<WorkshopMechanic> {
  const normalized = status.trim().toLowerCase();
  const res = await api.put(`/provider/update-mechanic-status/${id}`, {
    status: normalized,
    is_active: normalized === "available" ? 1 : 0,
  });
  const mechanic = normalizeMechanic(extractMechanicRow(res.data));
  if (!mechanic) throw new Error("Invalid mechanic response from server.");
  return mechanic;
}

/** @deprecated use editProviderMechanic */
export async function updateProviderMechanic(
  id: number,
  payload: EditMechanicPayload
): Promise<WorkshopMechanic> {
  return editProviderMechanic(id, payload);
}

/** DELETE /provider/delete-mechanic/{id} */
export async function deleteProviderMechanic(id: number): Promise<void> {
  await api.delete(`/provider/delete-mechanic/${id}`);
}

function buildAssignMechanicBody(
  requestId: number,
  mechanicId: number,
  workshopId?: number
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    mechanic_id: mechanicId,
    workshop_mechanic_id: mechanicId,
    mechanic: mechanicId,
    request_id: requestId,
    service_request_id: requestId,
  };
  if (workshopId != null && Number.isFinite(workshopId) && workshopId > 0) {
    body.workshop_id = workshopId;
    body.provider_id = workshopId;
    body.workShop_id = workshopId;
  }
  return body;
}

/**
 * POST /provider/assign-mechanic/{request_id}
 * Falls back to legacy path if the server returns 404.
 */
export async function assignMechanicToRequest(
  requestId: number,
  mechanicId: number,
  workshopId?: number
): Promise<void> {
  if (!Number.isFinite(requestId) || requestId <= 0) {
    throw new Error("Invalid service request id.");
  }
  if (!Number.isFinite(mechanicId) || mechanicId <= 0) {
    throw new Error("Select a mechanic to assign.");
  }

  const body = buildAssignMechanicBody(requestId, mechanicId, workshopId);
  const paths = [
    `/provider/assign-mechanic/${requestId}`,
    `/provider/service-requests/${requestId}/assign-mechanic`,
    `/assign-mechanic/${requestId}`,
  ];

  let lastError: unknown;
  for (const path of paths) {
    try {
      await api.post(path, body);
      return;
    } catch (err) {
      lastError = err;
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
