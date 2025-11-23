"use client";

import { AuthCard } from "@/components/shared/AuthCard";
import { RegisterForm } from "@/components/forms/RegistrationForm";
import { useAuthStore } from "@/lib/store";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllowedBasePath } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (!hydrated) return;
    if (accessToken && role) {
      const base = getAllowedBasePath(role);
      router.replace(`${base}/dashboard`);
    }
  }, [hydrated, accessToken, role, router]);

  return (
    <AuthCard title="Create Account" subtitle="Join as a coach or client">
      <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: "1.4", margin: 0 }}>
          <strong>Note:</strong> If you want to use this platform without any coach, use referral code: <span style={{ fontWeight: 600, color: "#1f2937" }}>PU-PZMQ22</span>
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading form…</p>}>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}
 