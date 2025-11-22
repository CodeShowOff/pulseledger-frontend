"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

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

    // If still no token, redirect to login
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
