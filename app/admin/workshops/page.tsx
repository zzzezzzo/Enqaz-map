"use client";

import { AdminWorkshopsTable } from "./AdminWorkshopsTable";
import { useAdminPendingWorkshops } from "./useAdminPendingWorkshops";

export default function AdminWorkshopsPage() {
  const { rows, meta, loading, error, updatingId, refresh, goToPage, setAvailability } =
    useAdminPendingWorkshops();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workshops action</h1>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {loading && rows.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading workshops…
        </div>
      ) : null}

      {rows.length > 0 || (!loading && rows.length === 0) ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <AdminWorkshopsTable
            rows={rows}
            meta={meta}
            updatingId={updatingId}
            onToggleAvailable={setAvailability}
            onPageChange={goToPage}
          />
        </div>
      ) : null}
    </div>
  );
}
