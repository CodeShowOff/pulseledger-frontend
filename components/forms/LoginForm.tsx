"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import axios from "axios";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { setAccessToken, setUser } = useAuthStore();
  const [deactivatedMessage, setDeactivatedMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        setDeactivatedMessage(null);
        const res = await api.post("/auth/login", data);
        const { data: userData } = res.data;
        const { tokens, ...user } = userData;
        setAccessToken(tokens.accessToken);
        setUser(user);

        // ✅ Save accessToken in a short-lived cookie (for SSR middleware)
        document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=900;`;

        toast.success("Login successful!");

        if (user.role === "coach") router.replace("/coach/dashboard");
        else if (user.role === "client") router.replace("/client/dashboard");
        else router.replace("/admin/dashboard");
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const errorData = (err as any).response?.data;
          const message = errorData?.message || (err as any).message || "Login failed";
          if (errorData?.requiresVerification && errorData?.email) {
            toast.info("Verification code sent to your email");
            router.push(`/auth/register/verify?email=${encodeURIComponent(errorData.email)}`);
            return;
          }
          if (String(message).toLowerCase().includes("deactivated")) {
            setDeactivatedMessage(
              "Your account has been deactivated by the admin. Please contact admin at mail.fitcoach@gmail.com to reactivate."
            );
          }
          toast.error(message);
          return;
        } else if (err instanceof Error) {
          const message = err.message || "Login failed";
          toast.error(message);
          return;
        }
        toast.error("Login failed");
      }
    },
    [setAccessToken, setUser, router]
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
        <label>Password</label>
        <input
          type="password"
          {...register("password")}
          className="auth-form__input"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="auth-form__error">{errors.password.message}</p>
        )}
      </div>

      <div className="auth-form__forgot">
        <button
          type="button"
          onClick={() => router.push("/auth/forgot-password")}
          className="auth-form__forgot-link"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-form__submit"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      {deactivatedMessage && (
        <p className="auth-form__error" style={{ marginTop: "0.75rem" }}>
          {deactivatedMessage}
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
      <button
        type="button"
        onClick={() => router.push("/auth/register")}
        className="w-full rounded-full border-2 border-green-600 text-green-700 bg-transparent py-2.5 px-5 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-green-600 hover:text-white"
      >
        Create an Account
      </button>
    </form>
  );
};
