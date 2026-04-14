"use client";

import { useEffect, useState } from "react";
import api from "@/services/auth";
import type {
  ProviderProfilePayload,
  ServiceOption,
  WorkshopProfileForm,
} from "./types";

const MOCK_FORM: WorkshopProfileForm = {
  name: "Al-Noor Workshop",
  phoneNumber: "01205179358",
  address: "mastol azza el sayeda",
  description:
    "Trusted roadside assistance and vehicle repair for everyday drivers. We focus on speed, transparency, and quality parts.",
  latitude: "12.345678",
  longitude: "87.654321",
  services: [1, 3],
  openingTime: "08:00",
  closingTime: "22:00",
};

export function useWorkshopProfileSettings() {
  const [form, setForm] = useState<WorkshopProfileForm>(MOCK_FORM);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [servicesOptions, setServicesOptions] = useState<ServiceOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup object URL (if any)
      if (logoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const response = await api.get("/services");
        const raw = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const normalized: ServiceOption[] = raw
          .map((item: any) => ({
            id: Number(item?.id),
            name: String(item?.name ?? item?.title ?? ""),
          }))
          .filter(
            (service: ServiceOption) =>
              Number.isFinite(service.id) && service.id > 0 && service.name
          );

        setServicesOptions(normalized);
      } catch (error) {
        setServicesError("Unable to load services from backend.");
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleLogoFileChange = (file: File | null) => {
    if (!file) return;
    if (logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    const url = URL.createObjectURL(file);
    setLogoPreviewUrl(url);
    setSelectedFileName(file.name);
  };

  const handleSave = () => {
    const payload: ProviderProfilePayload = {
      name: form.name,
      description: form.description,
      latitude: form.latitude,
      longitude: form.longitude,
      services: form.services,
    };

    // TODO: Replace endpoint when backend route is finalized
    api
      .put("/workshop/profile", payload)
      .then(() => {
        console.log("Workshop profile saved", payload);
      })
      .catch(() => {
        console.log("Failed to save workshop profile", payload);
      });
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
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

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
  };
}

