"use client";

import { AdminDashboardView } from "./AdminDashboardView";
import { useAdminDashboard } from "./useAdminDashboard";

export default function AdminDashboardPage() {
  const { loading, error, refresh, cards, performance, pendingApprovals, liveSystemMap, recentActivity } =
    useAdminDashboard();

  return (
    <AdminDashboardView
      loading={loading}
      error={error}
      onRefresh={refresh}
      cards={cards}
      performance={performance}
      pendingApprovals={pendingApprovals}
      liveSystemMap={liveSystemMap}
      recentActivity={recentActivity}
    />
  );
}
