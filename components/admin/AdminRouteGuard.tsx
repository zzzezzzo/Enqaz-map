"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { isAdminUser, unwrapAuthMePayload } from "@/lib/postRegisterRedirect";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "allowed" | "denied" | "guest">("loading");

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
        console.log(raw);
        if (cancelled) return;
        const user = unwrapAuthMePayload(raw)
        if (isAdminUser(user)) setState("allowed");
        else setState("denied");
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

  if (state === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="mx-auto max-w-md rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Admin access only</h1>
        <p className="mt-2 text-sm text-slate-600">
          This area requires an administrator account. Your API should mark admins in{" "}
          <code className="rounded bg-white px-1 py-0.5 text-xs">/auth/me</code> (for example{" "}
          <code className="rounded bg-white px-1 py-0.5 text-xs">role: &quot;admin&quot;</code> or{" "}
          <code className="rounded bg-white px-1 py-0.5 text-xs">is_admin: 1</code>).
        </p>
        <Link
          href="/customer"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go to customer app
        </Link>
      </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
