"use client";

import dynamic from "next/dynamic";
import { Info, MapPin, Phone } from "lucide-react";
import type { LocationState, NearestProvider } from "@/app/customer/useCustomerHome";

const CustomerLocationMap = dynamic(
  () => import("@/components/customer/CustomerLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] rounded-2xl bg-gray-200 animate-pulse flex items-center justify-center text-gray-500">
        Loading map...
      </div>
    ),
  }
);

interface CustomerHomeViewProps {
  location: LocationState;
  displayAddress: string;
  displayCoords: string;
  nearestProviders: NearestProvider[];
  providersLoading: boolean;
  providersError: string | null;
  onSelectProvider: (providerId: number) => void;
}

export default function CustomerHomeView({
  location,
  displayAddress,
  displayCoords,
  nearestProviders,
  providersLoading,
  providersError,
  onSelectProvider,
}: CustomerHomeViewProps) {
  return (
    <>
      <p className="text-center text-xl font-semibold text-gray-800 mb-6">
        No active requests
      </p>
      <div className="flex justify-center mb-10">
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
        >
          <Info className="w-5 h-5" />
          Request Emergency Assistance
          <Phone className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-gray-200/80 rounded-2xl overflow-hidden mb-12">
        <div className="relative w-full h-[320px] md:h-[380px]">
          {location.loading ? (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              Getting your location...
            </div>
          ) : location.error ? (
            <div className="w-full h-full flex items-center justify-center p-6">
              <p className="text-red-600 text-center max-w-sm">{location.error}</p>
            </div>
          ) : location.lat != null && location.lng != null ? (
            <CustomerLocationMap
              lat={location.lat}
              lng={location.lng}
              zoom={16}
              className="rounded-2xl"
            />
          ) : null}
        </div>

        {!location.loading &&
          !location.error &&
          location.lat != null &&
          location.lng != null && (
            <div className="p-4 md:p-6 bg-white border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 mb-1">
                    Your Current Location
                  </h2>
                  <p className="text-gray-700 text-sm md:text-base">
                    {displayAddress}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{displayCoords}</p>
                </div>
              </div>
            </div>
          )}
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Nearest Providers</h2>

        {providersLoading && (
          <p className="text-sm text-gray-500">Loading nearest providers...</p>
        )}

        {!providersLoading && providersError && (
          <p className="text-sm text-red-600">{providersError}</p>
        )}

        {!providersLoading && !providersError && nearestProviders.length === 0 && (
          <p className="text-sm text-gray-500">No nearby providers found out of our network.</p>
        )}

        {!providersLoading && !providersError && nearestProviders.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nearestProviders.map((provider) => (
              <div
                key={provider.id}
                className="rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <p className="font-semibold text-gray-900">
                  {provider.name}
                </p>
                {provider.description && (
                  <p className="text-sm text-orange-600 mt-1">
                    {provider.description}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {provider.distanceKm != null
                    ? `${provider.distanceKm.toFixed(2)} km away`
                    : "Distance unavailable"}
                </p>
                {provider.phone && (
                  <p className="text-sm text-gray-600 mt-1">{provider.phone}</p>
                )}

                {provider.services?.length ? (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-slate-500">
                      Services available
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {provider.services.slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200"
                        >
                          {s.name}
                        </span>
                      ))}
                      {provider.services.length > 4 && (
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                          +{provider.services.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => onSelectProvider(provider.id)}
                  className="mt-3 w-full rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
                >
                  Request this service
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

