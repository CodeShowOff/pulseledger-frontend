"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/lib/store";

interface SubscriptionStatus {
  status: "trial" | "active" | "expired" | "suspended";
  isValid: boolean;
  daysRemaining: number;
}

const ALLOWED_ROUTES_FOR_EXPIRED = [
  "/coach/platform-subscription",
  "/auth/logout",
  "/profile",
  "/notifications",
];

export default function CoachSubscriptionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [isChecking, setIsChecking] = useState(true);

  // Only fetch subscription status for coaches
  const { data: subscription, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["platformSubscription"],
    queryFn: async () => {
      const res = await api.get("/platform-subscription/status");
      return res.data.data;
    },
    enabled: user?.role === "coach",
  });

  useEffect(() => {
    // Not a coach, allow access
    if (user?.role !== "coach") {
      setIsChecking(false);
      return;
    }

    // Still loading subscription data
    if (isLoading) {
      return;
    }

    // Check if current route is allowed for expired coaches
    const isAllowedRoute = ALLOWED_ROUTES_FOR_EXPIRED.some((route) =>
      pathname.startsWith(route)
    );

    // If subscription is expired and user is not on an allowed route, redirect
    if (subscription && subscription.status === "expired" && !isAllowedRoute) {
      router.push(`/coach/platform-subscription?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsChecking(false);
  }, [subscription, isLoading, pathname, router, user]);

  // Show loading state while checking
  if (isChecking || (user?.role === "coach" && isLoading)) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#6b7280" }}>Checking subscription status...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
