"use client";

import ActiveJobsView from "./ActiveJobsView";
import { useProviderActiveRequests } from "./useProviderActiveRequests";

export default function ProviderActiveJobsPage() {
  const {
    requests,
    workshopLocation,
    hasMapCenter,
    isLoading,
    error,
    actionError,
    updatingRequestId,
    updateRequestStatus,
    refetch,
  } = useProviderActiveRequests();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading active jobs...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>Failed to load active jobs: {error}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-3 inline-flex items-center rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasMapCenter) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        Workshop location is missing, please update your location first.
      </div>
    );
  }

  return (
    <ActiveJobsView
      requests={requests}
      workshopLocation={workshopLocation}
      actionError={actionError}
      updatingRequestId={updatingRequestId}
      onUpdateStatus={updateRequestStatus}
    />
  );
}
