"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const ResetSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().length(6, "Enter 6-digit code"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof ResetSchema>;

export const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetEmail = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: presetEmail,
    },
  });

  const onSubmit = useCallback(
    async (data: ResetFormData) => {
      try {
        const payload = {
          email: data.email,
          otp: data.otp,
          newPassword: data.newPassword,
        };
        await api.post("/auth/reset-password", payload);
        toast.success("Password reset successfully. You can now log in.");
        router.replace("/auth/login");
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const msg = (err as any).response?.data?.message || (err as any).message || "Failed to reset password. Please try again.";
          toast.error(msg);
        } else if (err instanceof Error) {
          toast.error(err.message || "Failed to reset password. Please try again.");
        } else {
          toast.error("Failed to reset password. Please try again.");
        }
      }
    },
    [router]
  );

  return (
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
        <label>Reset Code</label>
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

      <div className="auth-form__field">
        <label>New Password</label>
        <input
          type="password"
          {...register("newPassword")}
          className="auth-form__input"
          placeholder="••••••••"
        />
        {errors.newPassword && (
          <p className="auth-form__error">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="auth-form__field">
        <label>Confirm New Password</label>
        <input
          type="password"
          {...register("confirmPassword")}
          className="auth-form__input"
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="auth-form__error">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-form__submit auth-form__submit--secondary"
      >
        {isSubmitting ? "Resetting..." : "Reset password"}
      </button>

      <p className="mt-3 text-xs text-slate-500 text-center">
        Didn&apos;t get a code? Check your spam folder or
        {" "}
        <button
          type="button"
          className="text-primary-600 hover:underline"
          onClick={async () => {
            const email = presetEmail || "";
            if (!email) {
              toast.error("Please enter your email above first.");
              return;
            }
            try {
              await api.post("/auth/forgot-password", { email });
              toast.success("We've sent a new reset code.");
            } catch (err: unknown) {
              if (axios.isAxiosError(err)) {
                const msg = (err as any).response?.data?.message || (err as any).message || "Failed to resend reset code.";
                toast.error(msg);
              } else if (err instanceof Error) {
                toast.error(err.message || "Failed to resend reset code.");
              } else {
                toast.error("Failed to resend reset code.");
              }
            }
          }}
        >
          request a new one
        </button>
        .
      </p>
    </form>
  );
};
