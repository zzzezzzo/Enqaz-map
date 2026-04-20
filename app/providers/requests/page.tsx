 "use client";

import { Car, MapPin, Clock2, Phone } from "lucide-react";
import { useProviderServiceRequests } from "./useProviderServiceRequests";

function formatMinutesAgo(value: string | number): string {
  const minutes = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(minutes) || minutes > 0) return "just now";

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export default function ProviderIncomingRequestsPage() {
  const {
    requests,
    isLoading,
    error,
    actionError,
    refetch,
    currentPage,
    lastPage,
    total,
    hasPagination,
    canGoNext,
    canGoPrev,
    knowsLastPage,
    nextPage,
    prevPage,
    updatingRequestId,
    updateRequestStatus,
  } = useProviderServiceRequests();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading incoming requests...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>Failed to load incoming requests: {error}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incoming Requests</h1>
          <p className="mt-1 text-sm text-gray-500">All pending assistance requests assigned to your workshop.</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-1 text-xs font-semibold text-amber-600">
          {requests.length} Pending
        </span>
      </div>

      <div className="space-y-3">
        {actionError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </div>
        )}
        {requests.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-500">
            No incoming requests right now.
          </div>
        )}
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{request.customer_name}</p>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-500" /> {request.car || "-"}
                  {" • "}
                  <MapPin className="w-4 h-4 text-gray-500" /> {request.distance}
                  {" • "}
                  <Clock2 className="w-4 h-4 text-gray-500" /> {formatMinutesAgo(request.minutes_ago)}
                  {" • "}
                  <span className="text-orange-500 flex items-center ">
                    <Phone className="w-4 h-4 text-orange-500" /> {request.phone || "N/A"}
                  </span>
                </p>
                <p className="text-sm font-semibold text-gray-700">{request.service_name}</p>
              </div>
              <p className="text-sm text-gray-600">{request.description}</p>
            </div>

            <div className="mt-3 flex items-center gap-3 md:mt-5">
              <button
                type="button"
                onClick={() => updateRequestStatus(request.id, "accepted")}
                disabled={updatingRequestId === request.id}
                className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingRequestId === request.id ? "Updating..." : "Accept Request"}
              </button>
              <button
                type="button"
                onClick={() => updateRequestStatus(request.id, "rejected")}
                disabled={updatingRequestId === request.id}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-xs font-semibold text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingRequestId === request.id ? "Updating..." : "Reject"}
              </button>
            </div>
          </div>
        ))}
      </div>

      { hasPagination && (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm text-gray-600">
            {knowsLastPage
              ? `Page ${currentPage} of ${lastPage}${total > 0 ? ` (${total} total)` : ""}`
              : `Page ${currentPage}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevPage}
              disabled={isLoading || !canGoPrev}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={nextPage}
              disabled={isLoading || !canGoNext}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

