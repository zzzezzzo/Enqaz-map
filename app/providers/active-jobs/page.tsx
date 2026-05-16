"use client";

import { useCallback, useEffect, useState } from "react";
import ActiveJobsView from "./ActiveJobsView";
import { useProviderActiveRequests } from "./useProviderActiveRequests";
import { assignMechanicToRequest, fetchProviderMechanics } from "@/lib/mechanics/providerMechanicsApi";
import type { WorkshopMechanic } from "@/lib/mechanics/types";
import { useProviderProfile } from "@/app/providers/profile/useProviderProfile";
import { readAuthApiErrorMessage } from "@/services/auth";

export default function ProviderActiveJobsPage() {
  const { profile } = useProviderProfile();
  const workshopId = profile?.id ?? null;

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

  const [mechanics, setMechanics] = useState<WorkshopMechanic[]>([]);
  const [mechanicsLoading, setMechanicsLoading] = useState(true);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assigningRequestId, setAssigningRequestId] = useState<number | null>(null);

  const loadMechanics = useCallback(async () => {
    if (workshopId == null) {
      setMechanics([]);
      setMechanicsLoading(false);
      return;
    }
    setMechanicsLoading(true);
    try {
      setMechanics(await fetchProviderMechanics(workshopId));
    } catch {
      setMechanics([]);
    } finally {
      setMechanicsLoading(false);
    }
  }, [workshopId]);

  useEffect(() => {
    void loadMechanics();
  }, [loadMechanics]);

  const onAssignMechanic = useCallback(
    async (requestId: number, mechanicId: number) => {
      setAssigningRequestId(requestId);
      setAssignError(null);
      try {
        await assignMechanicToRequest(
          requestId,
          mechanicId,
          workshopId ?? undefined
        );
        await refetch();
      } catch (err: unknown) {
        const msg = readAuthApiErrorMessage(err);
        setAssignError(msg);
        throw new Error(msg);
      } finally {
        setAssigningRequestId(null);
      }
    },
    [refetch, workshopId]
  );

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
      mechanics={mechanics}
      mechanicsLoading={mechanicsLoading}
      actionError={actionError}
      assignError={assignError}
      updatingRequestId={updatingRequestId}
      assigningRequestId={assigningRequestId}
      onUpdateStatus={updateRequestStatus}
      onAssignMechanic={onAssignMechanic}
    />
  );
}
