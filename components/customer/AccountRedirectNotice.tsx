"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const NOTICES: Record<string, { title: string; body: string }> = {
  "not-provider": {
    title: "Provider area is for workshop accounts",
    body:
      "This app section is for registered providers. Your account is a customer account. If you are a workshop owner, use provider registration (role provider) and wait for an administrator to approve your workshop before you can use the provider app.",
  },
};

type Props = { paramName?: string };

/**
 * Renders a dismissible alert when a route has set a notice query (e.g. after redirecting away from a wrong-area route).
 */
export function AccountRedirectNotice({ paramName = "accountNotice" }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const key = searchParams.get(paramName) ?? "";
  const notice = key && NOTICES[key] ? NOTICES[key] : null;

  const clearQuery = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(paramName);
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [paramName, pathname, router, searchParams]);

  useEffect(() => {
    if (notice) setDismissed(false);
  }, [notice, key]);

  if (!notice || dismissed) return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{notice.title}</p>
          <p className="mt-1 text-sm text-amber-900/90">{notice.body}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            clearQuery();
          }}
          className="shrink-0 text-sm text-amber-800 underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
