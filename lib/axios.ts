import axios from "axios";
import { useAuthStore } from "./store";

const api = axios.create({
  // Prefer same-origin proxy via Next.js rewrites to avoid cross-site cookies in dev
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
  withCredentials: true, // send cookies for refresh/logout
});

// Axios interceptor for attaching access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers)
      config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    // Handle subscription expired error (403 with specific error code)
    if (status === 403) {
      const msg = String(error.response?.data?.message || '').toLowerCase();
      const errorCode = error.response?.data?.error || error.response?.data?.code;
      
      // Redirect to subscription payment page if subscription expired
      if (errorCode === "SUBSCRIPTION_EXPIRED") {
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          window.location.href = `/coach/platform-subscription?returnUrl=${encodeURIComponent(currentPath)}`;
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
      (originalRequest as any)._retry = true;
      try {
        const refreshRes = await api.post("/auth/refresh");
        const newToken = refreshRes.data.accessToken;
        const userData = refreshRes.data.user;

        useAuthStore.getState().setAccessToken(newToken);
        
        // Update user data if provided (keeps state in sync)
        if (userData) {
          useAuthStore.getState().setUser(userData);
        }

        // ✅ Update short-lived cookie so Next.js middleware can read it
        document.cookie = `accessToken=${newToken}; path=/; max-age=900;`;

        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
