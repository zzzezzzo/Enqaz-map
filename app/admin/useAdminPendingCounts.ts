"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPendingWorkshopsForAdmin } from "@/lib/adminBackend";

export function useAdminPendingCounts() {
  const [pendingWorkshops, setPendingWorkshops] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const { workshops } = await fetchPendingWorkshopsForAdmin();
    setPendingWorkshops(workshops.length);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { pendingWorkshops, refresh };
}
