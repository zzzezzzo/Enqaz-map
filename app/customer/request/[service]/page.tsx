"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Plus, ChevronUp, ChevronDown } from "lucide-react";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import { getServiceBySlug } from "@/lib/services";

const CustomerLocationMap = dynamic(
  () => import("@/components/customer/CustomerLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[240px] rounded-xl bg-gray-200 animate-pulse flex items-center justify-center text-gray-500 text-sm">
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

export default function ServiceRequestPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.service === "string" ? params.service : "";
  const service = getServiceBySlug(slug);

  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    address: null,
    loading: true,
    error: null,
  });
  const [vehicle, setVehicle] = useState("");
  const [problem, setProblem] = useState("");

  useEffect(() => {
    if (!service) return;
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
  }, [service]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <CustomerNav />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Service not found.</p>
            <button
              type="button"
              onClick={() => router.push("/customer")}
              className="text-orange-500 hover:underline font-medium"
            >
              Back to services
            </button>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  const displayAddress =
    location.address ??
    (location.lat != null && location.lng != null
      ? "Your current position"
      : "—");
  const displayCoords =
    location.lat != null && location.lng != null
      ? `${location.lat.toFixed(5)}° N ${location.lng.toFixed(5)}° E`
      : "—";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: submit to API
    router.push("/customer");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Request {service.name}
        </h1>
        <p className="text-gray-600 mb-8">
          Fill in the details to submit your assistance request
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Your Current Location */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="relative h-[240px]">
                  {location.loading ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Getting your location...
                    </div>
                  ) : location.error ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <p className="text-red-600 text-sm text-center">
                        {location.error}
                      </p>
                    </div>
                  ) : location.lat != null && location.lng != null ? (
                    <>
                      <CustomerLocationMap
                        lat={location.lat}
                        lng={location.lng}
                        zoom={15}
                        className="rounded-t-2xl"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <button
                          type="button"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow border border-gray-200 hover:bg-gray-50 text-gray-700"
                          aria-label="Zoom in"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow border border-gray-200 hover:bg-gray-50 text-gray-700"
                          aria-label="Zoom out"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm mb-1">
                        Your Current Location
                      </h2>
                      <p className="text-gray-700 text-sm">{displayAddress}</p>
                      <p className="text-gray-500 text-xs mt-1">{displayCoords}</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-orange-500 hover:bg-orange-50 rounded-lg font-medium transition-colors border border-orange-200"
                  >
                    <Plus className="w-4 h-4" />
                    Adjust your location if needed
                  </button>
                </div>
              </div>
            </div>

            {/* Service details form */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="vehicle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Your Vehicle
                </label>
                <select
                  id="vehicle"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  <option value="">Choose vehicle...</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="problem"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Describe the Problem
                </label>
                <textarea
                  id="problem"
                  rows={5}
                  placeholder="Describe your situation..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                />
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Safety First
                </p>
                <p className="text-sm text-amber-800">
                  Make sure you&apos;re in a safe location before submitting this
                  request. Turn on your hazard lights if you&apos;re not on a
                  road.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full md:w-auto px-10 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              Submit Assistance Request
            </button>
          </div>
        </form>
      </main>

      <CustomerFooter />
    </div>
  );
}
