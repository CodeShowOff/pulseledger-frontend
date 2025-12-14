"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      // User is logged in, redirect to their role-specific dashboard
      if (user.role === "coach") {
        router.replace("/coach/dashboard");
      } else if (user.role === "client") {
        router.replace("/client/dashboard");
      } else if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        // Fallback if role is unknown
        router.replace("/");
      }
    } else {
      // User is not logged in, redirect to home page
      router.replace("/");
    }
  }, [user, router]);

  // Show loading state while redirecting
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#f3f4f6"
    }}>
      <div style={{
        textAlign: "center",
        padding: "2rem"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #3b82f6",
          borderRadius: "50%",
          margin: "0 auto 1rem",
          animation: "spin 1s linear infinite"
        }} />
        <p style={{
          color: "#6b7280",
          fontSize: "0.875rem"
        }}>
          Loading dashboard...
        </p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
