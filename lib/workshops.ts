import type { Workshop } from "@/components/customer/WorkshopCard";
import api from "@/services/auth";

export const MOCK_WORKSHOPS: Workshop[] = [
  {
    id: "1",
    name: "Speedy Auto Repair",
    rating: 4.7,
    reviewCount: 128,
    description: "Mechanic & Tow",
    image: "/image.png",
  },
  {
    id: "2",
    name: "Quick Fix Auto Services",
    rating: 4.5,
    reviewCount: 96,
    description: "Battery & Tire repair",
    image: "/image1.png",
  },
  {
    id: "3",
    name: "Reliable Auto Repair",
    rating: 4.8,
    reviewCount: 204,
    description: "Full roadside assistance",
    image: "/image2.png",
  },
  {
    id: "4",
    name: "24/7 Roadside Pro",
    rating: 4.6,
    reviewCount: 87,
    description: "Winch, Battery & Mechanic",
    image: "/image.png",
  },
  {
    id: "5",
    name: "City Auto Care",
    rating: 4.4,
    reviewCount: 56,
    description: "Tire & Mechanic services",
    image: "/image1.png",
  },
  {
    id: "6",
    name: "Highway Rescue",
    rating: 4.9,
    reviewCount: 312,
    description: "Towing & Recovery",
    image: "/image2.png",
  },
];

type WorkshopApiItem = {
  id: number | string;
  name?: string;
  workshop_name?: string;
  rating?: number | string | null;
  review_count?: number | string | null;
  reviews_count?: number | string | null;
  description?: string | null;
  image?: string | null;
  logo?: string | null;
};

function normalizeWorkshop(item: WorkshopApiItem): Workshop {
  return {
    id: String(item.id),
    name: item.name ?? item.workshop_name ?? "Workshop",
    rating: Number(item.rating ?? 4.5),
    reviewCount: Number(item.review_count ?? item.reviews_count ?? 0),
    description: item.description ?? "Roadside assistance workshop",
    image: item.image ?? item.logo ?? "/image.png",
  };
}

export async function fetchWorkshops(): Promise<Workshop[]> {
  const response = await api.get("/workshops");
  const raw = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
  return raw.map(normalizeWorkshop);
}
