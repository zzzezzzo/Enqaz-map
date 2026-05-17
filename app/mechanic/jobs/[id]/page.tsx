"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Car, MessageSquare, Navigation, Phone } from "lucide-react";
import {
  fetchMechanicJob,
  updateMechanicJobStatus,
} from "@/lib/mechanics/mechanicJobsApi";
import { mechanicAuthService } from "@/services/mechanicAuth";
import type { MechanicDispatchStatus, MechanicJob } from "@/lib/mechanics/types";
import { useMechanicLocationBroadcast } from "@/hooks/useMechanicLocationBroadcast";

const RequestsMap = dynamic(() => import("@/components/map/RequestsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
      Loading map…
    </div>
  ),
});

const STATUS_ACTIONS: {
  label: string;
  status: MechanicDispatchStatus;
  variant: "primary" | "secondary";
}[] = [
  { label: "Start driving", status: "en_route", variant: "primary" },
  { label: "I arrived", status: "arrived", variant: "primary" },
  { label: "Start service", status: "in_service", variant: "secondary" },
  { label: "Complete job", status: "completed", variant: "secondary" },
];

export default function MechanicJobDetailPage() {
  const params = useParams();
  const jobId = Number(typeof params.id === "string" ? params.id : "");
  const [job, setJob] = useState<MechanicJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(jobId)) return;
    setLoading(true);
    setError(null);
    try {
      const mechanic = await mechanicAuthService.getCurrentMechanic();
      const data = await fetchMechanicJob(jobId, mechanic?.workshop_id);
      if (!data) throw new Error("Job not found");
      setJob(data);
    } catch {
      setError("Could not load this job.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  const trackingActive =
    job?.dispatch_status === "en_route" ||
    job?.dispatch_status === "assigned";

  useMechanicLocationBroadcast({
    enabled: trackingActive && job != null,
    serviceRequestId: job?.service_request_id ?? 0,
  });

  useEffect(() => {
    if (!trackingActive) return;
    if (!navigator.geolocation) {
      setGpsError("GPS is not available on this device.");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setGpsError(null);
        setMyLat(p.coords.latitude);
        setMyLng(p.coords.longitude);
      },
      () => setGpsError("Allow location access so the customer can see you coming."),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [trackingActive]);

  const mapCenter = useMemo<[number, number] | null>(() => {
    if (myLat != null && myLng != null) return [myLat, myLng];
    if (job && job.customer_latitude && job.customer_longitude) {
      return [job.customer_latitude, job.customer_longitude];
    }
    return null;
  }, [job, myLat, myLng]);

  const markers = useMemo(() => {
    if (!job) return [];
    const list: Array<{
      id: number;
      lat: number;
      lng: number;
      label: string;
      subtitle?: string;
      type: "customer" | "driver";
    }> = [];
    if (job.customer_latitude && job.customer_longitude) {
      list.push({
        id: 1,
        lat: job.customer_latitude,
        lng: job.customer_longitude,
        label: job.customer_name,
        subtitle: "Customer / vehicle",
        type: "customer",
      });
    }
    if (myLat != null && myLng != null) {
      list.push({
        id: 2,
        lat: myLat,
        lng: myLng,
        label: "You",
        subtitle: "Live GPS",
        type: "driver",
      });
    }
    return list;
  }, [job, myLat, myLng]);

  const route = useMemo(() => {
    if (
      myLat == null ||
      myLng == null ||
      !job?.customer_latitude ||
      !job?.customer_longitude
    ) {
      return undefined;
    }
    return {
      from: [myLat, myLng] as [number, number],
      to: [job.customer_latitude, job.customer_longitude] as [number, number],
    };
  }, [job, myLat, myLng]);

  const mapsUrl =
    job && job.customer_latitude && job.customer_longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${job.customer_latitude},${job.customer_longitude}&travelmode=driving`
      : null;

  const onStatus = async (status: MechanicDispatchStatus) => {
    if (!job) return;
    setSaving(true);
    try {
      const updated = await updateMechanicJobStatus(job.id, status);
      if (updated) setJob(updated);
      else await load();
    } catch {
      setError("Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading job…</p>;
  }

  if (error || !job) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{error ?? "Job not found."}</p>
        <Link href="/mechanic/jobs" className="text-sm font-medium text-orange-600 hover:underline">
          ← Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href="/mechanic/jobs"
        className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All jobs
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">{job.customer_name}</h1>
        <p className="mt-1 text-sm text-slate-600">{job.service_name}</p>
        <div className="mt-3 space-y-2 text-xs text-slate-600">
          <p className="flex items-center gap-2">
            <Car className="h-3.5 w-3.5 text-slate-400" />
            {job.vehicle_details}
          </p>
          <p className="flex items-start gap-2">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
            {job.description}
          </p>
          {job.customer_phone ? (
            <a
              href={`tel:${job.customer_phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 font-medium text-orange-600 hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {job.customer_phone}
            </a>
          ) : null}
        </div>
      </div>

      <div className="h-64 overflow-hidden rounded-2xl border border-slate-100">
        {mapCenter ? (
          <RequestsMap center={mapCenter} zoom={13} markers={markers} route={route} />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-500">
            Waiting for GPS…
          </div>
        )}
      </div>

      {gpsError ? <p className="text-xs text-amber-700">{gpsError}</p> : null}

      {mapsUrl ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Navigation className="h-4 w-4" />
          Open directions
        </a>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {STATUS_ACTIONS.map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={saving}
            onClick={() => void onStatus(action.status)}
            className={
              action.variant === "primary"
                ? "rounded-lg bg-orange-500 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                : "rounded-lg border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            }
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

