"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Building2, FileText, Truck, Users } from "lucide-react";
import api, { readAuthApiErrorMessage } from "@/services/auth";
import type {
  AdminDashboardCardView,
  AdminDashboardResponse,
  DashboardCardKey,
  DashboardRecentActivityRow,
  DashboardLiveSystemMap,
} from "./dashboardTypes";

const CARD_META: Array<{
  key: DashboardCardKey;
  title: string;
  icon: typeof FileText;
}> = [
  { key: "total_requests_today", title: "Total Requests Today", icon: FileText },
  { key: "active_requests", title: "Active Requests", icon: Activity },
  { key: "registered_drivers", title: "Registered Drivers", icon: Users },
  { key: "registered_workshops", title: "Registered Workshops", icon: Building2 },
  { key: "active_winches", title: "Active Winches", icon: Truck },
];

function unwrapDashboardPayload(payload: unknown): AdminDashboardResponse | null {
  if (payload == null || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const hasRootKeys = "cards" in p && "system_performance" in p;
  if (hasRootKeys) return payload as AdminDashboardResponse;
  const inner = p.data;
  if (inner != null && typeof inner === "object") {
    const d = inner as Record<string, unknown>;
    if ("cards" in d && "system_performance" in d) return inner as AdminDashboardResponse;
  }
  return null;
}

function formatMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0 min";
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} min`;
  const hours = totalMinutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  const days = hours / 24;
  return `${days.toFixed(1)} d`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(2).replace(/\.00$/, "")}%`;
}

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/dashboard");
      const parsed = unwrapDashboardPayload(response.data);
      if (!parsed) throw new Error("Dashboard payload format is not recognized.");
      setData(parsed);
    } catch (e) {
      setError(readAuthApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const cards = useMemo<AdminDashboardCardView[]>(() => {
    if (!data) return [];
    return CARD_META.map((meta) => {
      const weekly = data.cards.weekly_change?.[meta.key];
      return {
        key: meta.key,
        title: meta.title,
        value: String(data.cards[meta.key]),
        icon: meta.icon,
        changePercentText: weekly ? formatPercent(Math.abs(weekly.change_percent)) : "0%",
        changeLabel: weekly?.label || "vs last week",
        direction: weekly?.direction || "flat",
      };
    });
  }, [data]);

  const performance = useMemo(() => {
    if (!data) return null;
    return [
      {
        label: "Average Response Time",
        value: formatMinutes(data.system_performance.average_response_time_minutes),
      },
      {
        label: "Completion Rate",
        value: formatPercent(data.system_performance.completion_rate),
      },
      {
        label: "Customer Satisfaction",
        value: `${data.system_performance.customer_satisfaction} / ${data.system_performance.customer_satisfaction_scale}`,
      },
    ];
  }, [data]);

  const liveSystemMap = useMemo<DashboardLiveSystemMap>(() => {
    if (!data) {
      return { active_requests: [], workshops: [], winches: [] };
    }
    return data.live_system_map;
  }, [data]);

  const recentActivity = useMemo<DashboardRecentActivityRow[]>(
    () => data?.recent_activity ?? [],
    [data]
  );

  return {
    loading,
    error,
    refresh,
    cards,
    performance,
    pendingApprovals: data?.pending_approvals ?? null,
    liveSystemMap,
    recentActivity,
  };
}
