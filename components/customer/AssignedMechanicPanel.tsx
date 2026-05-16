"use client";

import Link from "next/link";
import { MapPinned, Phone, User, Wrench } from "lucide-react";
import type { ServiceRequest } from "@/lib/requests";

function formatDispatchStatus(status: string | undefined): string | null {
  if (!status?.trim()) return null;
  const s = status.trim().toLowerCase();
  if (s === "unassigned") return null;
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type Props = {
  request: ServiceRequest;
  /** Compact row for request cards; full panel on tracking/details. */
  variant?: "card" | "panel";
};

export default function AssignedMechanicPanel({
  request,
  variant = "panel",
}: Props) {
  const hasMechanic =
    request.assignedMechanicId != null ||
    Boolean(request.assignedMechanicName?.trim());
  const dispatchLabel = formatDispatchStatus(request.dispatchStatus);
  const phone = request.assignedMechanicPhone?.replace(/\s/g, "");
  const showTrack =
    request.status === "pending" ||
    request.status === "accepted" ||
    request.status === "in_progress";

  if (!hasMechanic) {
    if (variant === "card") {
      return (
        <p className="rounded-lg border border-dashed border-orange-200 bg-orange-50/50 px-3 py-2 text-xs text-orange-900">
          <span className="font-medium">Mobile mechanic:</span> Your workshop can assign
          someone to come to you. You will be able to call them here once assigned.
        </p>
      );
    }
    return (
      <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/60 px-4 py-3 text-sm text-orange-900">
        <div className="flex items-start gap-3">
          <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div>
            <p className="font-medium">Mobile mechanic</p>
            <p className="mt-1 text-orange-800/90">
              Your workshop can send a mechanic to you. When one is assigned, their
              name and phone will appear here so you can call them directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const name = request.assignedMechanicName ?? "Assigned mechanic";

  if (variant === "card") {
    return (
      <div className="rounded-lg border border-orange-100 bg-orange-50/80 px-3 py-2.5 text-sm">
        <p className="flex items-center gap-2 font-medium text-orange-900">
          <User className="h-4 w-4 shrink-0" />
          Mechanic: {name}
          {dispatchLabel ? (
            <span className="font-normal text-orange-700">· {dispatchLabel}</span>
          ) : null}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
            >
              <Phone className="h-3.5 w-3.5" />
              Call mechanic
            </a>
          ) : null}
          {showTrack ? (
            <Link
              href={`/customer/requests/${request.id}/tracking`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50"
            >
              <MapPinned className="h-3.5 w-3.5" />
              Live tracking
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/80 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
            Your mechanic
          </p>
          <p className="text-lg font-semibold text-gray-900">{name}</p>
          {dispatchLabel ? (
            <p className="text-sm text-orange-800">Status: {dispatchLabel}</p>
          ) : (
            <p className="text-sm text-orange-800">Assigned to your request</p>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Need help on site? Call your mechanic directly or open live tracking to see
        when they are on the way.
      </p>
      <div className="flex flex-wrap gap-2">
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <Phone className="h-4 w-4" />
            Call {name.split(" ")[0] ?? "mechanic"}
          </a>
        ) : (
          <p className="text-xs text-amber-800">
            Phone number not available yet — contact the workshop if you need to
            reach your mechanic.
          </p>
        )}
        {showTrack ? (
          <Link
            href={`/customer/requests/${request.id}/tracking`}
            className="inline-flex items-center gap-2 rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
          >
            <MapPinned className="h-4 w-4" />
            Live tracking
          </Link>
        ) : null}
      </div>
    </div>
  );
}
