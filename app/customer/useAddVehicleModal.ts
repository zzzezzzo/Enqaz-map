"use client";

import { useEffect, useState } from "react";
import api from "@/services/auth";

import type { CarDetails } from "@/components/customer/AddVehicleModal";

export function useAddVehicleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [car, setCar] = useState<CarDetails>({
    plate_number: "",
    model: "",
    brand: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSaving(false);
    }
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Backend expects this exact payload:
      // { plate_number, model, brand }
      await api.post("/customer/add-vehicle", car);

      try {
        localStorage.setItem("customer_vehicle_saved", "1");
      } catch {
        // ignore
      }

      onClose();
    } catch {
      setError("Failed to save vehicle details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    mounted,
    car,
    setCar,
    saving,
    error,
    handleSave,
  };
}

