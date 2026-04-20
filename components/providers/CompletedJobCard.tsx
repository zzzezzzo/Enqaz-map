"use client";

import {
  Car,
  User,
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
} from "lucide-react";
import type { CompletedJob } from "@/app/providers/completed-jobs/types";

export type CompletedJobCardProps = {
  job: CompletedJob;
  className?: string;
};

/**
 * Presentational card for a single completed job. No logic; only renders props.
 */
export function CompletedJobCard({ job, className = "" }: CompletedJobCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {/* Top row: customer, service, job ID, price, payment status */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-base font-semibold text-slate-900">
          {job.customerName}
        </p>
        <span className="text-slate-400">•</span>
        <p className="text-sm text-slate-600">{job.service}</p>
        <span
          className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"
        >
          {job.jobId}
        </span>
        <p className="text-sm font-semibold text-emerald-600">{job.price}</p>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            job.paymentStatus === "Paid"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {job.paymentStatus}
        </span>
      </div>

      {/* Middle row: car, technician, date, duration, phone */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <Car className="h-4 w-4 text-slate-400" />
          {job.car}
        </span>
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-slate-400" />
          {job.technicianName}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-slate-400" />
          {job.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-slate-400" />
          {job.duration}
        </span>
        <span className="flex items-center gap-1.5">
          <Phone className="h-4 w-4 text-slate-400" />
          {job.phone}
        </span>
      </div>

      {/* Bottom row: completed at */}
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-sm text-slate-500">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <span>Completed at {job.completedAtRaw}</span>
      </div>
    </div>
  );
}
