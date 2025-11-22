"use client";

import { AuthCard } from "@/components/shared/AuthCard";
import { LoginForm } from "@/components/forms/LoginForm";
import { useAuthStore } from "@/lib/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllowedBasePath } from "@/lib/auth";

export default function LoginPage() {
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
    <AuthCard title="Welcome Back" subtitle="Sign in to continue">
      <LoginForm />
    </AuthCard>
  );
}
