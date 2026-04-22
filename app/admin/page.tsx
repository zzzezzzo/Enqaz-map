"use client";

import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Eye,
  FileText,
  Truck,
  Users,
} from "lucide-react";
import { useAdminPendingCounts } from "./useAdminPendingCounts";

const kpis = [
  { title: "Total Requests Today", value: "156", delta: "+12.5%", up: true, Icon: FileText },
  { title: "Active Requests", value: "24", delta: "-5.3%", up: false, Icon: Activity },
  { title: "Registered Drivers", value: "2,847", delta: "+8.2%", up: true, Icon: Users },
  { title: "Registered Workshops", value: "142", delta: "-1%", up: false, Icon: Building2 },
  { title: "Active Winches", value: "89", delta: "-1%", up: false, Icon: Truck },
];

const activityRows = [
  {
    id: "#REQ-10492",
    driver: "Ahmed K.",
    workshop: "Al-Noor Auto",
    service: "Battery",
    status: "In Progress" as const,
    time: "2 min ago",
  },
  {
    id: "#REQ-10488",
    driver: "Sara M.",
    workshop: "Highway Rescue",
    service: "Winch",
    status: "Completed" as const,
    time: "18 min ago",
  },
  {
    id: "#REQ-10481",
    driver: "Omar H.",
    workshop: "City Auto Care",
    service: "Tire",
    status: "Assigned" as const,
    time: "32 min ago",
  },
  {
    id: "#REQ-10476",
    driver: "Layla R.",
    workshop: "—",
    service: "Mechanic",
    status: "Pending" as const,
    time: "45 min ago",
  },
];

function statusClass(status: (typeof activityRows)[number]["status"]) {
  switch (status) {
    case "In Progress":
      return "bg-sky-100 text-sky-800";
    case "Completed":
      return "bg-emerald-100 text-emerald-800";
    case "Assigned":
      return "bg-violet-100 text-violet-800";
    case "Pending":
      return "bg-amber-100 text-amber-900";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminDashboardPage() {
  const { pendingWorkshops, refresh } = useAdminPendingCounts();
  const pendingLabel =
    pendingWorkshops === null ? "—" : String(pendingWorkshops);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of ENQAZ operations and system health.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.title}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                <div className="mt-2 flex items-center gap-1 text-sm font-medium">
                  {card.up ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" aria-hidden />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" aria-hidden />
                  )}
                  <span className={card.up ? "text-emerald-600" : "text-red-600"}>{card.delta}</span>
                  <span className="font-normal text-slate-400">vs last week</span>
                </div>
              </div>
              <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                <card.Icon className="h-5 w-5" aria-hidden />
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
              {[
                { label: "Average Response Time", value: "8.5 min", pill: "Excellent" },
                { label: "Completion Rate", value: "94.2%", pill: "High" },
                { label: "Customer Satisfaction", value: "4.7 / 5", pill: "Great" },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{row.value}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {row.pill}
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
                onClick={() => void refresh()}
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
                <p className="mt-1 text-2xl font-bold text-slate-900">{pendingLabel}</p>
                <p className="mt-2 text-xs text-amber-700">Open workshops → Activate accounts</p>
              </Link>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 opacity-80">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Winch registrations</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">—</p>
                <p className="mt-2 text-xs text-slate-500">Hook to your API when available</p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Live system map</h2>
          <p className="mt-1 text-xs text-slate-500">Illustrative view — connect your map provider for live data.</p>
          <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,39,68,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,39,68,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute left-[22%] top-[38%] h-3 w-3 rounded-full bg-amber-500 shadow ring-2 ring-white" title="Active request" />
            <div className="absolute left-[55%] top-[52%] h-3 w-3 rounded-full bg-amber-500 shadow ring-2 ring-white" />
            <div className="absolute left-[40%] top-[28%] h-3 w-3 rounded-full bg-sky-600 shadow ring-2 ring-white" title="Workshop" />
            <div className="absolute left-[68%] top-[40%] h-3 w-3 rounded-full bg-emerald-500 shadow ring-2 ring-white" title="Winch" />
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
              {activityRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3 font-mono text-xs font-medium text-slate-900">{row.id}</td>
                  <td className="px-5 py-3">{row.driver}</td>
                  <td className="px-5 py-3">{row.workshop}</td>
                  <td className="px-5 py-3">{row.service}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{row.time}</td>
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
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
