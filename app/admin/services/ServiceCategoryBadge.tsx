import type { ServiceCategoryKey } from "@/lib/adminServicesApi";

const map: Record<ServiceCategoryKey, string> = {
  emergency: "bg-rose-100 text-rose-800 border-rose-200/80",
  basic: "bg-sky-100 text-sky-800 border-sky-200/80",
  workshop: "bg-violet-100 text-violet-800 border-violet-200/80",
  other: "bg-slate-100 text-slate-700 border-slate-200/80",
};

export function ServiceCategoryBadge({ label, categoryKey }: { label: string; categoryKey: ServiceCategoryKey }) {
  return (
    <span
      className={`inline-block max-w-full truncate rounded-md border px-2 py-0.5 text-[0.7rem] font-semibold ${map[categoryKey] || map.other}`}
      title={label}
    >
      {label}
    </span>
  );
}
