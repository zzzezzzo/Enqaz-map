"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import api, { authService } from "@/services/auth";
import echo, { syncEchoBroadcastAuth } from "@/lib/echo";

// function extractAuthUserId(me: unknown): number | null {
//   if (me == null || typeof me !== "object") return null;
//   const o = me as Record<string, unknown>;
//   const pick = (v: unknown): number | null => {
//     if (typeof v === "number" && !Number.isNaN(v)) return v;
//     if (typeof v === "string") {
//       const n = Number(v);
//       return Number.isNaN(n) ? null : n;
//     }
//     return null;
//   };
//   const fromRecord = (rec: Record<string, unknown>): number | null =>
//     pick(rec.id) ?? pick(rec.user_id) ?? pick(rec.userId);

//   const direct = fromRecord(o);
//   if (direct != null) return direct;

//   const data = o.data;
//   if (data != null && typeof data === "object") {
//     const d = data as Record<string, unknown>;
//     const inner = fromRecord(d);
//     if (inner != null) return inner;
//     const attrs = d.attributes;
//     if (attrs != null && typeof attrs === "object") {
//       const a = fromRecord(attrs as Record<string, unknown>);
//       if (a != null) return a;
//     }
//     const user = d.user;
//     if (user != null && typeof user === "object") {
//       const u = fromRecord(user as Record<string, unknown>);
//       if (u != null) return u;
//     }
//   }

//   const user = o.user;
//   if (user != null && typeof user === "object") {
//     const inner = fromRecord(user as Record<string, unknown>);
//     if (inner != null) return inner;
//   }
//   return null;
// }

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
    /** Authenticated User model id from `/auth/me` (not necessarily the workshop `provider_id`). */
    const [authUserId, setAuthUserId] = useState<number | null>(null);
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/provider/dashboard'); 
        
        // #region agent log
        fetch('http://127.0.0.1:7526/ingest/e79cfa0e-58a0-4269-8cc0-77138c16c2b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'adcf85'},body:JSON.stringify({sessionId:'adcf85',runId:'post-fix',hypothesisId:'H1',location:'ProviderDashboard.ts:fetchDashboardData',message:'dashboard_ids_shape',data:{hasRootProviderId:response.data?.provider_id!=null&&response.data?.provider_id!==undefined,incomeRequestProviderId:response.data?.income_request?.provider_id??null,conditionUsesRoot:!!response.data?.provider_id},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        const pid = response.data?.income_request?.provider_id;
        if (pid !== undefined && pid !== null && pid !== "") {
          const n = typeof pid === "number" ? pid : Number(pid);
          if (!Number.isNaN(n)) setProviderId(n);
        }
        if (response.data) {
          setData(response.data); 
        }
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.response?.data?.message || err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
      fetchDashboardData();
    }, []);

    // useEffect(() => {
    //   let cancelled = false;
    //   (async () => {
    //     try {
    //       const me = await authService.getCurrentUser();
    //       const uid = me?.id;
    //       if (!cancelled) setAuthUserId(uid);
    //       const topKeys =
    //         me != null && typeof me === "object"
    //           ? Object.keys(me as object).slice(0, 12)
    //           : [];
    //       // #region agent log
    //       fetch('http://127.0.0.1:7526/ingest/e79cfa0e-58a0-4269-8cc0-77138c16c2b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'adcf85'},body:JSON.stringify({sessionId:'adcf85',runId:'post-fix',hypothesisId:'H6',location:'ProviderDashboard.ts:authMe',message:'auth_me_user_id',data:{authUserId:uid,meTopKeys:topKeys},timestamp:Date.now()})}).catch(()=>{});
    //       // #endregion
    //     } catch (err) {
    //       if (!cancelled) setAuthUserId(null);
    //       const status = axios.isAxiosError(err) ? err.response?.status ?? null : null;
    //       // #region agent log
    //       fetch('http://127.0.0.1:7526/ingest/e79cfa0e-58a0-4269-8cc0-77138c16c2b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'adcf85'},body:JSON.stringify({sessionId:'adcf85',runId:'post-fix',hypothesisId:'H6',location:'ProviderDashboard.ts:authMe',message:'auth_me_failed',data:{httpStatus:status},timestamp:Date.now()})}).catch(()=>{});
    //       // #endregion
    //     }
    //   })();
    //   return () => {
    //     cancelled = true;
    //   };
    // }, []);

    useEffect(() => {
      if (!providerId) {
        setRealtimeDiagnostics({
          wsState: "no_provider",
          privateChannel: "idle",
          channelName: null,
          httpStatus: null,
          authSummary: null,
        });
        // #region agent log
        fetch('http://127.0.0.1:7526/ingest/e79cfa0e-58a0-4269-8cc0-77138c16c2b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'adcf85'},body:JSON.stringify({sessionId:'adcf85',runId:'post-fix',hypothesisId:'H1',location:'ProviderDashboard.ts:realtimeEffect',message:'skipped_no_providerId',data:{},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return;
      }

      const channelName = `provider.${providerId}`;
      syncEchoBroadcastAuth();
      setRealtimeDiagnostics({
        wsState: "connecting",
        privateChannel: "subscribing",
        channelName,
        httpStatus: null,
        authSummary: null,
      });
      // #region agent log
      fetch('http://127.0.0.1:7526/ingest/e79cfa0e-58a0-4269-8cc0-77138c16c2b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'adcf85'},body:JSON.stringify({sessionId:'adcf85',runId:'post-fix',hypothesisId:'H3',location:'ProviderDashboard.ts:realtimeEffect',message:'reverb_env_flags',data:{hasAppKey:!!process.env.NEXT_PUBLIC_REVERB_APP_KEY,hasHost:!!process.env.NEXT_PUBLIC_REVERB_HOST,hasPort:process.env.NEXT_PUBLIC_REVERB_PORT!=null&&process.env.NEXT_PUBLIC_REVERB_PORT!=='',scheme:String(process.env.NEXT_PUBLIC_REVERB_SCHEME??''),hasAuthHeader:!!(typeof window!=='undefined'&&localStorage.getItem('token'))},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      const pusher = (echo as unknown as { connector?: { pusher?: { connection?: { state?: string; bind: (ev: string, fn: () => void) => void; unbind: (ev: string, fn: () => void) => void } } } }).connector?.pusher;
      const onWsConnected = () => {
        // #region agent log
        fetch('http://127.0.0.1:7526/ingest/e79cfa0e-58a0-4269-8cc0-77138c16c2b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'adcf85'},body:JSON.stringify({sessionId:'adcf85',runId:'post-fix',hypothesisId:'H5',location:'ProviderDashboard.ts:pusher',message:'pusher_socket_connected',data:{channelName},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      };
      const onWsError = () => {
        // #region agent log
        fetch('http://127.0.0.1:7526/ingest/e79cfa0e-58a0-4269-8cc0-77138c16c2b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'adcf85'},body:JSON.stringify({sessionId:'adcf85',runId:'post-fix',hypothesisId:'H5',location:'ProviderDashboard.ts:pusher',message:'pusher_connection_error',data:{channelName},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      };
      const onStateChange = () => {
        const st = pusher?.connection?.state ?? "unknown";
        setRealtimeDiagnostics((prev) => ({ ...prev, wsState: st }));
      };
      pusher?.connection?.bind?.("connected", onWsConnected);
      pusher?.connection?.bind?.("error", onWsError);
      pusher?.connection?.bind?.("state_change", onStateChange);
      onStateChange();

      const channel = echo.private(channelName) as unknown as {
        subscribed?: (cb: () => void) => unknown;
        error?: (cb: (status: unknown) => void) => unknown;
        listen: (ev: string, cb: (e: unknown) => void) => unknown;
      };
      channel.subscribed?.(() => {
        setRealtimeDiagnostics((prev) => ({
          ...prev,
          privateChannel: "subscribed",
          httpStatus: null,
          authSummary: null,
        }));
        // #region agent log
        fetch('http://127.0.0.1:7526/ingest/e79cfa0e-58a0-4269-8cc0-77138c16c2b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'adcf85'},body:JSON.stringify({sessionId:'adcf85',runId:'post-fix',hypothesisId:'H2',location:'ProviderDashboard.ts:privateChannel',message:'private_channel_subscribed',data:{channelName},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      });
      channel.error?.((status) => {
        const { httpStatus, label } = summarizePusherSubscriptionError(status);
        setRealtimeDiagnostics((prev) => ({
          ...prev,
          privateChannel: "error",
          httpStatus,
          authSummary: label,
        }));
        // #region agent log
        fetch('http://127.0.0.1:7526/ingest/e79cfa0e-58a0-4269-8cc0-77138c16c2b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'adcf85'},body:JSON.stringify({sessionId:'adcf85',runId:'post-fix',hypothesisId:'H2',location:'ProviderDashboard.ts:privateChannel',message:'private_channel_subscription_error',data:{channelName,httpStatus,summaryLabel:label},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      });
      channel.listen(".customer-create-request", (e: any) => {
        fetchDashboardData();
      });

      return () => {
        pusher?.connection?.unbind?.("connected", onWsConnected);
        pusher?.connection?.unbind?.("error", onWsError);
        pusher?.connection?.unbind?.("state_change", onStateChange);
        echo.leaveChannel(`private-${channelName}`);
      };
    }, [providerId]);
  
    return { data, isLoading, error, refetch: fetchDashboardData, realtimeDiagnostics, authUserId };
  };