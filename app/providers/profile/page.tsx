"use client";

import { Star } from "lucide-react";
import { useWorkshopProfileSettings } from "./useWorkshopProfileSettings";
import { uniqueServiceIdsFromProfile } from "./useProviderProfile";
import WorkshopInformationCard from "@/components/providers/profile/WorkshopInformationCard";

export default function ProviderProfilePage() {
  const {
    form,
    setForm,
    profile,
    profileLoading,
    profileError,
    refetchProfile,
    servicesOptions,
    servicesLoading,
    servicesError,
    locationLoading,
    locationError,
    saveError,
    saveLoading,
    toggleService,
    useLiveLocation,
    handleSave,
  } = useWorkshopProfileSettings();

  if (profileLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold text-slate-900">Profile & Settings</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading provider profile...
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold text-slate-900">Profile & Settings</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{profileError}</p>
          <button
            type="button"
            onClick={() => refetchProfile()}
            className="mt-3 inline-flex items-center rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = profile?.is_available === 1;
  const rating = profile?.average_rating ?? "0";
  const linkedServiceCount = profile
    ? uniqueServiceIdsFromProfile(profile.services).length
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Profile & Settings</h1>
          {profile && (
            <p className="mt-1 text-sm text-slate-500">
              Workshop ID {profile.id}
              {profile.user_id ? ` · User ${profile.user_id}` : ""}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveLoading}
          className="inline-flex items-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div>
      )}

      {profile && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Availability</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {isAvailable ? "Available for requests" : "Unavailable"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average rating</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Star className="h-4 w-4 text-amber-500" aria-hidden />
              {rating}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Linked services</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{linkedServiceCount} selected</p>
            <p className="mt-1 text-xs text-slate-500">Matches unique service IDs from your profile.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-9">
          <WorkshopInformationCard
            form={form}
            setForm={setForm}
            servicesOptions={servicesOptions}
            servicesLoading={servicesLoading}
            servicesError={servicesError}
            onToggleService={toggleService}
            onUseLiveLocation={useLiveLocation}
            locationLoading={locationLoading}
            locationError={locationError}
          />
        </div>
      </div>
    </div>
  );
}
