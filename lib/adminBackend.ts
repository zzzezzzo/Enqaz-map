import axios from "axios";
import api, { readAuthApiErrorMessage } from "@/services/auth";
import { fetchServicesCatalog } from "@/lib/servicesCatalog";
import type { ServiceOption } from "@/app/providers/profile/types";

export type AdminWorkshopRow = {
  id: number;
  workShopName: string;
  email?: string;
  approval_status?: "pending" | "approved" | "rejected";
  is_approved?: number;
};

function rowsFromPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((x) => x != null && typeof x === "object") as Record<string, unknown>[];
  }
  if (payload != null && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const inner = p.data;
    if (Array.isArray(inner)) {
      return inner.filter((x) => x != null && typeof x === "object") as Record<string, unknown>[];
    }
  }
  return [];
}

function normalizeWorkshopRow(raw: Record<string, unknown>): AdminWorkshopRow | null {
  const id = Number(raw.id ?? raw.provider_id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const workShopName = String(
    raw.workShopName ?? raw.workshop_name ?? raw.name ?? raw.workshopName ?? "Workshop"
  );
  const email =
    typeof raw.email === "string"
      ? raw.email
      : raw.user && typeof raw.user === "object"
        ? String((raw.user as Record<string, unknown>).email ?? "")
        : undefined;
  const approval_status = raw.approval_status as AdminWorkshopRow["approval_status"] | undefined;
  const is_approved =
    typeof raw.is_approved === "number"
      ? raw.is_approved
      : raw.is_approved === true
        ? 1
        : raw.is_approved === false
          ? 0
          : undefined;
  return {
    id,
    workShopName,
    email: email || undefined,
    approval_status,
    is_approved,
  };
}

function isPendingRow(row: AdminWorkshopRow): boolean {
  if (row.approval_status === "pending") return true;
  if (row.approval_status === "approved" || row.approval_status === "rejected") return false;
  if (typeof row.is_approved === "number") return row.is_approved !== 1;
  return true;
}

/**
 * Loads workshops/providers awaiting admin activation.
 * Tries several Laravel-style routes; your API may implement only one.
 */
export async function fetchPendingWorkshopsForAdmin(): Promise<{
  workshops: AdminWorkshopRow[];
  endpointUsed: string | null;
  error: string | null;
}> {
  const endpoints: Array<{
    url: string;
    params?: Record<string, string>;
    /** When true, only rows that look "pending" are kept (broad list endpoints). */
    clientFilter: boolean;
  }> = [
    { url: "/admin/workshops/pending", clientFilter: false },
    { url: "/admin/workshops", params: { status: "pending" }, clientFilter: false },
    { url: "/admin/providers/pending", clientFilter: false },
    { url: "/admin/providers", params: { approval_status: "pending" }, clientFilter: false },
    { url: "/admin/providers", clientFilter: true },
  ];

  for (const spec of endpoints) {
    try {
      const { data } = await api.get(spec.url, { params: spec.params });
      const rows = rowsFromPayload(data)
        .map(normalizeWorkshopRow)
        .filter((r): r is AdminWorkshopRow => r != null);
      const workshops = spec.clientFilter ? rows.filter(isPendingRow) : rows;
      return { workshops, endpointUsed: spec.url, error: null };
    } catch {
      /* try next */
    }
  }

  return {
    workshops: [],
    endpointUsed: null,
    error: null,
  };
}

/** Approve / activate a workshop so it can use the provider app. */
export async function approveWorkshopAdmin(workshopId: number): Promise<void> {
  const attempts: Array<{ method: "post" | "put" | "patch"; url: string; data?: unknown }> = [
    { method: "post", url: `/admin/workshops/${workshopId}/approve` },
    { method: "post", url: `/admin/providers/${workshopId}/approve` },
    {
      method: "put",
      url: `/admin/providers/${workshopId}`,
      data: { approval_status: "approved", is_approved: 1 },
    },
    {
      method: "patch",
      url: `/admin/providers/${workshopId}/approval`,
      data: { approval_status: "approved" },
    },
  ];

  let lastError: unknown;
  for (const a of attempts) {
    try {
      if (a.method === "post") await api.post(a.url, a.data ?? {});
      else if (a.method === "put") await api.put(a.url, a.data ?? {});
      else await api.patch(a.url, a.data ?? {});
      return;
    } catch (e) {
      lastError = e;
    }
  }

  throw new Error(lastError ? readAuthApiErrorMessage(lastError) : "Could not approve workshop.");
}

export async function createCatalogServiceAdmin(input: {
  name: string;
  description?: string;
}): Promise<void> {
  const body = {
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
  };
  const urls = ["/admin/services", "/services"];

  let lastError: unknown;
  for (const url of urls) {
    try {
      await api.post(url, body);
      return;
    } catch (e) {
      lastError = e;
      if (axios.isAxiosError(e) && e.response?.status === 404) continue;
    }
  }
  throw new Error(lastError ? readAuthApiErrorMessage(lastError) : "Could not create service.");
}

export async function loadServicesCatalogForAdmin(): Promise<{
  services: ServiceOption[];
  error: string | null;
}> {
  return fetchServicesCatalog(api);
}
