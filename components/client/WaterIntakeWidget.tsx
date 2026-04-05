"use client";

import React from "react";
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
  size?: number;
};

function WaterDoseGlassIcon({ fillRatio, size = 18 }: WaterDoseGlassIconProps) {
  const gradientId = React.useId();
  const iconWidth = 24;
  const iconHeight = 26;
  const glassWidth = 14;
  const glassHeight = 20;
  const glassX = (iconWidth - glassWidth) / 2;
  const glassY = 2;

  const normalizedFill = Math.max(0, Math.min(1, fillRatio));
  const fillInset = 1.7;
  const maxWaterHeight = glassHeight - fillInset * 2;
  const waterHeight = maxWaterHeight * normalizedFill;
  const waterY = glassY + glassHeight - fillInset - waterHeight;

  return (
    <svg
      width={size}
      height={(size * iconHeight) / iconWidth}
      viewBox={`0 0 ${iconWidth} ${iconHeight}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.94" />
        </linearGradient>
      </defs>

      <rect
        x={glassX}
        y={glassY}
        width={glassWidth}
        height={glassHeight}
        rx={3.5}
        fill="rgba(20, 184, 166, 0.13)"
        stroke="rgba(15, 118, 110, 0.68)"
        strokeWidth={1.4}
      />

      {waterHeight > 0 ? (
        <rect
          x={glassX + fillInset}
          y={waterY}
          width={glassWidth - fillInset * 2}
          height={waterHeight}
          rx={2}
          fill={`url(#${gradientId})`}
        />
      ) : null}

      <path
        d={`M ${glassX + 2.1} ${glassY + 4} L ${glassX + 2.1} ${glassY + glassHeight - 2.5}`}
        stroke="rgba(240, 253, 250, 0.8)"
        strokeWidth={1.05}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function WaterIntakeWidget({ compact = false }: WaterIntakeWidgetProps) {
  const queryClient = useQueryClient();

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

  const total = todayData?.data?.amountLiters || 0;
  const goal = goalData?.data?.goal || 3.5;
  const percentage = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
  const rootPadding = compact ? "0.8rem" : "0.95rem";
  const rootRadius = compact ? "0.9rem" : "1rem";
  const titleSize = compact ? "0.9rem" : "0.98rem";
  const valueSize = compact ? "1.2rem" : "1.45rem";
  const quickButtonPadding = compact ? "0.52rem 0.2rem" : "0.58rem 0.25rem";
  const quickIconSize = compact ? 16 : 18;
  const quickCaptionSize = compact ? "0.52rem" : "0.56rem";

  const quickButtons = [
    { amount: 0.25, label: "250ml", fillRatio: 0.25 },
    { amount: 0.5, label: "500ml", fillRatio: 0.5 },
    { amount: 1, label: "1L", fillRatio: 1 },
  ] as const;

  return (
    <div
      style={{
        background: "#f7fbfa",
        borderRadius: rootRadius,
        border: "1px solid #ddebe7",
        padding: rootPadding,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: compact ? "0.7rem" : "0.82rem",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: compact ? "0.55rem" : "0.65rem", minWidth: 0 }}>
          <span
            style={{
              width: compact ? "2rem" : "2.2rem",
              height: compact ? "2rem" : "2.2rem",
              borderRadius: "0.75rem",
              background: "#e6f7f1",
              border: "1px solid #cdeee2",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <GlassWater style={{ width: compact ? "1rem" : "1.1rem", height: compact ? "1rem" : "1.1rem", color: "#0f766e" }} />
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
              Water Intake
            </h3>
          </div>
        </div>

        <Link
          href="/client/water-intake"
          style={{
            width: compact ? "1.9rem" : "2rem",
            height: compact ? "1.9rem" : "2rem",
            background: "#f1f8f6",
            border: "1px solid #dbe8e3",
            borderRadius: "0.65rem",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            transition: "all 0.2s ease",
            textDecoration: "none",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#eaf4f1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f1f8f6";
          }}
          title="View Full Water Intake Log"
        >
          <ExternalLink style={{ width: compact ? "0.8rem" : "0.9rem", height: compact ? "0.8rem" : "0.9rem", color: "#0f766e" }} />
        </Link>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #ddebe7",
          borderRadius: compact ? "0.78rem" : "0.88rem",
          padding: compact ? "0.68rem" : "0.8rem",
          display: "flex",
          flexDirection: "column",
          gap: compact ? "0.45rem" : "0.55rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", minWidth: 0 }}>
            <span style={{ margin: 0, fontSize: valueSize, fontWeight: 700, color: "#0f766e", lineHeight: 1 }}>
              {total.toFixed(1)}L
            </span>
            <span style={{ margin: 0, fontSize: compact ? "0.72rem" : "0.78rem", color: "#64748b" }}>
              / {goal.toFixed(1)}L
            </span>
          </div>

          <span
            style={{
              fontSize: compact ? "0.75rem" : "0.82rem",
              fontWeight: 700,
              color: "#115e59",
              background: "#e3f5f0",
              border: "1px solid #d0e9e0",
              borderRadius: "999px",
              padding: compact ? "0.24rem 0.5rem" : "0.3rem 0.6rem",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {Math.round(percentage)}%
          </span>
        </div>

        <div style={{ width: "100%", height: compact ? "0.38rem" : "0.45rem", background: "#dcebe6", borderRadius: "999px", overflow: "hidden" }} aria-label={`${Math.round(percentage)} percent hydrated`}>
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              background: "linear-gradient(90deg, #34d399 0%, #14b8a6 100%)",
              borderRadius: "999px",
              transition: "width 620ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: compact ? "0.42rem" : "0.55rem" }}>
        {quickButtons.map((option) => (
          <button
            key={option.label}
            onClick={() => handleQuickLog(option.amount)}
            disabled={logMutation.isPending}
            aria-label={`Log ${option.label} water`}
            style={{
              padding: quickButtonPadding,
              background: "#ffffff",
              border: "1px solid #ddebe7",
              borderRadius: compact ? "0.72rem" : "0.82rem",
              cursor: logMutation.isPending ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: compact ? "0.08rem" : "0.1rem",
              color: "#0f766e",
              transition: "all 0.2s ease",
              opacity: logMutation.isPending ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.background = "#f1f8f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            <WaterDoseGlassIcon fillRatio={option.fillRatio} size={quickIconSize} />
            <span
              style={{
                fontSize: quickCaptionSize,
                fontWeight: 600,
                lineHeight: 1,
                color: "#64748b",
                letterSpacing: "0.01em",
              }}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
