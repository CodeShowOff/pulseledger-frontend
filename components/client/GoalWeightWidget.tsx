// Goal Weight Progress Widget - Circular progress indicator
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { fetchClientProgressEntries } from "@/lib/queries/clientProgress";
import { Scale, Target, TrendingDown, TrendingUp, Edit2, X, Check } from "lucide-react";
import { toast } from "sonner";

const fetchGoalWeight = async (): Promise<number | null> => {
  try {
    const res = await api.get("/progress/goal-weight");
    return res.data?.goalWeight ?? null;
  } catch {
    return null;
  }
};

export default function GoalWeightWidget() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [goalValue, setGoalValue] = useState("");

  const { data: goalWeight } = useQuery({
    queryKey: ["goalWeight"],
    queryFn: fetchGoalWeight,
    staleTime: 5 * 60 * 1000,
  });

  const { data: progressData } = useQuery({
    queryKey: ["clientProgressEntries"],
    queryFn: fetchClientProgressEntries,
    staleTime: 60 * 1000,
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (weight: number) => {
      const res = await api.put("/progress/goal-weight", { goalWeight: weight });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goalWeight"] });
      toast.success("Goal weight updated successfully");
      setIsEditing(false);
      setGoalValue("");
    },
    onError: () => {
      toast.error("Failed to update goal weight");
    },
  });

  const handleSaveGoal = () => {
    const weight = parseFloat(goalValue);
    if (isNaN(weight) || weight <= 0 || weight > 500) {
      toast.error("Please enter a valid weight (1-500 kg)");
      return;
    }
    updateGoalMutation.mutate(weight);
  };

  const handleStartEdit = () => {
    setGoalValue(goalWeight?.toString() || "");
    setIsEditing(true);
  };

  // Calculate progress
  const entries = progressData?.data || [];
  
  // Get latest weight (most recent entry with weight)
  const getLatestValue = (fieldName: string): number | null => {
    let latest: { date: string; value: any } | null = null;
    for (const raw of entries) {
      const entry = raw as any;
      if (entry[fieldName] != null) {
        if (!latest || new Date(entry.date) > new Date(latest.date)) {
          latest = { date: entry.date, value: entry[fieldName] };
        }
      }
    }
    return latest ? latest.value : null;
  };
  
  const currentWeight = getLatestValue('weight');

  // Determine if user is trying to lose or gain weight
  let progressPercentage = 0;
  let remainingKg = 0;
  let achievedKg = 0;
  let isWeightLoss = false;
  let isWeightGain = false;
  let progressMessage = "";

  if (goalWeight && currentWeight) {
    const difference = currentWeight - goalWeight;
    
    if (difference > 0) {
      // User needs to LOSE weight (overweight scenario)
      isWeightLoss = true;
      
      // Find highest weight (starting point for weight loss)
      const highestWeight = entries.length > 0 
        ? entries.reduce((highest, entry) => {
            if (!entry.weight) return highest;
            return entry.weight > highest ? entry.weight : highest;
          }, currentWeight)
        : currentWeight;
      
      // Use the higher of: highest weight ever OR current weight
      // This ensures if current is at peak, we use current as baseline
      const startingWeight = Math.max(highestWeight, currentWeight);
      
      const totalToLose = startingWeight - goalWeight;
      const alreadyLost = startingWeight - currentWeight;
      
      if (totalToLose > 0) {
        progressPercentage = Math.min(100, Math.max(0, (alreadyLost / totalToLose) * 100));
        achievedKg = alreadyLost;
      }
      
      // If at starting point (0% progress), show total amount to lose
      remainingKg = currentWeight - goalWeight;
      
      progressMessage = achievedKg > 0 
        ? `You've lost ${achievedKg.toFixed(1)} kg so far!`
        : `${remainingKg.toFixed(1)} kg to lose to reach your goal!`;
      
    } else if (difference < 0) {
      // User needs to GAIN weight (underweight scenario)
      isWeightGain = true;
      
      // Find lowest weight (starting point for weight gain)
      const lowestWeight = entries.length > 0 
        ? entries.reduce((lowest, entry) => {
            if (!entry.weight) return lowest;
            return entry.weight < lowest ? entry.weight : lowest;
          }, currentWeight)
        : currentWeight;
      
      // Use the lower of: lowest weight ever OR current weight
      const startingWeight = Math.min(lowestWeight, currentWeight);
      
      const totalToGain = goalWeight - startingWeight;
      const alreadyGained = currentWeight - startingWeight;
      
      if (totalToGain > 0) {
        progressPercentage = Math.min(100, Math.max(0, (alreadyGained / totalToGain) * 100));
        achievedKg = alreadyGained;
      }
      
      remainingKg = Math.abs(difference);
      
      progressMessage = achievedKg > 0 
        ? `You've gained ${achievedKg.toFixed(1)} kg so far!`
        : `${remainingKg.toFixed(1)} kg to gain to reach your goal!`;
        
    } else {
      // User has reached goal weight
      progressPercentage = 100;
      remainingKg = 0;
      achievedKg = 0;
      progressMessage = "🎉 Goal achieved! Congratulations!";
    }
  }

  const strokeWidth = 6;
  const size = 140;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <>
      <style jsx>{`
        .goal-widget-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          width: 100%;
        }
        .goal-widget-progress-info {
          display: flex;
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
        borderRadius: "0.75rem",
        border: "1px solid #e0f2fe",
        padding: "1rem",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)"
      }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Target style={{ width: "1rem", height: "1rem", color: "#0ea5e9" }} />
          <h3 style={{ 
            fontSize: "0.95rem", 
            fontWeight: "600", 
            color: "#111827",
            marginTop: "0",
            marginRight: "0",
            marginBottom: "0",
            marginLeft: "0"
          }}>
            Weight Goal Progress
          </h3>
        </div>
        {!isEditing && (
          <button
            onClick={handleStartEdit}
            style={{
              padding: "0.4rem",
              background: "#f0f9ff",
              border: "1px solid #e0f2fe",
              borderRadius: "0.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#e0f2fe"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#f0f9ff"}
          >
            <Edit2 style={{ width: "0.9rem", height: "0.9rem", color: "#0ea5e9" }} />
          </button>
        )}
      </div>

      {/* Goal Weight Input */}
      {isEditing && (
        <div style={{
          background: "#ffffff",
          padding: "0.75rem",
          borderRadius: "0.5rem",
          border: "1px solid #e0f2fe",
          marginBottom: "1rem"
        }}>
          <label style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.35rem", display: "block", fontWeight: "500" }}>
            Set Your Goal Weight (kg)
          </label>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <input
              type="number"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              placeholder="e.g., 70"
              min="1"
              max="500"
              step="0.1"
              style={{
                flex: 1,
                padding: "0.625rem 0.875rem",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                fontSize: "0.9375rem",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
            <button
              onClick={handleSaveGoal}
              disabled={updateGoalMutation.isPending}
              style={{
                padding: "0.625rem 1rem",
                background: "#0ea5e9",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <Check style={{ width: "1rem", height: "1rem" }} />
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setGoalValue("");
              }}
              style={{
                padding: "0.625rem 1rem",
                background: "#f3f4f6",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <X style={{ width: "1rem", height: "1rem" }} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Progress Circle */}
      {goalWeight && currentWeight ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
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
                stroke="url(#gradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#06b6d4" />
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
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", lineHeight: "1" }}>
                {Math.round(progressPercentage)}%
              </div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.35rem" }}>
                Achieved
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="goal-widget-stats">
            <div style={{ textAlign: "center", padding: "0.5rem", background: "#f0f9ff", borderRadius: "0.4rem" }}>
              <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.15rem" }}>Current</div>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0ea5e9" }}>{currentWeight} kg</div>
            </div>
            <div style={{ textAlign: "center", padding: "0.5rem", background: "#f0f9ff", borderRadius: "0.4rem" }}>
              <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.15rem" }}>Goal</div>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0284c7" }}>{goalWeight} kg</div>
            </div>
            <div style={{ textAlign: "center", padding: "0.5rem", background: "#f0f9ff", borderRadius: "0.4rem" }}>
              <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.15rem" }}>
                {progressPercentage === 100 ? "Done!" : isWeightGain ? "To Gain" : "To Lose"}
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0369a1" }}>
                {progressPercentage === 100 ? "✓" : `${remainingKg.toFixed(1)} kg`}
              </div>
            </div>
          </div>

          {/* Progress Info */}
          {progressPercentage > 0 && progressPercentage < 100 && (
            <div className="goal-widget-progress-info" style={{
              width: "100%",
              padding: "0.65rem 0.75rem",
              background: isWeightGain 
                ? "linear-gradient(135deg, #dbeafe, #bfdbfe)" 
                : "linear-gradient(135deg, #dcfce7, #bbf7d0)",
              borderRadius: "0.5rem",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              {isWeightGain ? (
                <TrendingUp style={{ width: "1.15rem", height: "1.15rem", color: "#1e40af" }} />
              ) : (
                <TrendingDown style={{ width: "1.15rem", height: "1.15rem", color: "#15803d" }} />
              )}
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: isWeightGain ? "#1e40af" : "#15803d" }}>
                  {progressMessage}
                </div>
                <div style={{ fontSize: "0.65rem", color: isWeightGain ? "#1e3a8a" : "#166534", marginTop: "0.1rem" }}>
                  Keep up the great work! 💪
                </div>
              </div>
            </div>
          )}
          
          {progressPercentage === 100 && (
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
        <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
          <Scale style={{ width: "2rem", height: "2rem", color: "#cbd5e1", margin: "0 auto 0.75rem" }} />
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0", marginRight: "0", marginBottom: "0.5rem", marginLeft: "0" }}>
            {!goalWeight ? "Set your goal weight to start tracking progress" : "Add weight entries in Progress page to see your progress"}
          </p>
          {!goalWeight && (
            <button
              onClick={handleStartEdit}
              className="client-button"
              style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", fontSize: "0.75rem" }}
            >
              Set Goal Weight
            </button>
          )}
        </div>
      )}
      </div>
    </>
  );
}
