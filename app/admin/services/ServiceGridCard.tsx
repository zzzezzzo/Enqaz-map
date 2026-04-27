"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { AdminCatalogService, ServiceCategoryKey } from "@/lib/adminServicesApi";
import { ServiceCategoryBadge } from "./ServiceCategoryBadge";

type Props = {
  service: AdminCatalogService;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive: (s: AdminCatalogService) => void;
  busyDelete: boolean;
  busyToggle: boolean;
};

export function ServiceGridCard({
  service: s,
  onEdit,
  onDelete,
  onToggleActive,
  busyDelete,
  busyToggle,
}: Props) {
  const cat: ServiceCategoryKey = s.category_key ?? "other";
  const label = s.category_label ?? "Service";
  const req = s.total_requests;
  const rate = s.average_rating;
  const active = s.is_active !== false;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900" dir="auto">
          {s.name}
        </h3>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => onToggleActive(s)}
          disabled={busyToggle}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            active ? "bg-emerald-500" : "bg-slate-300"
          } disabled:opacity-50`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              active ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      <div className="mt-2">
        <ServiceCategoryBadge label={label} categoryKey={cat} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:gap-3">
        <div>
          <dt className="text-slate-500">Total requests</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">{req != null ? req : "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Avg rating</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">
            {rate != null && String(rate) !== "" ? `★ ${String(rate).slice(0, 4)} / 5` : "—"}
          </dd>
        </div>
      </dl>

      {s.description ? (
        <p className="mt-3 line-clamp-2 text-xs text-slate-600" dir="auto" title={s.description}>
          {s.description}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onEdit(s.id)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(s.id)}
          disabled={busyDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
