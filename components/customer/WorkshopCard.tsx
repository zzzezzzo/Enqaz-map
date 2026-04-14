"use client";

import Image from "next/image";
import { Check, Star, Phone, Building2 } from "lucide-react";

export interface Workshop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
}

type WorkshopCardProps = {
  workshop: Workshop;
  selected?: boolean;
  onSelectProvider?: (workshopId: string) => void;
};

export default function WorkshopCard({
  workshop,
  selected = false,
  onSelectProvider,
}: WorkshopCardProps) {
  const selectable = Boolean(onSelectProvider);

  return (
    <div
      className={`rounded-2xl overflow-hidden border bg-white shadow-sm transition-all hover:shadow-md ${
        selected
          ? "border-orange-500 ring-2 ring-orange-500/20 shadow-md"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      <div className="relative h-36 bg-slate-200">
        <Image
          src={workshop.image}
          alt={workshop.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
        />
        {selected && (
          <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow">
            <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-900 mb-2">{workshop.name}</h3>
        <div className="flex items-center gap-1 text-amber-500 mb-2">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium text-slate-600">
            {workshop.rating} ({workshop.reviewCount} reviews)
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {workshop.description}
        </p>
        <div className="flex flex-col gap-2">
          {selectable && (
            <button
              type="button"
              onClick={() => onSelectProvider?.(workshop.id)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              {selected ? "Selected provider" : "Use as provider"}
            </button>
          )}
          <button
            type="button"
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors border ${
              selectable
                ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-orange-500 hover:bg-orange-600 text-white border-transparent"
            }`}
          >
            <Phone className="w-4 h-4" />
            Call now
          </button>
        </div>
      </div>
    </div>
  );
}
