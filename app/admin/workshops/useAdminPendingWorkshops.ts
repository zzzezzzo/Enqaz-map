"use client";

import { useCallback, useEffect, useState } from "react";
import { readAuthApiErrorMessage } from "@/services/auth";
import {
  fetchAdminPendingWorkshopsPage,
  updateWorkshopIsAvailable,
  type AdminPendingWorkshop,
  type AdminWorkshopsPageMeta,
} from "@/lib/adminWorkshopsApi";

export function useAdminPendingWorkshops() {
  const [rows, setRows] = useState<AdminPendingWorkshop[]>([]);
  const [meta, setMeta] = useState<AdminWorkshopsPageMeta>({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: null,
    to: null,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async (nextPage: number, opts?: { clearList?: boolean }) => {
    setLoading(true);
    setError(null);
    if (opts?.clearList !== false) {
      setRows([]);
    }
    try {
      const { rows: list, meta: m } = await fetchAdminPendingWorkshopsPage(nextPage);
      setRows(list);
      setMeta(m);
      setPage(m.currentPage);
    } catch (e: unknown) {
      setError(readAuthApiErrorMessage(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1, { clearList: true });
  }, [load]);

  const goToPage = useCallback(
    (p: number) => {
      if (p < 1 || p > meta.lastPage) return;
      void load(p);
    },
    [load, meta.lastPage]
  );

  const setAvailability = useCallback(
    async (workshopId: number, next: boolean) => {
      setUpdatingId(workshopId);
      setError(null);
      try {
        await updateWorkshopIsAvailable(workshopId, next);
        await load(page, { clearList: false });
      } catch (e: unknown) {
        setError(readAuthApiErrorMessage(e));
      } finally {
        setUpdatingId(null);
      }
    },
    [load, page]
  );

  return {
    rows,
    meta,
    page,
    loading,
    error,
    updatingId,
    refresh: () => void load(page),
    goToPage,
    setAvailability,
  };
}
