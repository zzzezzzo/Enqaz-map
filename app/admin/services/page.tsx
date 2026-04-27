"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, LayoutGrid, Plus, X } from "lucide-react";
import { readAuthApiErrorMessage } from "@/services/auth";
import {
  createAdminService,
  deleteService,
  fetchAdminServices,
  getServiceForEdit,
  updateService,
  updateServiceIsActive,
  type AdminCatalogService,
  type ServiceCategoryKey,
} from "@/lib/adminServicesApi";
import { ServiceGridCard } from "./ServiceGridCard";

const FILTER_CHIPS: { id: "all" | ServiceCategoryKey; label: string }[] = [
  { id: "all", label: "All services" },
  { id: "emergency", label: "Emergency" },
  { id: "basic", label: "Basic service" },
  { id: "workshop", label: "Workshop" },
];

function KpiCard({
  title,
  value,
  subtitle,
  Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  Icon: typeof LayoutGrid;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="rounded-lg bg-amber-50 p-2 text-amber-800">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function formatKpi(n: number, compact = false) {
  try {
    if (compact && n >= 1000) {
      return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
    }
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
}

function categoryCountLabel(services: AdminCatalogService[]): string {
  const keys = new Set(services.map((s) => s.category_key).filter((k) => k && k !== "other") as ServiceCategoryKey[]);
  if (keys.size) return `Across ${keys.size} ${keys.size === 1 ? "category" : "categories"}.`;
  return "Categories from API.";
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminCatalogService[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [filter, setFilter] = useState<"all" | ServiceCategoryKey>("all");

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const list = await fetchAdminServices();
      setServices(list);
    } catch (e: unknown) {
      setListError(readAuthApiErrorMessage(e));
      setServices([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const counts = useMemo(() => {
    const c = (k: ServiceCategoryKey | "other") =>
      services.filter((s) => (s.category_key ?? "other") === k).length;
    return { emergency: c("emergency"), basic: c("basic"), workshop: c("workshop"), other: c("other") };
  }, [services]);

  const filtered = useMemo(() => {
    if (filter === "all") return services;
    return services.filter((s) => (s.category_key ?? "other") === filter);
  }, [services, filter]);

  const kpis = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.is_active !== false).length;
    const tr = services.reduce((a, s) => a + (s.total_requests ?? 0), 0);
    return { total, active, totalReq: tr, catLine: categoryCountLabel(services) };
  }, [services]);

  const openEdit = useCallback(async (id: number) => {
    setEditId(id);
    setEditName("");
    setEditDescription("");
    setEditActive(true);
    setEditError(null);
    setEditLoading(true);
    try {
      const s = await getServiceForEdit(id);
      setEditName(s.name);
      setEditDescription(s.description ?? "");
      setEditActive(s.is_active !== false);
    } catch (e: unknown) {
      setEditError(readAuthApiErrorMessage(e));
    } finally {
      setEditLoading(false);
    }
  }, []);

  const closeEdit = useCallback(() => {
    if (editSaving) return;
    setEditId(null);
    setEditError(null);
  }, [editSaving]);

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId == null || !editName.trim()) {
      setEditError("Name is required.");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      await updateService(editId, {
        name: editName.trim(),
        description: editDescription.trim(),
        is_active: editActive,
      });
      setEditId(null);
      await loadList();
    } catch (err: unknown) {
      setEditError(readAuthApiErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggle = async (s: AdminCatalogService) => {
    setTogglingId(s.id);
    setListError(null);
    const wasActive = s.is_active !== false;
    try {
      await updateServiceIsActive(s.id, !wasActive);
      await loadList();
    } catch (e: unknown) {
      setListError(readAuthApiErrorMessage(e));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!globalThis.confirm("Delete this service? This cannot be undone.")) return;
    setDeletingId(id);
    setListError(null);
    try {
      await deleteService(id);
      if (editId === id) setEditId(null);
      await loadList();
    } catch (e: unknown) {
      setListError(readAuthApiErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError("Service name is required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createAdminService({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      setAddOpen(false);
      await loadList();
    } catch (err: unknown) {
      setSubmitError(readAuthApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const showOtherChip = counts.other > 0;
  const chipList = useMemo(
    () =>
      showOtherChip
        ? [...FILTER_CHIPS, { id: "other" as const, label: "Other" }]
        : FILTER_CHIPS,
    [showOtherChip]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Services &amp; categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the service catalog and availability. List and create use{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">/api/admin/services</code>; update and delete use{" "}
            <code className="text-xs">/api/services/{"{id}"}</code> when your backend supports it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadList()}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmitError(null);
              setAddOpen(true);
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-amber-600 hover:to-orange-600"
          >
            <Plus className="h-4 w-4" />
            Add new services
          </button>
        </div>
      </div>

      {listError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{listError}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total services"
          value={String(kpis.total)}
          subtitle={kpis.catLine}
          Icon={LayoutGrid}
        />
        <KpiCard
          title="Active services"
          value={String(kpis.active)}
          subtitle="Available now"
          Icon={CheckCircle2}
        />
        <KpiCard
          title="Total requests"
          value={formatKpi(kpis.totalReq, true)}
          Icon={BarChart3}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-700">Filter by category</p>
        <div className="flex flex-wrap gap-2">
          {chipList.map((c) => {
            const n =
              c.id === "all"
                ? services.length
                : c.id === "emergency"
                  ? counts.emergency
                  : c.id === "basic"
                    ? counts.basic
                    : c.id === "workshop"
                      ? counts.workshop
                      : counts.other;
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id as typeof filter)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c.label} ({n})
              </button>
            );
          })}
        </div>
      </div>

      {listLoading && services.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          Loading services…
        </div>
      ) : !listLoading && filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 border-dashed bg-slate-50/80 p-12 text-center text-sm text-slate-600">
          No services in this filter. Try &quot;All services&quot; or add a new service.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((s) => (
            <ServiceGridCard
              key={s.id}
              service={s}
              onEdit={(id) => void openEdit(id)}
              onDelete={handleDelete}
              onToggleActive={handleToggle}
              busyDelete={deletingId === s.id}
              busyToggle={togglingId === s.id}
            />
          ))}
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/50"
            aria-label="Close"
            onClick={() => (submitting ? null : setAddOpen(false))}
          />
          <div
            className="relative w-full max-w-md rounded-t-2xl border border-slate-200 bg-white p-6 shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-modal
            aria-labelledby="add-svc-title"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <h2 id="add-svc-title" className="text-lg font-bold text-slate-900">
                Add service
              </h2>
              <button
                type="button"
                onClick={() => (submitting ? null : setAddOpen(false))}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleCreate}>
              {submitError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{submitError}</div>
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
                  placeholder="e.g. Towing"
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
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => (submitting ? null : setAddOpen(false))}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#0f2744] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0c2036] disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editId != null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button type="button" className="absolute inset-0 cursor-default bg-black/50" aria-label="Close" onClick={closeEdit} />
          <div
            className="relative w-full max-w-md rounded-t-2xl border border-slate-200 bg-white p-6 shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-modal
            aria-labelledby="edit-svc-title"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <h2 id="edit-svc-title" className="text-lg font-bold text-slate-900">
                Edit service (#{editId})
              </h2>
              <button
                type="button"
                onClick={closeEdit}
                disabled={editSaving}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {editLoading ? (
              <p className="text-sm text-slate-500">Loading service…</p>
            ) : (
              <form className="space-y-3" onSubmit={saveEdit}>
                {editError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{editError}</div>
                ) : null}
                <div>
                  <label htmlFor="edit-svc-name" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </label>
                  <input
                    id="edit-svc-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
                  />
                </div>
                <div>
                  <label htmlFor="edit-svc-desc" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </label>
                  <textarea
                    id="edit-svc-desc"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Service active
                </label>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    disabled={editSaving}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="rounded-lg bg-[#0f2744] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0c2036] disabled:opacity-50"
                  >
                    {editSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
