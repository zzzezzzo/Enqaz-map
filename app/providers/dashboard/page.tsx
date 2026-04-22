"use client"
import dynamic from "next/dynamic";
import { LayoutDashboard , BatteryCharging, MapPin ,Clock2 , CircleDot, Fuel, Wrench } from "lucide-react";
import { icon } from "leaflet";
import { useProviderDashboard } from "./ProviderDashboard";

const RequestsMap = dynamic(
  () => import("@/components/map/RequestsMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
        Loading map...
      </div>
    ),
  }
);

export default function ProviderDashboard() {
  const { data, isLoading, error, refetch, realtimeDiagnostics, authUserId } = useProviderDashboard();
  const statsCards = data ? [
    { title: 'Total Requests Today', value: data?.service_status?.total_requests_today.toString() || '0', change: '+12%', color: 'bg-blue-500' },
    { title: 'Active Jobs', value: data?.service_status?.active_jobs.toString() || '0', change: '+8%', color: 'bg-green-500' },
  ] : [] as { title: string; value: string; change: string; color: string }[];
  const incomingRequests = data ? data.income_request : [];
  const workshop = data?.income_request?.workShop_location;
  if(!workshop){
    return <div>loading map</div>
  }


  const reqCount = data?.income_request?.requests?.length ?? 0;
  const rt = realtimeDiagnostics;
  const rtOk = rt.privateChannel === "subscribed" && rt.wsState === "connected";
  const channelProvMatch = rt.channelName?.match(/^provider\.(\d+)$/);
  const channelProviderId =
    channelProvMatch != null ? Number(channelProvMatch[1]) : null;
  const is403PrivateProvider =
    rt.privateChannel === "error" &&
    rt.httpStatus === 403 &&
    channelProviderId != null &&
    !Number.isNaN(channelProviderId);

  let rtErrorBanner: string;
  // use it when you want to see the error banner
  if (rt.privateChannel === "error" && is403PrivateProvider) {
    if (authUserId != null && authUserId !== channelProviderId) {
      rtErrorBanner = `Realtime: HTTP 403 — Laravel denied private-${rt.channelName}. This app uses workshop/provider id ${channelProviderId} in the channel name; /auth/me user id is ${authUserId}. If channels.php uses (int) $user->id === (int) $providerId, that only passes when those numbers match. Fix Laravel: authorize the workshop the user owns, e.g. (int) optional($user->provider)->id === (int) $providerId (adjust to your relation), or broadcast on private-provider.{ $user->id } and keep the same id in PHP events.`;
    } else if (authUserId != null && authUserId === channelProviderId) {
      rtErrorBanner = `Realtime: HTTP 403 on private-${rt.channelName} even though /auth/me id (${authUserId}) equals the channel segment. Then the closure is still returning false (wrong guard user, wrong channel name vs Broadcast::channel, or exception). Confirm Broadcast::routes() uses auth:sanctum (or your API guard) and that routes/channels.php registers exactly provider.{providerId}.`;
    } else {
      rtErrorBanner = `Realtime: HTTP 403 on private-${rt.channelName}. The segment is workshop/provider id ${channelProviderId}. Could not read user id from /auth/me (response shape). If channels.php uses $user->id === $providerId, that requires the signed-in user's id to equal ${channelProviderId}. Prefer authorizing ownership of that provider id in channels.php, or return a predictable id from /auth/me.`;
    }
  } else if (rt.privateChannel === "error") {
    rtErrorBanner = `Realtime: channel auth failed${rt.httpStatus != null ? ` (HTTP ${rt.httpStatus})` : ""}${rt.authSummary ? ` — ${rt.authSummary}` : ""}. For private-${rt.channelName ?? "provider.*"}, ensure routes/channels.php authorizes that segment for this token and events use the same channel name.`;
  } else {
    rtErrorBanner = "";
  }

  const rtBanner =
    rt.privateChannel === "error"
      ? rtErrorBanner
      : rtOk
        ? "Realtime: WebSocket connected and subscribed to your provider channel."
        : `Realtime: WebSocket state "${rt.wsState}", channel "${rt.privateChannel}"${rt.channelName ? ` (${rt.channelName})` : ""}.`;

  return (
    <>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Dashboard Overview
      </h2>
      <div
        className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
          rtOk ? "border-green-200 bg-green-50 text-green-900" : rt.privateChannel === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
        role="status"
      >
        {rtBanner}
      </div>
      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 ">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="transform rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                <div className="flex items-center">
                  <p className="mt-2 text-sm text-green-600">{card.change}</p>
                  <div className="ml-2 h-2 w-2 animate-pulse rounded-full bg-green-100" />
                </div>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color} transform transition-transform duration-300 hover:rotate-12`}
              >
                <LayoutDashboard className="h-6 w-6 text-white transition-transform duration-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Incoming Requests (summary) */}
        <div className="lg:col-span-2 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Incoming Requests
              </h3>
              <span className="text-sm text-gray-500">
                Showing {reqCount} requests
              </span>
            </div>
          </div>
          <div className="space-y-4 p-4">
            {data?.income_request?.requests?.slice(0, 5).map((request) => (
              <div 
              className="rounded-lg border border-gray-200 bg-white px-4 py-3"
              key={request.id}
              >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1E3A5F]">
                    {request.customer_name}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    {request.service_name}  <MapPin className="h-4 w-4 text-gray-500" /> {request.distance}  <Clock2 className="h-4 w-4 text-gray-500" /> {request.minutes_ago}  ago
                  </p>
                  <p className="text-lg text-gray-500 flex items-center gap-2">
                    {request.description} 
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#E18100]">
                  Pending
                </span>
              </div>
                <div className="flex items-center gap-2 mt-3 ">
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-md">Accept</button>
                  <button className="bg-transparent-500 text-gray-500 px-4 py-2 rounded-md border border-gray-300 ">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Requests Map */}
            
        <div className="rounded-lg bg-white shadow col-span-2">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Requests Map
            </h3>
          </div>
          <div className="p-4">
            <RequestsMap
            
              center={
                workshop
                  ? [parseFloat(workshop.latitude), parseFloat(workshop.longitude)]
                  : [0, 0] 
              }
              zoom={11}
              markers={
                data?.income_request?.requests?.map((req, index) => ({
                  id: req.id ?? index,
                  lat: parseFloat(req.latitude || "0"),
                  lng: parseFloat(req.longitude || "0"),

                  label: `${req.customer_name} - ${req.service_name}`,
                  subtitle: req.distance || "0 km",

                  type: "driver",
                })) || []
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
