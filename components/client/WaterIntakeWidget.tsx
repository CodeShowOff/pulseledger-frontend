"use client";

import React, { useState } from "react";
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

export default function WaterIntakeWidget() {
  const [amountInput, setAmountInput] = useState("");
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
  
  // Circular progress values - compact for mobile
  const strokeWidth = 6;
  const size = 140;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{
      background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
      borderRadius: "0.75rem",
      border: "1px solid #dcfce7",
      padding: "1rem",
      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <GlassWater style={{ width: "1rem", height: "1rem", color: "#22c55e" }} />
          <h3 style={{ 
            fontSize: "0.95rem", 
            fontWeight: "600", 
            color: "#111827",
            marginTop: "0",
            marginRight: "0",
            marginBottom: "0",
            marginLeft: "0"
          }}>
            Water Intake Today
          </h3>
        </div>
        <Link
          href="/client/water-intake"
          style={{
            padding: "0.4rem",
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
          <ExternalLink style={{ width: "0.9rem", height: "0.9rem", color: "#22c55e" }} />
        </Link>
      </div>

      {/* Progress Circle */}
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
              stroke="#dcfce7"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#greenGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", lineHeight: "1" }}>
              {Math.round(percentage)}%
            </div>
            <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.35rem" }}>
              Hydrated
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
          width: "100%"
        }}>
          <div style={{ textAlign: "center", padding: "0.5rem", background: "#f0fdf4", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.15rem" }}>Today</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#22c55e" }}>{total.toFixed(1)}L</div>
          </div>
          <div style={{ textAlign: "center", padding: "0.5rem", background: "#f0fdf4", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.15rem" }}>Goal</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#10b981" }}>{goal.toFixed(1)}L</div>
          </div>
          <div style={{ textAlign: "center", padding: "0.5rem", background: "#f0fdf4", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.15rem" }}>
              {percentage >= 100 ? "Done!" : "Left"}
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#15803d" }}>
              {percentage >= 100 ? "✓" : `${(goal - total).toFixed(1)}L`}
            </div>
          </div>
        </div>

        {/* Quick Log Buttons */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
          width: "100%"
        }}>
          <button
            onClick={() => handleQuickLog(0.25)}
            disabled={logMutation.isPending}
            style={{
              padding: "0.5rem 0.25rem",
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              border: "1px solid #bbf7d0",
              borderRadius: "0.4rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.1rem",
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#15803d",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <GlassWater style={{ width: "0.85rem", height: "0.85rem" }} />
            250ml
          </button>
          <button
            onClick={() => handleQuickLog(0.5)}
            disabled={logMutation.isPending}
            style={{
              padding: "0.5rem 0.25rem",
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              border: "1px solid #bbf7d0",
              borderRadius: "0.4rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.1rem",
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#15803d",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <GlassWater style={{ width: "0.85rem", height: "0.85rem" }} />
            500ml
          </button>
          <button
            onClick={() => handleQuickLog(1)}
            disabled={logMutation.isPending}
            style={{
              padding: "0.5rem 0.25rem",
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              border: "1px solid #bbf7d0",
              borderRadius: "0.4rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.1rem",
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#15803d",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <GlassWater style={{ width: "0.85rem", height: "0.85rem" }} />
            1L
          </button>
        </div>
      </div>
    </div>
  );
}
