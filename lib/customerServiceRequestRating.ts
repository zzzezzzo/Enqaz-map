import api from "@/services/auth";

export type CustomerServiceRequestRatingPayload = {
  rating: number;
  comment: string;
};

/**
 * POST /api/customer/service-requests/{id}/rating
 * Body: { "rating": number, "comment": string }
 */
export async function submitCustomerServiceRequestRating(
  serviceRequestId: number,
  payload: CustomerServiceRequestRatingPayload
): Promise<void> {
  await api.post(`/customer/service-requests/${serviceRequestId}/rating`, {
    rating: payload.rating,
    comment: payload.comment,
  });
}
