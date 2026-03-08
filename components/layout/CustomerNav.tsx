"use client";

import { Menu, X, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomerNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === "/customer";
  const isRequests = pathname?.startsWith("/customer/requests");

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/customer" className="flex gap-3 items-center">
            <Image src="/logo.svg" alt="ENQAZ" width={50} height={50} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ENQAZ</h1>
              <p className="text-xs text-gray-600">Smart Roadside Assistance</p>
            </div>
          </Link>

          {/* Desktop Navigation - Customer links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/customer"
              className={
                isDashboard
                  ? "text-gray-900 border-b-2 border-orange-500 pb-1 font-semibold text-orange-600"
                  : "text-gray-500 hover:text-orange-500 transition-colors font-medium"
              }
            >
              Dashboard
            </Link>
            <Link
              href="/customer/requests"
              className={
                isRequests
                  ? "text-gray-900 border-b-2 border-orange-500 pb-1 font-semibold text-orange-600"
                  : "text-gray-500 hover:text-orange-500 transition-colors font-medium"
              }
            >
              My Requests
            </Link>
          </div>

          {/* Profile dropdown */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
              <ChevronDown className="w-4 h-4" />
            </button>
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden="true"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <Link
                    href="/customer/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/customer/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-500 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link
                href="/customer"
                className="text-gray-700 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/customer/requests"
                className="text-gray-700 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My Requests
              </Link>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
