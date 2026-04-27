import axios from "axios";
import api, { readAuthApiErrorMessage } from "@/services/auth";

/** Service attached to a workshop row (from API `services` array). */
export type AdminPendingWorkshopService = {
  id: number;
  name: string;
  description: string;
  pivot?: { provider_id?: number; service_id?: number };
};

/** Row shape from `GET /api/admin/workshops/pending` (Laravel list item). */
export type AdminPendingWorkshop = {
  id: number;
  user_id: number;
  workShopName: string;
  description: string;
  latitude: string;
  longitude: string;
  is_available: number;
  average_rating: string;
  created_at: string;
  updated_at: string;
  services: AdminPendingWorkshopService[];
};

export type AdminWorkshopsPageMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
};

function normalizeServices(raw: unknown): AdminPendingWorkshopService[] {
  if (!Array.isArray(raw)) return [];
  const out: AdminPendingWorkshopService[] = [];
  for (const item of raw) {
    if (item == null || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const sid = Number(o.id);
    if (!Number.isFinite(sid) || sid <= 0) continue;
    const pivot = o.pivot;
    out.push({
      id: sid,
      name: String(o.name ?? ""),
      description: String(o.description ?? ""),
      pivot:
        pivot != null && typeof pivot === "object"
          ? {
              provider_id: Number((pivot as { provider_id?: number }).provider_id) || undefined,
              service_id: Number((pivot as { service_id?: number }).service_id) || undefined,
            }
          : undefined,
    });
  }
  return out;
}

function normalizeRow(raw: Record<string, unknown>): AdminPendingWorkshop | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const isAvail = raw.is_available;
  return {
    id,
    user_id: Number(raw.user_id) || 0,
    workShopName: String(raw.workShopName ?? ""),
    description: String(raw.description ?? ""),
    latitude: String(raw.latitude ?? ""),
    longitude: String(raw.longitude ?? ""),
    is_available: isAvail === true || isAvail === 1 || isAvail === "1" ? 1 : 0,
    average_rating: String(raw.average_rating ?? "0"),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    services: normalizeServices(raw.services),
  };
}

function parseLaravelPage(payload: unknown): {
  rows: AdminPendingWorkshop[];
  meta: AdminWorkshopsPageMeta;
} {
  if (payload == null || typeof payload !== "object") {
    return {
      rows: [],
      meta: { currentPage: 1, lastPage: 1, perPage: 10, total: 0, from: null, to: null },
    };
  }
  const p = payload as Record<string, unknown>;
  const list = Array.isArray(p.data) ? p.data : [];
  const rows: AdminPendingWorkshop[] = (list as unknown[])
    .map((x) => (x != null && typeof x === "object" ? normalizeRow(x as Record<string, unknown>) : null))
    .filter((r): r is AdminPendingWorkshop => r != null);

  return {
    rows,
    meta: {
      currentPage: Math.max(1, Number(p.current_page) || 1),
      lastPage: Math.max(1, Number(p.last_page) || 1),
      perPage: Math.max(1, Number(p.per_page) || 10),
      total: Math.max(0, Number(p.total) || 0),
      from: p.from == null ? null : Number(p.from) || null,
      to: p.to == null ? null : Number(p.to) || null,
    },
  };
}

const PENDING_LIST_PATH = "/admin/workshops/pending";

/**
 * `GET /api/admin/workshops/pending?page=…` — workshops that are not yet available in your listing.
 * Response is a Laravel length-aware paginator (see your API JSON).
 */
export async function fetchAdminPendingWorkshopsPage(page: number): Promise<{
  rows: AdminPendingWorkshop[];
  meta: AdminWorkshopsPageMeta;
}> {
  const { data } = await api.get(PENDING_LIST_PATH, {
    params: { page: Math.max(1, page) },
  });
  return parseLaravelPage(data);
}

/**
 * Updates `is_available` (0 = not available, 1 = available) for a workshop.
 * Tries a few common Laravel admin routes; adjust to match your backend.
 */
export async function updateWorkshopIsAvailable(
  workshopId: number,
  isAvailable: boolean
): Promise<void> {
  const value = isAvailable ? 1 : 0;
  const attempts: Array<{
    method: "patch" | "put" | "post";
    url: string;
    data: Record<string, unknown>;
  }> = [
    {
      method: "put",
      url: `/admin/workshops/${workshopId}/availability`,
      data: { is_available: value },
    },
  ];

  let lastError: unknown;
  for (const a of attempts) {
    try {
      if (a.method === "patch") await api.patch(a.url, a.data);
      else if (a.method === "put") await api.put(a.url, a.data);
      else await api.post(a.url, a.data);
      return;
    } catch (e) {
      lastError = e;
      if (axios.isAxiosError(e) && e.response?.status === 404) continue;
      throw new Error(readAuthApiErrorMessage(e));
    }
  }
  throw new Error(lastError ? readAuthApiErrorMessage(lastError) : "No matching update route for workshop.");
}
