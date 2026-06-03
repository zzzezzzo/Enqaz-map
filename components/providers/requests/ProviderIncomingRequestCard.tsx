"use client";

import {
  CalendarClock,
  Car,
  Clock2,
  MapPin,
  MessageSquare,
  Phone,
  Zap,
} from "lucide-react";
import type { ProviderIncomingRequest } from "@/lib/providerIncomingRequests";

type Props = {
  request: ProviderIncomingRequest;
  updating: boolean;
  onAccept: () => void;
  onReject: () => void;
  /** Tighter layout for dashboard summary panel. */
  variant?: "full" | "compact";
};

export default function ProviderIncomingRequestCard({
  request,
  updating,
  onAccept,
  onReject,
  variant = "full",
}: Props) {
  const isScheduled = request.timing === "scheduled";
  const compact = variant === "compact";

  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {request.requestLabel}
          </p>
          <h2
            className={`font-bold text-slate-900 ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {request.customer_name}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {request.service_name}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              isScheduled
                ? "bg-indigo-50 text-indigo-800"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            {isScheduled ? (
              <>
                <CalendarClock className="h-3.5 w-3.5" />
                Scheduled visit
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                Immediate
              </>
            )}
          </span>
        </div>
      </div>

      {isScheduled && request.appointmentLabel ? (
        <p
          className={`flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 font-medium text-indigo-950 ${
            compact
              ? "mt-3 px-2.5 py-2 text-xs"
              : "mt-4 px-3 py-2.5 text-sm"
          }`}
        >
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
          {request.appointmentLabel}
        </p>
      ) : null}

      <div
        className={`flex flex-wrap gap-x-4 gap-y-2 text-slate-600 ${
          compact ? "mt-3 text-xs" : "mt-4 text-sm"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          {request.distance}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock2 className="h-4 w-4 shrink-0 text-slate-400" />
          {request.relativeTimeLabel}
        </span>
        {request.car ? (
          <span className="inline-flex items-center gap-1.5">
            <Car className="h-4 w-4 shrink-0 text-slate-400" />
            {request.car}
          </span>
        ) : null}
        {request.phone ? (
          <a
            href={`tel:${request.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 text-orange-600 hover:underline"
          >
            <Phone className="h-4 w-4 shrink-0" />
            {request.phone}
          </a>
        ) : null}
      </div>

      {!compact && request.latitude != null && request.longitude != null ? (
        <p className="mt-2 text-xs font-mono text-slate-400">
          {request.latitude.toFixed(5)}, {request.longitude.toFixed(5)}
        </p>
      ) : null}

      <div
        className={
          compact
            ? "mt-3 text-xs text-slate-600 line-clamp-2"
            : "mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3"
        }
      >
        {compact ? (
          <p className="flex items-start gap-2">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{request.description}</span>
          </p>
        ) : (
          <p className="flex items-start gap-2 text-sm text-slate-700">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <span className="font-semibold text-slate-800">Description: </span>
              {request.description}
            </span>
          </p>
        )}
      </div>

      <div className={`flex flex-wrap items-center gap-3 ${compact ? "mt-3" : "mt-5"}`}>
        <button
          type="button"
          onClick={onAccept}
          disabled={updating}
          className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updating ? "Updating…" : "Accept request"}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={updating}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updating ? "Updating…" : "Reject"}
        </button>
      </div>
    </article>
  );
}
