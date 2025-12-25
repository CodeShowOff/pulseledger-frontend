"use client";

import React, { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const RegisterSchema = z
  .object({
    fullName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["coach", "client"]),
    phone: z.string().min(7),
    whatsappNumber: z.string().min(7),
    coachId: z.string().optional(),
    companyName: z.string().optional(),
    coachReferralCode: z.string().optional(), // For coach-to-coach referrals
  })
  .refine(
    (data) => {
      if (data.role === "client") {
        return !!data.coachId;
      }
      return true;
    },
    {
      message: "Coach referral code is required for clients",
      path: ["coachId"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "coach") {
        return !!data.companyName && data.companyName.length >= 2;
      }
      return true;
    },
    {
      message: "Company name is required for coaches",
      path: ["companyName"],
    }
  );


type RegisterFormData = z.infer<typeof RegisterSchema>;

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { role: "client" },
  });

  // Auto-fill coach referral code if provided in query (?coach=...)
  useEffect(() => {
    const coachCode = searchParams.get("coach");
    if (coachCode) {
      // setValue is available via register's form methods
      // But react-hook-form requires explicit import; we can use direct DOM fallback if needed.
      const input = document.getElementById("coachId") as HTMLInputElement | null;
      if (input && !input.value) {
        input.value = coachCode;
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  }, [searchParams]);

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
        // Ensure coachId is only sent for clients. If role is coach, drop empty coachId to avoid backend Joi "not allowed to be empty" error.
        const payload: any = { ...data };
        if (payload.role === "coach") {
          delete payload.coachId;
          // Keep coachReferralCode only if it has a value
          if (!payload.coachReferralCode?.trim()) {
            delete payload.coachReferralCode;
          }
        } else {
          // For clients, remove coachReferralCode as it's not applicable
          delete payload.coachReferralCode;
        }
        const res = await api.post("/auth/register", payload);
        const email = res.data?.data?.email ?? payload.email;
        toast.success("Verification code sent! Please check your email.");
        router.replace(`/auth/register/verify?email=${encodeURIComponent(email)}`);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const msg = (err as any).response?.data?.message || (err as any).message || "Registration failed";
          toast.error(msg);
        } else if (err instanceof Error) {
          toast.error(err.message || "Registration failed");
        } else {
          toast.error("Registration failed");
        }
      }
    },
    [router]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <div className="auth-form__field">
        <label>Full Name</label>
        <input
          type="text"
          {...register("fullName")}
          className="auth-form__input"
          placeholder="John Doe"
        />
        {errors.fullName && (
          <p className="auth-form__error">{errors.fullName.message}</p>
        )}
      </div>

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
        <label>Phone (with country code)</label>
        <input
          type="tel"
          {...register("phone")}
          className="auth-form__input"
          placeholder="+919876543210"
        />
        {errors.phone && <p className="auth-form__error">{errors.phone.message}</p>}
      </div>

      <div className="auth-form__field">
        <label>WhatsApp Number</label>
        <input
          type="tel"
          {...register("whatsappNumber")}
          className="auth-form__input"
          placeholder="+919876543210"
        />
        {errors.whatsappNumber && (
          <p className="auth-form__error">{errors.whatsappNumber.message}</p>
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
      <div className="auth-form__field">
        <label>Registering as</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="client"
              {...register("role")}
            />
            <span>Client</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="coach"
              {...register("role")}
            />
            <span>Coach</span>
          </label>
        </div>
        {errors.role && (
          <p className="auth-form__error">{errors.role.message}</p>
        )}
      </div>
      {watch("role") === "coach" && (
        <>
          <div className="auth-form__field">
            <label htmlFor="companyName">Company Name</label>
            <input
              id="companyName"
              {...register("companyName", { required: "Company name is required" })}
              placeholder="e.g., FitLife Coaching"
              className="auth-form__input"
            />
            {errors.companyName && (
              <p className="auth-form__error">{errors.companyName.message}</p>
            )}
          </div>
          <div className="auth-form__field">
            <label htmlFor="coachReferralCode">Referral Code (Optional)</label>
            <input
              id="coachReferralCode"
              {...register("coachReferralCode")}
              placeholder="e.g., AB-4J7XZ2"
              className="auth-form__input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Have a referral code from another coach? Enter it here.
            </p>
            {errors.coachReferralCode && (
              <p className="auth-form__error">{errors.coachReferralCode.message}</p>
            )}
          </div>
        </>
      )}
      {watch("role") === "client" && (
        <div className="auth-form__field">
          <label htmlFor="coachId">Coach Referral Code</label>
          <input
            id="coachId"
            {...register("coachId", { required: "Coach referral code is required" })}
            placeholder="e.g., AB-4J7XZ2"
            className="auth-form__input"
          />
          {errors.coachId && (
            <p className="auth-form__error">{errors.coachId.message}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-form__submit auth-form__submit--secondary"
      >
        {isSubmitting ? "Creating account..." : "Register"}
      </button>
    </form>
  );
};