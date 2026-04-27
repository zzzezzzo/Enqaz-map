import api from "@/services/auth";

/** POST /api/admin/profile — create a new administrator. */
export type CreateAdminProfilePayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
};

export async function createAdminProfile(payload: CreateAdminProfilePayload): Promise<void> {
  await api.post("/admin/profile", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    phone: payload.phone,
  });
}
