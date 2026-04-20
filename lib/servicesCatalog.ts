import type { AxiosInstance } from "axios";
import type { ServiceOption } from "@/app/providers/profile/types";

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

const SERVICE_ENDPOINTS = ["/services", "/provider/services"] as const;

/**
 * Loads the service catalog for signup and profile UIs.
 * Tries public `/services` first, then `/provider/services` (e.g. when the API only exposes the catalog there).
 */
export async function fetchServicesCatalog(api: AxiosInstance): Promise<{
  services: ServiceOption[];
  error: string | null;
}> {
  for (const url of SERVICE_ENDPOINTS) {
    try {
      const { data } = await api.get(url);
      console.log(data);
      const services = normalizeServicesCatalogPayload(data);
      return { services, error: null };
    } catch {
      /* try next endpoint */
    }
  }
  return {
    services: [],
    error: "Unable to load services from the server.",
  };
}
