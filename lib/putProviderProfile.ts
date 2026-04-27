import type { AxiosInstance } from "axios";
import type { ProviderProfileSavePayload } from "@/app/providers/profile/types";
import { PROVIDER_ROLE_ID } from "@/lib/providerRole";

export type PutProviderWorkshopOptions = {
  /** Include when the API expects `role_id` on this request (e.g. right after register). */
  includeRoleId?: boolean;
};

/**
 * Body shape used by `PUT /provider/profile` in this app (see useWorkshopProfileSettings).
 */
export function buildProviderProfilePutBody(
  form: ProviderProfileSavePayload,
  options?: PutProviderWorkshopOptions
) {
  const body: Record<string, unknown> = {
    ...form,
    name: form.workShopName,
    workshop_name: form.workShopName,
    service_ids: form.services,
  };
  if (options?.includeRoleId) {
    body.role_id = PROVIDER_ROLE_ID;
  }
  return body;
}

/**
 * Saves workshop fields to the same endpoint as the provider settings page.
 * Tries `/workshop/profile` if `/provider/profile` returns 404.
 */
export async function putProviderWorkshopProfile(
  api: AxiosInstance,
  form: ProviderProfileSavePayload,
  options?: PutProviderWorkshopOptions
): Promise<void> {
  const body = buildProviderProfilePutBody(form, options);
  try {
    await api.post("/provider/profile", body);
  } catch (error: unknown) {
    const status =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;
    if (status !== 404) throw error;
    await api.post("/provider/profile", body);
  }
}
