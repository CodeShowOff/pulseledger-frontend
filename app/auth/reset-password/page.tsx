"use client";

import { Suspense } from "react";
import { AuthCard } from "@/components/shared/AuthCard";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

function ResetPasswordContent() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the code we emailed you and choose a new password"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading reset form…</p>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
