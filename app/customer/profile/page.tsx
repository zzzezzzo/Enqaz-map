"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  LogOut,
  Globe,
  Bell,
  Lock,
  Settings,
} from "lucide-react";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";

const MOCK_PROFILE = {
  fullName: "Mohamed Ahmed",
  email: "AhmedMohamed@gmail.com",
  phone: "+012 3456 8910",
  avatarUrl: null as string | null, // set to image path when you have one
};

export default function CustomerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: MOCK_PROFILE.fullName,
    email: MOCK_PROFILE.email,
    phone: MOCK_PROFILE.phone,
  });
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    setIsEditing(false);
    // TODO: persist to API
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        {/* User summary card */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {MOCK_PROFILE.avatarUrl ? (
                <Image
                  src={MOCK_PROFILE.avatarUrl}
                  alt={form.fullName}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{form.fullName}</h2>
              <p className="text-gray-600">{form.phone}</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Link>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Personal Information
            </h3>
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="text-orange-500 hover:text-orange-600 font-semibold"
              >
                Save
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-orange-500 hover:text-orange-600 font-semibold"
              >
                Edit
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-1 gap-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                readOnly={!isEditing}
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${
                  isEditing
                    ? "border-orange-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    : "border-gray-200 bg-gray-50 text-gray-700 cursor-default"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                readOnly={!isEditing}
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${
                  isEditing
                    ? "border-orange-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    : "border-gray-200 bg-gray-50 text-gray-700 cursor-default"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                readOnly={!isEditing}
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${
                  isEditing
                    ? "border-orange-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    : "border-gray-200 bg-gray-50 text-gray-700 cursor-default"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Preferences & Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Preferences & Security
          </h3>

          <div className="space-y-6">
            {/* Language */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Language</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setLanguage("ar")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    language === "ar"
                      ? "bg-green-500 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  (AR)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    language === "en"
                      ? "bg-green-500 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  (EN)
                </button>
              </div>
            </div>

            {/* Notification */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Notification</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                onClick={() => setNotifications((prev) => !prev)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    notifications ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Account Security */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Account Security</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Update your login credentials
                  </p>
                </div>
              </div>
              <Link
                href="/customer/profile/change-password"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-orange-200 transition-colors font-medium"
              >
                <Settings className="w-4 h-4 text-orange-500" />
                Change Password
              </Link>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
