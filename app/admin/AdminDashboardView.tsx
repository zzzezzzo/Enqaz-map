"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowDownRight, ArrowUpRight, Eye, Minus } from "lucide-react";
import type { AdminDashboardCardView, DashboardLiveSystemMap, DashboardRecentActivityRow } from "./dashboardTypes";

const AdminLiveSystemMap = dynamic(() => import("./AdminLiveSystemMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-200" />,
});

type AdminDashboardViewProps = {
  loading: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  cards: AdminDashboardCardView[];
  performance: Array<{ label: string; value: string }> | null;
  pendingApprovals: { new_workshops: number; winch_registrations: number } | null;
  liveSystemMap: DashboardLiveSystemMap;
  recentActivity: DashboardRecentActivityRow[];
};

function statusClass(status: string) {
  const s = status.toLowerCase();
  if (s === "completed") return "bg-emerald-100 text-emerald-800";
  if (s === "accepted" || s === "assigned") return "bg-violet-100 text-violet-800";
  if (s === "in_progress" || s === "in progress") return "bg-sky-100 text-sky-800";
  if (s === "pending") return "bg-amber-100 text-amber-900";
  return "bg-slate-100 text-slate-700";
}

function TrendIcon({ direction }: { direction: AdminDashboardCardView["direction"] }) {
  if (direction === "up") return <ArrowUpRight className="h-4 w-4 text-emerald-500" aria-hidden />;
  if (direction === "down") return <ArrowDownRight className="h-4 w-4 text-red-500" aria-hidden />;
  return <Minus className="h-4 w-4 text-slate-400" aria-hidden />;
}

function TrendTextClass(direction: AdminDashboardCardView["direction"]) {
  if (direction === "up") return "text-emerald-600";
  if (direction === "down") return "text-red-600";
  return "text-slate-500";
}

export function AdminDashboardView({
  loading,
  error,
  onRefresh,
  cards,
  performance,
  pendingApprovals,
  liveSystemMap,
  recentActivity,
}: AdminDashboardViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of ENQAZ operations and system health.</p>
        </div>
        <button
          type="button"
          onClick={() => void onRefresh()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Refresh Dashboard
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.title}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : card.value}</p>
                <div className="mt-2 flex items-center gap-1 text-sm font-medium">
                  <TrendIcon direction={card.direction} />
                  <span className={TrendTextClass(card.direction)}>{card.changePercentText}</span>
                  <span className="font-normal text-slate-400">{card.changeLabel}</span>
                </div>
              </div>
              <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                <card.icon className="h-5 w-5" aria-hidden />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">System performance</h2>
            <ul className="mt-4 space-y-4">
              {(performance ?? []).map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{loading ? "..." : row.value}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Healthy
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Pending approvals</h2>
              <button
                type="button"
                onClick={() => void onRefresh()}
                className="text-xs font-medium text-[#0f2744] hover:underline"
              >
                Refresh
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/admin/workshops"
                className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-amber-200 hover:bg-amber-50/40"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">New workshops</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "..." : String(pendingApprovals?.new_workshops ?? 0)}
                </p>
                <p className="mt-2 text-xs text-amber-700">Open workshops → Activate accounts</p>
              </Link>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Winch registrations</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "..." : String(pendingApprovals?.winch_registrations ?? 0)}
                </p>
                <p className="mt-2 text-xs text-slate-500">Awaiting activation review</p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Live system map</h2>
          <p className="mt-1 text-xs text-slate-500">Live positioning from dashboard endpoint coordinates.</p>
          <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-lg">
            <AdminLiveSystemMap data={liveSystemMap} />
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-md bg-white/90 px-3 py-2 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Active requests
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-600" /> Workshops
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Winches
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
          <p className="text-xs text-slate-500">Latest service requests across the network.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Request ID</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Workshop</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(recentActivity.length ? recentActivity : []).map((row) => (
                <tr key={row.request_id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3 font-mono text-xs font-medium text-slate-900">{row.display_request_id}</td>
                  <td className="px-5 py-3">{row.driver}</td>
                  <td className="px-5 py-3">{row.workshop}</td>
                  <td className="px-5 py-3">{row.service}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{row.time_ago}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      className="inline-flex rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                      aria-label="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">
                    No recent activity found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
