"use client";

import { Clock4, Globe } from "lucide-react";
import type { WorkshopProfileForm } from "@/app/providers/profile/types";

export type WorkingHoursCardProps = {
  form: WorkshopProfileForm;
  setForm: (next: WorkshopProfileForm) => void;
};

export default function WorkingHoursCard({
  form,
  setForm,
}: WorkingHoursCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Working Hours</h3>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <Clock4 className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">
              Opening Time
            </span>
          </div>
          <input
            type="time"
            value={form.openingTime}
            onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 text-slate-800"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Clock4 className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">
              Closing Time
            </span>
          </div>
          <input
            type="time"
            value={form.closingTime}
            onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 text-slate-800"
          />
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Globe className="h-4 w-4 text-slate-400" />
        Current hours: {form.openingTime} - {form.closingTime} (7 days a week)
      </p>
    </div>
  );
}

