import axios from "axios";
import { readAuthApiErrorMessage } from "@/services/auth";
import type { MechanicSession } from "@/lib/mechanics/types";

const MECHANIC_TOKEN_KEY = "mechanic_token";
const MECHANIC_PROFILE_KEY = "mechanic_profile";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object";
}

function pickToken(obj: Record<string, unknown>): string | null {
  const keys = [
    "access_token",
    "token",
    "plain_text_token",
    "plainTextToken",
    "auth_token",
    "api_token",
  ];
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const auth = obj.authorisation ?? obj.authorization;
  if (isRecord(auth) && typeof auth.token === "string" && auth.token.trim()) {
    return auth.token.trim();
  }
  return null;
}

function extractAccessToken(body: unknown): string | null {
  if (!isRecord(body)) return null;
  const direct = pickToken(body);
  if (direct) return direct;
  if (isRecord(body.data)) {
    const nested = pickToken(body.data);
    if (nested) return nested;
    if (isRecord(body.data.data)) {
      return pickToken(body.data.data);
    }
  }
  return null;
}

function extractMechanic(body: unknown): MechanicSession | null {
  if (!isRecord(body)) return null;
  const raw =
    (isRecord(body.mechanic) ? body.mechanic : null) ??
    (isRecord(body.data)
      ? (isRecord(body.data.mechanic)
          ? body.data.mechanic
          : isRecord(body.data.user)
            ? body.data.user
            : body.data)
      : null) ??
    (isRecord(body.user) ? body.user : null);

  if (!isRecord(raw)) return null;
  const id = Number(raw.id ?? raw.mechanic_id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    name: String(raw.name ?? ""),
    username: String(raw.username ?? raw.user_name ?? ""),
    workshop_id: Number(
      raw.workshop_id ??
        raw.work_shop_id ??
        raw.provider_id ??
        raw.workShop_id ??
        0
    ),
    workshop_name:
      typeof raw.workshop_name === "string"
        ? raw.workshop_name
        : typeof raw.workShopName === "string"
          ? raw.workShopName
          : undefined,
  };
}

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "") +
  "/api";

const LOGIN_PATHS = ["/mechanic/login", "/provider/mechanic/login"] as const;

export const mechanicAuthService = {
  async login(username: string, password: string): Promise<MechanicSession> {
    const payload = {
      username,
      user_name: username,
      password,
    };

    let lastError: unknown;
    for (const path of LOGIN_PATHS) {
      try {
        const response = await axios.post(`${API_BASE_URL}${path}`, payload, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const token = extractAccessToken(response.data);
        if (!token) {
          throw new Error(
            "Login succeeded but the server did not return an access token. Check the mechanic login API response."
          );
        }

        localStorage.setItem(MECHANIC_TOKEN_KEY, token);

        const mechanic = extractMechanic(response.data);
        if (mechanic) {
          localStorage.setItem(MECHANIC_PROFILE_KEY, JSON.stringify(mechanic));
          return mechanic;
        }

        const fallback: MechanicSession = {
          id: 0,
          name: username,
          username,
          workshop_id: 0,
        };
        localStorage.setItem(MECHANIC_PROFILE_KEY, JSON.stringify(fallback));
        return fallback;
      } catch (err) {
        lastError = err;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          continue;
        }
        throw err;
      }
    }

    throw lastError ?? new Error("Mechanic login endpoint not found.");
  },

  async logout(): Promise<void> {
    try {
      await mechanicApi.post("/mechanic/logout", undefined, { skipAuthRedirect: true });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(MECHANIC_TOKEN_KEY);
      localStorage.removeItem(MECHANIC_PROFILE_KEY);
    }
  },

  async getCurrentMechanic(): Promise<MechanicSession | null> {
    if (!this.getToken()) return null;

    const cached = localStorage.getItem(MECHANIC_PROFILE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as MechanicSession;
      } catch {
        localStorage.removeItem(MECHANIC_PROFILE_KEY);
      }
    }

    try {
      const res = await mechanicApi.get("/mechanic/me", { skipAuthRedirect: true });
      const mechanic = extractMechanic(res.data);
      if (mechanic) {
        localStorage.setItem(MECHANIC_PROFILE_KEY, JSON.stringify(mechanic));
        return mechanic;
      }
    } catch {
      // Profile endpoint optional — token + jobs list are enough.
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

  getWorkshopId(): number | null {
    const cached = localStorage.getItem(MECHANIC_PROFILE_KEY);
    if (!cached) return null;
    try {
      const profile = JSON.parse(cached) as MechanicSession;
      const id = Number(profile.workshop_id);
      return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
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
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const cfg = error.config as { skipAuthRedirect?: boolean } | undefined;
    if (cfg?.skipAuthRedirect === true) {
      return Promise.reject(error);
    }

    const path = typeof window !== "undefined" ? window.location.pathname : "";
    if (path.startsWith("/mechanic/login")) {
      return Promise.reject(error);
    }

    localStorage.removeItem(MECHANIC_TOKEN_KEY);
    localStorage.removeItem(MECHANIC_PROFILE_KEY);
    const params = new URLSearchParams({ reason: "session" });
    window.location.href = `/mechanic/login?${params.toString()}`;
    return Promise.reject(error);
  }
);

export { readAuthApiErrorMessage };
