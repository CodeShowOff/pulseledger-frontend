// Goal Weight Progress Widget - progress indicator
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import { fetchClientProgressEntries, CLIENT_PROGRESS_QUERY_KEY } from "@/lib/queries/clientProgress";
import { Scale, Target, Edit2, X, Check } from "lucide-react";
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

  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["clientProgressEntries"],
    queryFn: fetchClientProgressEntries,
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
      queryClient.invalidateQueries({ queryKey: ["clientProgressEntries"] });
      queryClient.invalidateQueries({ queryKey: ["myPlans"] });
      queryClient.invalidateQueries({ queryKey: ["clientSummary"] });
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

  // Get latest weight from progress data
  const progressEntries = progressData?.data || [];
  const currentWeight =
    progressEntries.length > 0
      ? progressEntries.reduce((latest: any, entry: any) => {
          if (!entry.weight) return latest;
          if (!latest) return entry;
          return new Date(entry.date) > new Date(latest.date) ? entry : latest;
        }, null)?.weight || null
      : null;

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

  // Progress calculation with improved messages
  let progressPercentage = 0;
  let remainingKg = 0;
  let isWeightGain = false;

  const hasAllWeights = startWeight != null && goalWeight != null && currentWeight != null;

  if (hasAllWeights) {
    const denominator = goalWeight! - startWeight!;
    const numerator = currentWeight! - startWeight!;

    // Determine direction from start -> goal
    isWeightGain = denominator > 0;

    if (denominator === 0) {
      // Start and goal are the same (shouldn't happen after validation)
      progressPercentage = currentWeight === goalWeight ? 100 : 0;
    } else {
      progressPercentage = (numerator / denominator) * 100;

      // Handle edge cases and generate appropriate messages
      if (progressPercentage >= 100) {
        progressPercentage = 100;
        remainingKg = 0;
      } else if (progressPercentage < 0) {
        // Client is going in wrong direction
        progressPercentage = 0;
      } else {
        // Normal progress (0-100%)
        remainingKg = Math.abs(goalWeight! - currentWeight!);
      }
    }

    // Clamp percentage between 0-100
    progressPercentage = Math.min(100, Math.max(0, progressPercentage));
  }

  const tone = isWeightGain
    ? {
        accent: "#0f766e",
        accentStrong: "#134e4a",
        softBg: "#f0fdfa",
        panelBg: "#f4fbf9",
        border: "#d5ebe4",
        track: "#d6efe6",
        fill: "linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%)",
        badgeBg: "#d9f6ef",
        iconBg: "#e7f9f4",
      }
    : {
        accent: "#b45309",
        accentStrong: "#7c2d12",
        softBg: "#fff7ed",
        panelBg: "#fff9f3",
        border: "#f5e3cf",
        track: "#fde6ce",
        fill: "linear-gradient(90deg, #fb923c 0%, #f97316 100%)",
        badgeBg: "#ffedd5",
        iconBg: "#fff2e2",
      };

  const rootPadding = compact ? "0.9rem" : "1.15rem";
  const rootRadius = compact ? "0.95rem" : "1.15rem";
  const panelPadding = compact ? "0.72rem" : "0.9rem";
  const titleSize = compact ? "0.9rem" : "1rem";

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>

      <div
        style={{
          background: "linear-gradient(160deg, #fbfbff 0%, #ffffff 100%)",
          borderRadius: rootRadius,
          border: "1px solid #e8e7f1",
          padding: rootPadding,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: compact ? "0.7rem" : "0.9rem",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: compact ? "0.55rem" : "0.65rem", minWidth: 0 }}>
            <span
              style={{
                width: compact ? "2rem" : "2.2rem",
                height: compact ? "2rem" : "2.2rem",
                borderRadius: "0.75rem",
                background: tone.iconBg,
                border: `1px solid ${tone.border}`,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Target style={{ width: compact ? "1rem" : "1.1rem", height: compact ? "1rem" : "1.1rem", color: tone.accent }} />
            </span>

            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: titleSize,
                  fontWeight: 700,
                  color: "#0f172a",
                  marginTop: "0",
                  marginRight: "0",
                  marginBottom: "0",
                  marginLeft: "0",
                  lineHeight: 1.2,
                }}
              >
                Weight Goal
              </h3>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={handleStartEdit}
              style={{
                width: compact ? "1.9rem" : "2rem",
                height: compact ? "1.9rem" : "2rem",
                background: tone.softBg,
                border: `1px solid ${tone.border}`,
                borderRadius: "0.65rem",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
              }}
              aria-label="Edit weight values"
            >
              <Edit2 style={{ width: compact ? "0.82rem" : "0.9rem", height: compact ? "0.82rem" : "0.9rem", color: tone.accent }} />
            </button>
          )}
        </div>

        {isEditing && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              background: "#ffffff",
              border: `1px solid ${tone.border}`,
              borderRadius: "0.9rem",
              padding: panelPadding,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: compact ? "0.55rem" : "0.65rem" }}>
              <div>
                <label style={{ fontSize: "0.72rem", color: "#475569", marginBottom: "0.32rem", display: "block", fontWeight: 600 }}>
                  Start Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("startWeight", { valueAsNumber: true })}
                  placeholder={currentWeight ? `e.g., ${currentWeight}` : "e.g., 75"}
                  style={{
                    width: "100%",
                    padding: compact ? "0.55rem 0.65rem" : "0.6rem 0.72rem",
                    borderRadius: "0.6rem",
                    border: "1px solid #dbe4e3",
                    fontSize: "0.86rem",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = tone.accent;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#dbe4e3";
                  }}
                />
                {errors.startWeight && <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "0.24rem", marginBottom: 0 }}>{errors.startWeight.message}</p>}
              </div>

              <div>
                <label style={{ fontSize: "0.72rem", color: "#475569", marginBottom: "0.32rem", display: "block", fontWeight: 600 }}>
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("weight", { valueAsNumber: true })}
                  placeholder="e.g., 75.5"
                  style={{
                    width: "100%",
                    padding: compact ? "0.55rem 0.65rem" : "0.6rem 0.72rem",
                    borderRadius: "0.6rem",
                    border: "1px solid #dbe4e3",
                    fontSize: "0.86rem",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = tone.accent;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#dbe4e3";
                  }}
                />
                {errors.weight && <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "0.24rem", marginBottom: 0 }}>{errors.weight.message}</p>}
              </div>

              <div>
                <label style={{ fontSize: "0.72rem", color: "#475569", marginBottom: "0.32rem", display: "block", fontWeight: 600 }}>
                  Goal Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("goalWeight", { valueAsNumber: true })}
                  placeholder="e.g., 70"
                  style={{
                    width: "100%",
                    padding: compact ? "0.55rem 0.65rem" : "0.6rem 0.72rem",
                    borderRadius: "0.6rem",
                    border: "1px solid #dbe4e3",
                    fontSize: "0.86rem",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = tone.accent;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#dbe4e3";
                  }}
                />
                {errors.goalWeight && <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "0.24rem", marginBottom: 0 }}>{errors.goalWeight.message}</p>}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? "0.42rem" : "0.5rem", marginTop: compact ? "0.65rem" : "0.75rem" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: compact ? "0.52rem 0.82rem" : "0.58rem 0.95rem",
                  background: tone.accent,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.6rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: compact ? "0.8rem" : "0.84rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  opacity: isSubmitting ? 0.72 : 1,
                }}
              >
                <Check style={{ width: compact ? "0.88rem" : "0.95rem", height: compact ? "0.88rem" : "0.95rem" }} />
                {isSubmitting ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                style={{
                  padding: compact ? "0.52rem 0.82rem" : "0.58rem 0.95rem",
                  background: "#f8fafc",
                  color: "#475569",
                  border: "1px solid #dbe4e3",
                  borderRadius: "0.6rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: compact ? "0.8rem" : "0.84rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  opacity: isSubmitting ? 0.72 : 1,
                }}
              >
                <X style={{ width: compact ? "0.88rem" : "0.95rem", height: compact ? "0.88rem" : "0.95rem" }} />
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoadingGoal || isLoadingProgress ? (
          <div style={{ display: "flex", flexDirection: "column", gap: compact ? "0.58rem" : "0.7rem" }}>
            <div
              style={{
                height: compact ? "68px" : "78px",
                borderRadius: "0.9rem",
                background: "linear-gradient(90deg, #f1f5f9 0%, #e8eef5 50%, #f1f5f9 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.3s linear infinite",
              }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: compact ? "0.42rem" : "0.55rem" }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: compact ? "48px" : "56px",
                    borderRadius: "0.72rem",
                    background: "linear-gradient(90deg, #f1f5f9 0%, #e8eef5 50%, #f1f5f9 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.3s linear infinite",
                  }}
                />
              ))}
            </div>
          </div>
        ) : hasAllWeights ? (
          <div style={{ display: "flex", flexDirection: "column", gap: compact ? "0.55rem" : "0.68rem" }}>
            <div
              style={{
                background: tone.panelBg,
                border: `1px solid ${tone.border}`,
                borderRadius: "0.9rem",
                padding: panelPadding,
                display: "flex",
                flexDirection: "column",
                gap: compact ? "0.46rem" : "0.58rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", minWidth: 0 }}>
                  <span style={{ margin: 0, fontSize: compact ? "1.12rem" : "1.26rem", fontWeight: 700, color: tone.accent, lineHeight: 1 }}>
                    {currentWeight?.toFixed(1)} kg
                  </span>
                  <span style={{ margin: 0, fontSize: compact ? "0.72rem" : "0.78rem", color: "#64748b" }}>
                    / {goalWeight?.toFixed(1)} kg
                  </span>
                </div>

                <span
                  style={{
                    fontSize: compact ? "0.75rem" : "0.82rem",
                    fontWeight: 700,
                    color: tone.accentStrong,
                    background: tone.badgeBg,
                    border: `1px solid ${tone.border}`,
                    borderRadius: "999px",
                    padding: compact ? "0.24rem 0.5rem" : "0.3rem 0.6rem",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {Math.round(progressPercentage)}%
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: compact ? "0.42rem" : "0.5rem",
                  background: tone.track,
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
                aria-label={`${Math.round(progressPercentage)} percent weight goal progress`}
              >
                <div
                  style={{
                    width: `${progressPercentage}%`,
                    height: "100%",
                    background: tone.fill,
                    borderRadius: "999px",
                    transition: "width 620ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", fontSize: compact ? "0.66rem" : "0.72rem", color: "#64748b" }}>
                <span>Start {startWeight} kg</span>
                <span>
                  {progressPercentage === 100
                    ? "Goal achieved"
                    : `${remainingKg.toFixed(1)} kg to ${isWeightGain ? "gain" : "lose"}`}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: compact ? "0.95rem 0.7rem" : "1.2rem 0.9rem",
              background: "#fafbff",
              border: "1px dashed #dbe2f2",
              borderRadius: "0.9rem",
            }}
          >
            <Scale style={{ width: compact ? "1.45rem" : "1.7rem", height: compact ? "1.45rem" : "1.7rem", color: "#94a3b8", margin: compact ? "0 auto 0.45rem" : "0 auto 0.6rem" }} />
            <p style={{ fontSize: compact ? "0.7rem" : "0.77rem", color: "#475569", marginTop: "0", marginRight: "0", marginBottom: "0", marginLeft: "0" }}>
              {goalWeight == null || startWeight == null
                ? "Set your start and goal weight to begin tracking."
                : "Add a current weight entry to view your progress."}
            </p>

            {(goalWeight == null || startWeight == null) && (
              <button
                onClick={handleStartEdit}
                style={{
                  marginTop: "0.7rem",
                  padding: compact ? "0.46rem 0.72rem" : "0.5rem 0.82rem",
                  borderRadius: "0.6rem",
                  border: `1px solid ${tone.border}`,
                  background: tone.softBg,
                  color: tone.accentStrong,
                  fontSize: compact ? "0.74rem" : "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Set Start & Goal Weight
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
