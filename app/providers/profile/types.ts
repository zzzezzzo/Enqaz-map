/** Editable fields aligned with GET/PUT `/provider/profile` `data` object. */
export type WorkshopProfileForm = {
  workShopName: string;
  description: string;
  latitude: string;
  longitude: string;
  /**
   * Minutes since midnight (0–1439). Sent as `opening_time` in the API body.
   * Legacy backends may still return/store hour-only integers (0–23); the app normalizes those on load.
   */
  opening_time: number;
  /** Same as `opening_time`, API key may be spelled `closeing_time`. */
  closeing_time: number;
  services: number[];
};

/** Body for PUT `/provider/profile` (same shape as API `data` fields you send). */
export type ProviderProfileSavePayload = WorkshopProfileForm;

/** @deprecated use ProviderProfileSavePayload */
export type ProviderProfilePayload = ProviderProfileSavePayload;

export type ProviderProfileServicePivot = {
  provider_id?: number;
  service_id?: number;
};

export type ProviderProfileServiceFromApi = {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  pivot?: ProviderProfileServicePivot;
};

export type ProviderProfileApiData = {
  id: number;
  user_id: number;
  workShopName: string;
  description: string;
  latitude: string;
  longitude: string;
  opening_time?: number | string;
  /** Backend typo; also accept `closing_time`. */
  closeing_time?: number | string;
  closing_time?: number | string;
  is_available: number;
  average_rating: string;
  created_at: string;
  updated_at: string;
  services: ProviderProfileServiceFromApi[];
  /**
   * When set by the API: `1` = admin approved, `0` = pending.
   * If omitted, the app treats the provider as approved (older backends).
   */
  is_approved?: number;
  /** Alternative to `is_approved` for admin workflow */
  approval_status?: "pending" | "approved" | "rejected";
};

export type ProviderProfileApiResponse = {
  message?: string;
  data?: ProviderProfileApiData;
};

export type ServiceOption = {
  id: number;
  name: string;
};

export type WorkshopProfileViewModel = WorkshopProfileForm;

