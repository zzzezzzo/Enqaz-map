"use client";

import { ChevronLeft, ChevronRight, Wrench } from "lucide-react";
import type { AdminPendingWorkshop, AdminWorkshopsPageMeta } from "@/lib/adminWorkshopsApi";
import { WorkshopLocationCell } from "./WorkshopLocationCell";

type Props = {
  rows: AdminPendingWorkshop[];
  meta: AdminWorkshopsPageMeta;
  updatingId: number | null;
  onToggleAvailable: (id: number, next: boolean) => void;
  onPageChange: (page: number) => void;
};

function fmt(v: string) {
  const d = v?.split("T")[0];
  return d || "—";
}

export function AdminWorkshopsTable({
  rows,
  meta,
  updatingId,
  onToggleAvailable,
  onPageChange,
}: Props) {
  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-600">
        <p>
          No workshops on this page. The list is loaded from{" "}
          <code className="rounded bg-slate-100 px-1.5 text-xs">GET /api/admin/workshops/pending</code>
          (typically only workshops with <code className="text-xs">is_available = 0</code>).
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3 sm:px-4">ID</th>
              <th className="px-3 py-3 sm:px-4">Workshop</th>
              <th className="px-3 py-3 sm:px-4 min-w-[10rem]">
                <span className="inline-flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5" aria-hidden />
                  Services
                </span>
              </th>
              <th className="px-3 py-3 sm:px-4 hidden lg:table-cell">Description</th>
              <th className="px-3 py-3 sm:px-4 hidden md:table-cell">Location</th>
              <th className="px-3 py-3 sm:px-4">Rating</th>
              <th className="px-3 py-3 sm:px-4">Available</th>
              <th className="px-3 py-3 sm:px-4 hidden sm:table-cell">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((w) => {
              const available = w.is_available === 1;
              const busy = updatingId === w.id;
              return (
                <tr key={w.id} className="text-slate-800">
                  <td className="px-3 py-3 font-mono text-xs sm:px-4">{w.id}</td>
                  <td className="px-3 py-3 sm:px-4">
                    <div className="font-medium" dir="auto">
                      {w.workShopName}
                    </div>
                    <div className="text-xs text-slate-500">user #{w.user_id}</div>
                    <p className="mt-1 text-slate-600 line-clamp-2 lg:hidden">{w.description || "—"}</p>
                  </td>
                  <td className="px-3 py-3 align-top sm:px-4">
                    {w.services.length ? (
                      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" dir="auto">
                        {w.services.map((s) => (
                          <li key={`${w.id}-svc-${s.id}`}>
                            <span
                              className="inline-block max-w-[10rem] truncate rounded-md border border-indigo-200/80 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-900"
                              title={s.description || s.name}
                            >
                              {s.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                    <p className="mt-1 text-[0.7rem] text-slate-500 lg:hidden">
                      {w.services.length
                        ? `${w.services.length} service${w.services.length === 1 ? "" : "s"}`
                        : "No services"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-slate-600 line-clamp-2 hidden lg:table-cell max-w-sm">
                    {w.description || "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600 hidden md:table-cell align-top">
                    <WorkshopLocationCell latitude={w.latitude} longitude={w.longitude} />
                  </td>
                  <td className="px-3 py-3 sm:px-4">{w.average_rating}</td>
                  <td className="px-3 py-3 sm:px-4">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <span className="sr-only">Toggle is_available</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        checked={available}
                        disabled={busy}
                        onChange={() => onToggleAvailable(w.id, !available)}
                      />
                      <span
                        className={`text-xs font-medium ${
                          available ? "text-emerald-700" : "text-slate-500"
                        }`}
                      >
                        {busy ? "…" : available ? "On" : "Off"}
                      </span>
                    </label>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500 hidden sm:table-cell">
                    {fmt(w.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {meta.lastPage > 1 && (
        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            {meta.from != null && meta.to != null
              ? `Rows ${meta.from}–${meta.to} of ${meta.total}`
              : `${meta.total} total`}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(meta.currentPage - 1)}
              disabled={meta.currentPage <= 1}
              className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="px-2 text-xs text-slate-600">
              {meta.currentPage} / {meta.lastPage}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(meta.currentPage + 1)}
              disabled={meta.currentPage >= meta.lastPage}
              className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
