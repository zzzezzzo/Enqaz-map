import axios from 'axios';
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token (omitted for public catalog GETs)
api.interceptors.request.use((config) => {
  if (config.publicCatalog) {
    const h = config.headers;
    if (h && "delete" in h && typeof h.delete === "function") {
      h.delete("Authorization");
    } else {
      const rec = h as unknown as Record<string, unknown> | undefined;
      if (rec) delete rec.Authorization;
    }
    return config;
  }
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const cfg = error.config;
      const skipByFlag = cfg?.skipAuthRedirect === true;
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const publicAuthPathPrefixes = [
        "/auth/register",
        "/auth/login",
        "/auth/forgot-password",
        "/auth/reset-password",
      ] as const;
      const onPublicAuthPage = publicAuthPathPrefixes.some(
        (p) => path === p || path.startsWith(`${p}/`)
      );
      const skipRedirect = skipByFlag || onPublicAuthPage;
      if (skipRedirect) {
        localStorage.removeItem("token");
        return Promise.reject(error);
      }
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  /**
   * Tell the backend this account is a workshop provider (not only a customer).
   * Backend should create a provider/workshop record and set admin approval to pending when applicable.
   */
  role?: 'customer' | 'provider';
  /**
   * Numeric role when the API uses `role_id` (e.g. `3` = provider) instead of or in addition to `role`.
   */
  role_id?: number;
  /** Required when `role` is `provider` — matches provider profile / workshop fields. */
  workShopName?: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  /** Service catalog IDs to attach to the new workshop. */
  services?: number[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

function extractAccessToken(body: unknown): string | null {
  if (body == null || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const direct =
    (typeof b.access_token === "string" && b.access_token) ||
    (typeof b.token === "string" && b.token) ||
    (typeof b.plainTextToken === "string" && b.plainTextToken) ||
    null;
  if (direct) return direct;

  const inner = b.data;
  if (inner != null && typeof inner === "object") {
    const d = inner as Record<string, unknown>;
    const nested =
      (typeof d.access_token === "string" && d.access_token) ||
      (typeof d.token === "string" && d.token) ||
      null;
    if (nested) return nested;
  }

  return null;
}

/** Human-readable message for failed auth API calls (register, login, …). */
export function readAuthApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message
      ? error.message
      : "Something went wrong. Please try again.";
  }

  const status = error.response?.status;
  const data = error.response?.data;

  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    const msg = rec.message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
    const errStr = rec.error;
    if (typeof errStr === "string" && errStr.trim()) return errStr.trim();
    const errors = rec.errors;
    if (errors && typeof errors === "object" && !Array.isArray(errors)) {
      const lines: string[] = [];
      for (const [, val] of Object.entries(errors)) {
        if (Array.isArray(val)) {
          for (const v of val) {
            if (typeof v === "string" && v.trim()) lines.push(v.trim());
          }
        } else if (val != null && String(val).trim()) {
          lines.push(String(val).trim());
        }
      }
      if (lines.length) return lines.join(" ");
    }
  }

  if (status === 404)
    return "Registration endpoint was not found. Check API URL and routes.";
  if (status === 419)
    return "Session expired. Refresh the page and try again.";
  if (status === 429) return "Too many attempts. Please wait and try again.";
  if (status) return `Request failed (HTTP ${status}).`;

  if (error.code === "ERR_NETWORK") {
    return "Cannot reach the server. Check that the API is running and CORS is allowed.";
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return "Something went wrong. Please try again.";
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/login', credentials);
    const token = extractAccessToken(response.data);
    if (token) localStorage.setItem('token', token);
    return response.data as AuthResponse;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/register', data);
    const token = extractAccessToken(response.data);
    if (token) localStorage.setItem('token', token);
    return response.data as AuthResponse;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/me');
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post('/auth/refresh');
    const token = extractAccessToken(response.data);
    if (token) localStorage.setItem('token', token);
    return response.data as AuthResponse;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },
};

export default api;
