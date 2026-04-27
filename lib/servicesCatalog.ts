import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { ServiceOption } from "@/app/providers/profile/types";

function isPlausibleEmptyListResponse(payload: unknown): boolean {
  if (Array.isArray(payload)) return true;
  if (payload == null) return true;
  if (typeof payload === "object" && "data" in payload) {
    const d = (payload as { data: unknown }).data;
    return d == null || Array.isArray(d);
  }
  return false;
}

export function normalizeServicesCatalogPayload(payload: unknown): ServiceOption[] {
  const raw = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray((payload as { data: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : [];

  return raw
    .map((item: { id?: number; name?: string; title?: string }) => ({
      id: Number(item?.id),
      name: String(item?.name ?? item?.title ?? ""),
    }))
    .filter(
      (service: ServiceOption) =>
        Number.isFinite(service.id) && service.id > 0 && service.name
    );
}

const CATALOG_GET_ATTEMPTS: ReadonlyArray<{ path: string; publicCatalog: boolean }> = [
  { path: "/services", publicCatalog: true },
  { path: "/services", publicCatalog: false },
  { path: "/provider/services", publicCatalog: false },
  { path: "/provider/services", publicCatalog: true },
] as const;

/**
 * Loads the service catalog for signup and profile UIs.
 * Tries guest and authenticated GETs so a stale token does not break public listings;
 * `skipAuthRedirect` avoids full-page jump to login on 401 from protected routes.
 */
export async function fetchServicesCatalog(api: AxiosInstance): Promise<{
  services: ServiceOption[];
  error: string | null;
}> {
  for (const { path, publicCatalog } of CATALOG_GET_ATTEMPTS) {
    try {
      const { data } = await api.get(path, {
        skipAuthRedirect: true,
        publicCatalog,
      } as AxiosRequestConfig);
      const services = normalizeServicesCatalogPayload(data);
      if (services.length > 0) {
        return { services, error: null };
      }
      if (isPlausibleEmptyListResponse(data)) {
        return { services: [], error: null };
      }
    } catch {
      /* try next */
    }
  }
  return {
    services: [],
    error: "Unable to load services from the server.",
  };
}
