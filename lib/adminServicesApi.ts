import axios from "axios";
import api, { readAuthApiErrorMessage } from "@/services/auth";

export type ServiceCategoryKey = "emergency" | "basic" | "workshop" | "other";

/** Service row from `GET/POST /api/admin/services` (Laravel) — extra fields when your API returns them. */
export type AdminCatalogService = {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  /** e.g. "Emergency" | "Basic Service" */
  category_label?: string;
  category_key?: ServiceCategoryKey;
  /** 1/0 or true/false; defaults to "active" when omitted */
  is_active?: boolean;
  total_requests?: number;
  /** e.g. "4.7" or 4.7 */
  average_rating?: string | number;
};

function toNum(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function inferCategoryKey(
  raw: Record<string, unknown>
): { key: ServiceCategoryKey; label: string } {
  const rawCat =
    raw.category_name ??
    raw.category_slug ??
    raw.category ??
    raw.type ??
    "";
  const c = String(rawCat).toLowerCase();
  const label = String(rawCat || "").trim() || "Service";
  if (c.includes("emergency") || c === "1" || raw.is_emergency === 1) {
    return { key: "emergency", label: label || "Emergency" };
  }
  if (c.includes("workshop") || c.includes("work_shop")) {
    return { key: "workshop", label: label || "Workshop Service" };
  }
  if (c.includes("basic") || c === "2") {
    return { key: "basic", label: label || "Basic Service" };
  }
  return { key: "other", label: label || "Service" };
}

const ADMIN_SERVICES_PATH = "/admin/services";

function normalizeService(raw: Record<string, unknown>): AdminCatalogService | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const { key, label: catLabel } = inferCategoryKey(raw);
  const isActive =
    raw.is_active === true || raw.is_active === 1 || raw.is_active === "1" || raw.active === 1
      ? true
      : raw.is_active === false || raw.is_active === 0 || raw.is_active === "0"
        ? false
        : true;
  return {
    id,
    name: String(raw.name ?? raw.title ?? ""),
    description: String(raw.description ?? ""),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
    category_label: catLabel,
    category_key: key,
    is_active: isActive,
    total_requests: toNum(raw.total_requests ?? raw.requests_count),
    average_rating:
      raw.average_rating != null
        ? typeof raw.average_rating === "number"
          ? raw.average_rating
          : String(raw.average_rating)
        : raw.avg_rating != null
          ? typeof raw.avg_rating === "number"
            ? raw.avg_rating
            : String(raw.avg_rating)
          : undefined,
  };
}

/** Single resource from `GET /services/{id}/edit` (may wrap in `data`). */
export function parseSingleServicePayload(payload: unknown): AdminCatalogService | null {
  if (payload == null || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const inner = p.data;
  const o =
    inner != null && typeof inner === "object" && !Array.isArray(inner)
      ? (inner as Record<string, unknown>)
      : p;
  return normalizeService(o);
}

/** Accepts a plain array, `{ data: T[] }`, or Laravel paginator `{ data: { data: T[] } }`. */
export function parseAdminServicesPayload(payload: unknown): AdminCatalogService[] {
  let list: unknown[] = [];
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload != null && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const d = p.data;
    if (Array.isArray(d)) {
      list = d;
    } else if (d != null && typeof d === "object" && "data" in d && Array.isArray((d as { data: unknown[] }).data)) {
      list = (d as { data: unknown[] }).data;
    }
  }
  return list
    .map((x) => (x != null && typeof x === "object" ? normalizeService(x as Record<string, unknown>) : null))
    .filter((s): s is AdminCatalogService => s != null);
}

/**
 * `GET /api/admin/services` — full service catalog for admin.
 */
export async function fetchAdminServices(): Promise<AdminCatalogService[]> {
  const { data } = await api.get(ADMIN_SERVICES_PATH);
  return parseAdminServicesPayload(data);
}

/**
 * `POST /api/admin/services` — create a catalog service.
 * Falls back to `POST /api/services` if the admin route is not implemented.
 */
export async function createAdminService(input: { name: string; description?: string }): Promise<void> {
  const body = {
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
  };
  if (!body.name) {
    throw new Error("Name is required.");
  }
  try {
    await api.post(ADMIN_SERVICES_PATH, body);
    return;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      await api.post("/services", body);
      return;
    }
    throw new Error(readAuthApiErrorMessage(e));
  }
}

/**
 * `GET /api/services/{id}/edit` — service for the edit form (Laravel).
 * Tries `GET /services/{id}` if the edit route is not registered.
 */
export async function getServiceForEdit(id: number): Promise<AdminCatalogService> {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Invalid service id.");
  }
  const paths = [`/admin/services/${id}/edit`, `/services/${id}/edit`, `/services/${id}`];
  let last: unknown;
  for (const path of paths) {
    try {
      const { data } = await api.get(path);
      const s = parseSingleServicePayload(data);
      if (s) return s;
    } catch (e) {
      last = e;
      if (axios.isAxiosError(e) && e.response?.status === 404) continue;
      throw new Error(readAuthApiErrorMessage(e));
    }
  }
  throw new Error(
    last ? readAuthApiErrorMessage(last) : "Could not load service (empty response)."
  );
}

/**
 * `PUT /api/services/{id}` — update service. Uses PATCH on 405; on 404 for `/services/`, tries `/admin/services/{id}`.
 */
export async function updateService(
  id: number,
  input: { name: string; description?: string; is_active?: boolean }
): Promise<void> {
  const body: Record<string, unknown> = { name: input.name.trim(), description: (input.description ?? "").trim() };
  if (!String(body.name)) throw new Error("Name is required.");
  if (input.is_active != null) body.is_active = input.is_active ? 1 : 0;
  const url = `/services/${id}`;
  try {
    await api.put(url, body);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 405) {
      await api.patch(url, body);
    } else if (axios.isAxiosError(e) && e.response?.status === 404) {
      try {
        await api.put(`${ADMIN_SERVICES_PATH}/${id}`, body);
      } catch (e2) {
        if (axios.isAxiosError(e2) && e2.response?.status === 405) {
          await api.patch(`${ADMIN_SERVICES_PATH}/${id}`, body);
        } else {
          throw new Error(readAuthApiErrorMessage(e2));
        }
      }
    } else {
      throw new Error(readAuthApiErrorMessage(e));
    }
  }
}
export async function updateServiceIsActive(id: number, is_active: boolean): Promise<void> {
  const body: Record<string, unknown> = { is_active: is_active ? 1 : 0 };
  try {
    await api.put(`${ADMIN_SERVICES_PATH}/${id}/active`, body);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 405) {
      await api.patch(`${ADMIN_SERVICES_PATH}/${id}`, body);
    } else {
      throw new Error(readAuthApiErrorMessage(e));
    }
  }
}

/**
 * `DELETE /api/services/{id}` — remove catalog service.
 */
export async function deleteService(id: number): Promise<void> {
  const url = `/services/${id}`;
  try {
    await api.delete(url);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      await api.delete(`${ADMIN_SERVICES_PATH}/${id}`);
      return;
    }
    throw new Error(readAuthApiErrorMessage(e));
  }
}
