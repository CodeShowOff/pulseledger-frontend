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
      <Suspense fallback={<p className="text-sm text-gray-500">Loading form…</p>}>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}
 