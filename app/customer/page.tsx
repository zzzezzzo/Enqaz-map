"use client";

import { Suspense } from "react";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import { AccountRedirectNotice } from "@/components/customer/AccountRedirectNotice";
import CustomerHomeView from "@/components/customer/CustomerHomeView";
import { useCustomerHome } from "./useCustomerHome";
import AddVehicleModalContainer from "@/components/customer/AddVehicleModalContainer";
import { useCustomerVehiclePrompt } from "./useCustomerVehiclePrompt";

export default function CustomerPage() {
  const { showVehicleModal, setShowVehicleModal } =
    useCustomerVehiclePrompt();

  const {
    location,
    displayAddress,
    displayCoords,
    nearestProviders,
    providersLoading,
    providersError,
    onSelectProvider,
  } = useCustomerHome();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <Suspense fallback={null}>
          <AccountRedirectNotice />
        </Suspense>
        <CustomerHomeView
          location={location}
          displayAddress={displayAddress}
          displayCoords={displayCoords}
          nearestProviders={nearestProviders}
          providersLoading={providersLoading}
          providersError={providersError}
          onSelectProvider={onSelectProvider}
        />
      </main>

      <CustomerFooter />

      <AddVehicleModalContainer
        open={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
      />
    </div>
  );
}
