"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ProviderProfileApiResponse } from "@/app/providers/profile/types";
import api from "@/services/auth";
import {
  PROVIDER_PENDING_APPROVAL_PATH,
  providerMayAccessProviderApp,
  providerWorkshopRejected,
} from "@/lib/providerAccess";

export default function ProviderRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(PROVIDER_PENDING_APPROVAL_PATH)) {
      setAllowed(true);
      return;
    }

    let cancelled = false;
    let redirected = false;

    (async () => {
      try {
        const res = await api.get<ProviderProfileApiResponse>("/provider/profile");
        const profile = res.data?.data ?? null;
        if (cancelled) return;
        if (profile && !providerMayAccessProviderApp(profile)) {
          redirected = true;
          const suffix = providerWorkshopRejected(profile) ? "?status=rejected" : "";
          router.replace(`${PROVIDER_PENDING_APPROVAL_PATH}${suffix}`);
          return;
        }
      } catch {
        // Non-provider accounts or network errors: still render; API routes will enforce auth.
      } finally {
        if (!cancelled && !redirected) setAllowed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
