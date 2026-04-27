import type { AdminAccountRole, AdminAccountStatus } from "./types";

const ROLE_LABELS: Record<AdminAccountRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
};

export function formatRoleLabel(role: AdminAccountRole): string {
  return ROLE_LABELS[role];
}

export function formatStatusLabel(status: AdminAccountStatus): string {
  return status === "active" ? "Active" : "Inactive";
}

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

export function formatTableDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "—", time: "" };
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function formatCreatedDate(iso: string): string {
  const p = iso.split("T")[0];
  return p || "—";
}
