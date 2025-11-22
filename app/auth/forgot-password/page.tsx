"use client";

import { AuthCard } from "@/components/shared/AuthCard";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset code"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
