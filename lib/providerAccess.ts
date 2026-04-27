import type { ProviderProfileApiData } from "@/app/providers/profile/types";

export const PROVIDER_PENDING_APPROVAL_PATH = "/providers/pending-approval";

/** Full access to `/providers/*` (dashboard, jobs, etc.). */
export function providerMayAccessProviderApp(
  profile: ProviderProfileApiData | null
): boolean {
  if (!profile) return false;
  if (profile.is_available === 0) return false;
  if (profile.approval_status === "pending") return false;
  if (profile.is_available === 1) return true;
  if (typeof profile.is_approved === "number") return profile.is_approved === 1;
  return true;
}

export function providerWorkshopRejected(
  profile: ProviderProfileApiData | null
): boolean {
  return profile?.approval_status === "rejected";
}
