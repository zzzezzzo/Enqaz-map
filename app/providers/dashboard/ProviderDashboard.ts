"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import api, { authService } from "@/services/auth";
import echo, { syncEchoBroadcastAuth } from "@/lib/echo";

/** Laravel often wraps JSON as `{ data: { service_status, income_request } }`. */
function unwrapDashboardPayload(payload: unknown): DashboardResponse | null {
  if (payload == null || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const inner = p.data;
  if (inner != null && typeof inner === "object" && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>;
    if ("income_request" in d || "service_status" in d) return inner as DashboardResponse;
  }
  if ("income_request" in p || "service_status" in p) return payload as DashboardResponse;
  return null;
}

/** Resolve workshop/provider id for `private-provider.{id}` from varying API shapes. */
function extractProviderIdFromDashboard(data: unknown): number | null {
  if (data == null || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const ir =
    root.income_request != null && typeof root.income_request === "object"
      ? (root.income_request as Record<string, unknown>)
      : null;
  const nested = root.data != null && typeof root.data === "object" ? (root.data as Record<string, unknown>) : null;
  const dIr =
    nested?.income_request != null && typeof nested.income_request === "object"
      ? (nested.income_request as Record<string, unknown>)
      : null;

  const candidates: unknown[] = [
    root.provider_id,
    root.workshop_id,
    ir?.provider_id,
    ir?.workshop_id,
    nested?.provider_id,
    nested?.workshop_id,
    dIr?.provider_id,
    dIr?.workshop_id,
  ];
  for (const v of candidates) {
    if (v === undefined || v === null || v === "") continue;
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function extractAuthUserId(me: unknown): number | null {
  if (me == null || typeof me !== "object") return null;
  const o = me as Record<string, unknown>;
  const pick = (v: unknown): number | null => {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    }
    return null;
  };
  const fromRecord = (rec: Record<string, unknown>): number | null =>
    pick(rec.id) ?? pick(rec.user_id) ?? pick(rec.userId);

  const direct = fromRecord(o);
  if (direct != null) return direct;

  const data = o.data;
  if (data != null && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const inner = fromRecord(d);
    if (inner != null) return inner;
    const attrs = d.attributes;
    if (attrs != null && typeof attrs === "object") {
      const a = fromRecord(attrs as Record<string, unknown>);
      if (a != null) return a;
    }
    const user = d.user;
    if (user != null && typeof user === "object") {
      const u = fromRecord(user as Record<string, unknown>);
      if (u != null) return u;
    }
  }

  const user = o.user;
  if (user != null && typeof user === "object") {
    const inner = fromRecord(user as Record<string, unknown>);
    if (inner != null) return inner;
  }
  return null;
}

function summarizePusherSubscriptionError(raw: unknown): {
  httpStatus: number | null;
  label: string;
} {
  if (raw == null) return { httpStatus: null, label: "empty_error" };
  if (typeof raw === "object" && raw !== null) {
    const o = raw as Record<string, unknown>;
    if (typeof o.status === "number") {
      return { httpStatus: o.status, label: `http_${o.status}` };
    }
    if (typeof o.error === "string" && o.error.trim()) {
      return { httpStatus: null, label: o.error.trim().slice(0, 120) };
    }
    if (typeof o.data === "string") {
      return { httpStatus: null, label: o.data.slice(0, 120) };
    }
  }
  if (typeof raw === "string") return { httpStatus: null, label: raw.slice(0, 120) };
  return { httpStatus: null, label: "subscription_error" };
}

export type RealtimeDiagnostics = {
  wsState: string;
  privateChannel: "idle" | "subscribing" | "subscribed" | "error";
  channelName: string | null;
  httpStatus: number | null;
  authSummary: string | null;
};
export interface ServiceStatus {
  total_requests_today: number;
  active_jobs: number;
}

export interface WorkshopLocation {
  latitude: string;
  longitude: string;
}

export interface IncomeRequest {
  id: number;
  latitude: string;
  longitude: string;
  customer_name: string;
  description: string;
  service_name: string;
  distance: string;
  minutes_ago: string;
}

export interface IncomeRequestData {
  workShop_location: WorkshopLocation;
  requests: IncomeRequest[];
}

export interface DashboardResponse {
  service_status: ServiceStatus;
  income_request: IncomeRequestData;
}

export const useProviderDashboard = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [realtimeDiagnostics, setRealtimeDiagnostics] = useState<RealtimeDiagnostics>({
    wsState: "init",
    privateChannel: "idle",
    channelName: null,
    httpStatus: null,
    authSummary: null,
  });
  const [authUserId, setAuthUserId] = useState<number | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  const fetchDashboardData = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    try {
      if (!silent) setIsLoading(true);
      const response = await api.get(
        "/provider/dashboard",
        silent ? { params: { _rt: Date.now() } } : undefined
      );
      const raw = response.data;
      const dashboard = unwrapDashboardPayload(raw);
      const pid = extractProviderIdFromDashboard(raw) ?? (dashboard ? extractProviderIdFromDashboard(dashboard) : null);
      if (pid != null) setProviderId(pid);
      const nextData = dashboard ?? (raw != null && typeof raw === "object" ? (raw as DashboardResponse) : null);
      if (nextData) {
        setData(nextData);
        setLastFetchedAt(Date.now());
      }
    } catch (err: unknown) {
      console.error("Fetch Error:", err);
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object"
          ? String((err.response.data as { message?: string }).message ?? err.message)
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      setError(msg);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  /** When WebSocket events never match your Laravel channel, polling still refreshes the list. Set `NEXT_PUBLIC_PROVIDER_DASHBOARD_POLL_MS=0` to disable. */
  useEffect(() => {
    if (providerId == null) return;
    const raw = process.env.NEXT_PUBLIC_PROVIDER_DASHBOARD_POLL_MS;
    const ms = raw === "0" ? 0 : Number(raw || 12000);
    if (!Number.isFinite(ms) || ms < 3000) return;
    const id = setInterval(() => void fetchDashboardData({ silent: true }), ms);
    return () => clearInterval(id);
  }, [providerId, fetchDashboardData]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        const uid = extractAuthUserId(me);
        if (!cancelled) setAuthUserId(uid);
      } catch {
        if (!cancelled) setAuthUserId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!providerId) {
      setRealtimeDiagnostics({
        wsState: "no_provider",
        privateChannel: "idle",
        channelName: null,
        httpStatus: null,
        authSummary: null,
      });
      return;
    }

    const wsSegment =
      (process.env.NEXT_PUBLIC_PROVIDER_WS_CHANNEL_PREFIX?.trim() || "provider").replace(/^private-/, "");
    const channelName = `${wsSegment}.${providerId}`;
    const privateChannelFullName = `private-${channelName}`;
    syncEchoBroadcastAuth();
    setRealtimeDiagnostics({
      wsState: "connecting",
      privateChannel: "subscribing",
      channelName,
      httpStatus: null,
      authSummary: null,
    });

    const pusher = (echo as unknown as { connector?: { pusher?: { connection?: { state?: string; bind: (ev: string, fn: (msg?: unknown) => void) => void; unbind: (ev: string, fn: (msg?: unknown) => void) => void } } } }).connector?.pusher;

    const followUpTimers: ReturnType<typeof setTimeout>[] = [];
    let debounceLead: ReturnType<typeof setTimeout> | null = null;
    const scheduleRealtimeRefresh = () => {
      if (debounceLead) clearTimeout(debounceLead);
      debounceLead = setTimeout(() => {
        debounceLead = null;
        void fetchDashboardData({ silent: true });
        while (followUpTimers.length) {
          const t = followUpTimers.pop();
          if (t) clearTimeout(t);
        }
        followUpTimers.push(
          setTimeout(() => void fetchDashboardData({ silent: true }), 450),
          setTimeout(() => void fetchDashboardData({ silent: true }), 1400)
        );
      }, 80);
    };

    const onConnectionMessage = (raw: unknown) => {
      const msg = raw as { channel?: string; event?: string };
      if (!msg?.channel || msg.channel !== privateChannelFullName) return;
      const ev = msg.event ?? "";
      if (ev.startsWith("pusher_internal:") || ev.startsWith("pusher:")) return;
      scheduleRealtimeRefresh();
    };

    const onWsConnected = () => {
      syncEchoBroadcastAuth();
      void fetchDashboardData({ silent: true });
    };
    const onWsError = () => {};
    const onStateChange = () => {
      const st = pusher?.connection?.state ?? "unknown";
      setRealtimeDiagnostics((prev) => ({ ...prev, wsState: st }));
    };
    pusher?.connection?.bind?.("connected", onWsConnected);
    pusher?.connection?.bind?.("error", onWsError);
    pusher?.connection?.bind?.("state_change", onStateChange);
    pusher?.connection?.bind?.("message", onConnectionMessage);
    onStateChange();

    const channel = echo.private(channelName) as unknown as {
      subscribed?: (cb: () => void) => unknown;
      error?: (cb: (status: unknown) => void) => unknown;
      listen: (ev: string, cb: (e: unknown) => void) => unknown;
      listenToAll?: (cb: (eventName: string, data: unknown) => void) => unknown;
    };
    channel.subscribed?.(() => {
      setRealtimeDiagnostics((prev) => ({
        ...prev,
        privateChannel: "subscribed",
        httpStatus: null,
        authSummary: null,
      }));
    });
    channel.error?.((status) => {
      const { httpStatus, label } = summarizePusherSubscriptionError(status);
      setRealtimeDiagnostics((prev) => ({
        ...prev,
        privateChannel: "error",
        httpStatus,
        authSummary: label,
      }));
    });

    /** Any app event on this private channel (name varies by Laravel class / broadcastAs). */
    channel.listenToAll?.(() => {
      scheduleRealtimeRefresh();
    });

    return () => {
      if (debounceLead) clearTimeout(debounceLead);
      for (const t of followUpTimers) clearTimeout(t);
      followUpTimers.length = 0;
      pusher?.connection?.unbind?.("message", onConnectionMessage);
      pusher?.connection?.unbind?.("connected", onWsConnected);
      pusher?.connection?.unbind?.("error", onWsError);
      pusher?.connection?.unbind?.("state_change", onStateChange);
      echo.leaveChannel(privateChannelFullName);
    };
  }, [providerId, fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardData,
    realtimeDiagnostics,
    authUserId,
    lastFetchedAt,
  };
};
