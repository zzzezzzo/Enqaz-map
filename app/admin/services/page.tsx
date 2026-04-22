"use client";

import { useCallback, useEffect, useState } from "react";
import { readAuthApiErrorMessage } from "@/services/auth";
import { createCatalogServiceAdmin, loadServicesCatalogForAdmin } from "@/lib/adminBackend";
import type { ServiceOption } from "@/app/providers/profile/types";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const { services: next, error } = await loadServicesCatalogForAdmin();
    setServices(next);
    setListError(error);
    setListLoading(false);
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError("Service name is required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createCatalogServiceAdmin({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      await loadList();
    } catch (err: unknown) {
      setSubmitError(readAuthApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Services &amp; categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add catalog services workshops can offer. New entries are sent to your API (
          <code className="rounded bg-slate-100 px-1 text-xs">POST /api/admin/services</code> or{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">POST /api/services</code>).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Add a service</h2>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            {submitError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {submitError}
              </div>
            ) : null}
            <div>
              <label htmlFor="svc-name" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </label>
              <input
                id="svc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
                placeholder="e.g. Flat tire assistance"
              />
            </div>
            <div>
              <label
                htmlFor="svc-desc"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Description <span className="font-normal normal-case text-slate-400">(optional)</span>
              </label>
              <textarea
                id="svc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
                placeholder="Short description for admins and providers"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#0f2744] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0c2036] disabled:opacity-60 sm:w-auto sm:px-6"
            >
              {submitting ? "Saving…" : "Create service"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Catalog</h2>
            <button
              type="button"
              onClick={() => void loadList()}
              className="text-xs font-semibold text-[#0f2744] hover:underline"
            >
              Reload
            </button>
          </div>
          {listLoading ? (
            <p className="mt-6 text-sm text-slate-500">Loading services…</p>
          ) : listError ? (
            <p className="mt-6 text-sm text-amber-800">{listError}</p>
          ) : services.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No services returned from the API.</p>
          ) : (
            <ul className="mt-4 max-h-[28rem] divide-y divide-slate-100 overflow-y-auto">
              {services.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span className="font-mono text-xs text-slate-400">#{s.id}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
