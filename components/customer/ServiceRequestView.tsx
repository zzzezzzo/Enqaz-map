"use client";

import dynamic from "next/dynamic";
import { MapPin, Sparkles } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { LocationState } from "@/app/customer/request/useServiceRequest";
import type { CustomerVehicleOption } from "@/app/customer/request/types";

const CustomerLocationMap = dynamic(
  () => import("@/components/customer/CustomerLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[220px] md:h-[260px] rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-500 text-sm">
        Loading map…
      </div>
    ),
  }
);

export type ServiceRequestViewProps = {
  serviceName: string;
  location: LocationState;
  displayAddress: string;
  displayCoords: string;
  vehicles: CustomerVehicleOption[];
  vehiclesLoading: boolean;
  vehiclesError: string | null;
  selectedVehicleId: number | null;
  onSelectVehicleId: (id: number) => void;
  problem: string;
  setProblem: Dispatch<SetStateAction<string>>;
  submitError: string | null;
  onSubmit: (e: FormEvent) => void;
  variant?: "page" | "embedded";
  onChangeService?: () => void;
};

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/25 placeholder:text-slate-400";

export default function ServiceRequestView({
  serviceName,
  location,
  displayAddress,
  displayCoords,
  vehicles,
  vehiclesLoading,
  vehiclesError,
  selectedVehicleId,
  onSelectVehicleId,
  problem,
  setProblem,
  submitError,
  onSubmit,
  variant = "page",
  onChangeService,
}: ServiceRequestViewProps) {
  const embedded = variant === "embedded";

  const shellClass = embedded
    ? "rounded-3xl border border-slate-200/90 bg-white/95 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm"
    : "max-w-5xl mx-auto w-full px-4 py-10";

  const inner = (
    <>
      <div
        className={
          embedded
            ? "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-6"
            : "mb-8"
        }
      >
        <div>
          {embedded && (
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
              Selected service
            </p>
          )}
          {embedded ? (
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {serviceName}
            </h2>
          ) : (
            <h1
              id="request-title"
              className="text-2xl md:text-3xl font-bold text-slate-900 mb-2"
            >
              Request {serviceName}
            </h1>
          )}
          {!embedded && (
            <p className="text-slate-600">
              Fill in the details to submit your assistance request
            </p>
          )}
          {embedded && (
            <p className="text-slate-600 text-sm mt-1">
              Pick your saved vehicle, confirm location, then describe what you
              need.
            </p>
          )}
        </div>
        {embedded && onChangeService && (
          <button
            type="button"
            onClick={onChangeService}
            className="shrink-0 text-sm font-semibold text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline"
          >
            Change service
          </button>
        )}
      </div>

      {submitError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 overflow-hidden shadow-inner">
              <div className="relative h-[220px] md:h-[260px]">
                {location.loading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500 text-sm bg-slate-100">
                    <span className="inline-flex h-9 w-9 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                    Getting your location…
                  </div>
                ) : location.error ? (
                  <div className="w-full h-full flex items-center justify-center p-4 bg-rose-50">
                    <p className="text-red-700 text-sm text-center">
                      {location.error}
                    </p>
                  </div>
                ) : location.lat != null && location.lng != null ? (
                  <CustomerLocationMap
                    lat={location.lat}
                    lng={location.lng}
                    zoom={15}
                    className="rounded-t-2xl"
                  />
                ) : null}
              </div>

              <div className="p-4 border-t border-slate-200/80 bg-white">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                    <MapPin className="w-5 h-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900 text-sm mb-0.5">
                      Your location
                    </h2>
                    <p className="text-slate-700 text-sm break-words">
                      {displayAddress}
                    </p>
                    <p className="text-slate-500 text-xs mt-1 font-mono">
                      {displayCoords}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="vehicle_id"
                className="block text-sm font-semibold text-slate-800 mb-2"
              >
                Your vehicle
              </label>
              {vehiclesError && (
                <p className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {vehiclesError}
                </p>
              )}
              {vehiclesLoading ? (
                <p className="text-sm text-slate-500">Loading your vehicles…</p>
              ) : vehicles.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  No vehicles found. Add a vehicle from your account first.
                </p>
              ) : (
                <select
                  id="vehicle_id"
                  value={selectedVehicleId ?? ""}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v > 0) onSelectVehicleId(v);
                  }}
                  className={fieldClass}
                  required
                >
                  <option value="">Select a vehicle…</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label
                htmlFor="problem"
                className="block text-sm font-semibold text-slate-800 mb-2"
              >
                Describe the problem
              </label>
              <textarea
                id="problem"
                rows={5}
                placeholder="What do you need? (e.g. oil change and general check)"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className={`${fieldClass} resize-none min-h-[120px]`}
              />
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 p-4 flex gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-950 mb-1">
                  Safety first
                </p>
                <p className="text-sm text-amber-900/90 leading-relaxed">
                  Stay in a safe spot before submitting. Use hazard lights if
                  you are stopped on or near a road.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Submit assistance request
          </button>
        </div>
      </form>
    </>
  );

  if (embedded) {
    return <section className={shellClass}>{inner}</section>;
  }

  return (
    <section className={`flex-1 ${shellClass}`} aria-labelledby="request-title">
      {inner}
    </section>
  );
}
