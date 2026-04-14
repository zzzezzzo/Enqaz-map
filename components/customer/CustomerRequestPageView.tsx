"use client";

import { Wrench } from "lucide-react";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import ServiceRequestView from "@/components/customer/ServiceRequestView";
import type { CustomerRequestPageViewModel } from "@/app/customer/request/useCustomerRequestPage";

type Props = CustomerRequestPageViewModel;

export default function CustomerRequestPageView(props: Props) {
  const {
    providerId,
    showProviderMode,
    allServicesLoading,
    providerServicesLoading,
    providerServicesError,
    vehicles,
    vehiclesLoading,
    vehiclesError,
    selectedServiceId,
    selectedVehicleId,
    setSelectedVehicleId,
    selectService,
    clearService,
    quickAccessServices,
    serviceAccent,
    location,
    problem,
    setProblem,
    displayAddress,
    displayCoords,
    submitError,
    handleSubmit,
    serviceName,
  } = props;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100/80">
      <CustomerNav />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <header className="mb-10 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
            Roadside assistance
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Request assistance
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto lg:mx-0 text-base leading-relaxed">
            Provider comes from your link. Choose a service, your saved
            vehicle, location, and a short description—we send{" "}
            <span className="font-medium text-slate-800">
              provider_id, vehicle_id, service_id, latitude, longitude,
              description
            </span>{" "}
            to the server.
          </p>
          {!providerId && (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 max-w-2xl mx-auto lg:mx-0">
              This page needs a provider in the URL, for example{" "}
              <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">
                ?provider_id=5
              </code>
              . Open it from your provider list or home screen.
            </p>
          )}
        </header>

        <div className="grid xl:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="xl:col-span-5 space-y-8">
            <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm shadow-slate-200/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-5 h-5 text-orange-600" aria-hidden />
                <h2 className="text-lg font-bold text-slate-900">Services</h2>
              </div>
              <p className="text-sm text-slate-600 mb-5">
                {showProviderMode
                  ? "Services offered by this provider."
                  : "Pick a service. With a provider in the URL you will only see their services."}
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {showProviderMode && providerServicesLoading ? (
                  <p className="text-sm text-slate-500 col-span-full">
                    Loading services…
                  </p>
                ) : showProviderMode && providerServicesError ? (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 col-span-full">
                    {providerServicesError}
                  </p>
                ) : quickAccessServices.length > 0 ? (
                  quickAccessServices.map((service, index) => {
                    const selected = selectedServiceId === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => selectService(service)}
                        className={`text-left rounded-2xl p-5 text-white transition-all shadow-lg bg-gradient-to-br ${
                          serviceAccent[index % serviceAccent.length]
                        } ${
                          selected
                            ? "ring-2 ring-white ring-offset-2 ring-offset-slate-100 scale-[1.02]"
                            : "hover:brightness-105 hover:shadow-xl"
                        }`}
                      >
                        <Wrench
                          className="w-9 h-9 mb-3 opacity-90"
                          aria-hidden
                        />
                        <h3 className="text-base font-bold mb-1 leading-snug">
                          {service.name}
                        </h3>
                        <p className="text-xs opacity-90 line-clamp-3 leading-relaxed">
                          {service.description ||
                            "Tap to continue with this service."}
                        </p>
                        {selected && (
                          <p className="mt-3 text-xs font-semibold uppercase tracking-wide opacity-95">
                            Selected
                          </p>
                        )}
                      </button>
                    );
                  })
                ) : showProviderMode ? (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 col-span-full">
                    This provider has no services listed.
                  </p>
                ) : allServicesLoading ? (
                  <p className="text-sm text-slate-500 col-span-full">
                    Loading services…
                  </p>
                ) : (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 col-span-full">
                    No services available.
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="xl:col-span-7 xl:sticky xl:top-24 space-y-4">
            {!selectedServiceId ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center shadow-inner">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
                  <Wrench className="w-7 h-7" />
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  Select a service
                </p>
                <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Choose a service on the left, then confirm your vehicle,
                  location, and description here.
                </p>
              </div>
            ) : (
              <ServiceRequestView
                variant="embedded"
                serviceName={serviceName}
                location={location}
                displayAddress={displayAddress}
                displayCoords={displayCoords}
                vehicles={vehicles}
                vehiclesLoading={vehiclesLoading}
                vehiclesError={vehiclesError}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicleId={setSelectedVehicleId}
                problem={problem}
                setProblem={setProblem}
                submitError={submitError}
                onSubmit={handleSubmit}
                onChangeService={clearService}
              />
            )}
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
