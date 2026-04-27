import type { CreateAdminProfilePayload } from "@/lib/adminProfileApi";

export type AdminAccountRole = "super_admin" | "admin" | "manager";

export type AdminAccountStatus = "active" | "inactive";

export type AdminAccountRow = {
  publicId: string;
  name: string;
  email: string;
  phone: string;
  role: AdminAccountRole;
  lastLoginAt: string;
  createdAt: string;
  status: AdminAccountStatus;
  isOnline: boolean;
};

export type AdminAccountStats = {
  total: number;
  superAdmins: number;
  activeNow: number;
  inactive: number;
};

export type RolePermissionDefinition = {
  id: string;
  title: string;
  className: string;
  items: string[];
};

/** Props for the presentational page shell; assembled in `useAdminAccounts`. */
export type AdminAccountsViewProps = {
  stats: AdminAccountStats;
  rows: AdminAccountRow[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onAddNew: () => void;
  onEditAdmin: (row: AdminAccountRow) => void;
  onDeactivateAdmin: (row: AdminAccountRow) => void;
  addModalOpen: boolean;
  /** Remounts the add modal on each open so the form starts empty (avoids setState in effects). */
  addModalKey: number;
  onAddModalClose: () => void;
  onAddAdminSubmit: (payload: CreateAdminProfilePayload) => Promise<void>;
  addSubmitting: boolean;
  addError: string | null;
};
