"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { PROVIDER_PENDING_APPROVAL_PATH } from "@/lib/providerAccess";
import { isAdminUser, isProviderUser, unwrapAuthMePayload } from "@/lib/postRegisterRedirect";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<
    "loading" | "allowed" | "denied" | "guest" | { denied: { isProvider: boolean } }
  >("loading");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setState("guest");
      router.replace("/auth/login");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const raw = await authService.getCurrentUser();
        if (cancelled) return;
        const user = unwrapAuthMePayload(raw);
        if (isAdminUser(user)) setState("allowed");
        else
          setState({ denied: { isProvider: isProviderUser(user) } });
      } catch {
        if (!cancelled) setState("denied");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "loading" || state === "guest") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (state === "denied" || (typeof state === "object" && "denied" in state)) {
    const isProvider = typeof state === "object" && "denied" in state && state.denied.isProvider;
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="mx-auto max-w-md rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Admin access only</h1>
          {isProvider ? (
            <p className="mt-2 text-sm text-slate-600">
              Your account is a <strong>provider</strong> (workshop) account, not an administrator.
              The admin dashboard is a separate area. If your workshop is new, an administrator may
              still need to <strong>approve your account</strong> before the full provider app is
              available.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              This area requires an administrator account. If you are not an admin, use the customer
              or provider app for your account type.
            </p>
          )}
          {isProvider ? (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                href="/providers/dashboard"
                className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Go to provider app
              </Link>
              <Link
                href={PROVIDER_PENDING_APPROVAL_PATH}
                className="inline-block rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
              >
                Check approval status
              </Link>
            </div>
          ) : (
            <Link
              href="/customer"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Go to customer app
            </Link>
          )}
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
