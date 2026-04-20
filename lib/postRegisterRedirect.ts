import type { ProviderProfileApiResponse } from "@/app/providers/profile/types";
import api, { authService } from "@/services/auth";
import {
  PROVIDER_PENDING_APPROVAL_PATH,
  providerMayAccessProviderApp,
  providerWorkshopRejected,
} from "@/lib/providerAccess";

function unwrapMePayload(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const inner = r.data;
  if (inner != null && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return r;
}

function isProviderUser(user: Record<string, unknown> | null): boolean {
  if (!user) return false;
  const role = user.role;
  if (role === "provider" || role === "Provider") return true;
  if (user.type === "provider") return true;
  if (user.user_type === "provider") return true;
  if (user.is_provider === true || user.is_provider === 1) return true;
  return false;
}

/** Where to send the user right after successful `/register` (token already stored). */
export async function resolvePostRegisterDestination(): Promise<string> {
  try {
    const raw = await authService.getCurrentUser();
    const user = unwrapMePayload(raw);
    if (!isProviderUser(user)) return "/customer";

    const res = await api.get<ProviderProfileApiResponse>("/provider/profile");
    const profile = res.data?.data ?? null;
    if (profile && !providerMayAccessProviderApp(profile)) {
      return providerWorkshopRejected(profile)
        ? `${PROVIDER_PENDING_APPROVAL_PATH}?status=rejected`
        : PROVIDER_PENDING_APPROVAL_PATH;
    }
    return "/providers/dashboard";
  } catch {
    return "/customer";
  }
}
