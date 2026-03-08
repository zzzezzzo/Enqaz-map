"use client";

import Image from "next/image";
import { Star, Phone } from "lucide-react";

export interface Workshop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
}

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="relative h-36 bg-gray-200">
        <Image
          src={workshop.image}
          alt={workshop.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">{workshop.name}</h3>
        <div className="flex items-center gap-1 text-amber-500 mb-2">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium text-gray-700">
            {workshop.rating} ({workshop.reviewCount} reviews)
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {workshop.description}
        </p>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Now
        </button>
      </div>
    </div>
  );
}
