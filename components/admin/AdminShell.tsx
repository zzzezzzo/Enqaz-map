"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  Activity,
  Layers,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Search,
  SlidersHorizontal,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { authService } from "@/services/auth";

const navPrimary: Array<{ href: string; icon: typeof LayoutDashboard; label: string }> = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  // { href: "/admin/drivers", icon: Users, label: "Drivers Management" },
  { href: "/admin/workshops", icon: Building2, label: "Workshops Management" },
  // { href: "/admin/winches", icon: Truck, label: "Winches Management" },
  // { href: "/admin/requests", icon: Activity, label: "Requests Monitoring" },
  { href: "/admin/services", icon: Layers, label: "Services & Categories" },
  // { href: "/admin/reports", icon: BarChart3, label: "Reports & Analytics" },
  { href: "/admin/accounts", icon: UserCog, label: "Admin Accounts" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      setUserOpen(false);
      setSidebarOpen(false);
      router.push("/auth/login");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:shadow-none`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5">
          <Image src="/logo.svg" alt="" width={40} height={40} className="shrink-0" />
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">ENQAZ</p>
            <p className="text-xs text-slate-500">Roadside Assistance</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navPrimary.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#0f2744] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-1 border-t border-slate-100 bg-white p-3">
          <Link
            href="/admin/settings"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${
              pathname.startsWith("/admin/settings") ? "bg-slate-100 text-slate-900" : ""
            }`}
          >
            <Settings className="h-5 w-5 shrink-0" aria-hidden />
            System Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                onClick={() => setSidebarOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="relative hidden min-w-0 flex-1 max-w-xl sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search requests, workshops, drivers…"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0f2744] focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="hidden rounded-lg bg-[#0f2744] p-2.5 text-white shadow-sm hover:bg-[#0c2036] sm:block"
                aria-label="Filters"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  4
                </span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full bg-amber-500 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    AD
                  </span>
                  Admin
                  <ChevronDown className="h-4 w-4 opacity-80" aria-hidden />
                </button>
                {userOpen ? (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Profile
                    </button>
                    <hr className="my-1 border-slate-100" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>

        <footer className="border-t border-slate-800 bg-[#0f2744] px-4 py-6 text-center text-sm text-slate-300 sm:px-6">
          <p className="font-semibold text-white">ENQAZ</p>
          <p className="mt-1 text-xs text-slate-400">Roadside Assistance</p>
          <p className="mt-3 text-xs text-slate-400">
            © {new Date().getFullYear()} Roadside Assistance. We connect drivers with reliable mechanics 24/7.
          </p>
        </footer>
      </div>
    </div>
  );
}
