"use client";

import Link from "next/link";
import {
  Calendar,
  MapPin,
  User,
  MapPinned,
  Star,
  FileText,
  Phone,
  Car,
  MessageSquare,
} from "lucide-react";
import type { ServiceRequest } from "@/lib/requests";

const statusStyles: Record<ServiceRequest["status"], string> = {
  pending: "bg-orange-500 text-white",
  completed: "bg-green-500 text-white",
  cancelled: "bg-red-500 text-white",
};

function statusBadgeText(request: ServiceRequest): string {
  const raw = request.statusLabel?.trim();
  if (raw) {
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return request.status.charAt(0).toUpperCase() + request.status.slice(1);
}

export default function RequestCard({
  request,
  isHighlighted,
}: {
  request: ServiceRequest;
  isHighlighted?: boolean;
}) {
  const borderClass = isHighlighted
    ? "border-orange-500 border-2"
    : "border border-gray-200";

  return (
    <div
      className={`bg-white rounded-xl shadow-sm ${borderClass} p-5 space-y-4`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-bold text-gray-900 text-lg">
          {request.serviceName}
        </h3>
        <span
          className={`px-3 py-1 rounded-md text-sm font-medium ${statusStyles[request.status]}`}
        >
          {statusBadgeText(request)}
        </span>
      </div>

      <div className="grid gap-2 text-sm text-gray-600">
        <p>Request ID: {request.requestId}</p>
        <p className="flex items-center gap-2">
          <Calendar className="w-4 h-4 shrink-0 text-gray-400" />
          {request.dateTime}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
          <span className="break-all">{request.location}</span>
        </p>
        <p className="flex items-center gap-2">
          <User className="w-4 h-4 shrink-0 text-gray-400" />
          <span>
            <span className="font-medium text-gray-700">Provider: </span>
            {request.serviceProvider}
          </span>
        </p>
        {request.providerPhone ? (
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0 text-gray-400" />
            <a
              href={`tel:${request.providerPhone.replace(/\s/g, "")}`}
              className="text-orange-600 hover:underline"
            >
              {request.providerPhone}
            </a>
          </p>
        ) : null}
        {request.vehicleSummary ? (
          <p className="flex items-center gap-2">
            <Car className="w-4 h-4 shrink-0 text-gray-400" />
            <span>
              <span className="font-medium text-gray-700">Vehicle: </span>
              {request.vehicleSummary}
            </span>
          </p>
        ) : null}
        {request.description ? (
          <p className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
            <span>
              <span className="font-medium text-gray-700">Description: </span>
              {request.description}
            </span>
          </p>
        ) : null}
        {request.customerName &&
        request.customerName !== "Your request" ? (
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 shrink-0 text-gray-400" />
            <span>
              <span className="font-medium text-gray-700">Customer: </span>
              {request.customerName}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        {request.cost !== undefined ? (
          <span className="font-semibold text-gray-900">
            {request.cost} EGP
          </span>
        ) : (
          <span className="text-sm text-gray-500">Cost not quoted yet</span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {request.status === "pending" && (
            <Link
              href={`/customer/requests/${request.id}/tracking`}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <MapPinned className="w-4 h-4" />
              View Tracking
            </Link>
          )}
          {request.status === "completed" && request.rating == null && (
            <>
              <Link
                href={`/customer/requests/${request.id}/rate`}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Star className="w-4 h-4" />
                Rate Service
              </Link>
              <Link
                href={`/customer/requests/${request.id}`}
                className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Details
              </Link>
            </>
          )}
          {(request.status === "completed" && request.rating != null) ||
          request.status === "cancelled" ? (
            <Link
              href={`/customer/requests/${request.id}`}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Details
            </Link>
          ) : null}
          {request.status === "completed" && request.rating != null && (
            <span className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i <= request.rating! ? "fill-current" : ""}`}
                />
              ))}
              <span className="text-gray-600 text-sm ml-1">
                {request.rating}/5
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
