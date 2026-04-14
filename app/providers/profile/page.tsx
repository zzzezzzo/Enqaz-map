"use client";

import { useWorkshopProfileSettings } from "./useWorkshopProfileSettings";
import WorkshopInformationCard from "@/components/providers/profile/WorkshopInformationCard";
import WorkingHoursCard from "@/components/providers/profile/WorkingHoursCard";
import AccountSettingsCard from "@/components/providers/profile/AccountSettingsCard";

export default function ProviderProfilePage() {
  const {
    form,
    setForm,
    logoPreviewUrl,
    selectedFileName,
    servicesOptions,
    servicesLoading,
    servicesError,
    locationLoading,
    locationError,
    handleLogoFileChange,
    toggleService,
    useLiveLocation,
    handleSave,
  } = useWorkshopProfileSettings();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Profile & Settings
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          Save Changes
        </button>
      </div>

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
          <WorkingHoursCard form={form} setForm={setForm} />
          <AccountSettingsCard
            form={form}
            onChangePassword={() => console.log("change password")}
            onConfigureNotifications={() => console.log("configure notifications")}
            onDeactivateAccount={() => console.log("deactivate account")}
          />
        </div>
      </div>
    </div>
  );
}

