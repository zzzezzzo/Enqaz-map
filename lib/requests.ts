export type RequestStatus = "pending" | "completed" | "cancelled";

export interface ServiceRequest {
  id: string;
  serviceName: string;
  status: RequestStatus;
  requestId: string;
  dateTime: string;
  location: string;
  customerName: string;
  serviceProvider: string;
  cost: number;
  rating?: number; // 1-5 if completed and rated
}

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: "1",
    serviceName: "Battery Service",
    status: "pending",
    requestId: "req-001",
    dateTime: "2020-02-29 at 14:00",
    location: "King Fahd Road, Riyadh",
    customerName: "Mohammed Al-Rashid",
    serviceProvider: "Al-Rapid Auto Service",
    cost: 0,
  },
  {
    id: "2",
    serviceName: "Battery Service",
    status: "completed",
    requestId: "req-001",
    dateTime: "2020-02-28 at 10:30",
    location: "King Fahd Road, Riyadh",
    customerName: "Mohammed Al-Rashid",
    serviceProvider: "Al-Rapid Auto Service",
    cost: 150,
  },
  {
    id: "3",
    serviceName: "Battery Service",
    status: "completed",
    requestId: "req-002",
    dateTime: "2020-02-27 at 16:45",
    location: "King Fahd Road, Riyadh",
    customerName: "Mohammed Al-Rashid",
    serviceProvider: "Speedy Auto Repair",
    cost: 120,
    rating: 3,
  },
  {
    id: "4",
    serviceName: "Battery Service",
    status: "cancelled",
    requestId: "req-003",
    dateTime: "2020-02-26 at 09:15",
    location: "King Fahd Road, Riyadh",
    customerName: "Mohammed Al-Rashid",
    serviceProvider: "Al-Rapid Auto Service",
    cost: 0,
  },
];

export function getRequestById(id: string) {
  return MOCK_REQUESTS.find((r) => r.id === id) ?? null;
}
