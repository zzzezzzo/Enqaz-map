"use client";

import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import RequestCard from "@/components/customer/RequestCard";
import { useCustomerServiceRequests } from "./useCustomerServiceRequests";

export default function RequestHistoryPage() {
  const { requests, loading, error } = useCustomerServiceRequests();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Request history
        </h1>
        <p className="text-gray-600 text-sm mb-8">
          Service requests from{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            GET /customer/service-requests
          </code>
        </p>

        {loading && (
          <p className="text-gray-500 text-center py-12">Loading…</p>
        )}

        {error && !loading && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </p>
        )}

        {!loading && !error && requests.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            No service requests yet.
          </p>
        )}

        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <RequestCard
                key={request.id}
                request={request}
                isHighlighted={request.status === "pending" && index === 0}
              />
            ))}
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}
