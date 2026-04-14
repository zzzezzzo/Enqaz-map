"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Old deep links redirect to the unified request page. */
export default function ServiceRequestRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.service === "string" ? params.service : "";

  useEffect(() => {
    if (slug) {
      router.replace(
        `/customer/request?service=${encodeURIComponent(slug)}`
      );
    } else {
      router.replace("/customer/request");
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
      Redirecting…
    </div>
  );
}
