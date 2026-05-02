import type { LucideIcon } from "lucide-react";

export type TrendDirection = "up" | "down" | "flat";

export type DashboardCardKey =
  | "total_requests_today"
  | "active_requests"
  | "registered_drivers"
  | "registered_workshops"
  | "active_winches";

export type DashboardWeeklyChange = {
  value: number;
  change_percent: number;
  direction: TrendDirection;
  label: string;
};

export type DashboardCards = {
  total_requests_today: number;
  active_requests: number;
  registered_drivers: number;
  registered_workshops: number;
  active_winches: number;
  weekly_change: Partial<Record<DashboardCardKey, DashboardWeeklyChange>>;
};

export type DashboardSystemPerformance = {
  average_response_time_minutes: number;
  completion_rate: number;
  customer_satisfaction: number;
  customer_satisfaction_scale: number;
};

export type DashboardPendingApprovals = {
  new_workshops: number;
  winch_registrations: number;
};

export type DashboardMapPoint = {
  id: number;
  lat: number;
  lng: number;
};

export type DashboardWorkshopPoint = DashboardMapPoint & {
  name: string;
};

export type DashboardLiveSystemMap = {
  active_requests: DashboardMapPoint[];
  workshops: DashboardWorkshopPoint[];
  winches: DashboardMapPoint[];
};

export type DashboardRecentActivityRow = {
  request_id: number;
  display_request_id: string;
  driver: string;
  workshop: string;
  service: string;
  status: string;
  time_ago: string;
};

export type AdminDashboardResponse = {
  cards: DashboardCards;
  system_performance: DashboardSystemPerformance;
  pending_approvals: DashboardPendingApprovals;
  live_system_map: DashboardLiveSystemMap;
  recent_activity: DashboardRecentActivityRow[];
};

export type AdminDashboardCardView = {
  key: DashboardCardKey;
  title: string;
  value: string;
  icon: LucideIcon;
  changePercentText: string;
  changeLabel: string;
  direction: TrendDirection;
};

export type MapMarker = {
  id: number;
  xPercent: number;
  yPercent: number;
};
