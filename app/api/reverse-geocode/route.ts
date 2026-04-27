import { NextRequest, NextResponse } from "next/server";

/**
 * Resolves lat/lng to a human-readable address via Nominatim (OpenStreetMap).
 * Browser → your API → Nominatim to satisfy Nominatim’s usage policy and avoid CORS issues.
 */
export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  if (lat == null || lng == null || lat === "" || lng === "") {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const n = (v: string) => Number(v);
  if (Number.isNaN(n(lat)) || Number.isNaN(n(lng))) {
    return NextResponse.json({ error: "invalid coordinates" }, { status: 400 });
  }

  const acceptLang = request.headers.get("accept-language")?.split(",")[0]?.trim() || "en";

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", acceptLang);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "ENQAZ-Admin-Client/1.0 (contact: web)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ displayName: null }, { status: 200 });
    }

    const data = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };

    const line =
      data.display_name?.trim() ||
      formatAddressObject(data.address) ||
      null;

    return NextResponse.json({ displayName: line });
  } catch {
    return NextResponse.json({ displayName: null }, { status: 200 });
  }
}

function formatAddressObject(addr: Record<string, string> | undefined): string {
  if (!addr || typeof addr !== "object") return "";
  const city = addr.city || addr.town || addr.village || addr.municipality || addr.state || "";
  const road = addr.road || addr.neighbourhood || "";
  const house = addr.house_number;
  const parts = [house && road ? `${road} ${house}`.trim() : road, city].filter(Boolean);
  return parts.join(city && road ? ", " : "");
}
