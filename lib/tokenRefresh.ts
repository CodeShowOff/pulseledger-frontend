// Proactive access token refresh with single-flight and cross-tab coordination
// - Schedules a refresh shortly before access token expiry
// - Uses BroadcastChannel to avoid duplicate refreshes across tabs

import api from "./axios";

type SetAccessToken = (token: string | null) => void;

// Lightweight Base64URL JWT decode (no signature verification)
export function decodeJwt(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;
let inflight: Promise<string | null> | null = null;
let channel: BroadcastChannel | null = null;

function ensureChannel() {
  if (typeof window === "undefined") return null;
  if (!channel) channel = new BroadcastChannel("auth-token-refresh");
  return channel;
}

async function refreshOnce(setAccessToken: SetAccessToken): Promise<string | null> {
  if (inflight) return inflight;
  const ch = ensureChannel();
  inflight = (async () => {
    try {
      ch?.postMessage({ type: "refresh-start" });
      const res = await api.post("/auth/refresh");
      const newToken: string | undefined = res.data?.accessToken;
      if (newToken) {
        setAccessToken(newToken);
        // Also update the short-lived cookie (SSR/proxy)
        if (typeof document !== "undefined") {
          document.cookie = `accessToken=${newToken}; path=/; max-age=900;`;
        }
        ch?.postMessage({ type: "refresh-done", accessToken: newToken });
        return newToken;
      }
      return null;
    } catch (e) {
      ch?.postMessage({ type: "refresh-error" });
      throw e;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function schedule(accessToken: string, setAccessToken: SetAccessToken) {
  const decoded = decodeJwt(accessToken);
  if (!decoded?.exp) return;
  const expMs = decoded.exp * 1000;
  const now = Date.now();
  // refresh 60s before expiry, with a minimum delay to avoid immediate bursts
  const skewMs = 60_000;
  let delay = expMs - now - skewMs;
  if (delay < 5_000) delay = 5_000; // 5s minimum

  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    try {
      const newToken = await refreshOnce(setAccessToken);
      if (newToken) schedule(newToken, setAccessToken);
    } catch (e) {
      // On failure, do not reschedule here; interceptor will handle 401s
    }
  }, delay);
}

export function attachProactiveRefresh(accessToken: string | null, setAccessToken: SetAccessToken) {
  if (typeof window === "undefined") return () => {};

  const ch = ensureChannel();
  const listener = (event: MessageEvent) => {
    const msg = event.data;
    if (msg?.type === "refresh-done" && msg.accessToken) {
      // Another tab refreshed; adopt new token and reschedule
      setAccessToken(msg.accessToken);
      if (typeof document !== "undefined") {
        document.cookie = `accessToken=${msg.accessToken}; path=/; max-age=900;`;
      }
      schedule(msg.accessToken, setAccessToken);
    }
  };
  ch?.addEventListener("message", listener as any);

  if (accessToken) schedule(accessToken, setAccessToken);

  // Cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    ch?.removeEventListener("message", listener as any);
  };
}

// Manual trigger (optional external use)
export async function refreshAccessTokenNow(setAccessToken: SetAccessToken) {
  return refreshOnce(setAccessToken);
}
