 "use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  CheckCircle,
  DollarSign,
  Settings,
  LogOut,
  User as UserIcon,
  Search,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

interface ProvidersLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { href: "/providers/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/providers/requests", icon: Inbox, label: "Incoming Requests" },
  { href: "/providers/active-jobs", icon: Wrench, label: "Active Jobs" },
  { href: "/providers/completed-jobs", icon: CheckCircle, label: "Completed Jobs" },
  { href: "#", icon: DollarSign, label: "Services & Pricing" },
  { href: "#", icon: UserIcon, label: "Technicians" },
  { href: "#", icon: DollarSign, label: "Earnings" },
  { href: "#", icon: Settings, label: "Profile & Settings" },
];

export default function ProvidersLayout({ children }: ProvidersLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href !== "#" && pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center h-16">
        <div className="flex gap-3 justify-center  mt-8">
            <div>
              <Image src="/logo.svg" alt="ENQAZ" width={70} height={70} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ENQAZ</h1>
              <p className="text-sm text-gray-600">Smart Roadside Assistance</p>
            </div>
          </div>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                    : "text-gray-700"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button className="w-full flex items-center px-6 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors">
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setSidebarOpen((open) => !open)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <div className="relative max-w-md flex-1 ml-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="relative ml-4">
              <button
                onClick={() => setUserDropdownOpen((open) => !open)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  AN
                </div>
                <span className="ml-2 font-medium text-gray-700">
                  Al-Noor Workshop
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-500 transition-transform duration-200" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Profile
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Settings
                  </button>
                  <hr className="my-1" />
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
          <p>2024 ENQAZ Smart Roadside Assistance. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

