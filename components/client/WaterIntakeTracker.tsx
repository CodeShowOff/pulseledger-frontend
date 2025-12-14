"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WaterIntakeEntry {
  _id: string;
  amountLiters: number;
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

interface AnalyticsData {
  success: boolean;
  period: string;
  summary: {
    totalAmount: string;
    averageGoal: string;
    daysTracked: number;
    averagePerDay: string;
  };
  data: Array<{
    date: string;
    amount: string;
    goal: string;
    percentage: string;
    entries?: Array<{
      _id: string;
      time: string;
      amount: number;
      notes?: string;
    }>;
  }>;
}

export default function WaterIntakeTracker() {
  // Get Indian timezone date string (IST - UTC+5:30)
  const getIndianDateString = () => {
    const now = new Date();
    // Convert to IST by adding 5 hours 30 minutes
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istTime = new Date(now.getTime() + istOffset);
    const year = istTime.getUTCFullYear();
    const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istTime.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState(getIndianDateString());
  const [amountInput, setAmountInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user's daily water goal
  const { data: goalData } = useQuery<{ data: { goal: number } }>({
    queryKey: ["waterGoal"],
    queryFn: async () => {
      const res = await api.get("/water-intake/goal");
      return res.data;
    },
  });

  // Update goal input when goalData changes
  React.useEffect(() => {
    if (goalData?.data?.goal) {
      setGoalInput(goalData.data.goal.toString());
    }
  }, [goalData]);

  // Fetch today's water intake
  const { data: todayData } = useQuery<{ data: TodayDataResponse }>({
    queryKey: ["waterIntakeToday"],
    queryFn: async () => {
      const res = await api.get("/water-intake/today");
      return res.data;
    },
  });

  // Fetch analytics for the week
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["waterIntakeAnalytics", "week", selectedDate],
    queryFn: async () => {
      const res = await api.get("/water-intake/analytics", {
        params: { period: "week", date: selectedDate },
      });
      return res.data as AnalyticsData;
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async (goal: number) => {
      const res = await api.put("/water-intake/goal", { goal });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Daily water goal updated successfully");
      setIsEditingGoal(false);
      queryClient.invalidateQueries({ queryKey: ["waterGoal"] });
      queryClient.invalidateQueries({ queryKey: ["waterIntakeToday"] });
      queryClient.invalidateQueries({ queryKey: ["waterIntakeAnalytics"] });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const msg = (error as any).response?.data?.message || (error as any).message || "Failed to update goal";
        toast.error(msg);
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to update goal");
      } else {
        toast.error("Failed to update goal");
      }
    },
  });

  // Log water intake mutation
  const logMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(amountInput);
      if (!amountInput || isNaN(amount)) {
        throw new Error("Please enter a valid water amount");
      }
      if (amount <= 0 || amount > 100) {
        throw new Error("Amount must be between 0.01 and 100 liters");
      }
      if (!selectedDate) {
        throw new Error("Please select a date");
      }
      // Send date as YYYY-MM-DD string to preserve the exact date
      const res = await api.post("/water-intake", {
        amountLiters: amount,
        date: selectedDate, // Send as "YYYY-MM-DD" string
        notes: notesInput && notesInput.trim() !== "" ? notesInput.trim() : null,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Water intake logged successfully");
      setAmountInput("");
      setNotesInput("");
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["waterIntakeToday"] });
      queryClient.invalidateQueries({ queryKey: ["waterIntakeAnalytics"] });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const msg = (error as any).response?.data?.message || (error as any).message || "Failed to log water intake";
        toast.error(msg);
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to log water intake");
      } else {
        toast.error("Failed to log water intake");
      }
    },
  });

  const todayAmount = todayData?.data?.amountLiters || 0;
  const todayGoal = goalData?.data?.goal || 3.5;
  const todayPercentage = todayGoal > 0 ? ((todayAmount / todayGoal) * 100).toFixed(1) : '0.0';
  const todayEntries = todayData?.data?.entries || [];

  const handleSaveGoal = () => {
    const goal = parseFloat(goalInput);
    if (isNaN(goal) || !goal || goal <= 0) {
      toast.error("Please enter a valid number greater than 0");
      return;
    }
    if (goal < 0.5 || goal > 20) {
      toast.error("Goal must be between 0.5 and 20 liters");
      return;
    }
    updateGoalMutation.mutate(goal);
  };

  const analytics = analyticsData?.data || [];
  const summary = analyticsData?.summary || {
    totalAmount: "0",
    averageGoal: "3.5",
    daysTracked: 0,
    averagePerDay: "0",
  };

  return (
    <div>
      {/* Header */}
      <section className="admin-page-header">
        <h1 className="admin-page-header__title coach-page-header__title">
          💧 Water Intake Tracker
        </h1>
        <p className="admin-page-header__subtitle coach-page-header__subtitle">
          Track your daily water intake and monitor your hydration goals.
        </p>
      </section>

      {/* Daily Goal Setting */}
      <section style={{ marginTop: "1.25rem" }}>
        <div className="admin-card" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 className="admin-page-header__title" style={{ fontSize: "1rem", margin: 0 }}>
              🎯 Daily Water Goal
            </h2>
            {!isEditingGoal && (
              <button
                type="button"
                onClick={() => setIsEditingGoal(true)}
                className="client-button"
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
              >
                Edit Goal
              </button>
            )}
          </div>
          {isEditingGoal ? (
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", fontWeight: "600" }}>
                  Goal (Liters per day)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="20"
                  value={goalInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string for user to clear, but prevent negative
                    if (value === '' || parseFloat(value) >= 0) {
                      setGoalInput(value);
                    }
                  }}
                  className="client-form__control"
                  placeholder="e.g. 3.5"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveGoal}
                disabled={updateGoalMutation.isPending}
                className="client-button"
                style={{ padding: "0.6rem 1.2rem" }}
              >
                {updateGoalMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingGoal(false);
                  setGoalInput(goalData?.data?.goal.toString() || "3.5");
                }}
                className="client-button-secondary"
                style={{ padding: "0.6rem 1.2rem" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <p style={{ fontSize: "2rem", fontWeight: "700", color: "#1e40af", margin: "0.5rem 0 0 0" }}>
              {todayGoal}L per day
            </p>
          )}
        </div>
      </section>

      {/* Log Water Intake Form */}
      <section style={{ marginTop: "1.25rem" }}>
        <div className="admin-card">
          <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "1.25rem", color: "#1e40af" }}>
            💧 Log Water Intake
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                  📅 Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="client-form__control"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                  💧 Amount (Liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  max="100"
                  placeholder="e.g. 0.5"
                  value={amountInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string for user to clear, but prevent negative
                    if (value === '' || parseFloat(value) >= 0) {
                      setAmountInput(value);
                    }
                  }}
                  className="client-form__control"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
            </div>
            
            {notesInput !== "" && (
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                  📝 Notes (Optional)
                </label>
                <textarea
                  placeholder="Add any notes about your water intake..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="client-form__control client-form__control--textarea"
                  rows={3}
                  style={{ fontSize: "0.9rem", resize: "vertical" }}
                />
              </div>
            )}
            
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => logMutation.mutate()}
                disabled={logMutation.isPending}
                className="client-button"
                style={{ flex: 1, padding: "0.75rem 1.5rem", fontSize: "0.95rem", fontWeight: "600" }}
              >
                {logMutation.isPending ? "Logging..." : "✓ Log Water Intake"}
              </button>
              <button
                type="button"
                onClick={() => setNotesInput(notesInput === "" ? " " : "")}
                className="client-button-secondary"
                style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}
              >
                {notesInput === "" ? "+ Add Notes" : "✕ Remove Notes"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Progress */}
      <section style={{ marginTop: "1.25rem" }}>
        <div className="admin-card">
          <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>
            Today's Progress
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div style={{ textAlign: "center", padding: "1rem", borderRadius: "8px", backgroundColor: "#f0f9ff" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>Amount Consumed</p>
              <p style={{ fontSize: "2rem", fontWeight: "700", color: "#0ea5e9" }}>
                {todayAmount.toFixed(1)}L
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>of {todayGoal}L goal</p>
            </div>
            <div style={{ textAlign: "center", padding: "1rem", borderRadius: "8px", backgroundColor: "#f0fdf4" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>Goal Progress</p>
              <p style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981" }}>
                {todayPercentage}%
              </p>
              <div
                style={{
                  marginTop: "0.75rem",
                  height: "8px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(parseFloat(todayPercentage), 100)}%`,
                    backgroundColor: "#10b981",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "1rem", borderRadius: "8px", backgroundColor: "#fef3c7" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>Remaining</p>
              <p style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b" }}>
                {Math.max(0, todayGoal - todayAmount).toFixed(1)}L
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>to reach goal</p>
            </div>
          </div>
          
          {/* Today's Entries - Compact View */}
          {todayEntries.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.75rem", color: "#374151" }}>
                Today's Entries ({todayEntries.length})
              </h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", 
                gap: "0.5rem" 
              }}>
                {todayEntries.map((entry) => (
                  <div
                    key={entry._id}
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "6px",
                      border: "1px solid #bae6fd",
                      textAlign: "center",
                    }}
                    title={entry.notes || ''}
                  >
                    <p style={{ fontSize: "1rem", fontWeight: "700", color: "#0ea5e9", margin: 0 }}>
                      {entry.amountLiters}L
                    </p>
                    {entry.createdAt && (
                      <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem" }}>
                        {new Date(entry.createdAt).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          timeZone: 'Asia/Kolkata'
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>



      {/* Weekly Chart */}
      {!analyticsLoading && analytics.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <div className="admin-card">
            <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              Weekly Water Intake Trend
            </h2>
            
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analytics} margin={{ bottom: 60, left: 0, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: "0.7rem" }}
                    interval={0}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      // Show day name for week view (e.g., "Mon", "Tue")
                      const date = new Date(value);
                      if (isNaN(date.getTime())) return value;
                      return date.toLocaleDateString('en-US', { weekday: 'short' });
                    }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "0.75rem" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number | string) => `${value}L`}
                    labelFormatter={(label) => {
                      // Full date in tooltip for week view
                      const date = new Date(label);
                      if (isNaN(date.getTime())) return label;
                      return date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short', 
                        day: 'numeric'
                      });
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.85rem" }} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    dot={{ fill: "#0ea5e9", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Amount (L)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="goal" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Goal (L)" 
                  />
                </LineChart>
              </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* No Data State */}
      {!analyticsLoading && analytics.length === 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <div className="admin-card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontSize: "1rem", color: "#6b7280" }}>
              No water intake data for this week. Start tracking to see your analytics!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
