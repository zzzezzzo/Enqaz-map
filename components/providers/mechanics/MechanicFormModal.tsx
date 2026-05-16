"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type {
  CreateMechanicPayload,
  EditMechanicPayload,
} from "@/lib/mechanics/providerMechanicsApi";
import type { WorkshopMechanic } from "@/lib/mechanics/types";
import { readAuthApiErrorMessage } from "@/services/auth";

type Props = {
  open: boolean;
  workshopId: number | null;
  /** When set, modal edits an existing mechanic instead of creating one. */
  editingMechanic?: WorkshopMechanic | null;
  onClose: () => void;
  onSubmit: (payload: CreateMechanicPayload) => Promise<void>;
  onEdit?: (id: number, payload: EditMechanicPayload) => Promise<void>;
};

export default function MechanicFormModal({
  open,
  workshopId,
  editingMechanic,
  onClose,
  onSubmit,
  onEdit,
}: Props) {
  const isEdit = editingMechanic != null;
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingMechanic) {
      setName(editingMechanic.name);
      setUsername(editingMechanic.username);
      setPhone(editingMechanic.phone ?? "");
      setPassword("");
    } else {
      setName("");
      setUsername("");
      setPassword("");
      setPhone("");
    }
    setError(null);
  }, [open, editingMechanic]);

  if (!open) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !username.trim() || !phone.trim()) {
      setError("Name, username, and phone are required.");
      return;
    }

    if (isEdit) {
      if (!onEdit || !editingMechanic) return;
      if (password && password.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      setSaving(true);
      try {
        const payload: EditMechanicPayload = {
          name: name.trim(),
          username: username.trim(),
          phone: phone.trim(),
        };
        if (password) payload.password = password;
        await onEdit(editingMechanic.id, payload);
        onClose();
      } catch (err: unknown) {
        setError(readAuthApiErrorMessage(err));
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (workshopId == null || !Number.isFinite(workshopId) || workshopId <= 0) {
      setError("Workshop profile is not loaded. Refresh the page and try again.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        username: username.trim(),
        password,
        phone: phone.trim(),
        workshop_id: workshopId,
        provider_id: workshopId,
      });
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
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit mechanic" : "Add mechanic"}
          </h2>
          <button type="button" onClick={handleClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          {isEdit
            ? "Update details or set a new password (leave blank to keep current)."
            : "Create login credentials. Mechanics sign in at /mechanic/login."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700" autoComplete="off" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              {isEdit ? "New password (optional)" : "Password"}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700" minLength={isEdit ? undefined : 6} required={!isEdit} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Phone number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700" autoComplete="tel" required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={handleClose} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
