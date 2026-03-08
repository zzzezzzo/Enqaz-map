"use client";

import Link from "next/link";
import {
  Calendar,
  MapPin,
  User,
  Wrench,
  MapPinned,
  Star,
  FileText,
} from "lucide-react";
import type { ServiceRequest } from "@/lib/requests";

const statusStyles: Record<ServiceRequest["status"], string> = {
  pending: "bg-orange-500 text-white",
  completed: "bg-green-500 text-white",
  cancelled: "bg-red-500 text-white",
};

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
        <h3 className="font-bold text-gray-900 text-lg">{request.serviceName}</h3>
        <span
          className={`px-3 py-1 rounded-md text-sm font-medium ${statusStyles[request.status]}`}
        >
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      <div className="grid gap-2 text-sm text-gray-600">
        <p>Request ID: {request.requestId}</p>
        <p className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {request.dateTime}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          {request.location}
        </p>
        <p className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          {request.customerName}
        </p>
        <p className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-gray-400" />
          {request.serviceProvider}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <span className="font-semibold text-gray-900">
          {request.cost} EGP
        </span>
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
