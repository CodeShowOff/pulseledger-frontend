"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { attachProactiveRefresh } from "@/lib/tokenRefresh";

export default function AuthCookieSync() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (accessToken) {
      // Keep a short-lived cookie so the Proxy can authorize SSR/hard reloads
      document.cookie = `accessToken=${accessToken}; path=/; max-age=900;`;
    } else {
      // Clear if user logged out
      document.cookie = "accessToken=; Max-Age=0; path=/;";
    }
  }, [accessToken]);

  // Proactive token refresh lifecycle
  useEffect(() => {
    const cleanup = attachProactiveRefresh(accessToken, setAccessToken);
    return () => cleanup();
  }, [accessToken, setAccessToken]);

  return null;
}
