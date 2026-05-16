"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import MechanicFormModal from "@/components/providers/mechanics/MechanicFormModal";
import {
  createProviderMechanic,
  deleteProviderMechanic,
  editProviderMechanic,
  fetchProviderMechanics,
  updateMechanicStatus,
} from "@/lib/mechanics/providerMechanicsApi";
import type { WorkshopMechanic } from "@/lib/mechanics/types";
import { useProviderProfile } from "@/app/providers/profile/useProviderProfile";
import { readAuthApiErrorMessage } from "@/services/auth";

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "in_job", label: "In Job" },
  { value: "offline", label: "Offline" },
] as const;

function statusBadgeClass(status: string | undefined, isActive: boolean): string {
  const s = (status ?? "").toLowerCase();
  if (s === "available" || (isActive && !status)) return "bg-emerald-50 text-emerald-700";
  if (s === "in_job") return "bg-amber-50 text-amber-700";
  if (s === "offline" || !isActive) return "bg-slate-100 text-slate-600";
  return "bg-sky-50 text-sky-700";
}

function statusLabel(m: WorkshopMechanic): string {
  if (m.status) return m.status.charAt(0).toUpperCase() + m.status.slice(1);
  return m.is_active ? "Active" : "Inactive";
}

function currentStatusValue(m: WorkshopMechanic): string {
  const s = (m.status ?? "").toLowerCase();
  if (s === "available" || s === "busy" || s === "offline") return s;
  return m.is_active ? "available" : "offline";
}

export default function ProviderMechanicsPage() {
  const { profile, isLoading: profileLoading } = useProviderProfile();
  const workshopId = profile?.id ?? null;

  const [mechanics, setMechanics] = useState<WorkshopMechanic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<WorkshopMechanic | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (workshopId == null) return;
    setLoading(true);
    setError(null);
    try {
      setMechanics(await fetchProviderMechanics(workshopId));
    } catch (err) {
      setError(readAuthApiErrorMessage(err));
      setMechanics([]);
    } finally {
      setLoading(false);
    }
  }, [workshopId]);

  useEffect(() => {
    if (profileLoading) return;
    if (workshopId == null) {
      setError("Workshop profile is not loaded. Refresh the page and try again.");
      setMechanics([]);
      setLoading(false);
      return;
    }
    void load();
  }, [load, profileLoading, workshopId]);

  const openCreate = () => {
    setEditingMechanic(null);
    setModalOpen(true);
  };

  const openEdit = (m: WorkshopMechanic) => {
    setEditingMechanic(m);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMechanic(null);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Remove this mechanic? They will no longer be able to sign in.")) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteProviderMechanic(id);
      await load();
    } catch (err) {
      setError(readAuthApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const onStatusChange = async (m: WorkshopMechanic, status: string) => {
    setUpdatingStatusId(m.id);
    setError(null);
    try {
      const updated = await updateMechanicStatus(m.id, status);
      setMechanics((prev) => prev.map((row) => (row.id === m.id ? updated : row)));
    } catch (err) {
      setError(readAuthApiErrorMessage(err));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mechanics</h1>
          <p className="text-sm text-slate-500">
            Manage team logins, availability, and credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={profileLoading || workshopId == null}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add mechanic
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading mechanics…</p>
        ) : mechanics.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">No mechanics yet. Add your first team member.</p>
            <button
              type="button"
              onClick={openCreate}
              disabled={workshopId == null}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add mechanic
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mechanics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{m.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{m.username}</td>
                    <td className="px-4 py-3 text-slate-600">{m.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(m.status, m.is_active)}`}
                        >
                          {statusLabel(m)}
                        </span>
                        <select
                          value={currentStatusValue(m)}
                          disabled={updatingStatusId === m.id}
                          onChange={(e) => void onStatusChange(m, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-60"
                          aria-label={`Change status for ${m.name}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(m)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(m.id)}
                          disabled={deletingId === m.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingId === m.id ? "Removing…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MechanicFormModal
        open={modalOpen}
        workshopId={workshopId}
        editingMechanic={editingMechanic}
        onClose={closeModal}
        onSubmit={async (payload) => {
          await createProviderMechanic(payload);
          await load();
        }}
        onEdit={async (id, payload) => {
          await editProviderMechanic(id, payload);
          await load();
        }}
      />
    </div>
  );
}
