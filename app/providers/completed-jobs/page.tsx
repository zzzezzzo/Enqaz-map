"use client";

import { Calendar, CheckCircle2, DollarSign, Download } from "lucide-react";
import { KpiCard } from "@/components/providers/KpiCard";
import { CompletedJobCard } from "@/components/providers/CompletedJobCard";
import { useCompletedJobs } from "./useCompletedJobs";

export default function CompletedJobsPage() {
  const {
    jobs,
    kpis,
    dateRange,
    setDateRange,
    exportJobs,
  } = useCompletedJobs();

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <h1 className="text-2xl font-bold text-slate-900">Completed Jobs</h1>

      {/* Toolbar: date range + export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex items-center">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
          </select>
          <Calendar className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
        </div>
        <button
          type="button"
          onClick={exportJobs}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          label="Today's Completed"
          value={kpis.todayCompleted}
          icon={<CheckCircle2 className="h-10 w-10 text-green-500 bg-green-100 p-2 rounded-xl" />}
        />
        <KpiCard
          label="This Week"
          value={kpis.thisWeek}
          icon={<Calendar className="h-5 w-5 text-blue-500 " />}
        />
        {/* <KpiCard
          label="Total Revenue"
          value={kpis.totalRevenue}
          icon={<DollarSign className="h-5 w-5 text-orange-500" />}
        /> */}
      </div>

      {/* Job History */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Job History</h2>
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              No completed jobs in this period.
            </p>
          ) : (
            jobs.map((job) => (
              <CompletedJobCard key={job.id} job={job} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
