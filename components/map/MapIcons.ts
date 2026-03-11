"use client";

type LeafletModule = typeof import("leaflet");

let L: LeafletModule | null = null;

if (typeof window !== "undefined") {
  L = require("leaflet");
}

function createCircleIcon(color: string, extra?: string) {
  return (
    L?.divIcon({
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background: ${color};
          border: 3px solid white;
          border-radius: 999px;
          box-shadow: 0 8px 18px rgba(148, 163, 184, 0.5);
          ${extra ?? ""}
        "></div>
      `,
      className: "",
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    }) ?? null
  );
}

export const workshopIcon = createCircleIcon("#0f172a"); // dark navy
export const customerIcon = createCircleIcon("#0ea5e9"); // sky
export const driverIcon = createCircleIcon("#f97316"); // orange
export const requestIcon = driverIcon;



