"use client";

import { useCallback, useMemo, useState } from "react";
import { createAdminProfile, type CreateAdminProfilePayload } from "@/lib/adminProfileApi";
import { readAuthApiErrorMessage } from "@/services/auth";
import { DEFAULT_ADMIN_ACCOUNTS } from "./adminAccountsDefaultData";
import type { AdminAccountRow, AdminAccountStats, AdminAccountsViewProps } from "./types";

function computeStats(accounts: AdminAccountRow[]): AdminAccountStats {
  return {
    total: accounts.length,
    superAdmins: accounts.filter((a) => a.role === "super_admin").length,
    activeNow: accounts.filter((a) => a.isOnline).length,
    inactive: accounts.filter((a) => a.status === "inactive").length,
  };
}

function accountMatchesQuery(row: AdminAccountRow, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    row.publicId.toLowerCase().includes(s) ||
    row.name.toLowerCase().includes(s) ||
    row.email.toLowerCase().includes(s) ||
    row.phone.replace(/\s/g, "").includes(s.replace(/\s/g, ""))
  );
}

export function useAdminAccounts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  /** Swap this to async fetch when `GET /admin/accounts` (or similar) is available. */
  const allAccounts = useMemo(() => DEFAULT_ADMIN_ACCOUNTS, []);

  const stats = useMemo(() => computeStats(allAccounts), [allAccounts]);

  const filteredRows = useMemo(
    () => allAccounts.filter((r) => accountMatchesQuery(r, searchQuery)),
    [allAccounts, searchQuery]
  );

  const onAddNew = useCallback(() => {
    setAddError(null);
    setAddModalKey((k) => k + 1);
    setAddModalOpen(true);
  }, []);

  const onAddModalClose = useCallback(() => {
    if (addSubmitting) return;
    setAddModalOpen(false);
    setAddError(null);
  }, [addSubmitting]);

  const onAddAdminSubmit = useCallback(
    async (payload: CreateAdminProfilePayload) => {
      setAddSubmitting(true);
      setAddError(null);
      try {
        await createAdminProfile(payload);
        setAddModalOpen(false);
      } catch (e) {
        setAddError(readAuthApiErrorMessage(e));
      } finally {
        setAddSubmitting(false);
      }
    },
    []
  );

  const onEditAdmin = useCallback((row: AdminAccountRow) => {
    void row;
    // Placeholder: edit drawer / route
  }, []);

  const onDeactivateAdmin = useCallback((row: AdminAccountRow) => {
    void row;
    // Placeholder: confirm + API
  }, []);

  const viewProps: AdminAccountsViewProps = {
    stats,
    rows: filteredRows,
    searchQuery,
    onSearchChange: setSearchQuery,
    onAddNew,
    onEditAdmin,
    onDeactivateAdmin,
    addModalOpen,
    addModalKey,
    onAddModalClose,
    onAddAdminSubmit,
    addSubmitting,
    addError,
  };

  return { viewProps };
}
