"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Wrench } from "lucide-react";
import MechanicRouteGuard from "@/components/mechanic/MechanicRouteGuard";
import { mechanicAuthService } from "@/services/mechanicAuth";

export default function MechanicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname?.startsWith("/mechanic/login");

  const handleLogout = async () => {
    await mechanicAuthService.logout();
    router.push("/mechanic/login");
    router.refresh();
  };

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/mechanic/jobs" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="ENQAZ" width={36} height={36} />
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Wrench className="h-4 w-4 text-orange-500" />
              Mechanic
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>
      <MechanicRouteGuard>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </MechanicRouteGuard>
    </div>
  );
}
