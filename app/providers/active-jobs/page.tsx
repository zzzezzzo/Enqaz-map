"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Phone, Car, CheckCircle2, Clock3, User } from "lucide-react";

const RequestsMap = dynamic(
  () => import("@/components/map/RequestsMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
        Loading map...
      </div>
    ),
  }
);

export type ActiveJobStatus = "On The Way" | "Arrived";

export type JobStatusStep = {
  label: string;
  time?: string;
  completed: boolean;
};

export type ActiveJob = {
  id: number;
  driverName: string;
  service: string;
  technicianName: string;
  eta: string;
  status: ActiveJobStatus;
  phone: string;
  car: string;
  address: string;
  statusSteps: JobStatusStep[];
  /** For map: driver position */
  driverLat: number;
  driverLng: number;
  customerLat: number;
  customerLng: number;
  workshopLat: number;
  workshopLng: number;
};

const activeJobs: ActiveJob[] = [
  {
    id: 1,
    driverName: "Omar Al-Rashid",
    service: "Battery Replacement",
    technicianName: "Ali Mohammed",
    eta: "8 mins",
    status: "On The Way",
    phone: "01205179358",
    car: "Toyota Camry 2020",
    address: "King Fahd Road, Riyadh",
    statusSteps: [
      { label: "Accepted", time: "10:03 AM", completed: true },
      { label: "On the way", time: "10:15 AM", completed: true },
      { label: "Arrived", completed: false },
      { label: "Completed", completed: false },
    ],
    driverLat: 24.727,
    driverLng: 46.695,
    customerLat: 24.722,
    customerLng: 46.690,
    workshopLat: 24.717,
    workshopLng: 46.681,
  },
  {
    id: 2,
    driverName: "Omar Al-Rashid",
    service: "Battery Replacement",
    technicianName: "Ali Mohammed",
    eta: "Arrived",
    status: "Arrived",
    phone: "+966 50 987 6543",
    car: "Toyota Camry 2020",
    address: "King Fahd Road, Riyadh",
    statusSteps: [
      { label: "Accepted", time: "10:03 AM", completed: true },
      { label: "On the way", time: "10:15 AM", completed: true },
      { label: "Arrived", completed: true },
      { label: "Completed", completed: false },
    ],
    driverLat: 24.723,
    driverLng: 46.69,
    customerLat: 24.718,
    customerLng: 46.685,
    workshopLat: 24.7136,
    workshopLng: 46.6753,
  },
  {
    id: 3,
    driverName: "Omar Al-Rashid",
    service: "Battery Replacement",
    technicianName: "Ali Mohammed",
    eta: "8 mins",
    status: "On The Way",
    phone: "+966 50 987 6543",
    car: "Toyota Camry 2020",
    address: "King Fahd Road, Riyadh",
    statusSteps: [
      { label: "Accepted", time: "10:03 AM", completed: true },
      { label: "On the way", time: "10:15 AM", completed: true },
      { label: "Arrived", completed: false },
      { label: "Completed", completed: false },
    ],
    driverLat: 24.725,
    driverLng: 46.692,
    customerLat: 24.720,
    customerLng: 46.688,
    workshopLat: 24.715,
    workshopLng: 46.678,
  },
];

export default function ProviderActiveJobsPage() {
  const [selectedJobId, setSelectedJobId] = useState<number>(activeJobs[0].id);
  const selectedJob = activeJobs.find((j) => j.id === selectedJobId) ?? activeJobs[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Active Jobs</h1>
        <span className="inline-flex items-center rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-white shadow-sm">
          {activeJobs.length} Active
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: job cards */}
        <div className="space-y-3">
          {activeJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={selectedJobId === job.id}
              onClick={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>

        {/* Center: map for selected job */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {selectedJob.driverName}
          </h2>
          <div className="h-64 overflow-hidden rounded-2xl">
            <RequestsMap
              center={[selectedJob.workshopLat, selectedJob.workshopLng]}
              zoom={12}
              markers={[
                {
                  id: 1,
                  lat: selectedJob.workshopLat,
                  lng: selectedJob.workshopLng,
                  label: "Workshop",
                  subtitle: "King Fahd Road",
                  type: "workshop",
                },
                {
                  id: 2,
                  lat: selectedJob.customerLat,
                  lng: selectedJob.customerLng,
                  label: selectedJob.technicianName,
                  subtitle: "Customer",
                  type: "customer",
                },
                {
                  id: 3,
                  lat: selectedJob.driverLat,
                  lng: selectedJob.driverLng,
                  label: selectedJob.driverName,
                  subtitle: selectedJob.status,
                  type: "driver",
                },
              ]}
              route={{
                from: [selectedJob.workshopLat, selectedJob.workshopLng],
                to: [selectedJob.driverLat, selectedJob.driverLng],
              }}
            />
          </div>
        </div>

        {/* Right: detail panel (driver contact + job status) */}
        <JobDetailPanel job={selectedJob} />
      </div>
    </div>
  );
}

// --- JobCard ---

interface JobCardProps {
  job: ActiveJob;
  isSelected: boolean;
  onClick: () => void;
}

function JobCard({ job, isSelected, onClick }: JobCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition-all
        ${isSelected ? "border-orange-500 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]" : "border-slate-200"}
        hover:border-orange-500 hover:shadow-md
      `}
    >
      <div>
        <p className="text-xs font-semibold text-slate-500">Driver:</p>
        <p className="text-sm font-semibold text-slate-900">{job.driverName}</p>
        <p className="mt-0.5 text-xs text-slate-500">{job.service}</p>
        <p className="mt-2 text-xs text-slate-400">{job.technicianName}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
          <Clock3 className="h-3.5 w-3.5" />
          <span>{job.eta}</span>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
            job.status === "Arrived"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-sky-50 text-sky-600"
          }`}
        >
          {job.status}
        </span>
      </div>
    </button>
  );
}

// --- JobDetailPanel (Driver Contact + StatusRow list) ---

interface JobDetailPanelProps {
  job: ActiveJob;
}

function JobDetailPanel({ job }: JobDetailPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Driver Contact
        </h3>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>{job.driverName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{job.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-3.5 w-3.5 text-slate-400" />
            <span>{job.car}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{job.address}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Job Status
        </h3>
        <div className="space-y-3 text-xs">
          {job.statusSteps.map((step) => (
            <StatusRow
              key={step.label}
              label={step.label}
              time={step.time}
              active={step.completed}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- StatusRow ---

interface StatusRowProps {
  label: string;
  time?: string;
  active?: boolean;
}

function StatusRow({ label, time, active }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            active
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <CheckCircle2
            className={`h-3 w-3 ${
              active ? "text-emerald-500" : "text-slate-300"
            }`}
          />
        </span>
        <span
          className={`text-xs font-medium ${
            active ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {label}
        </span>
      </div>
      {time && (
        <span className="text-[11px] font-medium text-slate-500">{time}</span>
      )}
    </div>
  );
}
