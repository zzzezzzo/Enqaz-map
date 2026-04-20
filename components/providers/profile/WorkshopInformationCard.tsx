"use client";

import type { ReactNode } from "react";
import { MapPin, UserRound } from "lucide-react";
import type { ServiceOption, WorkshopProfileForm } from "@/app/providers/profile/types";

export type WorkshopInformationCardProps = {
  form: WorkshopProfileForm;
  setForm: (next: WorkshopProfileForm) => void;
  servicesOptions: ServiceOption[];
  servicesLoading: boolean;
  servicesError: string | null;
  onToggleService: (serviceId: number) => void;
  onUseLiveLocation: () => void;
  locationLoading: boolean;
  locationError: string | null;
};

export default function WorkshopInformationCard({
  form,
  setForm,
  servicesOptions,
  servicesLoading,
  servicesError,
  onToggleService,
  onUseLiveLocation,
  locationLoading,
  locationError,
}: WorkshopInformationCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Workshop Information</h3>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LabeledInput
          label="Workshop name"
          icon={<UserRound className="h-4 w-4 text-slate-400" />}
          value={form.workShopName}
          onChange={(v) => setForm({ ...form, workShopName: v })}
        />

        <LabeledInput
          label="Latitude"
          icon={<MapPin className="h-4 w-4 text-slate-400" />}
          value={form.latitude}
          onChange={(v) => setForm({ ...form, latitude: v })}
          inputMode="decimal"
        />

        <LabeledInput
          label="Longitude"
          icon={<MapPin className="h-4 w-4 text-slate-400" />}
          value={form.longitude}
          onChange={(v) => setForm({ ...form, longitude: v })}
          inputMode="decimal"
        />
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={onUseLiveLocation}
          disabled={locationLoading}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {locationLoading ? "Getting location..." : "Use live location"}
        </button>
        {locationError && <p className="mt-2 text-xs text-red-600">{locationError}</p>}
      </div>

      <div className="mt-5">
        <label className="text-xs font-semibold text-slate-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="mt-5">
        <label className="text-xs font-semibold text-slate-700">Services</label>
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
          {servicesLoading ? (
            <p className="text-sm text-slate-500">Loading services...</p>
          ) : servicesError ? (
            <p className="text-sm text-red-600">{servicesError}</p>
          ) : servicesOptions.length === 0 ? (
            <p className="text-sm text-slate-500">No services available.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {servicesOptions.map((service) => {
                const checked = form.services.includes(service.id);
                return (
                  <label
                    key={service.id}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleService(service.id)}
                      className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                    />
                    {service.name}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type LabeledInputProps = {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

function LabeledInput({
  label,
  icon,
  value,
  onChange,
  type = "text",
  inputMode,
}: LabeledInputProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
        {icon}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 outline-none"
        />
      </div>
    </div>
  );
}
