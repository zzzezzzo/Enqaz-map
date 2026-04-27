"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
  Shield,
  XCircle,
} from "lucide-react";
import type {
  ProviderProfileApiData,
  ProviderProfileApiResponse,
} from "@/app/providers/profile/types";
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
  const [workshopName, setWorkshopName] = useState<string | null>(null);

  const load = useCallback(async () => {
    setView("loading");
    try {
      const res = await api.get<ProviderProfileApiResponse>("/provider/profile");
      const profile = res.data?.data ?? null;
      if (profile?.workShopName) {
        setWorkshopName(String(profile.workShopName).trim() || null);
      } else {
        setWorkshopName(null);
      }
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
      setWorkshopName(null);
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
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
        Checking your workshop status…
      </div>
    );
  }

  const isRejected = view === "rejected";

  return (
    <div className="w-full max-w-2xl">
      <div
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isRejected ? "border-red-200 bg-white" : "border-amber-200 bg-amber-50/40"
        }`}
      >
        <div
          className={`border-b px-6 py-4 ${
            isRejected ? "border-red-100 bg-red-50/80" : "border-amber-200 bg-amber-100/60"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            {isRejected ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
            ) : (
              <Clock className="h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            )}
            {isRejected ? "Workshop not approved" : "Admin review in progress"}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="text-center sm:text-left">
            {isRejected ? (
              <>
                <XCircle
                  className="mx-auto h-14 w-14 text-red-500 sm:mx-0"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                  Your registration was not approved
                </h1>
                {workshopName && (
                  <p className="mt-1 text-sm font-medium text-slate-700">{workshopName}</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  An administrator <strong>reviewed</strong> your provider profile and chose to{" "}
                  <strong>reject</strong> it. You cannot use the provider app until a workshop
                  account is approved. If you think this is a mistake, contact support.
                </p>
              </>
            ) : (
              <>
                <Shield
                  className="mx-auto h-14 w-14 text-amber-600 sm:mx-0"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                  We&apos;re reviewing your workshop
                </h1>
                {workshopName && (
                  <p className="mt-1 text-sm font-medium text-slate-800">{workshopName}</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Your provider profile is <strong>submitted</strong> and is waiting in the admin
                  queue. An administrator will <strong>review your workshop</strong> and will either
                  <strong> accept</strong> you as a provider or <strong> reject</strong> the
                  application. You will not appear to customers or receive jobs until you are
                  <strong> approved</strong>.
                </p>
              </>
            )}
          </div>

          {!isRejected && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-left">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">If approved</p>
                  <p className="mt-1 text-xs text-emerald-900/80">
                    You can use the full provider dashboard, receive requests, and be visible to
                    customers.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-left">
                <XCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-slate-600"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">If rejected</p>
                  <p className="mt-1 text-xs text-slate-600">
                    The provider application is declined. You can sign in again later to see
                    the outcome, or contact support.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-500 sm:text-left">
            Use &quot;Refresh status&quot; after an admin has updated your account.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            {!isRejected && (
              <button
                type="button"
                onClick={() => load()}
                className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
              >
                Refresh status
              </button>
            )}
            <Link
              href="/"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProviderPendingApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          Loading…
        </div>
      }
    >
      <ProviderPendingApprovalInner />
    </Suspense>
  );
}
