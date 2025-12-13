"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/axios";

/**
 * AuthGuard - Requires authentication but accepts any role (client/coach/admin)
 * Use this for pages that all authenticated users can access like /profile, /notifications, etc.
 * For role-specific pages, use RoleGuard instead.
 */
export default function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const triedBootstrapRef = useRef(false);
  const triedRefreshRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return; // wait for persisted state

    // Skip for auth pages to avoid redirect loops
    if (pathname?.startsWith("/auth")) {
      return;
    }

    // Ensure cookie is present if we have a token
    if (accessToken && typeof document !== "undefined") {
      const hasCookie = /(?:^|; )accessToken=/.test(document.cookie);
      if (!hasCookie) {
        document.cookie = `accessToken=${accessToken}; path=/; max-age=900;`;
      }
    }

    // Attempt single bootstrap from cookie if token missing
    if (!accessToken && !triedBootstrapRef.current) {
      triedBootstrapRef.current = true;
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )accessToken=([^;]+)/);
        const cookieToken = match ? decodeURIComponent(match[1]) : null;
        if (cookieToken) {
          setAccessToken(cookieToken);
          return; // will re-run effect with token
        }
      }
    }

    // If still no token, try to refresh before redirecting to login
    if (!accessToken && !triedRefreshRef.current) {
      triedRefreshRef.current = true;
      
      // Attempt refresh from httpOnly cookie
      api.post("/auth/refresh")
        .then((res) => {
          const newToken = res.data?.accessToken;
          const userData = res.data?.user;
          if (newToken) {
            setAccessToken(newToken);
            // Update user data if provided
            if (userData) {
              useAuthStore.getState().setUser(userData);
            }
            if (typeof document !== "undefined") {
              document.cookie = `accessToken=${newToken}; path=/; max-age=900;`;
            }
          }
        })
        .catch(() => {
          // Refresh failed, redirect to login
          const redirect = encodeURIComponent(pathname || "/");
          router.replace(`/auth/login?redirect=${redirect}`);
        });
      return;
    }

    // If still no token after all attempts, redirect to login
    if (!accessToken) {
      if (!redirectTimerRef.current) {
        redirectTimerRef.current = setTimeout(() => {
          const redirect = encodeURIComponent(pathname || "/");
          router.replace(`/auth/login?redirect=${redirect}`);
        }, 250); // short grace period
      }
      return;
    } else if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  }, [hydrated, accessToken, pathname, router, setAccessToken]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  return null;
}
