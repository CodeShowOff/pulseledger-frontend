// src/components/coach/PlanForm.tsx
"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CLIENT_PLANS_KEY } from "@/lib/queries/plans";

const planSchema = z.object({
  clientId: z.string().nullable().optional(),
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  goal: z.string().max(100).optional().nullable(),
  price: z.coerce.number().min(0).optional(),
  durationWeeks: z.coerce.number().min(1).max(52).optional(),
  isTemplate: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  tasks: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      date: z.string().optional().nullable(),
    })
  ).optional(),
});

type PlanFormType = z.infer<typeof planSchema>;

export default function PlanForm({ plan, onClose, variant = "modal" }: { plan?: any; onClose: () => void; variant?: "modal" | "page" }) {
  const queryClient = useQueryClient();

  // Fetch coach's clients to choose assignment
  const { data: clientsData } = useQuery({
    // Use a distinct key to avoid cache shape conflicts with CoachClients list query
    queryKey: ["coachClientsOptions"],
    queryFn: async () => {
      const res = await api.get("/coach/clients?limit=100");
      return res.data.data || [];
    },
  });

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<PlanFormType>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      clientId: "",
      title: "",
      description: "",
      goal: "",
      price: 0,
      durationWeeks: 4,
      isTemplate: true,
      isDefault: false,
      tasks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ name: "tasks", control });

  const watchClientId = watch("clientId");
  const watchIsDefault = watch("isDefault");
  const watchIsTemplate = watch("isTemplate");
  const watchPrice = watch("price");

  useEffect(() => {
    if (plan) {
      // populate for edit
      reset({
        clientId: plan.clientId?._id ?? "",
        title: plan.title,
        description: plan.description ?? "",
        goal: plan.goal ?? "",
        price: typeof plan.price === "number" ? plan.price : 0,
        durationWeeks: plan.durationWeeks ?? 4,
        isTemplate: !!plan.isTemplate,
        isDefault: !!plan.isDefault,
        tasks: plan.tasks?.map((t: any) => ({
          title: t.title,
          description: t.description ?? "",
          date: t.date ? new Date(t.date).toISOString().slice(0, 10) : "",
        })) ?? [],
      });
    }
  }, [plan, reset]);

  useEffect(() => {
    if (watchClientId) {
      if (watchIsTemplate) {
        setValue("isTemplate", false, { shouldDirty: true });
      }
      if (watchIsDefault) {
        setValue("isDefault", false, { shouldDirty: true });
      }
    } else if (!watchIsDefault && !watchIsTemplate) {
      setValue("isTemplate", true, { shouldDirty: true });
    }
  }, [watchClientId, watchIsDefault, watchIsTemplate, setValue]);

  useEffect(() => {
    if (watchIsDefault) {
      setValue("clientId", "", { shouldDirty: true });
      if (!watchIsTemplate) {
        setValue("isTemplate", true, { shouldDirty: true });
      }
    }
  }, [watchIsDefault, watchIsTemplate, setValue]);

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/plans", payload),
    onSuccess: () => {
      toast.success("Plan created");
      queryClient.invalidateQueries({ queryKey: ["coachPlans"] });
      queryClient.invalidateQueries({ queryKey: CLIENT_PLANS_KEY });
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.patch(`/plans/${id}`, payload),
    onSuccess: () => {
      toast.success("Plan updated");
      queryClient.invalidateQueries({ queryKey: ["coachPlans"] });
      queryClient.invalidateQueries({ queryKey: CLIENT_PLANS_KEY });
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Update failed"),
  });

  const onSubmit = (data: PlanFormType) => {
    const payload = {
      ...data,
      // convert empty string clientId to null
      clientId: data.clientId || null,
      price: typeof data.price === "number" ? data.price : 0,
      tasks: (data.tasks || []).map((t) => ({
        ...t,
        date: t.date ? new Date(t.date).toISOString() : undefined,
      })),
    };

    if (payload.isDefault) {
      payload.clientId = null;
      payload.isTemplate = true;
    }

    if (payload.clientId) {
      payload.isTemplate = false;
      payload.isDefault = false;
    }

    if (plan) {
      // Remove clientId from update payload - clientId cannot be changed after creation
      const { clientId: _, ...updatePayload } = payload;
      updateMutation.mutate({ id: plan._id, payload: updatePayload });
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

          <div className="coach-plan-form__row coach-plan-form__row--assign">
            <div className="auth-form__field">
              <label className="auth-form__label">Assign to client</label>
              <select
                {...register("clientId")}
                disabled={watchIsDefault}
                className="auth-form__input auth-form__input--select"
              >
                <option value="">Available to all clients</option>
                {Array.isArray(clientsData) &&
                  clientsData.map((c: any) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName} ({c.email})
                    </option>
                  ))}
              </select>
              <p className="coach-plan-form__hint">
                Leave blank to make this plan available to all your clients.
              </p>
            </div>

            <div className="coach-plan-form__info">
              Plans available to all clients can be requested by any of your clients. Assigning a
              plan makes it private to that specific client only.
            </div>
          </div>

          <input type="hidden" {...register("isTemplate")} />
        </div>

        <div className="coach-plan-form__section coach-plan-form__section--tasks">
          <div className="coach-plan-form__tasks-header">
            <div>
              <h2 className="coach-plan-form__tasks-title">Tasks</h2>
              <p className="coach-plan-form__hint">
                {!watchClientId 
                  ? "Tasks can only be added to plans assigned to specific clients."
                  : "Break the plan into workouts, check-ins, and milestones."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => append({ title: "", description: "", date: "" })}
              className="btn btn--outline btn--sm"
              disabled={!watchClientId}
              title={!watchClientId ? "Select a specific client to add tasks" : ""}
            >
              Add Task
            </button>
          </div>

          {fields.length === 0 && (
            <p className="coach-plan-form__tasks-empty">
              {!watchClientId 
                ? "Tasks are only available for plans assigned to specific clients. Please select a client above to add tasks."
                : "No tasks yet. Start by adding your first week."}
            </p>
          )}

          <div className="coach-plan-form__tasks-list">
            {fields.map((f, idx) => (
              <div key={f.id} className="coach-plan-form__task-card">
                <div className="coach-plan-form__task-grid">
                  <input
                    className="auth-form__input coach-plan-form__task-input coach-plan-form__task-input--title"
                    placeholder="Task title"
                    {...register(`tasks.${idx}.title`)}
                  />
                  <input
                    className="auth-form__input coach-plan-form__task-input coach-plan-form__task-input--description"
                    placeholder="Task description (optional)"
                    {...register(`tasks.${idx}.description`)}
                  />
                  <input
                    type="date"
                    className="auth-form__input coach-plan-form__task-input coach-plan-form__task-input--date"
                    {...register(`tasks.${idx}.date`)}
                  />
                </div>
                <div className="coach-plan-form__task-footer">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="btn btn--text btn--danger-text btn--sm"
                  >
                    Remove task
                  </button>
                </div>
              </div>
            ))}
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
              : "Create plan"}
          </button>
        </div>
      </form>
    );
  }

  // Modal variant (default)
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4 overflow-y-auto">
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign to client</label>
                <select
                  {...register("clientId")}
                  disabled={watchIsDefault}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 disabled:bg-gray-100"
                >
                  <option value="">Available to all clients</option>
                  {Array.isArray(clientsData) && clientsData.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.fullName} ({c.email})</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to make this plan available to all your clients.
                </p>
              </div>
              <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                Plans available to all clients can be requested by any of your clients. Assigning a plan makes it private to that specific client only.
              </div>
            </div>

            <input type="hidden" {...register("isTemplate")} />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Tasks</label>
                  <p className="text-xs text-gray-500">
                    {!watchClientId 
                      ? "Tasks can only be added to plans assigned to specific clients."
                      : "Break the plan into manageable tasks, workouts, or milestones."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => append({ title: "", description: "", date: "" })}
                  className="rounded-md border border-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!watchClientId}
                  title={!watchClientId ? "Select a specific client to add tasks" : ""}
                >
                  Add Task
                </button>
              </div>

              {fields.length === 0 && (
                <p className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                  {!watchClientId 
                    ? "Tasks are only available for plans assigned to specific clients. Please select a client above to add tasks."
                    : "No tasks yet. Click \"Add Task\" to start building the weekly checklist."}
                </p>
              )}

              <div className="space-y-3">
                {fields.map((f, idx) => (
                  <div key={f.id} className="rounded-md border border-gray-200 p-3">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
                      <input
                        className="md:col-span-4 rounded-md border border-gray-300 p-2"
                        placeholder="Task title"
                        {...register(`tasks.${idx}.title`)}
                      />
                      <input
                        className="md:col-span-5 rounded-md border border-gray-300 p-2"
                        placeholder="Task description"
                        {...register(`tasks.${idx}.description`)}
                      />
                      <input
                        type="date"
                        className="md:col-span-3 rounded-md border border-gray-300 p-2"
                        {...register(`tasks.${idx}.date`)}
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4 bg-white">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {isSubmitting ? "Saving..." : plan ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}