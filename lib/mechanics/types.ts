export type MechanicDispatchStatus =
  | "unassigned"
  | "assigned"
  | "en_route"
  | "arrived"
  | "in_service"
  | "completed";

export type WorkshopMechanic = {
  id: number;
  name: string;
  username: string;
  phone?: string | null;
  is_active: boolean;
  /** API `status` e.g. `available`, `busy`, `offline`. */
  status?: string;
  workshop_id?: number;
  is_available?: boolean;
  current_job_id?: number | null;
};

export type MechanicSession = {
  id: number;
  name: string;
  username: string;
  workshop_id: number;
  workshop_name?: string;
};

export type MechanicJob = {
  id: number;
  service_request_id: number;
  service_name: string;
  customer_name: string;
  customer_phone?: string;
  vehicle_details: string;
  description: string;
  customer_latitude: number;
  customer_longitude: number;
  dispatch_status: MechanicDispatchStatus;
  /** Raw request status from API e.g. `accepted`, `in_progress`. */
  request_status?: string;
  assigned_at?: string;
};

export type MechanicLocationPayload = {
  latitude: number;
  longitude: number;
  service_request_id?: number;
  heading?: number;
};
