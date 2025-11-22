"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { getAllowedBasePath } from "@/lib/auth";

type Role = "client" | "coach" | "admin";

export default function RoleGuard({ role }: { role: Role }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const triedBootstrapRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return; // wait for persisted state

    // If we already have an access token, ensure cookie is present (refresh SSR compatibility)
    // Public auth pages (login, register, verify, forgot/reset password) should
    // always be accessible without an access token. If a layout ever wraps
    // `/auth/*` with this guard, bail out early to avoid redirect loops.
    if (pathname?.startsWith("/auth")) {
      return;
    }

    if (accessToken && typeof document !== "undefined") {
      const hasCookie = /(?:^|; )accessToken=/.test(document.cookie);
      if (!hasCookie) {
        // 15m (900s) like initial login; keep consistent
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

    // If still no token after bootstrap attempt, delay redirect slightly to allow any async refresh logic.
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

    // If the logged-in user doesn't match the required role, send them to their own base dashboard
    if (user?.role && user.role !== role) {
      const ownBase = getAllowedBasePath(user.role);
      router.replace(`${ownBase}/dashboard`);
      return;
    }

    // Enforce role base path for the required role on client-side navigation as a fallback
    const allowedBase = getAllowedBasePath(role);
    if (!pathname.startsWith(allowedBase)) {
      router.replace(`${allowedBase}/dashboard`);
    }
  }, [hydrated, accessToken, user?.role, pathname, role]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  return null;
}
