/**
 * Completed job as shown in Job History.
 * UI-agnostic; used by hook and passed as props to CompletedJobCard.
 */
export type CompletedJob = {
  id: string;
  jobId: string;
  customerName: string;
  service: string;
  price: string;
  paymentStatus: "Paid" | "Pending";
  car: string;
  technicianName: string;
  date: string;
  duration: string;
  phone: string;
  completedAt: string;
  completedAtRaw?: string;
};

/**
 * KPI summary for the Completed Jobs page.
 */
export type CompletedJobsKpis = {
  todayCompleted: number;
  thisWeek: number;
  totalRevenue: string;
};

export type DateRangeKey = "today" | "thisWeek" | "thisMonth" | "custom";
