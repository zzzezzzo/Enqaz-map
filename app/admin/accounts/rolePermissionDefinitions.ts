import type { RolePermissionDefinition } from "./types";

export const ROLE_PERMISSION_CARDS: RolePermissionDefinition[] = [
  {
    id: "super",
    title: "Super Admin",
    className: "bg-emerald-50 border-emerald-200/80",
    items: [
      "Full system access",
      "Manage all admins",
      "System configuration",
      "Financial controls",
    ],
  },
  {
    id: "admin",
    title: "Admin",
    className: "bg-sky-50 border-sky-200/80",
    items: ["Manage users", "Approve workshops", "View reports", "Monitor requests"],
  },
  {
    id: "manager",
    title: "Manager roles",
    className: "bg-violet-50 border-violet-200/80",
    items: [
      "Department-specific access",
      "View analytics",
      "Generate reports",
      "Limited configurations",
    ],
  },
];
