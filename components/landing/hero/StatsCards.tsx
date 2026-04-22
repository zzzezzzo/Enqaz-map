import {
  Activity,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

type StatBadge = "trend" | "check";

const stats: {
  Icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
  badge: StatBadge;
}[] = [
  {
    Icon: Clock,
    iconClass: "text-orange-500",
    label: "Average Response",
    value: "~10min",
    badge: "trend",
  },
  {
    Icon: Star,
    iconClass: "text-orange-500",
    label: "User Satisfaction",
    value: "4.9/5",
    badge: "trend",
  },
  {
    Icon: Users,
    iconClass: "text-orange-500",
    label: "Active Providers",
    value: "500+",
    badge: "trend",
  },
  {
    Icon: Activity,
    iconClass: "text-emerald-600",
    label: "Real-Time Tracking",
    value: "Live",
    badge: "check",
  },
];

export default function StatsCards() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/45 p-4 shadow-xl backdrop-blur-md sm:p-5 md:rounded-3xl md:p-6">
      <div
        className="pointer-events-none absolute -right-6 -top-6 z-0 h-24 w-24 rounded-full border-[3px] border-[#FF9F1C]/30 sm:-right-8 sm:-top-8 sm:h-28 sm:w-28 md:h-32 md:w-32"
        aria-hidden
      />
      <div className="relative z-10 grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
        {stats.map(({ Icon, iconClass, label, value, badge }) => (
          <div
            key={label}
            className="flex min-h-[7.5rem] flex-col justify-between rounded-xl bg-white p-3 text-slate-900 shadow-md sm:min-h-[8.5rem] sm:rounded-2xl sm:p-4 md:min-h-0 md:p-5"
          >
            <div className="flex items-start justify-between gap-1">
              <Icon
                className={`h-5 w-5 shrink-0 sm:h-6 sm:w-6 md:h-7 md:w-7 ${iconClass}`}
                strokeWidth={2}
                aria-hidden
              />
              {badge === "trend" ? (
                <TrendingUp
                  className="h-3.5 w-3.5 shrink-0 text-emerald-500 sm:h-4 sm:w-4 md:h-5 md:w-5"
                  strokeWidth={2}
                  aria-hidden
                />
              ) : (
                <CheckCircle
                  className="h-3.5 w-3.5 shrink-0 text-emerald-500 sm:h-4 sm:w-4 md:h-5 md:w-5"
                  strokeWidth={2}
                  aria-hidden
                />
              )}
            </div>
            <div className="mt-2 text-start sm:mt-3">
              <span className="block text-xl font-bold leading-none tracking-tight text-slate-900 sm:text-2xl md:text-3xl lg:text-4xl">
                {value}
              </span>
              <span className="mt-1 block text-[10px] font-medium leading-snug text-gray-600 sm:text-xs md:text-sm">
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
