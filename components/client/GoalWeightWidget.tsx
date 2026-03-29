// Goal Weight Progress Widget - Circular progress indicator
"use client";

import React, { useId, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import { fetchClientProgressEntries, CLIENT_PROGRESS_QUERY_KEY } from "@/lib/queries/clientProgress";
import { Scale, Target, TrendingDown, TrendingUp, Edit2, X, Check } from "lucide-react";
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
  const ringGradientId = useId();

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
          // For weight loss: current should not be more than start (though we allow it with warning)
          if (current > start) {
            toast.warning(`Current weight (${current} kg) is higher than your starting weight (${start} kg). Keep going!`);
            // Allow it to proceed - just a warning
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
      
      // Update goal weight if provided
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

  // Get latest weight from progress data
  const progressEntries = progressData?.data || [];
  const currentWeight = progressEntries.length > 0 
    ? progressEntries.reduce((latest: any, entry: any) => {
        if (!entry.weight) return latest;
        if (!latest) return entry;
        return new Date(entry.date) > new Date(latest.date) ? entry : latest;
      }, null)?.weight || null
    : null;

  // Progress calculation with improved messages
  let progressPercentage = 0;
  let remainingKg = 0;
  let isWeightGain = false;
  let progressMessage = "";

  const hasAllWeights = startWeight != null && goalWeight != null && currentWeight != null;

  if (hasAllWeights) {
    const denominator = goalWeight! - startWeight!;
    const numerator = currentWeight! - startWeight!;

    // Determine direction from start -> goal
    isWeightGain = denominator > 0;

    if (denominator === 0) {
      // Start and goal are the same (shouldn't happen after validation)
      progressPercentage = currentWeight === goalWeight ? 100 : 0;
      progressMessage = currentWeight === goalWeight ? "Goal achieved 🎯" : "Set a different goal weight";
    } else {
      progressPercentage = (numerator / denominator) * 100;

      // Handle edge cases and generate appropriate messages
      if (progressPercentage >= 100) {
        progressPercentage = 100;
        remainingKg = 0;
        progressMessage = "Goal achieved 🎯";
      } else if (progressPercentage < 0) {
        // Client is going in wrong direction
        progressPercentage = 0;
        if (isWeightGain) {
          // Weight gain goal but current < start
          const deficit = startWeight! - currentWeight!;
          progressMessage = `You've lost ${deficit.toFixed(1)} kg from start. Focus on gaining!`;
        } else {
          // Weight loss goal but current > start
          const excess = currentWeight! - startWeight!;
          progressMessage = `You've gained ${excess.toFixed(1)} kg from start. Stay focused!`;
        }
      } else {
        // Normal progress (0-100%)
        remainingKg = Math.abs(goalWeight! - currentWeight!);
        if (isWeightGain) {
          const gained = currentWeight! - startWeight!;
          progressMessage = `Gained ${gained.toFixed(1)} kg! ${remainingKg.toFixed(1)} kg more to go.`;
        } else {
          const lost = startWeight! - currentWeight!;
          progressMessage = `Lost ${lost.toFixed(1)} kg! ${remainingKg.toFixed(1)} kg more to go.`;
        }
      }
    }

    // Clamp percentage between 0-100
    progressPercentage = Math.min(100, Math.max(0, progressPercentage));
  }

  const strokeWidth = compact ? 8 : 10;
  const size = compact ? 94 : 140;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
  const ringAnimationStyle: React.CSSProperties = {
    transition: `stroke-dashoffset ${compact ? "720ms" : "620ms"} cubic-bezier(0.22, 1, 0.36, 1)`,
    willChange: "stroke-dashoffset",
    backfaceVisibility: "hidden",
  };

  const rootPadding = compact ? "0.7rem" : "1rem";
  const rootRadius = compact ? "0.65rem" : "0.75rem";
  const headerTitleSize = compact ? "0.8rem" : "0.95rem";
  const iconSize = compact ? "0.85rem" : "1rem";
  const statPad = compact ? "0.4rem" : "0.5rem";
  const statLabelSize = compact ? "0.58rem" : "0.65rem";
  const statValueSize = compact ? "0.82rem" : "0.95rem";
  const statLabelMb = compact ? "0.08rem" : "0.15rem";
  const statCardMinHeight = compact ? 48 : undefined;

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
        .goal-widget-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          width: 100%;
        }
        .goal-widget-progress-info {
          display: flex;
        }

        .goal-widget-stats--compact {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.35rem;
        }

        .goal-widget-stats--compact > div:last-child {
          grid-column: 1 / -1;
        }

        @media (max-width: 640px) {
          .goal-widget-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .goal-widget-stats > div:last-child {
            grid-column: 1 / -1;
          }
          .goal-widget-progress-info {
            display: none !important;
          }
        }
      `}</style>
      <div style={{
        background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)",
        borderRadius: rootRadius,
        border: "1px solid #e0f2fe",
        padding: rootPadding,
        height: compact ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)"
      }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: compact ? "0.65rem" : "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Target style={{ width: iconSize, height: iconSize, color: isWeightGain ? "#0ea5e9" : "#f97316" }} />
          <h3 style={{ 
            fontSize: headerTitleSize, 
            fontWeight: "600", 
            color: "#111827",
            marginTop: "0",
            marginRight: "0",
            marginBottom: "0",
            marginLeft: "0"
          }}>
            Weight Goal
          </h3>
        </div>
        {!isEditing && (
          <button
            onClick={handleStartEdit}
            style={{
              padding: compact ? "0.28rem" : "0.4rem",
              background: isWeightGain ? "#f0f9ff" : "#fff7ed",
              border: isWeightGain ? "1px solid #e0f2fe" : "1px solid #fed7aa",
              borderRadius: "0.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isWeightGain ? "#e0f2fe" : "#fed7aa"}
            onMouseLeave={(e) => e.currentTarget.style.background = isWeightGain ? "#f0f9ff" : "#fff7ed"}
          >
            <Edit2 style={{ width: compact ? "0.78rem" : "0.9rem", height: compact ? "0.78rem" : "0.9rem", color: isWeightGain ? "#0ea5e9" : "#f97316" }} />
          </button>
        )}
      </div>

      {/* Weight Edit Form */}
      {isEditing && (
        <form onSubmit={handleSubmit(onSubmit)} style={{
          background: "#ffffff",
          padding: "0.75rem",
          borderRadius: "0.5rem",
          border: "1px solid #e0f2fe",
          marginBottom: "1rem"
        }}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.35rem", display: "block", fontWeight: "500" }}>
              Start Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("startWeight", { valueAsNumber: true })}
              placeholder={currentWeight ? `e.g., ${currentWeight}` : "e.g., 75"}
              className="client-form__control"
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                fontSize: "0.9375rem",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
            {errors.startWeight && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem" }}>{errors.startWeight.message}</p>}
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.35rem", display: "block", fontWeight: "500" }}>
              Current Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("weight", { valueAsNumber: true })}
              placeholder="e.g., 75.5"
              className="client-form__control"
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                fontSize: "0.9375rem",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
            {errors.weight && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem" }}>{errors.weight.message}</p>}
          </div>
          
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.35rem", display: "block", fontWeight: "500" }}>
              Goal Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("goalWeight", { valueAsNumber: true })}
              placeholder="e.g., 70"
              className="client-form__control"
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                fontSize: "0.9375rem",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
            {errors.goalWeight && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem" }}>{errors.goalWeight.message}</p>}
          </div>
          
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "0.625rem 1rem",
                background: "#0ea5e9",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              <Check style={{ width: "1rem", height: "1rem" }} />
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              style={{
                padding: "0.625rem 1rem",
                background: "#f3f4f6",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              <X style={{ width: "1rem", height: "1rem" }} />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {(isLoadingGoal || isLoadingProgress) ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: compact ? "0.65rem" : "1rem", padding: compact ? "0.65rem" : "1rem" }}>
          {/* Skeleton Circle */}
          <div style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: "linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            position: "relative"
          }}>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background: "#ffffff"
            }}></div>
          </div>

          {/* Skeleton Stats Grid */}
          <div className={compact ? "goal-widget-stats goal-widget-stats--compact" : "goal-widget-stats"}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ textAlign: "center", padding: statPad, background: "#f0f9ff", borderRadius: "0.4rem" }}>
                <div style={{
                  height: compact ? "0.58rem" : "0.65rem",
                  width: "60%",
                  margin: `0 auto ${statLabelMb}`,
                  borderRadius: "0.25rem",
                  background: "linear-gradient(90deg, #e0f2fe 0%, #bae6fd 50%, #e0f2fe 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite"
                }}></div>
                <div style={{
                  height: compact ? "0.82rem" : "0.95rem",
                  width: "80%",
                  margin: "0 auto",
                  borderRadius: "0.25rem",
                  background: "linear-gradient(90deg, #e0f2fe 0%, #bae6fd 50%, #e0f2fe 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite"
                }}></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Progress Circle */}
          {startWeight != null && goalWeight != null && currentWeight != null ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: compact ? "0.65rem" : "1rem" }}>
          {/* SVG Circle */}
          <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e0f2fe"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#${ringGradientId})`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={ringAnimationStyle}
              />
              <defs>
                <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  {isWeightGain ? (
                    <>
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </>
                  )}
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center"
            }}>
              <div style={{ fontSize: compact ? "1.55rem" : "2rem", fontWeight: "700", color: "#111827", lineHeight: "1" }}>
                {Math.round(progressPercentage)}%
              </div>
              <div style={{ fontSize: compact ? "0.6rem" : "0.7rem", color: "#6b7280", marginTop: compact ? "0.2rem" : "0.35rem" }}>
                Achieved
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={compact ? "goal-widget-stats goal-widget-stats--compact" : "goal-widget-stats"}>
            <div style={{ textAlign: "center", padding: statPad, background: isWeightGain ? "#f0f9ff" : "#fff7ed", borderRadius: "0.4rem", minHeight: statCardMinHeight, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: statLabelSize, color: "#6b7280", marginBottom: statLabelMb }}>Current</div>
              <div style={{ fontSize: statValueSize, fontWeight: "700", lineHeight: "1.1", color: isWeightGain ? "#0ea5e9" : "#f97316" }}>{currentWeight} kg</div>
            </div>
            <div style={{ textAlign: "center", padding: statPad, background: isWeightGain ? "#f0f9ff" : "#fff7ed", borderRadius: "0.4rem", minHeight: statCardMinHeight, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: statLabelSize, color: "#6b7280", marginBottom: statLabelMb }}>Goal</div>
              <div style={{ fontSize: statValueSize, fontWeight: "700", lineHeight: "1.1", color: isWeightGain ? "#0284c7" : "#ea580c" }}>{goalWeight} kg</div>
            </div>
            <div style={{ textAlign: "center", padding: statPad, background: isWeightGain ? "#f0f9ff" : "#fff7ed", borderRadius: "0.4rem", minHeight: statCardMinHeight, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: statLabelSize, color: "#6b7280", marginBottom: statLabelMb }}>
                {progressPercentage === 100 ? "Done!" : isWeightGain ? "To Gain" : "To Lose"}
              </div>
              <div style={{ fontSize: statValueSize, fontWeight: "700", lineHeight: "1.1", color: isWeightGain ? "#0369a1" : "#c2410c" }}>
                {progressPercentage === 100 ? "✓" : `${remainingKg.toFixed(1)} kg`}
              </div>
            </div>
          </div>

          {/* Progress Info */}
          {!compact && progressPercentage > 0 && progressPercentage < 100 && (
            <div className="goal-widget-progress-info" style={{
              width: "100%",
              padding: "0.65rem 0.75rem",
              background: isWeightGain 
                ? "linear-gradient(135deg, #dbeafe, #bfdbfe)" 
                : "linear-gradient(135deg, #fed7aa, #fdba74)",
              borderRadius: "0.5rem",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              {isWeightGain ? (
                <TrendingUp style={{ width: "1.15rem", height: "1.15rem", color: "#1e40af" }} />
              ) : (
                <TrendingDown style={{ width: "1.15rem", height: "1.15rem", color: "#c2410c" }} />
              )}
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: isWeightGain ? "#1e40af" : "#c2410c" }}>
                  {progressMessage}
                </div>
                <div style={{ fontSize: "0.65rem", color: isWeightGain ? "#1e3a8a" : "#9a3412", marginTop: "0.1rem" }}>
                  Keep up the great work! 💪
                </div>
              </div>
            </div>
          )}
          
          {!compact && progressPercentage === 100 && (
            <div style={{
              width: "100%",
              padding: "0.65rem 0.75rem",
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <div style={{ fontSize: "1.25rem" }}>🎉</div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#92400e" }}>
                  {progressMessage}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#78350f", marginTop: "0.1rem" }}>
                  Maintain your healthy weight! 🌟
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: compact ? "1rem 0.75rem" : "1.5rem 1rem" }}>
          <Scale style={{ width: compact ? "1.5rem" : "2rem", height: compact ? "1.5rem" : "2rem", color: "#cbd5e1", margin: compact ? "0 auto 0.5rem" : "0 auto 0.75rem" }} />
          <p style={{ fontSize: compact ? "0.65rem" : "0.75rem", color: "#6b7280", marginTop: "0", marginRight: "0", marginBottom: compact ? "0.35rem" : "0.5rem", marginLeft: "0" }}>
            {goalWeight == null || startWeight == null
              ? "Set your start weight and goal weight to start tracking progress"
              : "Add weight entries in Progress page to see your progress"}
          </p>
          {(goalWeight == null || startWeight == null) && (
            <button
              onClick={handleStartEdit}
              className="client-button"
              style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", fontSize: "0.75rem" }}
            >
              Set Start & Goal Weight
            </button>
          )}
        </div>
      )}
        </>
      )}
      </div>
    </>
  );
}
