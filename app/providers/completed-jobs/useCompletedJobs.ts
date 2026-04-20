"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/auth";
import type { CompletedJob, CompletedJobsKpis, DateRangeKey } from "./types";

type CompletedRequestsApiItem = {
  id?: number | string;
  vehicle_details?: string;
  customer_name?: string;
  description?: string;
  service_name?: string;
  status?: string;
  completed_at?: string;
  customer_contact?: string;
  price?: string | number | null;
  payment_status?: string | null;
  technician_name?: string | null;
  duration?: string | null;
};

type CompletedRequestsApiResponse = {
  data?: {
    completed_requests?: CompletedRequestsApiItem[];
  };
};

function parseApiDate(value: string | undefined): Date | null {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapCompletedRequest(item: CompletedRequestsApiItem): CompletedJob | null {
  const id = Number(item.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const completedDate = parseApiDate(item.completed_at);
  const localizedDate = completedDate ? completedDate.toLocaleDateString() : "-";
  const localizedTime = completedDate
    ? completedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "-";

  return {
    id: String(id),
    jobId: `REQ-${id}`,
    customerName: item.customer_name?.trim() || "Unknown customer",
    service: item.service_name?.trim() || "Unknown service",
    price: item.price != null && String(item.price).trim() ? `${String(item.price).trim()} EGP` : "-",
    paymentStatus:
      String(item.payment_status ?? "").toLowerCase() === "pending" ? "Pending" : "Paid",
    car: item.vehicle_details?.trim() || "-",
    technicianName: item.technician_name?.trim() || "Provider team",
    date: localizedDate,
    duration: item.duration?.trim() || "-",
    phone: item.customer_contact?.trim() || "-",
    completedAt: localizedTime,
    completedAtRaw: item.completed_at,
  };
}

function isWithinRange(dateRaw: string | undefined, range: DateRangeKey): boolean {
  if (range === "custom") return true;
  const date = parseApiDate(dateRaw);
  if (!date) return range === "thisMonth";

  const now = new Date();
  if (range === "today") {
    return date.toDateString() === now.toDateString();
  }
  if (range === "thisWeek") {
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return date >= start && date < end;
  }
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function useCompletedJobs() {
  const [dateRange, setDateRange] = useState<DateRangeKey>("thisMonth");
  const [searchQuery, setSearchQuery] = useState("");
  const [allJobs, setAllJobs] = useState<CompletedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletedJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<CompletedRequestsApiResponse>("/provider/completed-requests");
      const raw = Array.isArray(response.data?.data?.completed_requests)
        ? response.data.data.completed_requests
        : [];
      const mapped = raw
        .map(mapCompletedRequest)
        .filter((job): job is CompletedJob => job !== null);
      setAllJobs(mapped);
      setError(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || (err instanceof Error ? err.message : "Failed to load completed requests"));
      setAllJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedJobs();
  }, [fetchCompletedJobs]);

  const jobs = useMemo(() => {
    let list = [...allJobs];
    list = list.filter((job) => isWithinRange(job.completedAtRaw, dateRange));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.customerName.toLowerCase().includes(q) ||
          j.jobId.toLowerCase().includes(q) ||
          j.service.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allJobs, dateRange, searchQuery]);

  const kpis: CompletedJobsKpis = useMemo(() => {
    const now = new Date();
    const todayCompleted = allJobs.filter((job) => {
      const d = parseApiDate(job.completedAtRaw);
      return d ? d.toDateString() === now.toDateString() : false;
    }).length;

    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const thisWeek = allJobs.filter((job) => {
      const d = parseApiDate(job.completedAtRaw);
      return d ? d >= start && d < end : false;
    }).length;

    return {
      todayCompleted,
      thisWeek,
      totalRevenue: "-",
    };
  }, [allJobs]);

  const exportJobs = () => {
    // Logic: e.g. trigger download CSV or call export API
    console.log("Export completed jobs", { dateRange, count: jobs.length });
  };

  return {
    jobs,
    kpis,
    isLoading,
    error,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    refetch: fetchCompletedJobs,
    exportJobs,
  };
}
