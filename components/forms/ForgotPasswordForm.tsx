"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ForgotSchema = z.object({
  email: z.string().email(),
});

type ForgotFormData = z.infer<typeof ForgotSchema>;

export const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(ForgotSchema),
  });

  const onSubmit = useCallback(
    async (data: ForgotFormData) => {
      try {
        await api.post("/auth/forgot-password", data);
        toast.success("If an account exists, a reset code has been sent.");
        router.replace(`/auth/reset-password?email=${encodeURIComponent(data.email)}`);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const msg = (err as any).response?.data?.message || (err as any).message || "Failed to request password reset. Please try again.";
          toast.error(msg);
        } else if (err instanceof Error) {
          toast.error(err.message || "Failed to request password reset. Please try again.");
        } else {
          toast.error("Failed to request password reset. Please try again.");
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-form__submit auth-form__submit--secondary"
      >
        {isSubmitting ? "Sending code..." : "Send reset code"}
      </button>
    </form>
  );
};
