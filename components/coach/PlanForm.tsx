// src/components/coach/PlanForm.tsx
"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { CLIENT_PLANS_KEY } from "@/lib/queries/plans";

const planSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  goal: z.string().max(100).optional().nullable(),
  price: z.coerce.number().min(0).optional(),
  durationWeeks: z.coerce.number().min(1).max(52).optional(),
  isDefault: z.boolean().optional(),
});

type PlanFormType = z.infer<typeof planSchema>;

export default function PlanForm({ plan, onClose, variant = "modal" }: { plan?: any; onClose: () => void; variant?: "modal" | "page" }) {
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<PlanFormType>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: "",
      price: 0,
      durationWeeks: 4,
      isDefault: false,
    },
  });

  const watchIsDefault = watch("isDefault");
  const watchPrice = watch("price");

  useEffect(() => {
    if (plan) {
      // populate for edit
      reset({
        title: plan.title,
        description: plan.description ?? "",
        goal: plan.goal ?? "",
        price: typeof plan.price === "number" ? plan.price : 0,
        durationWeeks: plan.durationWeeks ?? 4,
        isDefault: !!plan.isDefault,
      });
    }
  }, [plan, reset]);

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post("/plans", payload),
    onSuccess: () => {
      toast.success("Plan created");
      queryClient.invalidateQueries({ queryKey: ["coachPlans"] });
      queryClient.invalidateQueries({ queryKey: CLIENT_PLANS_KEY });
      onClose();
    },
    onError: (err: AxiosError<{ message?: string }>) => toast.error((err.response?.data as { message?: string })?.message || "Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.patch(`/plans/${id}`, payload),
    onSuccess: () => {
      toast.success("Plan updated");
      queryClient.invalidateQueries({ queryKey: ["coachPlans"] });
      queryClient.invalidateQueries({ queryKey: CLIENT_PLANS_KEY });
      onClose();
    },
    onError: (err: AxiosError<{ message?: string }>) => toast.error((err.response?.data as { message?: string })?.message || "Update failed"),
  });

  const onSubmit = (data: PlanFormType) => {
    const payload = {
      ...data,
      price: typeof data.price === "number" ? data.price : 0,
    };

    if (plan) {
      updateMutation.mutate({ id: plan._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Page variant (no overlay/modal) - use admin/coach design system
  if (variant === "page") {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="coach-plan-form">
        <div className="coach-plan-form__section coach-plan-form__section--main">
          <div className="coach-plan-form__row coach-plan-form__row--title">
            <div className="auth-form__field coach-plan-form__field--wide">
              <label className="auth-form__label">Title</label>
              <input
                {...register("title")}
                className="auth-form__input coach-plan-form__input--lg"
                placeholder="Summer shred, Beginner strength, ..."
              />
              {errors.title && (
                <p className="auth-form__error">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="coach-plan-form__row coach-plan-form__row--default">
            <div className="coach-plan-form__default-toggle">
              <div>
                <label className="auth-form__label">Default plan</label>
                <p className="coach-plan-form__hint">
                  Used automatically when a client has no active subscription.
                </p>
              </div>
              <input
                type="checkbox"
                {...register("isDefault")}
              />
            </div>
          </div>

          <div className="coach-plan-form__row coach-plan-form__row--description">
            <div className="coach-plan-form__field coach-plan-form__field--wide">
              <label className="auth-form__label">Short description</label>
              <input
                {...register("description")}
                type="text"
                className="auth-form__input coach-plan-form__input--lg"
                placeholder="Who is this plan for and what will they achieve?"
              />
            </div>
          </div>

          <div className="coach-plan-form__row coach-plan-form__row--meta">
            <div className="auth-form__field">
              <label className="auth-form__label">Goal</label>
              <input
                {...register("goal")}
                className="auth-form__input"
                placeholder="Weight loss, strength, marathon prep..."
              />
              {errors.goal && (
                <p className="auth-form__error">{errors.goal.message}</p>
              )}
            </div>

            <div className="auth-form__field">
              <label className="auth-form__label">Duration (weeks)</label>
              <input
                type="number"
                step="1"
                min={1}
                max={52}
                {...register("durationWeeks", { valueAsNumber: true })}
                className="auth-form__input"
              />
              {errors.durationWeeks && (
                <p className="auth-form__error">{errors.durationWeeks.message}</p>
              )}
            </div>

            <div className="auth-form__field">
              <label className="auth-form__label">Price (Rs)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                {...register("price", { valueAsNumber: true })}
                className="auth-form__input"
              />
              <p className="coach-plan-form__hint">
                {watchPrice && watchPrice > 0
                  ? "Paid plan visible to clients in the app."
                  : "Set 0 to keep the plan free."}
              </p>
              {errors.price && (
                <p className="auth-form__error">{errors.price.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="coach-plan-form__actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn--ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn--primary"
          >
            {isSubmitting
              ? "Saving..."
              : plan
              ? "Save changes"
              : "Create subscription plan"}
          </button>
        </div>
      </form>
    );
  }

  // Modal variant (default)
  return (
    <div className="fixed inset-0 z-[200] flex items-start sm:items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="mt-10 mb-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{plan ? "Edit Plan" : "Create Plan"}</h3>
          <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-700">Close</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input {...register("title")} className="mt-1 w-full rounded-md border border-gray-300 p-2" />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>
              <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Mark as default plan</label>
                  <p className="text-xs text-gray-500">Clients fall back to this plan when no active subscription exists.</p>
                </div>
                <input type="checkbox" {...register("isDefault")} className="h-5 w-5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea {...register("description")} className="mt-1 w-full rounded-md border border-gray-300 p-2" rows={3} />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Goal</label>
                <input {...register("goal")} className="mt-1 w-full rounded-md border border-gray-300 p-2" placeholder="Weight loss, strength..." />
                {errors.goal && <p className="text-sm text-red-600">{errors.goal.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (weeks)</label>
                <input
                  type="number"
                  step="1"
                  min={1}
                  max={52}
                  {...register("durationWeeks", { valueAsNumber: true })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2"
                />
                {errors.durationWeeks && (
                  <p className="text-sm text-red-600">{errors.durationWeeks.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("price", { valueAsNumber: true })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {watchPrice && watchPrice > 0 ? "Paid plan visible to clients" : "Set to 0 for a free plan"}
                </p>
                {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4 bg-white">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {isSubmitting ? "Saving..." : plan ? "Save Changes" : "Create Subscription Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}