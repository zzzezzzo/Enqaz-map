"use client"
import dynamic from "next/dynamic";
import { LayoutDashboard , BatteryCharging, MapPin ,Clock2 , CircleDot, Fuel, Wrench } from "lucide-react";
import { icon } from "leaflet";

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
  const statsCards = [
    { title: 'Total Requests Today', value: '12,458', change: '+12%', color: 'bg-blue-500' },
    { title: 'Active Jobs', value: '8,039', change: '+8%', color: 'bg-green-500' },
    { title: 'Available Technicians', value: '11,597', change: '+5%', color: 'bg-orange-500' },
    { title: 'Available Winches', value: '300', change: '+2%', color: 'bg-purple-500' },
  ];

  const incomingRequests = [
    { id: 1, customer: 'Ahmed Mohammed',icon: <BatteryCharging className="h-6 w-6 text-orange-500 transition-transform duration-300" />, service: 'Battery Service', distance: '2.5 km', time: '2 min ago', status: 'pending' },
    { id: 2, customer: 'Sarah Al-Rashid', service: 'Tire Change', distance: '1.8 km', time: '5 min ago', status: 'pending' },
    { id: 3, customer: 'Khalid Hassan', service: 'Fuel Delivery', distance: '4.2 km', time: '8 min ago', status: 'pending' },
    { id: 4, customer: 'Fatima Ali', service: 'Car Towing', distance: '3.1 km', time: '12 min ago', status: 'pending' },
    { id: 5, customer: 'Omar Khalid', service: 'Lockout Service', distance: '0.9 km', time: '15 min ago', status: 'pending' },
  ];

  return (
    <>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Dashboard Overview
      </h2>
      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 ">
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
                Showing {incomingRequests.length} requests
              </span>
            </div>
          </div>
          <div className="space-y-4 p-4">
            {incomingRequests.slice(0, 5).map((request) => (
              <div 
              className="rounded-lg border border-gray-200 bg-white px-4 py-3"
              key={request.id}
              >
              <div
                
                className="flex items-center justify-between "
              >
                <div>
                  <p className="text-sm font-semibold text-[#1E3A5F]">
                    {request.customer}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    {request.service == "Battery Service" ? <BatteryCharging className="h-4 w-4 text-orange-500" /> : request.service == "Tire Service" ? <CircleDot className="h-4 w-4 text-orange-500" /> : request.service == "Fuel Service" ? <Fuel className="h-4 w-4 text-orange-500" /> : <Wrench className="h-4 w-4 text-orange-500" />} {request.service} • <MapPin className="h-4 w-4 text-gray-500" /> {request.distance} • <Clock2 className="h-4 w-4 text-gray-500" /> {request.time}
                  </p>
                </div>
                {/* <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#E18100]">
                  Pending
                </span> */}
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
              center={[24.7136, 46.6753]}
              zoom={11}
              markers={[
                {
                  id: 1,
                  lat: 24.721,
                  lng: 46.68,
                  label: "Workshop A",
                  subtitle: "Main branch",
                  type: "workshop",
                },
                {
                  id: 2,
                  lat: 24.708,
                  lng: 46.69,
                  label: "Request - Battery",
                  subtitle: "Ahmed Mohammed",
                  type: "driver",
                },
                {
                  id: 3,
                  lat: 24.703,
                  lng: 46.665,
                  label: "Request - Tire",
                  subtitle: "Sarah Al‑Rashid",
                  type: "driver",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
