"use client";

import Link from "next/link";
import { Truck, Wrench, Battery, CircleDot, LucideIcon } from "lucide-react";
import { SERVICES, type ServiceSlug } from "@/lib/services";

const iconMap: Record<ServiceSlug, LucideIcon> = {
  winch: Truck,
  mechanic: Wrench,
  battery: Battery,
  tire: CircleDot,
};

const colorClasses: Record<string, string> = {
  orange: "bg-orange-500 hover:bg-orange-600 text-white",
  blue: "bg-blue-500 hover:bg-blue-600 text-white",
  green: "bg-emerald-500 hover:bg-emerald-600 text-white",
  purple: "bg-purple-500 hover:bg-purple-600 text-white",
};

export default function QuickAccessCard({
  slug,
  name,
  description,
  color,
}: (typeof SERVICES)[number]) {
  const Icon = iconMap[slug];
  return (
    <Link
      href={`/customer/request/${slug}`}
      className={`block rounded-2xl p-6 ${colorClasses[color]} transition-colors shadow-md hover:shadow-lg text-left`}
    >
      <Icon className="w-10 h-10 mb-4" aria-hidden />
      <h3 className="text-lg font-bold mb-2">{name}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
}
