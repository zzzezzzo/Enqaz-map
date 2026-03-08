"use client";

import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import RequestCard from "@/components/customer/RequestCard";
import { MOCK_REQUESTS } from "@/lib/requests";

export default function RequestHistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Request History
        </h1>

        <div className="space-y-4">
          {MOCK_REQUESTS.map((request, index) => (
            <RequestCard
              key={request.id}
              request={request}
              isHighlighted={request.status === "pending" && index === 0}
            />
          ))}
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
