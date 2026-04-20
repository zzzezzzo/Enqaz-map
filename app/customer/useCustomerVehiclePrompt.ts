"use client";

import { useEffect, useState } from "react";
import api from "@/services/auth";

export function useCustomerVehiclePrompt() {
  const [mounted, setMounted] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkVehicle = async () => {
      // First try: ask backend if customer already has a vehicle
      try {
        const response = await api.get("/customer/vehicles");
        const data = response.data?.vehicles  ?? response.data;
        const hasVehicle = Array.isArray(data)
          ? data.length > 0
          : Boolean(data?.id );
          
        if (!hasVehicle) {
          setShowVehicleModal(true);
        } else {
          setShowVehicleModal(false);
        }
        return;
      } catch {
        // Fallback: use localStorage flag
        try {
          const saved = localStorage.getItem("customer_vehicle_saved") === "1";
          setShowVehicleModal(!saved);
        } catch {
          setShowVehicleModal(true);
        }
      }
    };

    void checkVehicle();
  }, [mounted]);

  return {
    showVehicleModal,
    setShowVehicleModal,
  };
}

