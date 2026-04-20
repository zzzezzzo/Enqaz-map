"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Clock, LogOut } from "lucide-react";
import type { ProviderProfileApiResponse } from "@/app/providers/profile/types";
import api, { authService } from "@/services/auth";
import {
  providerMayAccessProviderApp,
  providerWorkshopRejected,
} from "@/lib/providerAccess";

type ViewState = "loading" | "pending" | "rejected";

function ProviderPendingApprovalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewState>("loading");

  const load = useCallback(async () => {
    setView("loading");
    try {
      const res = await api.get<ProviderProfileApiResponse>("/provider/profile");
      const profile = res.data?.data ?? null;
      if (profile && providerMayAccessProviderApp(profile)) {
        router.replace("/providers/dashboard");
        return;
      }
      if (providerWorkshopRejected(profile) || searchParams.get("status") === "rejected") {
        setView("rejected");
        return;
      }
      setView("pending");
    } catch {
      setView("pending");
    }
  }, [router, searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      window.location.href = "/auth/login";
    }
  };

  if (view === "loading") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
        Checking your account…
      </div>
    );
  }

  const isRejected = view === "rejected";

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {isRejected ? (
          <>
            <AlertCircle className="h-12 w-12 text-red-500" aria-hidden />
            <h1 className="mt-4 text-xl font-semibold text-slate-900">Registration not approved</h1>
            <p className="mt-2 text-sm text-slate-600">
              An administrator did not approve this workshop registration. If you think this is a mistake,
              contact support or try again with updated workshop details after speaking with the team.
            </p>
          </>
        ) : (
          <>
            <Clock className="h-12 w-12 text-amber-500" aria-hidden />
            <h1 className="mt-4 text-xl font-semibold text-slate-900">Waiting for admin approval</h1>
            <p className="mt-2 text-sm text-slate-600">
              Your workshop profile was submitted successfully. An administrator will review it before you can
              accept jobs and appear to customers. You can sign out and come back later.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {!isRejected && (
            <button
              type="button"
              onClick={() => load()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              I was approved — refresh
            </button>
          )}
          <Link
            href="/"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProviderPendingApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          Loading…
        </div>
      }
    >
      <ProviderPendingApprovalInner />
    </Suspense>
  );
}
