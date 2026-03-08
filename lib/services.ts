export const SERVICES = [
  {
    slug: "winch",
    name: "Winch Service",
    description: "Towing service for disabled vehicles.",
    color: "orange",
    icon: "Truck",
  },
  {
    slug: "mechanic",
    name: "Mechanic",
    description: "On-demand mechanical repair.",
    color: "blue",
    icon: "Wrench",
  },
  {
    slug: "battery",
    name: "Battery Service",
    description: "Jump start or battery replacement.",
    color: "green",
    icon: "Battery",
  },
  {
    slug: "tire",
    name: "Tire Service",
    description: "Fix flat tires or replacement.",
    color: "purple",
    icon: "CircleDot",
  },
] as const;

export type ServiceSlug = (typeof SERVICES)[number]["slug"];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((s) => s.slug === slug) ?? null;
}
