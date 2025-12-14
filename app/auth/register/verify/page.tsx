"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthCard } from "@/components/shared/AuthCard";
import api from "@/lib/axios";
import { useAuthStore } from "@/lib/store";

const VerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "Enter 6-digit code"),
});

type VerifyFormData = z.infer<typeof VerifySchema>;

function VerifyRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken, setUser } = useAuthStore();

  const presetEmail = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(VerifySchema),
    defaultValues: { email: presetEmail },
  });

  const onSubmit = async (data: VerifyFormData) => {
    try {
      const res = await api.post("/auth/register/verify-otp", data);
      const { data: userData } = res.data;
      const { tokens, ...user } = userData;
      setAccessToken(tokens.accessToken);
      setUser(user);
      document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=900;`;
      toast.success("Email verified and account created!");

      if (user.role === "coach") router.replace("/coach/dashboard");
      else if (user.role === "client") router.replace("/client/dashboard");
      else router.replace("/admin/dashboard");
    } catch (err: unknown) {
      let errorMessage = "Verification failed";
      if (isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your email"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <div className="auth-form__field">
          <label>Email</label>
          <input
            type="email"
            {...register("email")}
            className="auth-form__input"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="auth-form__error">{errors.email.message}</p>
          )}
        </div>

        <div className="auth-form__field">
          <label>Verification Code</label>
          <input
            type="text"
            {...register("otp")}
            className="auth-form__input tracking-[0.3em] text-center"
            placeholder="123456"
            maxLength={6}
          />
          {errors.otp && (
            <p className="auth-form__error">{errors.otp.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-form__submit auth-form__submit--secondary"
        >
          {isSubmitting ? "Verifying..." : "Verify & Continue"}
        </button>

        <p className="mt-3 text-xs text-slate-500 text-center">
          Didn&apos;t get a code? Check your spam folder or
          {" "}
          <button
            type="button"
            className="text-primary-600 hover:underline"
            onClick={async () => {
              const email = (presetEmail || "").trim();
              if (!email) {
                toast.error("Please enter your email above first.");
                return;
              }
              try {
                await api.post("/auth/register/resend-otp", { email });
                toast.success("We've sent a new verification code.");
              } catch (err: unknown) {
                let errorMessage = "Failed to resend code";
                if (isAxiosError(err)) {
                  errorMessage = err.response?.data?.message || errorMessage;
                }
                toast.error(errorMessage);
              }
            }}
          >
            request a new one
          </button>
          .
        </p>
      </form>
    </AuthCard>
  );
}

export default function VerifyRegistrationPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading verification form…</p>}>
      <VerifyRegistrationContent />
    </Suspense>
  );
}

function isAxiosError(error: unknown): error is { response?: { data?: { message?: string } } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  );
}
