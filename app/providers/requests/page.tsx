"use client";

import ProviderIncomingRequestCard from "@/components/providers/requests/ProviderIncomingRequestCard";
import { useProviderServiceRequests } from "./useProviderServiceRequests";

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
    return <div className="text-sm text-gray-500">Loading incoming requests…</div>;
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incoming requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pending assistance and scheduled workshop visits for your workshop.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-4 py-1 text-xs font-semibold text-amber-600">
          {requests.length} pending
        </span>
      </div>

      <div className="space-y-4">
        {actionError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </div>
        ) : null}
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-500">
            No incoming requests right now.
          </div>
        ) : null}
        {requests.map((request) => (
          <ProviderIncomingRequestCard
            key={request.id}
            request={request}
            updating={updatingRequestId === request.id}
            onAccept={() => updateRequestStatus(request.id, "accepted")}
            onReject={() => updateRequestStatus(request.id, "rejected")}
          />
        ))}
      </div>

      {hasPagination ? (
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
      ) : null}
    </div>
  );
}
