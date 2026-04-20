"use client";

import { useEffect, useState } from "react";
import api, { readAuthApiErrorMessage } from "@/services/auth";
import type { ProviderProfileSavePayload, WorkshopProfileForm } from "./types";
import { useProviderProfile, uniqueServiceIdsFromProfile } from "./useProviderProfile";

const EMPTY_FORM: WorkshopProfileForm = {
  workShopName: "",
  description: "",
  latitude: "",
  longitude: "",
  services: [],
};

export function useWorkshopProfileSettings() {
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
    allServices: servicesOptions,
    servicesLoading,
    servicesError,
  } = useProviderProfile();

  const [form, setForm] = useState<WorkshopProfileForm>(EMPTY_FORM);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      workShopName: profile.workShopName ?? "",
      description: profile.description ?? "",
      latitude: String(profile.latitude ?? ""),
      longitude: String(profile.longitude ?? ""),
      services: uniqueServiceIdsFromProfile(profile.services),
    });
  }, [profile]);

  const handleSave = async () => {
    const payload: ProviderProfileSavePayload = {
      workShopName: form.workShopName.trim(),
      description: form.description ?? "",
      latitude: form.latitude.trim(),
      longitude: form.longitude.trim(),
      services: form.services,
    };
    const compatibilityPayload = {
      ...payload,
      name: payload.workShopName,
      workshop_name: payload.workShopName,
      service_ids: payload.services,
    };

    setSaveLoading(true);
    setSaveError(null);
    try {
      try {
        await api.put("/provider/profile", compatibilityPayload);
      } catch (error: unknown) {
        const status =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;
        if (status !== 404) throw error;
        await api.put("/workshop/profile", compatibilityPayload);
      }
      await refetchProfile();
    } catch (err: unknown) {
      setSaveError(readAuthApiErrorMessage(err));
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleService = (serviceId: number) => {
    setForm((prev) => {
      const hasService = prev.services.includes(serviceId);
      return {
        ...prev,
        services: hasService
          ? prev.services.filter((id) => id !== serviceId)
          : [...prev.services, serviceId],
      };
    });
  };

  const useLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(7);
        const lng = position.coords.longitude.toFixed(7);

        setForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        setLocationLoading(false);
      },
      () => {
        setLocationError("Unable to retrieve your location.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return {
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
  };
}
