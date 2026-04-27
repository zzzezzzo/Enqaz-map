"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";

const memoryCache = new Map<string, string | null>();

type Props = {
  latitude: string;
  longitude: string;
};

export function WorkshopLocationCell({ latitude, longitude }: Props) {
  const key = `${latitude},${longitude}`;
  const [text, setText] = useState<string | null>(() => {
    if (memoryCache.has(key)) return memoryCache.get(key) ?? null;
    return null;
  });
  const [loading, setLoading] = useState(!memoryCache.has(key));
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}`;

  useEffect(() => {
    if (memoryCache.has(key)) {
      setText(memoryCache.get(key) ?? null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = await fetch(
          `/api/reverse-geocode?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`,
          { headers: { "Accept-Language": typeof navigator !== "undefined" ? navigator.language : "en" } }
        );
        const j = (await r.json()) as { displayName?: string | null };
        const line = j.displayName?.trim() || null;
        if (!cancelled) {
          memoryCache.set(key, line);
          setText(line);
        }
      } catch {
        if (!cancelled) {
          memoryCache.set(key, null);
          setText(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, latitude, longitude]);

  if (loading) {
    return <span className="text-slate-400">Resolving address…</span>;
  }

  if (text) {
    return (
      <div className="max-w-[14rem]">
        <p className="inline-flex items-start gap-1.5 text-slate-700" dir="auto">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-500" aria-hidden />
          <span className="leading-snug line-clamp-3">{text}</span>
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-flex items-center gap-0.5 text-[0.7rem] text-blue-600 hover:underline"
        >
          Open in Maps
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600"
    >
      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="text-[0.7rem]">View on map</span>
      <ExternalLink className="h-3 w-3" aria-hidden />
    </a>
  );
}
