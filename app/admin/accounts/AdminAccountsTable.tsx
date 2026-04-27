"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoreVertical, Pencil, UserX } from "lucide-react";
import type { AdminAccountRow } from "./types";
import { formatCreatedDate, formatRoleLabel, formatStatusLabel, formatTableDateTime } from "./adminAccountFormatters";

type RowMenuProps = {
  rowId: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
};

function RowActionMenu({ rowId, isOpen, onOpen, onClose, onEdit, onDeactivate }: RowMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={`Actions for ${rowId}`}
        onClick={() => (isOpen ? onClose() : onOpen())}
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {isOpen ? (
        <div
          id={menuId}
          className="absolute right-0 z-20 mt-1 min-w-[9rem] rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
          role="menu"
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
            role="menuitem"
            onClick={() => {
              onEdit();
              onClose();
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-700 hover:bg-red-50"
            role="menuitem"
            onClick={() => {
              onDeactivate();
              onClose();
            }}
          >
            <UserX className="h-4 w-4" aria-hidden />
            Deactivate
          </button>
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  rows: AdminAccountRow[];
  totalForTitle: number;
  onEdit?: (row: AdminAccountRow) => void;
  onDeactivate?: (row: AdminAccountRow) => void;
};

function statusPillClass(status: AdminAccountRow["status"]): string {
  return status === "active"
    ? "bg-emerald-100 text-emerald-800 border-emerald-200/80"
    : "bg-slate-200 text-slate-800 border-slate-300/80";
}

export function AdminAccountsTable({ rows, totalForTitle, onEdit, onDeactivate }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-600">No administrators match this search.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 sm:px-5">
        All Administrators ({totalForTitle})
      </h2>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-3 sm:px-4">Admin ID</th>
            <th className="px-3 py-3 sm:px-4 min-w-[12rem]">Provider &amp; owner</th>
            <th className="px-3 py-3 sm:px-4">Contact</th>
            <th className="px-3 py-3 sm:px-4">Role</th>
            <th className="px-3 py-3 sm:px-4">Last login</th>
            <th className="px-3 py-3 sm:px-4 hidden sm:table-cell">Created</th>
            <th className="px-3 py-3 sm:px-4">Status</th>
            <th className="px-3 py-3 sm:px-4 w-12 text-right" aria-label="Row actions" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const last = formatTableDateTime(row.lastLoginAt);
            return (
              <tr key={row.publicId} className="text-slate-800">
                <td className="px-3 py-3 font-mono text-xs sm:px-4 whitespace-nowrap">{row.publicId}</td>
                <td className="px-3 py-3 sm:px-4">
                  <div className="font-medium" dir="auto">
                    {row.name}
                  </div>
                  <div className="text-xs text-slate-500">{row.email}</div>
                </td>
                <td className="px-3 py-3 text-slate-600 sm:px-4 whitespace-nowrap">{row.phone}</td>
                <td className="px-3 py-3 sm:px-4 whitespace-nowrap">{formatRoleLabel(row.role)}</td>
                <td className="px-3 py-3 text-slate-600 sm:px-4 whitespace-nowrap">
                  <div>{last.date}</div>
                  {last.time ? <div className="text-xs text-slate-500">{last.time}</div> : null}
                </td>
                <td className="px-3 py-3 text-slate-600 sm:px-4 hidden sm:table-cell whitespace-nowrap">
                  {formatCreatedDate(row.createdAt)}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusPillClass(
                      row.status
                    )}`}
                  >
                    {formatStatusLabel(row.status)}
                  </span>
                </td>
                <td className="px-3 py-2 sm:px-4 text-right">
                  <RowActionMenu
                    rowId={row.publicId}
                    isOpen={openId === row.publicId}
                    onOpen={() => setOpenId(row.publicId)}
                    onClose={() => setOpenId(null)}
                    onEdit={() => onEdit?.(row)}
                    onDeactivate={() => onDeactivate?.(row)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
