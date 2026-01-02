import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestHeaders } from "axios";
import { useAuthStore } from "./store";

// Always prefer same-origin proxy so auth cookies (refreshToken) are set for the frontend domain
// In production on Vercel, ensure `next.config.js` rewrites `/api/*` to your Render backend.
// In local development, rewrites also route to localhost backend.
const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

// Dedicated client for refreshing (no interceptors) to avoid recursion and to
// coordinate single-flight refresh across concurrent requests.
const refreshClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

let refreshInFlight: Promise<{ accessToken: string; user?: Record<string, unknown> } | null> | null = null;

async function refreshSingleFlight() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const res = await refreshClient.post("/auth/refresh");
      const accessToken: string | undefined = res.data?.accessToken;
      const user = res.data?.user;
      if (!accessToken) return null;
      return { accessToken, user };
    } catch (err: unknown) {
      // If another tab refreshed first, the backend may reject the old token with a
      // "already refreshed" message. A single retry will use the updated cookie.
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = String((err.response?.data as any)?.message || "");
        const code = (err.response?.data as any)?.code;
        const isAlreadyRefreshed =
          status === 403 && (/already\s+refreshed/i.test(msg) || code === "TOKEN_ALREADY_REFRESHED");

        const isTokenNotFound = status === 403 && code === "TOKEN_NOT_FOUND";

        if (isAlreadyRefreshed || isTokenNotFound) {
          const retryRes = await refreshClient.post("/auth/refresh");
          const accessToken: string | undefined = retryRes.data?.accessToken;
          const user = retryRes.data?.user;
          if (!accessToken) return null;
          return { accessToken, user };
        }
      }
      throw err;
    }
  })()
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export type RefreshAuthResult = { accessToken: string; user?: Record<string, unknown> } | null;

export async function refreshAuthSingleFlight(): Promise<RefreshAuthResult> {
  return refreshSingleFlight();
}

// Axios interceptor for attaching access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers)
      config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Auto-refresh interceptor
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);
    const originalRequest = (error.config || {}) as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Handle subscription expired error (403 with specific error code)
    if (status === 403) {
      const respData = error.response?.data as any;
      const msg = String(respData?.message || "").toLowerCase();
      const errorCode = respData?.error || respData?.code;
      
      // Redirect to subscription payment page if subscription expired
      if (errorCode === "SUBSCRIPTION_EXPIRED") {
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          window.location.href = `/coach/platform-fee?returnUrl=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(error);
      }
      
      // Logout only on account deactivation (check error code first, then message as fallback)
      const isAccountDeactivated = errorCode === "ACCOUNT_DEACTIVATED" || /account is deactivated|deactivated/.test(msg);
      if (isAccountDeactivated) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }

    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      // Do not attempt refresh for login requests; they should show invalid credentials
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;
      try {
        const refreshed = await refreshSingleFlight();
        const newToken = refreshed?.accessToken;
        const userData = refreshed?.user;

        if (!newToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        useAuthStore.getState().setAccessToken(newToken);
        
        // Update user data if provided (keeps state in sync)
        if (userData) {
          useAuthStore.getState().setUser(userData);
        }

        // ✅ Update short-lived cookie so Next.js middleware can read it
        if (typeof document !== "undefined") {
          document.cookie = `accessToken=${newToken}; path=/; max-age=900;`;
        }

        if (!originalRequest.headers) originalRequest.headers = {} as AxiosRequestHeaders;
        (originalRequest.headers as AxiosRequestHeaders).Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Only force logout when the refresh attempt proves the session is invalid.
        // Network errors, timeouts, and 5xx should NOT kick the user out.
        if (axios.isAxiosError(refreshError)) {
          const s = refreshError.response?.status;
          if (s === 401 || s === 403) {
            useAuthStore.getState().logout();
          }
        }

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
