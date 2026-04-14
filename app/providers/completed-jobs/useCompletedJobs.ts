"use client";

import { useState, useMemo } from "react";
import type { CompletedJob, CompletedJobsKpis, DateRangeKey } from "./types";

// Mock data – replace with API calls when backend is ready
const MOCK_JOBS: CompletedJob[] = [
  {
    id: "1",
    jobId: "JOB-001",
    customerName: "Ahmed Hassan",
    service: "Battery Replacement",
    price: "250 EGP",
    paymentStatus: "Paid",
    car: "Toyota Camry 2020",
    technicianName: "Ali Mohammed",
    date: "March 2, 2026",
    duration: "45 mins",
    phone: "+966 50 123 4567",
    completedAt: "11:30 AM",
  },
  {
    id: "2",
    jobId: "JOB-002",
    customerName: "Fatima Al-Zahrani",
    service: "Tire Change",
    price: "180 EGP",
    paymentStatus: "Paid",
    car: "Honda Accord 2021",
    technicianName: "Omar Khalid",
    date: "March 2, 2026",
    duration: "35 mins",
    phone: "+966 55 987 6543",
    completedAt: "10:15 AM",
  },
  {
    id: "3",
    jobId: "JOB-003",
    customerName: "Mohammed Al-Qahtani",
    service: "Mechanical Issue",
    price: "420 EGP",
    paymentStatus: "Paid",
    car: "Nissan Altima 2019",
    technicianName: "Ali Mohammed",
    date: "March 1, 2026",
    duration: "1 hr 20 mins",
    phone: "+966 54 111 2233",
    completedAt: "4:45 PM",
  },
];

const MOCK_KPIS: CompletedJobsKpis = {
  todayCompleted: 5,
  thisWeek: 18,
  totalRevenue: "4,850 EGP",
};

export function useCompletedJobs() {
  const [dateRange, setDateRange] = useState<DateRangeKey>("thisMonth");
  const [searchQuery, setSearchQuery] = useState("");

  const jobs = useMemo(() => {
    let list = [...MOCK_JOBS];
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
  }, [searchQuery]);

  const kpis: CompletedJobsKpis = MOCK_KPIS;

  const exportJobs = () => {
    // Logic: e.g. trigger download CSV or call export API
    console.log("Export completed jobs", { dateRange, count: jobs.length });
  };

  return {
    jobs,
    kpis,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    exportJobs,
  };
}
