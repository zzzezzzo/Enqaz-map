"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { mechanicAuthService } from "@/services/mechanicAuth";

export default function MechanicRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/mechanic/login")) {
      setReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      if (!mechanicAuthService.isAuthenticated()) {
        router.replace("/mechanic/login");
        return;
      }
      await mechanicAuthService.getCurrentMechanic();
      if (cancelled) return;
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}


