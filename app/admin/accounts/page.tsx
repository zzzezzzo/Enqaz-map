"use client";

import { AdminAccountsView } from "./AdminAccountsView";
import { useAdminAccounts } from "./useAdminAccounts";

export default function AdminAccountsPage() {
  const { viewProps } = useAdminAccounts();
  return <AdminAccountsView {...viewProps} />;
}
