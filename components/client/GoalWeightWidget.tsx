// Goal Weight Progress Widget - progress indicator
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import {
  fetchClientProgressSummary,
  CLIENT_PROGRESS_QUERY_KEY,
  CLIENT_PROGRESS_SUMMARY_QUERY_KEY,
} from "@/lib/queries/clientProgress";
import { Edit2, X, Check, Weight } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const WeightEditSchema = z.object({
  startWeight: z
    .number({ invalid_type_error: "Start weight must be a number" })
    .min(20, "Weight too low")
    .max(500, "Weight too high")
    .optional()
    .or(z.nan().transform(() => undefined)),
  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(20, "Weight too low")
    .max(500, "Weight too high")
    .optional()
    .or(z.nan().transform(() => undefined)),
  goalWeight: z
    .number({ invalid_type_error: "Goal weight must be a number" })
    .min(20, "Weight too low")
    .max(500, "Weight too high")
    .optional()
    .or(z.nan().transform(() => undefined)),
});

type WeightEditFormData = z.infer<typeof WeightEditSchema>;

type GoalWeightSettings = {
  goalWeight: number | null;
  startWeight: number | null;
};

const fetchGoalWeight = async (): Promise<GoalWeightSettings> => {
  try {
    const res = await api.get("/progress/goal-weight");
    return {
      goalWeight: res.data?.goalWeight ?? null,
      startWeight: res.data?.startWeight ?? null,
    };
  } catch {
    return { goalWeight: null, startWeight: null };
  }
};

type GoalWeightWidgetProps = {
  compact?: boolean;
};

const formatWeightCompact = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function GoalWeightWidget({ compact = false }: GoalWeightWidgetProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: goalSettings, isLoading: isLoadingGoal } = useQuery({
    queryKey: ["goalWeight"],
    queryFn: fetchGoalWeight,
    staleTime: 5 * 60 * 1000,
  });

  const goalWeight = goalSettings?.goalWeight ?? null;
  const startWeight = goalSettings?.startWeight ?? null;

  const { data: progressSummary, isLoading: isLoadingProgress } = useQuery({
    queryKey: CLIENT_PROGRESS_SUMMARY_QUERY_KEY,
    queryFn: fetchClientProgressSummary,
    staleTime: 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WeightEditFormData>({
    resolver: zodResolver(WeightEditSchema),
    defaultValues: {
      startWeight: undefined,
      weight: undefined,
      goalWeight: undefined,
    },
  });

  const updateWeightMutation = useMutation({
    mutationFn: async (payload: { weight?: number }) => {
      const res = await api.post("/progress", { weight: payload.weight });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_PROGRESS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_PROGRESS_SUMMARY_QUERY_KEY });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (payload: { goalWeight?: number; startWeight?: number }) => {
      const res = await api.put("/progress/goal-weight", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goalWeight"] });
    },
  });

  const currentWeight = progressSummary?.latestWeight ?? null;

  const onSubmit = async (data: WeightEditFormData) => {
    try {
      // Validate weight logic based on goal type
      const start = data.startWeight ?? startWeight;
      const goal = data.goalWeight ?? goalWeight;
      const current = data.weight;

      // If we have enough data to determine goal type, validate
      if (start != null && goal != null && current != null) {
        const isGainGoal = goal > start;

        if (isGainGoal) {
          // For weight gain: current should not be less than start
          if (current < start) {
            toast.error(`For weight gain goal, current weight (${current} kg) cannot be less than start weight (${start} kg)`);
            return;
          }
        } else if (goal < start) {
          // For weight loss: current can be higher than start, but show warning
          if (current > start) {
            toast.warning(`Current weight (${current} kg) is higher than your starting weight (${start} kg). Keep going!`);
          }
        }
      }

      // Validate that start and goal are different
      if (start != null && goal != null && start === goal) {
        toast.error("Start weight and goal weight must be different");
        return;
      }

      const promises = [];

      // Update current weight if provided
      if (data.weight !== undefined && !isNaN(data.weight)) {
        promises.push(updateWeightMutation.mutateAsync({ weight: data.weight }));
      }

      // Update goal/start weight if provided
      const shouldUpdateGoalSettings =
        (data.goalWeight !== undefined && !isNaN(data.goalWeight)) ||
        (data.startWeight !== undefined && !isNaN(data.startWeight));

      if (shouldUpdateGoalSettings) {
        promises.push(
          updateGoalMutation.mutateAsync({
            goalWeight: data.goalWeight,
            startWeight: data.startWeight,
          })
        );
      }

      if (promises.length === 0) {
        toast.error("Please enter at least one weight value");
        return;
      }

      await Promise.all(promises);

      toast.success("Weight updated successfully");
      setIsEditing(false);
      reset();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = (err as any).response?.data?.message || (err as any).message || "Failed to update weight";
        toast.error(msg);
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to update weight");
      } else {
        toast.error("Failed to update weight");
      }
    }
  };

  const handleStartEdit = () => {
    reset({
      startWeight: startWeight ?? undefined,
      weight: currentWeight ?? undefined,
      goalWeight: goalWeight ?? undefined,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  // Progress calculation with display fallbacks
  const hasGoalSettings = startWeight != null && goalWeight != null;
  const displayWeight = currentWeight ?? startWeight ?? null;

  let isWeightGain = hasGoalSettings ? goalWeight! > startWeight! : false;
  let progressPercentage = 0;
  let remainingKg = 0;

  if (hasGoalSettings && displayWeight != null) {
    const denominator = goalWeight! - startWeight!;
    const numerator = displayWeight - startWeight!;

    isWeightGain = denominator > 0;

    if (denominator === 0) {
      progressPercentage = displayWeight === goalWeight ? 100 : 0;
    } else {
      progressPercentage = (numerator / denominator) * 100;
    }

    progressPercentage = clamp(progressPercentage, 0, 100);
    remainingKg = progressPercentage >= 100 ? 0 : Math.max(0, Math.abs(goalWeight! - displayWeight));
  }

  const currentWeightLabel = displayWeight != null ? formatWeightCompact(displayWeight) : "--";
  const goalWeightLabel = goalWeight != null ? formatWeightCompact(goalWeight) : "--";
  const ratioText = `${currentWeightLabel}/${goalWeightLabel}kg`;
  const isLongRatio = ratioText.length >= 9;

  const tone = isWeightGain
    ? {
        accent: "#0f766e",
        accentStrong: "#134e4a",
        border: "#bfe8dd",
        cardBg: "#f5fcf9",
        ringTrack: "rgba(15, 118, 110, 0.2)",
        ringFrom: "#2dd4bf",
        ringMid: "#14b8a6",
        ringTo: "#0f766e",
        iconBg: "#e9faf4",
        badgeBg: "#d9f6ef",
      }
    : {
        accent: "#b45309",
        accentStrong: "#7c2d12",
        border: "#f5dcc2",
        cardBg: "#fff8f1",
        ringTrack: "rgba(234, 88, 12, 0.2)",
        ringFrom: "#fb923c",
        ringMid: "#f97316",
        ringTo: "#c2410c",
        iconBg: "#fff1e3",
        badgeBg: "#ffedd5",
      };

  const ringSize = compact ? "h-36 w-36" : "h-[min(74vw,15rem)] w-[min(74vw,15rem)] sm:h-64 sm:w-64";
  const ringStrokeWidth = compact ? 15 : 19;
  const shouldReduceEffects = compact;
  const ringCenter = 120;
  const ringRadius = 94;
  const circumference = 2 * Math.PI * ringRadius;
  const gaugeGapDegrees = compact ? 66 : 70;
  const gaugeVisibleDegrees = 360 - gaugeGapDegrees;
  const arcLength = (circumference * gaugeVisibleDegrees) / 360;
  const gapLength = circumference - arcLength;
  const progressArcLength = (arcLength * progressPercentage) / 100;
  const gaugeRotationDeg = 122;
  const ringGradientId = React.useId();

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br from-orange-50/35 via-white to-emerald-50/35 ${
          shouldReduceEffects
            ? "shadow-[0_10px_20px_-18px_rgba(15,23,42,0.28)]"
            : "shadow-[0_20px_40px_-30px_rgba(15,23,42,0.35)]"
        } ${
          compact ? "h-full p-3" : "p-4 sm:p-5"
        }`}
        style={{ borderColor: tone.border }}
      >
        {!compact ? (
          <>
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-orange-200/25 blur-3xl" />
          </>
        ) : null}

        <div className="relative z-[1] space-y-3 sm:space-y-4">
          <div className="flex min-h-8 items-center justify-between gap-2.5">
            <div className="min-w-0">
              <h3 className={`truncate font-bold leading-tight text-slate-900 ${compact ? "text-sm" : "text-base"}`}>
                Weight Goal
              </h3>
            </div>
          </div>

          {isLoadingGoal || isLoadingProgress ? (
            <div className="space-y-3">
              <div
                className={`mx-auto ${ringSize} rounded-full border border-slate-200/70 ${compact ? "" : "animate-pulse"}`}
                style={{ borderWidth: ringStrokeWidth }}
              />
              <div>
                <div className={`h-[58px] rounded-xl bg-slate-200/75 ${compact ? "" : "animate-pulse"}`} />
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto w-full text-center">
                <div className={`relative mx-auto ${ringSize}`} aria-label={`${Math.round(progressPercentage)} percent weight goal progress`}>
                  <svg viewBox="0 0 240 240" className="h-full w-full" role="presentation">
                    <defs>
                      <linearGradient id={ringGradientId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={tone.ringFrom} />
                        <stop offset="55%" stopColor={tone.ringMid} />
                        <stop offset="100%" stopColor={tone.ringTo} />
                      </linearGradient>
                    </defs>

                    <circle
                      cx={ringCenter}
                      cy={ringCenter}
                      r={ringRadius}
                      fill="none"
                      stroke={tone.ringTrack}
                      strokeWidth={ringStrokeWidth}
                      strokeDasharray={`${arcLength} ${gapLength}`}
                      style={{
                        transform: `rotate(${gaugeRotationDeg}deg)`,
                        transformOrigin: "50% 50%",
                      }}
                    />

                    <circle
                      cx={ringCenter}
                      cy={ringCenter}
                      r={ringRadius}
                      fill="none"
                      stroke={`url(#${ringGradientId})`}
                      strokeWidth={ringStrokeWidth}
                      strokeLinecap={progressArcLength > 0 ? "round" : "butt"}
                      strokeDasharray={`${progressArcLength} ${circumference}`}
                      style={{
                        transform: `rotate(${gaugeRotationDeg}deg)`,
                        transformOrigin: "50% 50%",
                        transition: shouldReduceEffects
                          ? "none"
                          : "stroke-dasharray 900ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                      className="motion-reduce:transition-none"
                    />
                  </svg>

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 text-center">
                    <p
                      className={`max-w-[92%] whitespace-nowrap tabular-nums font-extrabold leading-none tracking-tight ${
                        compact
                          ? isLongRatio
                            ? "text-[1.03rem]"
                            : "text-[1.17rem]"
                          : isLongRatio
                            ? "text-[1.3rem] sm:text-[1.55rem]"
                            : "text-[1.45rem] sm:text-[1.75rem]"
                      }`}
                    >
                      <span style={{ color: tone.accent }}>{currentWeightLabel}</span>
                      <span className="text-slate-900">/{goalWeightLabel}</span>
                      <span className={`ml-1 font-semibold text-slate-500 ${compact ? "text-[0.66rem]" : "text-[0.8rem] sm:text-[0.92rem]"}`}>
                        kg
                      </span>
                    </p>
                  </div>

                  <div className="absolute left-1/2 top-[83.5%] -translate-x-1/2 -translate-y-1/2">
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className={`group relative grid place-items-center rounded-full border bg-white/95 shadow-[0_10px_25px_-14px_rgba(2,132,199,0.35)] transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-0.5 active:translate-y-0 ${
                        compact ? "h-11 w-11" : "h-12 w-12 sm:h-14 sm:w-14"
                      }`}
                      style={{ borderColor: tone.border, color: tone.accentStrong }}
                      aria-label="Edit weight values"
                    >
                      <Weight size={compact ? 22 : 26} color={tone.accent} strokeWidth={2.25} />
                      <span
                        className={`absolute -top-1 -right-1 grid place-items-center rounded-full text-white shadow-sm ${
                          compact ? "h-[17px] w-[17px]" : "h-4 w-4 sm:h-[18px] sm:w-[18px]"
                        }`}
                        style={{ background: tone.accent }}
                        aria-hidden="true"
                      >
                        <Edit2 className={compact ? "h-2.5 w-2.5" : "h-2.5 w-2.5 sm:h-3 sm:w-3"} />
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`pt-2 ${compact ? "text-center" : "text-left"}`}
                style={{ borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: tone.border }}
              >
                <div className="min-w-0">
                  <p className={compact ? "text-[10px] font-semibold leading-tight text-slate-500" : "text-[11px] font-medium uppercase tracking-wide text-slate-500"}>
                    Remaining
                  </p>
                  <p className={compact ? "mt-0.5 whitespace-nowrap text-[1.02rem] font-bold leading-tight text-slate-900" : "mt-1 text-sm font-bold text-slate-900 sm:text-base"}>
                    {hasGoalSettings && displayWeight != null ? `${formatWeightCompact(remainingKg)} kg` : "--"}
                  </p>
                </div>
              </div>

              {!hasGoalSettings ? (
                <p className={`text-center font-medium text-slate-500 ${compact ? "text-[11px] leading-snug" : "text-xs"}`}>
                  Tap the weighted icon to set your start and goal weight.
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/45 p-3 pb-2 sm:items-center sm:p-4 sm:pb-4 sm:backdrop-blur-[1px]"
          onClick={handleCancelEdit}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="weight-edit-modal-title"
            className="w-full max-w-md max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:max-h-[90dvh] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 id="weight-edit-modal-title" className="text-base font-semibold text-slate-900">
                Edit weight goal
              </h4>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
                aria-label="Close weight goal editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="start-weight" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Start Weight (kg)
                </label>
                <input
                  id="start-weight"
                  type="number"
                  step="0.1"
                  {...register("startWeight", { valueAsNumber: true })}
                  placeholder={currentWeight ? `e.g. ${currentWeight}` : "e.g. 75"}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-300"
                />
                {errors.startWeight ? <p className="text-xs text-rose-600">{errors.startWeight.message}</p> : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="current-weight" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current Weight (kg)
                </label>
                <input
                  id="current-weight"
                  type="number"
                  step="0.1"
                  {...register("weight", { valueAsNumber: true })}
                  placeholder="e.g. 75.5"
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-300"
                />
                {errors.weight ? <p className="text-xs text-rose-600">{errors.weight.message}</p> : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="goal-weight" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Goal Weight (kg)
                </label>
                <input
                  id="goal-weight"
                  type="number"
                  step="0.1"
                  {...register("goalWeight", { valueAsNumber: true })}
                  placeholder="e.g. 70"
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-300"
                />
                {errors.goalWeight ? <p className="text-xs text-rose-600">{errors.goalWeight.message}</p> : null}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${
                    isSubmitting ? "cursor-not-allowed bg-sky-400" : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
