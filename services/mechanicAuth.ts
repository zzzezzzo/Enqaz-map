import axios from "axios";
import { readAuthApiErrorMessage } from "@/services/auth";
import type { MechanicSession } from "@/lib/mechanics/types";

const MECHANIC_TOKEN_KEY = "mechanic_token";

function extractAccessToken(body: unknown): string | null {
  if (body == null || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const direct =
    (typeof b.access_token === "string" && b.access_token) ||
    (typeof b.token === "string" && b.token) ||
    null;
  if (direct) return direct;
  const inner = b.data;
  if (inner != null && typeof inner === "object") {
    const d = inner as Record<string, unknown>;
    return (
      (typeof d.access_token === "string" && d.access_token) ||
      (typeof d.token === "string" && d.token) ||
      null
    );
  }
  return null;
}

function extractMechanic(body: unknown): MechanicSession | null {
  if (body == null || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const raw =
    (b.mechanic && typeof b.mechanic === "object" ? b.mechanic : null) ??
    (b.data && typeof b.data === "object"
      ? ((b.data as Record<string, unknown>).mechanic ??
        (b.data as Record<string, unknown>))
      : null);
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const id = Number(m.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    name: String(m.name ?? ""),
    username: String(m.username ?? ""),
    workshop_id: Number(m.workshop_id ?? m.provider_id ?? 0),
    workshop_name:
      typeof m.workshop_name === "string"
        ? m.workshop_name
        : typeof m.workShopName === "string"
          ? m.workShopName
          : undefined,
  };
}

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "") +
  "/api";

export const mechanicAuthService = {
  async login(username: string, password: string): Promise<MechanicSession> {
    const response = await axios.post(
      `${API_BASE_URL}/provider/mechanic/login`,
      { username, user_name: username, password },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const token = extractAccessToken(response.data);
    if (token) localStorage.setItem(MECHANIC_TOKEN_KEY, token);
    const mechanic = extractMechanic(response.data);
    if (mechanic) {
      localStorage.setItem("mechanic_profile", JSON.stringify(mechanic));
      return mechanic;
    }
    const profile = await this.getCurrentMechanic();
    if (!profile) throw new Error("Login succeeded but mechanic profile is missing.");
    return profile;
  },

  async logout(): Promise<void> {
    try {
      await mechanicApi.post("/mechanic/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(MECHANIC_TOKEN_KEY);
      localStorage.removeItem("mechanic_profile");
    }
  },

  async getCurrentMechanic(): Promise<MechanicSession | null> {
    const cached = localStorage.getItem("mechanic_profile");
    if (cached) {
      try {
        return JSON.parse(cached) as MechanicSession;
      } catch {
        localStorage.removeItem("mechanic_profile");
      }
    }
    if (!this.getToken()) return null;
    try {
      const res = await mechanicApi.get("/mechanic/me", { skipAuthRedirect: true });
      const mechanic = extractMechanic(res.data);
      if (mechanic) {
        localStorage.setItem("mechanic_profile", JSON.stringify(mechanic));
        return mechanic;
      }
    } catch {
      return null;
    }
    return null;
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(MECHANIC_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export const mechanicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

mechanicApi.interceptors.request.use((config) => {
  const token = mechanicAuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

mechanicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const cfg = error.config;
      const skip = cfg?.skipAuthRedirect === true;
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const onLogin = path.startsWith("/mechanic/login");
      if (!skip && !onLogin) {
        localStorage.removeItem(MECHANIC_TOKEN_KEY);
        localStorage.removeItem("mechanic_profile");
        window.location.href = "/mechanic/login";
      }
    }
    return Promise.reject(error);
  }
);

export { readAuthApiErrorMessage };
