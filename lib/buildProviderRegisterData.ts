import type { RegisterData } from "@/services/auth";
import { PROVIDER_ROLE_ID } from "@/lib/providerRole";
import { minutesTo24HourParts } from "@/lib/workshopHours";

export type BuildProviderRegisterInput = {
  userName: string;
  email: string;
  password: string;
  password_confirmation: string;
  workShopName: string;
  description: string;
  latitude: string;
  longitude: string;
  services: number[];
  openingMinutes: number;
  closingMinutes: number;
};

/**
 * Body for `POST /register` when signing up as a workshop provider.
 * Mirrors field names used by `buildProviderProfilePutBody` so Laravel can fill the same columns.
 */
export function buildProviderRegisterData(input: BuildProviderRegisterInput): RegisterData {
  const open = minutesTo24HourParts(input.openingMinutes);
  const close = minutesTo24HourParts(input.closingMinutes);
  const w = input.workShopName.trim();
  const ids = input.services;

  return {
    name: input.userName.trim(),
    email: input.email.trim(),
    password: input.password,
    password_confirmation: input.password_confirmation,
    role: "provider",
    role_id: PROVIDER_ROLE_ID,
    workShopName: w,
    workshop_name: w,
    description: input.description,
    latitude: input.latitude.trim(),
    longitude: input.longitude.trim(),
    services: ids,
    service_ids: ids,
    opening_time: open.time24,
    closeing_time: close.time24,
    closing_time: close.time24,
  };
}
