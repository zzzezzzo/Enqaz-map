"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CreateAdminProfilePayload } from "@/lib/adminProfileApi";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAdminProfilePayload) => Promise<void>;
  submitting: boolean;
  error: string | null;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
};

export function AddAdminModal({ open, onClose, onSubmit, submitting, error: serverError }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [clientError, setClientError] = useState<string | null>(null);

  if (!open) return null;

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    if (!name || !email || !phone) {
      setClientError("Name, email, and phone are required.");
      return;
    }
    if (form.password.length < 8) {
      setClientError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setClientError("Passwords do not match.");
      return;
    }
    await onSubmit({
      name,
      email,
      phone,
      password: form.password,
      password_confirmation: form.password_confirmation,
    });
  };

  const displayError = clientError || serverError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-admin-title"
      onClick={submitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <h2 id="add-admin-title" className="text-lg font-bold text-slate-900">
            Add new admin
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 sm:px-5">
          {displayError ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {displayError}
            </div>
          ) : null}

          <div>
            <label htmlFor="add-admin-name" className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="add-admin-name"
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="add-admin-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="add-admin-email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="add-admin-phone" className="block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              id="add-admin-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
              required
              autoComplete="tel"
            />
          </div>

          <div>
            <label htmlFor="add-admin-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="add-admin-password"
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              htmlFor="add-admin-password-confirm"
              className="block text-sm font-medium text-slate-700"
            >
              Confirm password
            </label>
            <input
              id="add-admin-password-confirm"
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setField("password_confirmation", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#0f2744] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0c2036] disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
