import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

const backendOrigin = (
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000'
).replace(/\/$/, '');

/** Same-origin in the browser so Pusher auth hits the Next proxy (avoids CORS). */
const broadcastingAuthPath = "/broadcasting/auth";

function broadcastingAuthEndpoint(): string {
  if (typeof window === "undefined") {
    return `${backendOrigin}${broadcastingAuthPath}`;
  }
  return `${window.location.origin}${broadcastingAuthPath}`;
}

const reverbScheme = (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") as string;
const reverbDefaultPort = reverbScheme === "https" ? 443 : 8080;
const reverbPort = process.env.NEXT_PUBLIC_REVERB_PORT
  ? Number(process.env.NEXT_PUBLIC_REVERB_PORT)
  : reverbDefaultPort;

function broadcastAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

const initialToken =
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const echo = new Echo({
  broadcaster: "reverb",
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "127.0.0.1",
  wsPort: reverbPort,
  wssPort: reverbPort,
  forceTLS: reverbScheme === "https",
  enabledTransports: ["ws", "wss"],
  authEndpoint: broadcastingAuthEndpoint(),
  auth: { headers: broadcastAuthHeaders() },
  ...(initialToken ? { bearerToken: initialToken } : {}),
});

/** Refresh Bearer on the Echo connector before private/presence subscriptions (token may load after module init). */
export function syncEchoBroadcastAuth(): void {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const connector = (echo as unknown as { connector?: { options?: { auth?: { headers?: Record<string, string> }; bearerToken?: string | null } } }).connector;
  if (!connector?.options?.auth?.headers) return;
  if (token) {
    connector.options.auth.headers.Authorization = `Bearer ${token}`;
    connector.options.bearerToken = token;
  } else {
    delete connector.options.auth.headers.Authorization;
    connector.options.bearerToken = null;
  }
}
export { echo };
export default echo;