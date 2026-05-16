"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import type { WorkshopMechanic } from "@/lib/mechanics/types";
import { readAuthApiErrorMessage } from "@/services/auth";

type Props = {
  open: boolean;
  requestLabel: string;
  mechanics: WorkshopMechanic[];
  loading?: boolean;
  onClose: () => void;
  onAssign: (mechanicId: number) => Promise<void>;
};

export default function AssignMechanicModal({
  open,
  requestLabel,
  mechanics,
  loading,
  onClose,
  onAssign,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const available = mechanics.filter((m) => m.is_active);

  const handleAssign = async () => {
    if (selectedId == null) {
      setError("Select a mechanic.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onAssign(selectedId);
      setSelectedId(null);
      onClose();
    } catch (err: unknown) {
      setError(readAuthApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Assign mechanic</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">{requestLabel}</p>

        {loading ? (
          <p className="text-sm text-slate-500">Loading team…</p>
        ) : available.length === 0 ? (
          <p className="text-sm text-amber-700">
            No mechanics yet. Add team members under Mechanics in the sidebar.
          </p>
        ) : (
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {available.map((m) => (
              <li key={m.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="mechanic"
                    checked={selectedId === m.id}
                    onChange={() => setSelectedId(m.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-slate-800">{m.name}</span>
                  <span className="text-xs text-slate-400">@{m.username}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || available.length === 0}
            onClick={() => void handleAssign()}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {saving ? "Assigning…" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
