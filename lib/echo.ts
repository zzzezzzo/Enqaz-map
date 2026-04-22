import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

const backendOrigin = (
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000'
).replace(/\/$/, '');

/** Same-origin in the browser so Pusher auth avoids cross-origin (HTTP 0 / CORS). */
const broadcastingAuthPath = '/broadcasting/auth';

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
  broadcaster: 'reverb',
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
  wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ? Number(process.env.NEXT_PUBLIC_REVERB_PORT) : 80,
  wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ? Number(process.env.NEXT_PUBLIC_REVERB_PORT) : 443,
  forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
  authEndpoint:
    typeof window === 'undefined'
      ? `${backendOrigin}${broadcastingAuthPath}`
      : broadcastingAuthPath,
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