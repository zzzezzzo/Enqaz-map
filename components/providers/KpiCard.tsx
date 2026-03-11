"use client";

import type { ReactNode } from "react";

export type KpiCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
};

/**
 * Presentational KPI card. No data fetching or business logic.
 */
export function KpiCard({ label, value, icon, className = "" }: KpiCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
