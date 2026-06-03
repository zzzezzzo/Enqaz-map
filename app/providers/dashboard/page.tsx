"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import ProviderIncomingRequestCard from "@/components/providers/requests/ProviderIncomingRequestCard";
import {
  mapProviderIncomingRequest,
  postProviderIncomingRequestStatus,
  type ProviderIncomingRequest,
} from "@/lib/providerIncomingRequests";
import { useProviderDashboard } from "./ProviderDashboard";

const RequestsMap = dynamic(() => import("@/components/map/RequestsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
      Loading map…
    </div>
  ),
});

export default function ProviderDashboard() {
  const { data, isLoading, error, refetch } = useProviderDashboard();
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const workshop = data?.income_request?.workShop_location;

  const incomingRequests = useMemo((): ProviderIncomingRequest[] => {
    const raw = data?.income_request?.requests ?? [];
    return raw
      .map(mapProviderIncomingRequest)
      .filter((row): row is ProviderIncomingRequest => row != null);
  }, [data?.income_request?.requests]);

  const updateRequestStatus = useCallback(
    async (requestId: number, status: "accepted" | "rejected") => {
      try {
        setUpdatingRequestId(requestId);
        setActionError(null);
        await postProviderIncomingRequestStatus(requestId, status);
        await refetch();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update request status";
        setActionError(message);
      } finally {
        setUpdatingRequestId(null);
      }
    },
    [refetch]
  );

  const statsCards = data
    ? [
        {
          title: "Total requests today",
          value: String(data.service_status?.total_requests_today ?? 0),
          change: "+12%",
          color: "bg-blue-500",
        },
        {
          title: "Active jobs",
          value: String(data.service_status?.active_jobs ?? 0),
          change: "+8%",
          color: "bg-green-500",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500">Loading dashboard overview…</div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>Failed to load dashboard: {error}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 inline-flex items-center rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!workshop?.latitude || !workshop?.longitude) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Workshop location is missing. Update your profile location to see the map
        and incoming requests.
      </div>
    );
  }

  const workshopLat = parseFloat(workshop.latitude);
  const workshopLng = parseFloat(workshop.longitude);

  return (
    <>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Dashboard overview
      </h2>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="transform rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                <div className="flex items-center">
                  <p className="mt-2 text-sm text-green-600">{card.change}</p>
                  <div className="ml-2 h-2 w-2 animate-pulse rounded-full bg-green-100" />
                </div>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color} transform transition-transform duration-300 hover:rotate-12`}
              >
                <LayoutDashboard className="h-6 w-6 text-white transition-transform duration-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-lg bg-white shadow lg:col-span-2">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Incoming requests
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{incomingRequests.length} pending</span>
                <Link
                  href="/providers/requests"
                  className="font-semibold text-orange-600 hover:underline"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>
          <div className="max-h-[32rem] space-y-3 overflow-y-auto p-4">
            {actionError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {actionError}
              </div>
            ) : null}
            {incomingRequests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No incoming requests right now.
              </div>
            ) : (
              incomingRequests.slice(0, 20).map((request) => (
                <ProviderIncomingRequestCard
                  key={request.id}
                  request={request}
                  variant="compact"
                  updating={updatingRequestId === request.id}
                  onAccept={() => updateRequestStatus(request.id, "accepted")}
                  onReject={() => updateRequestStatus(request.id, "rejected")}
                />
              ))
            )}
          </div>
        </div>

        <div className="col-span-2 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Incoming requests map
            </h3>
          </div>
          <div className="p-4">
            <RequestsMap
              center={[workshopLat, workshopLng]}
              zoom={11}
              markers={incomingRequests.map((req) => ({
                id: req.id,
                lat: req.latitude ?? workshopLat,
                lng: req.longitude ?? workshopLng,
                label: `${req.customer_name} — ${req.service_name}`,
                subtitle: req.appointmentLabel ?? req.distance,
                type: "driver" as const,
              }))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
