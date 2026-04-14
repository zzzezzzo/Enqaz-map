export type WorkshopProfileForm = {
  name: string;
  phoneNumber: string;
  address: string;
  description: string;
  latitude: string;
  longitude: string;
  services: number[];
  openingTime: string; // "HH:MM"
  closingTime: string; // "HH:MM"
};

export type ProviderProfilePayload = {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  services: number[];
};

export type ServiceOption = {
  id: number;
  name: string;
};

export type WorkshopProfileViewModel = WorkshopProfileForm & {
  logoPreviewUrl: string | null;
};

