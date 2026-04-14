"use client";

import { Suspense } from "react";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import CustomerRequestPageView from "@/components/customer/CustomerRequestPageView";
import { useCustomerRequestPage } from "./useCustomerRequestPage";

function RequestPageContent() {
  const state = useCustomerRequestPage();

  if (!state.mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <CustomerNav />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
          <p className="text-center text-slate-500">Loading…</p>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  return <CustomerRequestPageView {...state} />;
}

export default function RequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-slate-50">
          <CustomerNav />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
            <p className="text-center text-slate-500">Loading…</p>
          </main>
          <CustomerFooter />
        </div>
      }
    >
      <RequestPageContent />
    </Suspense>
  );
}
