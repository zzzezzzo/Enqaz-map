import type { AxiosInstance } from "axios";
import type { ProviderProfileSavePayload } from "@/app/providers/profile/types";
import { PROVIDER_ROLE_ID } from "@/lib/providerRole";
import { readAuthApiErrorMessage } from "@/services/auth";
import { minutesTo24HourParts } from "@/lib/workshopHours";

export type PutProviderWorkshopOptions = {
  /** Include when the API expects `role_id` on this request (e.g. right after register). */
  includeRoleId?: boolean;
};

function getResponseStatus(error: unknown): number | undefined {
  if (error && typeof error === "object" && "response" in error) {
    return (error as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

/**
 * Body shape for updating provider/workshop profile (see useWorkshopProfileSettings).
 */
export function buildProviderProfilePutBody(
  form: ProviderProfileSavePayload,
  options?: PutProviderWorkshopOptions
) {
  const open = minutesTo24HourParts(form.opening_time);
  const close = minutesTo24HourParts(form.closeing_time);

  /**
   * Always send wall-clock times in **24-hour `HH:MM`** (never 12-hour text).
   * Example: 5:30 PM → `"17:30"`, not `"5:30"` or `"5:30 PM"`.
   */
  const body: Record<string, unknown> = {
    workShopName: form.workShopName,
    description: form.description,
    latitude: form.latitude,
    longitude: form.longitude,
    services: form.services,
    opening_time: open.time24,
    closeing_time: close.time24,
    closing_time: close.time24,
    name: form.workShopName,
    workshop_name: form.workShopName,
    service_ids: form.services,
  };
  if (options?.includeRoleId) {
    body.role_id = PROVIDER_ROLE_ID;
  }
  return body;
}

type WriteAttempt = {
  method: "put" | "patch" | "post";
  path: string;
  /** When set, sent instead of `body` (e.g. Laravel HTTP method spoofing). */
  body?: Record<string, unknown>;
};

/**
 * Updates workshop fields for the signed-in provider.
 *
 * Many Laravel APIs use **POST only for create** (`POST /provider/profile`), which responds with
 * “already exists” when a profile is present. Saved settings therefore try **PUT/PATCH** first,
 * then alternate paths, then POST with `_method: PUT` for servers that only expose POST.
 */
export async function putProviderWorkshopProfile(
  api: AxiosInstance,
  form: ProviderProfileSavePayload,
  options?: PutProviderWorkshopOptions
): Promise<void> {
  const body = buildProviderProfilePutBody(form, options);

  const attempts: WriteAttempt[] = [
    { method: "put", path: "/provider/profile" },
    { method: "patch", path: "/provider/profile" },
    { method: "put", path: "/workshop/profile" },
    { method: "patch", path: "/workshop/profile" },
    {
      method: "post",
      path: "/provider/profile",
      body: { ...body, _method: "PUT" },
    },
  ];

  let lastError: unknown;
  for (const a of attempts) {
    const payload = a.body ?? body;
    try {
      switch (a.method) {
        case "put":
          await api.put(a.path, payload);
          break;
        case "patch":
          await api.patch(a.path, payload);
          break;
        case "post":
          await api.post(a.path, payload);
          break;
      }
      return;
    } catch (error: unknown) {
      lastError = error;
      const status = getResponseStatus(error);
      if (status === 404 || status === 405) continue;
      throw error;
    }
  }

  throw lastError ?? new Error("Failed to save provider profile");
}

/**
 * After `POST /register` as a provider, ensure workshop fields exist on the API.
 * Tries **create** (`POST /provider/profile`); if the profile already exists, falls back to **update**
 * (`putProviderWorkshopProfile`).
 */
export async function syncProviderWorkshopAfterRegister(
  api: AxiosInstance,
  form: ProviderProfileSavePayload
): Promise<void> {
  const body = buildProviderProfilePutBody(form);
  try {
    await api.post("/provider/profile", body);
  } catch (err: unknown) {
    const status = getResponseStatus(err);
    const msg = readAuthApiErrorMessage(err).toLowerCase();
    const looksLikeAlreadyExists =
      status === 409 ||
      (status === 422 &&
        (msg.includes("already exist") ||
          msg.includes("already exists") ||
          msg.includes("duplicate")));
    if (looksLikeAlreadyExists) {
      await putProviderWorkshopProfile(api, form);
      return;
    }
    throw err;
  }
}
