"use client";

import { UserPlus, Search } from "lucide-react";
import { AddAdminModal } from "./AddAdminModal";
import { AdminAccountStatCard } from "./AdminAccountStatCard";
import { AdminAccountPermissionCard } from "./AdminAccountPermissionCard";
import { AdminAccountsTable } from "./AdminAccountsTable";
import { ROLE_PERMISSION_CARDS } from "./rolePermissionDefinitions";
import type { AdminAccountsViewProps } from "./types";

export function AdminAccountsView({
  stats,
  rows,
  searchQuery,
  onSearchChange,
  onAddNew,
  onEditAdmin,
  onDeactivateAdmin,
  addModalOpen,
  addModalKey,
  onAddModalClose,
  onAddAdminSubmit,
  addSubmitting,
  addError,
}: AdminAccountsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Accounts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage platform administrators, roles, and high-level access.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:min-w-[14rem]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter administrators…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
              aria-label="Filter administrators"
            />
          </div>
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-amber-500 bg-white px-4 py-2 text-sm font-semibold text-amber-600 shadow-sm hover:bg-amber-50"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Add New Admin
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminAccountStatCard title="Total admins" value={stats.total} subtext="Active accounts" tone="emerald" />
        <AdminAccountStatCard title="Super admins" value={stats.superAdmins} subtext="Full access" tone="blue" />
        <AdminAccountStatCard title="Active now" value={stats.activeNow} subtext="Currently online" tone="emerald" />
        <AdminAccountStatCard title="Inactive" value={stats.inactive} subtext="Needs attention" tone="red" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <AdminAccountsTable
          rows={rows}
          totalForTitle={stats.total}
          onEdit={onEditAdmin}
          onDeactivate={onDeactivateAdmin}
        />
      </div>

      <section className="space-y-3" aria-labelledby="admin-role-permissions-heading">
        <h2
          id="admin-role-permissions-heading"
          className="text-lg font-bold text-slate-900"
        >
          Role Permissions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROLE_PERMISSION_CARDS.map((def) => (
            <AdminAccountPermissionCard key={def.id} definition={def} />
          ))}
        </div>
      </section>

      <AddAdminModal
        key={addModalKey}
        open={addModalOpen}
        onClose={onAddModalClose}
        onSubmit={onAddAdminSubmit}
        submitting={addSubmitting}
        error={addError}
      />
    </div>
  );
}
