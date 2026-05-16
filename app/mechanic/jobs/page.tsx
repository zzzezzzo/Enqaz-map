"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Car, ChevronRight, MapPin, RefreshCw } from "lucide-react";
import { fetchMechanicJobs } from "@/lib/mechanics/mechanicJobsApi";
import type { MechanicJob } from "@/lib/mechanics/types";
import { mechanicAuthService, readAuthApiErrorMessage } from "@/services/mechanicAuth";

function dispatchLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === "en_route") return "En route";
  if (s === "arrived") return "Arrived";
  if (s === "in_service") return "In service";
  if (s === "completed") return "Completed";
  if (s === "assigned") return "Assigned";
  return status;
}

function badgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "en_route") return "bg-orange-100 text-orange-800";
  if (s === "arrived") return "bg-sky-100 text-sky-800";
  if (s === "in_service") return "bg-indigo-100 text-indigo-800";
  if (s === "completed") return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-700";
}

export default function MechanicJobsPage() {
  const [jobs, setJobs] = useState<MechanicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mechanicName, setMechanicName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMechanicJobs();
      setJobs(list);
    } catch (err: unknown) {
      setError(readAuthApiErrorMessage(err));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void mechanicAuthService.getCurrentMechanic().then((m) => {
      if (m?.name) setMechanicName(m.name);
    });
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My jobs</h1>
          {mechanicName ? (
            <p className="text-sm text-slate-500">Hello, {mechanicName}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading jobs…</p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No active jobs assigned to you right now.
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/mechanic/jobs/${job.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-400"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{job.customer_name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <Car className="h-3.5 w-3.5 shrink-0" />
                    {job.vehicle_details}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{job.service_name}</p>
                </div>
                <div className="ml-3 flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass(job.dispatch_status)}`}
                  >
                    {dispatchLabel(job.dispatch_status)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
