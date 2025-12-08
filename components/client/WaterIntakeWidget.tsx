"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Droplet } from "lucide-react";
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
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to log water intake");
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

  return (
    <div className="client-card client-card--highlight">
      <div className="client-card__header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Droplet size={24} className="water-icon" />
          <p className="client-card__title">Water Intake Today</p>
        </div>
        <p className="client-card__subtitle">
          {total.toFixed(1)}L / {goal.toFixed(1)}L
        </p>
      </div>

      {/* Progress Bar */}
      <div className="water-progress-bar">
        <div className="water-progress-fill" style={{ width: `${percentage}%` }}>
          {percentage > 10 && <span className="water-progress-text">{percentage.toFixed(0)}%</span>}
        </div>
      </div>

      {/* Quick Log Buttons */}
      <div className="water-quick-log">
        <button
          onClick={() => handleQuickLog(0.25)}
          disabled={logMutation.isPending}
          className="water-glass-btn"
          title="Log 250ml"
        >
          <Droplet size={20} />
          <span>250ml</span>
        </button>
        <button
          onClick={() => handleQuickLog(0.5)}
          disabled={logMutation.isPending}
          className="water-glass-btn"
          title="Log 500ml"
        >
          <Droplet size={24} />
          <span>500ml</span>
        </button>
        <button
          onClick={() => handleQuickLog(1)}
          disabled={logMutation.isPending}
          className="water-glass-btn"
          title="Log 1L"
        >
          <Droplet size={28} />
          <span>1L</span>
        </button>
      </div>

      {/* Custom Amount Input */}
      <div className="water-custom-input">
        <input
          type="number"
          step="0.1"
          min="0.01"
          max="100"
          placeholder="Custom (L)"
          value={amountInput}
          onChange={(e) => {
            const value = e.target.value;
            // Allow empty string for user to clear, but prevent negative
            if (value === '' || parseFloat(value) >= 0) {
              setAmountInput(value);
            }
          }}
          className="water-input"
          disabled={logMutation.isPending}
        />
        <button
          onClick={handleCustomLog}
          disabled={logMutation.isPending || !amountInput}
          className="water-log-btn"
        >
          {logMutation.isPending ? "Logging..." : "Log"}
        </button>
      </div>

      {/* Link to Full Page */}
      <Link href="/client/water-intake" className="water-view-all-btn">
        View Full Water Intake Log
      </Link>
    </div>
  );
}
