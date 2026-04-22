"use client";

import { useCallback, useEffect, useState } from "react";
import { readAuthApiErrorMessage } from "@/services/auth";
import {
  approveWorkshopAdmin,
  fetchPendingWorkshopsForAdmin,
  type AdminWorkshopRow,
} from "@/lib/adminBackend";

export default function AdminWorkshopsPage() {
  const [rows, setRows] = useState<AdminWorkshopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [endpointUsed, setEndpointUsed] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPendingWorkshopsForAdmin();
      setRows(res.workshops);
      setEndpointUsed(res.endpointUsed);
    } catch (e: unknown) {
      setError(readAuthApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activate = async (id: number) => {
    setBusyId(id);
    setError(null);
    try {
      await approveWorkshopAdmin(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e: unknown) {
      setError(readAuthApiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workshops management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review new workshops and activate them so they can receive requests in the provider app.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Refresh list
        </button>
      </div>

      {endpointUsed ? (
        <p className="text-xs text-slate-400">
          Data source: <code className="rounded bg-slate-100 px-1">{endpointUsed}</code>
        </p>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading workshops…</p>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            <p>No pending workshops returned by the API.</p>
            <p className="mt-2 text-xs text-slate-500">
              Ensure your Laravel API exposes an admin list (for example{" "}
              <code className="rounded bg-slate-100 px-1">GET /api/admin/workshops/pending</code>) and an
              approve route (for example{" "}
              <code className="rounded bg-slate-100 px-1">POST /api/admin/workshops/{"{id}"}/approve</code>
              ). The client tries several common patterns automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Workshop</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((w) => (
                  <tr key={w.id} className="text-slate-800">
                    <td className="px-5 py-3 font-mono text-xs">{w.id}</td>
                    <td className="px-5 py-3 font-medium">{w.workShopName}</td>
                    <td className="px-5 py-3 text-slate-600">{w.email ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                        {w.approval_status ?? "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        disabled={busyId === w.id}
                        onClick={() => void activate(w.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {busyId === w.id ? "Activating…" : "Activate workshop"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
