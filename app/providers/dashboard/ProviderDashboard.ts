"use client";

import { useState, useEffect } from "react";
import api from "@/services/auth";
import echo from "@/lib/echo";
import Pusher from "pusher-js";
export interface ServiceStatus {
    total_requests_today: number;
    active_jobs: number;
  }
  
  export interface WorkshopLocation {
    latitude: string;
    longitude: string;
  }
  
  export interface IncomeRequest {
    id: number;
    latitude: string;
    longitude: string;
    customer_name: string;
    description: string;
    service_name: string;
    distance: string;
    minutes_ago: string;
  }
  
  export interface IncomeRequestData {
    workShop_location: WorkshopLocation;
    requests: IncomeRequest[];
  }
  
  export interface DashboardResponse {
    service_status: ServiceStatus;
    income_request: IncomeRequestData;
  }
  export const useProviderDashboard = () => {
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [providerId, setProviderId] = useState<number | null>(null);
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/provider/dashboard'); 
        
        if (response.data?.provider_id) {
          setProviderId(response.data.income_request.provider_id);
        }
        if (response.data) {
          setData(response.data); 
        }
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.response?.data?.message || err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
      fetchDashboardData();
    }, []);

    useEffect(() => {
      if (!providerId) return;

      const channelName = `provider.${providerId}`;
      echo.private(channelName).listen(".customer-create-request", (e: any) => {
        console.log("New Request:", e); 
        fetchDashboardData();
      });

      return () => {
        echo.leaveChannel(`private-${channelName}`);
      };
    }, [providerId]);
  
    return { data, isLoading, error, refetch: fetchDashboardData };
  };