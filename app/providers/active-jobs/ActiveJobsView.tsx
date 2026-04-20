"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Car, CheckCircle2, Clock3, MapPin, User } from "lucide-react";
import {
  type ActiveRequestStatus,
  type ProviderActiveRequest,
  type ProviderWorkshopLocation,
} from "./useProviderActiveRequests";

const RequestsMap = dynamic(() => import("@/components/map/RequestsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
      Loading map...
    </div>
  ),
});

interface ActiveJobsViewProps {
  requests: ProviderActiveRequest[];
  workshopLocation: ProviderWorkshopLocation;
  actionError?: string | null;
  updatingRequestId?: number | null;
  onUpdateStatus: (requestId: number, status: ActiveRequestStatus) => Promise<boolean>;
}

function toStatusLabel(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "pending") return "Pending";
  if (normalized === "completed") return "Completed";
  if (normalized === "in_progress") return "In Progress";
  if (normalized === "cancelled") return "Cancelled";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "accepted") return "Accepted";
  return status || "Accepted";
}

function createStatusSteps(status: string) {
  const current = status.toLowerCase();
  const order = ["pending", "accepted", "in_progress", "completed"];
  const statusIndex = order.indexOf(current);
  const isCancelled = current === "cancelled";
  const isRejected = current === "rejected";

  return [
    { label: "Pending", completed: statusIndex >= 0 || isCancelled || isRejected },
    { label: "Accepted", completed: statusIndex >= 1 || isCancelled },
    { label: "In Progress", completed: statusIndex >= 2 },
    { label: "Completed", completed: statusIndex >= 3 },
    {
      label: isCancelled ? "Cancelled" : "Rejected",
      completed: isCancelled || isRejected,
      terminal: true,
      danger: isCancelled || isRejected,
    },
  ];
}

function toSelectableStatus(status: string): ActiveRequestStatus {
  const value = status.toLowerCase();
  if (
    value === "pending" ||
    value === "accepted" ||
    value === "in_progress" ||
    value === "completed" ||
    value === "cancelled" ||
    value === "rejected"
  ) {
    return value;
  }
  return "accepted";
}

const STATUS_OPTIONS: { label: string; value: ActiveRequestStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Rejected", value: "rejected" },
];

function statusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "pending") return "bg-amber-50 text-amber-700";
  if (normalized === "accepted") return "bg-sky-50 text-sky-600";
  if (normalized === "in_progress") return "bg-indigo-50 text-indigo-700";
  if (normalized === "completed") return "bg-emerald-50 text-emerald-700";
  if (normalized === "cancelled" || normalized === "rejected") return "bg-rose-50 text-rose-700";
  return "bg-slate-50 text-slate-600";
}

export default function ActiveJobsView({
  requests,
  workshopLocation,
  actionError,
  updatingRequestId,
  onUpdateStatus,
}: ActiveJobsViewProps) {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(requests[0]?.id ?? null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<ActiveRequestStatus>("accepted");

  const selectedJob = useMemo(() => {
    if (!requests.length) return null;
    const found = requests.find((job) => job.id === selectedJobId);
    return found ?? requests[0];
  }, [requests, selectedJobId]);

  if (!selectedJob) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-500">
        No active jobs right now.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Active Jobs</h1>
        <span className="inline-flex items-center rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-white shadow-sm">
          {requests.length} Active
        </span>
      </div>
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          {requests.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => setSelectedJobId(job.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition-all ${
                selectedJob.id === job.id
                  ? "border-orange-500 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]"
                  : "border-slate-200"
              } hover:border-orange-500 hover:shadow-md`}
            >
              <p className="text-xs font-semibold text-slate-500">Customer:</p>
              <p className="text-sm font-semibold text-slate-900">{job.customerName}</p>
              <p className="mt-0.5 text-xs text-slate-500">{job.serviceName}</p>
              <p className="mt-2 text-xs text-slate-400">{job.vehicleDetails}</p>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{toStatusLabel(job.status)}</span>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadgeClass(job.status)}`}
                >
                  {toStatusLabel(job.status)}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">{selectedJob.customerName}</h2>
          <div className="h-64 overflow-hidden rounded-2xl">
            <RequestsMap
              center={[workshopLocation.latitude, workshopLocation.longitude]}
              zoom={12}
              markers={[
                {
                  id: 1,
                  lat: workshopLocation.latitude,
                  lng: workshopLocation.longitude,
                  label: "Workshop",
                  subtitle: "Your location",
                  type: "workshop",
                },
                {
                  id: selectedJob.id,
                  lat: selectedJob.latitude,
                  lng: selectedJob.longitude,
                  label: selectedJob.customerName,
                  subtitle: selectedJob.serviceName,
                  type: "customer",
                },
              ]}
              route={{
                from: [workshopLocation.latitude, workshopLocation.longitude],
                to: [selectedJob.latitude, selectedJob.longitude],
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Job Details</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedJob.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedJob.vehicleDetails}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedJob.description}</span>
              </div>
            </div>
            
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Job Status</h3>
            <div className="space-y-3 text-xs">
              {createStatusSteps(selectedJob.status).map((step) => (
                <div key={step.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        step.completed
                          ? step.danger
                            ? "border-rose-500 bg-rose-50"
                            : "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3 w-3 ${
                          step.completed ? (step.danger ? "text-rose-500" : "text-emerald-500") : "text-slate-300"
                        }`}
                      />
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        step.completed ? (step.danger ? "text-rose-700" : "text-slate-900") : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setNextStatus(toSelectableStatus(selectedJob.status));
                setIsStatusModalOpen(true);
              }}
              className="mt-4 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow transition-colors hover:bg-amber-600"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>

      {isStatusModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Update Request Status</h3>
            <p className="mt-1 text-sm text-slate-500">
              Select a new status for {selectedJob.customerName}.
            </p>

            <div className="mt-4 space-y-2">
              {STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="request-status"
                    checked={nextStatus === option.value}
                    onChange={() => setNextStatus(option.value)}
                    className="h-4 w-4"
                  />
                  <span className="font-medium text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingRequestId === selectedJob.id}
                onClick={async () => {
                  const ok = await onUpdateStatus(selectedJob.id, nextStatus);
                  if (ok) {
                    setIsStatusModalOpen(false);
                  }
                }}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingRequestId === selectedJob.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
