"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import QuickAccessCard from "@/components/customer/QuickAccessCard";
import WorkshopCard from "@/components/customer/WorkshopCard";
import { SERVICES } from "@/lib/services";
import { MOCK_WORKSHOPS } from "@/lib/workshops";

export default function RequestPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkshops = MOCK_WORKSHOPS.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">
          Select the Service You Need
        </h1>
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Quick Access</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {SERVICES.map((service) => (
                <QuickAccessCard key={service.slug} {...service} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Search Workshop
            </h2>
            <div className="flex gap-2 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search workshop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
            {filteredWorkshops.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No workshops match your search.
              </p>
            )}
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}