"use client";

import React, { useId, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { GlassWater, ExternalLink } from "lucide-react";
import Link from "next/link";

interface WaterIntakeEntry {
  _id: string;
  amountLiters: number;
  date: string;
  goal: number;
  notes?: string;
  createdAt?: string;
}

interface TodayDataResponse {
  amountLiters: number;
  goal: number;
  date: string;
  clientId: string;
  entries: WaterIntakeEntry[];
}

type WaterIntakeWidgetProps = {
  compact?: boolean;
};

type WaterDoseGlassIconProps = {
  fillRatio: number;
  label: string;
  compact?: boolean;
};

function WaterDoseGlassIcon({ fillRatio, label, compact = false }: WaterDoseGlassIconProps) {
  const iconWidth = compact ? 34 : 40;
  const iconHeight = compact ? 30 : 34;
  const glassWidth = compact ? 18 : 22;
  const glassHeight = compact ? 23 : 27;
  const glassX = (iconWidth - glassWidth) / 2;
  const glassY = compact ? 2.5 : 3;
  const gradientId = useId();

  const normalizedFill = Math.max(0, Math.min(1, fillRatio));
  const fillInset = 2;
  const maxWaterHeight = glassHeight - fillInset * 2;
  const waterHeight = Math.max(1.2, maxWaterHeight * normalizedFill);
  const waterY = glassY + glassHeight - fillInset - waterHeight;

  return (
    <div
      style={{
        width: `${iconWidth}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: compact ? "0.04rem" : "0.08rem",
      }}
      aria-hidden="true"
    >
      <svg width={iconWidth} height={iconHeight} viewBox={`0 0 ${iconWidth} ${iconHeight}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.94" />
          </linearGradient>
        </defs>

        <rect
          x={glassX}
          y={glassY}
          width={glassWidth}
          height={glassHeight}
          rx={compact ? 4 : 4.5}
          fill="rgba(34, 197, 94, 0.16)"
          stroke="rgba(21, 128, 61, 0.68)"
          strokeWidth={1.6}
        />

        <rect
          x={glassX + fillInset}
          y={waterY}
          width={glassWidth - fillInset * 2}
          height={waterHeight}
          rx={2.2}
          fill={`url(#${gradientId})`}
        />

        <path
          d={`M ${glassX + 2.5} ${glassY + 5} L ${glassX + 2.5} ${glassY + glassHeight - 3}`}
          stroke="rgba(220, 252, 231, 0.75)"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      </svg>

      <span
        style={{
          textAlign: "center",
          fontSize: compact ? "0.5rem" : "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.01em",
          color: "rgba(22, 101, 52, 0.45)",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function WaterIntakeWidget({ compact = false }: WaterIntakeWidgetProps) {
  const [amountInput, setAmountInput] = useState("");
  const queryClient = useQueryClient();
  const ringGradientId = useId();

  // Fetch user's daily water goal
  const { data: goalData } = useQuery<{ data: { goal: number } }>({
    queryKey: ["waterGoal"],
    queryFn: async () => {
      const res = await api.get("/water-intake/goal");
      return res.data;
    },
  });

  // Fetch today's water intake
  const { data: todayData } = useQuery<{ data: TodayDataResponse }>({
    queryKey: ["waterIntakeToday"],
    queryFn: async () => {
      const res = await api.get("/water-intake/today");
      return res.data;
    },
  });

  // Log water intake mutation
  const logMutation = useMutation({
    mutationFn: async (amount: number) => {
      // Get today's date in YYYY-MM-DD format (client's local date)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDate = `${year}-${month}-${day}`;
      
      const res = await api.post("/water-intake", {
        amountLiters: amount,
        date: todayDate, // Send as "YYYY-MM-DD" string
        notes: null,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Water intake logged!");
      setAmountInput("");
      queryClient.invalidateQueries({ queryKey: ["waterIntakeToday"] });
      queryClient.invalidateQueries({ queryKey: ["waterIntakeAnalytics"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to log water intake");
    },
  });

  const handleQuickLog = (amount: number) => {
    if (amount <= 0 || amount > 100) {
      toast.error("Invalid amount");
      return;
    }
    logMutation.mutate(amount);
  };

  const handleCustomLog = () => {
    const amount = parseFloat(amountInput);
    if (!amountInput || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount <= 0 || amount > 100) {
      toast.error("Amount must be between 0.01 and 100 liters");
      return;
    }
    logMutation.mutate(amount);
  };

  const total = todayData?.data?.amountLiters || 0;
  const goal = goalData?.data?.goal || 3.5;
  const percentage = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;

  const widgetPadding = compact ? "0.7rem" : "1rem";
  const widgetRadius = compact ? "0.65rem" : "0.75rem";
  const headerGap = compact ? "0.3rem" : "0.35rem";
  const headerTitleSize = compact ? "0.8rem" : "0.95rem";
  const buttonPad = compact ? "0.28rem" : "0.4rem";
  const chipPad = compact ? "0.4rem" : "0.5rem";
  const chipLabelSize = compact ? "0.58rem" : "0.65rem";
  const chipValueSize = compact ? "0.82rem" : "0.95rem";
  const quickPad = compact ? "0.4rem 0.2rem" : "0.5rem 0.25rem";
  const quickFontSize = compact ? "0.66rem" : "0.75rem";
  const statCardMinHeight = compact ? 48 : undefined;
  const quickButtons = [
    { amount: 0.25, label: "250ml", fillRatio: 0.25 },
    { amount: 0.5, label: "500ml", fillRatio: 0.5 },
    { amount: 1, label: "1L", fillRatio: 1 },
  ] as const;
  
  // Circular progress values - compact for mobile
  const strokeWidth = compact ? 8 : 10;
  const size = compact ? 94 : 140;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const ringAnimationStyle: React.CSSProperties = {
    transition: `stroke-dashoffset ${compact ? "720ms" : "620ms"} cubic-bezier(0.22, 1, 0.36, 1)`,
    willChange: "stroke-dashoffset",
    backfaceVisibility: "hidden",
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
      borderRadius: widgetRadius,
      border: "1px solid #dcfce7",
      padding: widgetPadding,
      height: compact ? "100%" : "auto",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: compact ? "0.65rem" : "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: headerGap }}>
          <GlassWater style={{ width: compact ? "0.85rem" : "1rem", height: compact ? "0.85rem" : "1rem", color: "#22c55e" }} />
          <h3 style={{ 
            fontSize: headerTitleSize, 
            fontWeight: "600", 
            color: "#111827",
            marginTop: "0",
            marginRight: "0",
            marginBottom: "0",
            marginLeft: "0"
          }}>
            Water Intake
          </h3>
        </div>
        <Link
          href="/client/water-intake"
          style={{
            padding: buttonPad,
            background: "#f0f9ff",
            border: "1px solid #dcfce7",
            borderRadius: "0.4rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            textDecoration: "none"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#dcfce7"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#f0f9ff"}
          title="View Full Water Intake Log"
        >
          <ExternalLink style={{ width: compact ? "0.78rem" : "0.9rem", height: compact ? "0.78rem" : "0.9rem", color: "#22c55e" }} />
        </Link>
      </div>

      {/* Progress Circle */}
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
              stroke="#dcfce7"
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
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
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
              {Math.round(percentage)}%
            </div>
            <div style={{ fontSize: compact ? "0.6rem" : "0.7rem", color: "#6b7280", marginTop: compact ? "0.2rem" : "0.35rem" }}>
              Hydrated
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: compact ? "0.35rem" : "0.5rem",
          width: "100%"
        }}>
          <div style={{ textAlign: "center", padding: chipPad, background: "#f0fdf4", borderRadius: "0.4rem", minHeight: statCardMinHeight, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: chipLabelSize, color: "#6b7280", marginBottom: compact ? "0.08rem" : "0.15rem" }}>Today</div>
            <div style={{ fontSize: chipValueSize, fontWeight: "700", color: "#22c55e" }}>{total.toFixed(1)}L</div>
          </div>
          <div style={{ textAlign: "center", padding: chipPad, background: "#f0fdf4", borderRadius: "0.4rem", minHeight: statCardMinHeight, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: chipLabelSize, color: "#6b7280", marginBottom: compact ? "0.08rem" : "0.15rem" }}>Goal</div>
            <div style={{ fontSize: chipValueSize, fontWeight: "700", color: "#10b981" }}>{goal.toFixed(1)}L</div>
          </div>
          <div style={{ textAlign: "center", padding: chipPad, background: "#f0fdf4", borderRadius: "0.4rem", minHeight: statCardMinHeight, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: chipLabelSize, color: "#6b7280", marginBottom: compact ? "0.08rem" : "0.15rem" }}>
              {percentage >= 100 ? "Done!" : "Left"}
            </div>
            <div style={{ fontSize: chipValueSize, fontWeight: "700", color: "#15803d" }}>
              {percentage >= 100 ? "✓" : `${(goal - total).toFixed(1)}L`}
            </div>
          </div>
        </div>

        {/* Quick Log Buttons */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: compact ? "0.35rem" : "0.5rem",
          width: "100%"
        }}>
          {quickButtons.map((option) => (
            <button
              key={option.label}
              onClick={() => handleQuickLog(option.amount)}
              disabled={logMutation.isPending}
              aria-label={`Log ${option.label} water`}
              style={{
                padding: quickPad,
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                border: "1px solid #bbf7d0",
                borderRadius: "0.4rem",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.1rem",
                fontSize: quickFontSize,
                fontWeight: "600",
                color: "#15803d",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <WaterDoseGlassIcon
                compact={compact}
                fillRatio={option.fillRatio}
                label={option.label}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
