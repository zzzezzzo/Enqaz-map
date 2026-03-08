"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import { getRequestById } from "@/lib/requests";

export default function RequestDetailsPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const request = getRequestById(id);

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <CustomerNav />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Request not found.</p>
            <Link
              href="/customer/requests"
              className="text-orange-500 hover:underline font-medium"
            >
              Back to Request History
            </Link>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <Link
          href="/customer/requests"
          className="text-orange-500 hover:underline font-medium mb-6 inline-block"
        >
          ← Back to Request History
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h1 className="text-xl font-bold text-gray-900">{request.serviceName}</h1>
          <p><span className="text-gray-500">Request ID:</span> {request.requestId}</p>
          <p><span className="text-gray-500">Date & time:</span> {request.dateTime}</p>
          <p><span className="text-gray-500">Location:</span> {request.location}</p>
          <p><span className="text-gray-500">Service provider:</span> {request.serviceProvider}</p>
          <p><span className="text-gray-500">Cost:</span> {request.cost} EGP</p>
        </div>
      </main>
      <CustomerFooter />
    </div>
  );
}
