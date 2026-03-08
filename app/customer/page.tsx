"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Info, Phone, Search, SlidersHorizontal } from "lucide-react";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";

import { MOCK_WORKSHOPS } from "@/lib/workshops";

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

interface LocationState {
  lat: number | null;
  lng: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export default function CustomerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    address: null,
    loading: true,
    error: null,
  });

  const filteredWorkshops = MOCK_WORKSHOPS.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser.",
      }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation((prev) => ({
          ...prev,
          lat,
          lng,
          address: null,
          loading: false,
          error: null,
        }));
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "ENQAZ-Roadside-Assistance/1.0",
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            const displayName = data?.address?.road
              ? `${data.address.road}${data.address.city ? ", " + data.address.city : ""}${data.address.country ? ", " + data.address.country : ""}`
              : data?.display_name ?? null;
            setLocation((prev) => ({ ...prev, address: displayName }));
          })
          .catch(() => {});
      },
      () => {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: "Unable to retrieve your location. Please enable location access.",
        }));
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const displayAddress =
    location.address ??
    (location.lat != null && location.lng != null
      ? "Your current position"
      : "—");
  const displayCoords =
    location.lat != null && location.lng != null
      ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
      : "—";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
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

        {/* Map - leave as it is */}
        <div className="bg-gray-200/80 rounded-2xl overflow-hidden mb-12">
          <div className="relative w-full h-[320px] md:h-[380px]">
            {location.loading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                Getting your location...
              </div>
            ) : location.error ? (
              <div className="w-full h-full flex items-center justify-center p-6">
                <p className="text-red-600 text-center max-w-sm">
                  {location.error}
                </p>
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
          {!location.loading && !location.error && location.lat != null && location.lng != null && (
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

        {/* Service selection - on the same page below the map */}
        
      </main>

      <CustomerFooter />
    </div>
  );
}
