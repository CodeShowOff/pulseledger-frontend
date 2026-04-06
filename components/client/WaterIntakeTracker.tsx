"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import {
  Clock3,
  Droplets,
  LineChart as LineChartIcon,
  Loader2,
  Pencil,
  PlusCircle,
  Save,
  Target,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  ComposedChart,
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

type ApiResponseError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as ApiResponseError;
    return axiosError.response?.data?.message || axiosError.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

const quickGlassOptions = [
  { amount: 0.25, label: "250ml", fillRatio: 0.25 },
  { amount: 0.5, label: "500ml", fillRatio: 0.5 },
  { amount: 1, label: "1L", fillRatio: 1 },
] as const;

type WaterDoseGlassIconProps = {
  fillRatio: number;
};

function WaterDoseGlassIcon({ fillRatio }: WaterDoseGlassIconProps) {
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
  const waterHeight = Math.max(1.2, maxWaterHeight * normalizedFill);
  const waterY = glassY + glassHeight - fillInset - waterHeight;

  return (
    <svg width={iconWidth} height={iconHeight} viewBox={`0 0 ${iconWidth} ${iconHeight}`} aria-hidden="true">
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
        rx={3.5}
        fill="rgba(34, 197, 94, 0.16)"
        stroke="rgba(21, 128, 61, 0.68)"
        strokeWidth={1.8}
      />

      <rect
        x={glassX + fillInset}
        y={waterY}
        width={glassWidth - fillInset * 2}
        height={waterHeight}
        rx={2}
        fill={`url(#${gradientId})`}
      />

      <path
        d={`M ${glassX + 2.1} ${glassY + 4} L ${glassX + 2.1} ${glassY + glassHeight - 2.5}`}
        stroke="rgba(220, 252, 231, 0.75)"
        strokeWidth={1.35}
        strokeLinecap="round"
      />
    </svg>
  );
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
  const [showNotesField, setShowNotesField] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user's daily water goal
  const { data: goalData, isError: goalError } = useQuery<{ data: { goal: number } }>({
    queryKey: ["waterGoal"],
    queryFn: async () => {
      const res = await api.get("/water-intake/goal");
      return res.data;
    },
  });

  // Update goal input when goalData changes
  React.useEffect(() => {
    if (typeof goalData?.data?.goal === "number") {
      setGoalInput(goalData.data.goal.toString());
    }
  }, [goalData]);

  // Fetch today's water intake
  const { data: todayData, isLoading: todayLoading, isError: todayError } = useQuery<{ data: TodayDataResponse }>({
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
      toast.error(getApiErrorMessage(error, "Failed to update goal"));
    },
  });

  type LogWaterPayload = {
    amount: number;
    date: string;
    notes?: string | null;
  };

  // Log water intake mutation
  const logMutation = useMutation({
    mutationFn: async ({ amount, date, notes }: LogWaterPayload) => {
      if (!amount || Number.isNaN(amount)) {
        throw new Error("Please enter a valid water amount");
      }
      if (amount <= 0 || amount > 100) {
        throw new Error("Amount must be between 0.01 and 100 liters");
      }
      if (!date) {
        throw new Error("Please select a date");
      }

      const res = await api.post("/water-intake", {
        amountLiters: amount,
        date,
        notes: notes && notes.trim() !== "" ? notes.trim() : null,
      });
      return res.data;
    },
    onSuccess: (_data, payload) => {
      toast.success(`${payload.amount.toFixed(2)}L logged`);
      setAmountInput("");
      setNotesInput("");
      setShowNotesField(false);
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["waterIntakeToday"] });
      queryClient.invalidateQueries({ queryKey: ["waterIntakeAnalytics"] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to log water intake"));
    },
  });

  const logWaterAmount = (amount: number, notes?: string | null) => {
    logMutation.mutate({
      amount,
      date: selectedDate,
      notes,
    });
  };

  const handleQuickLog = (amount: number) => {
    if (!selectedDate) {
      toast.error("Select date");
      return;
    }
    logWaterAmount(amount);
  };

  const handleCustomLog = () => {
    const amount = parseFloat(amountInput);
    if (!amountInput || Number.isNaN(amount)) {
      toast.error("Enter amount");
      return;
    }
    if (amount <= 0 || amount > 100) {
      toast.error("Amount must be 0.01 to 100L");
      return;
    }
    if (!selectedDate) {
      toast.error("Select date");
      return;
    }
    logWaterAmount(amount, showNotesField ? notesInput : null);
  };

  const todayAmount = todayData?.data?.amountLiters || 0;
  const todayGoal = goalData?.data?.goal || 3.5;
  const todayPercentageValue = todayGoal > 0 ? (todayAmount / todayGoal) * 100 : 0;
  const todayPercentage = todayPercentageValue.toFixed(1);
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

  const chartData = useMemo(
    () =>
      analytics.map((point) => ({
        ...point,
        amountValue: Number(point.amount || 0),
        goalValue: Number(point.goal || 0),
        dayLabel: (() => {
          const date = new Date(point.date);
          if (Number.isNaN(date.getTime())) return point.date;
          return date.toLocaleDateString("en-US", { weekday: "short" });
        })(),
      })),
    [analytics]
  );

  const hasEntriesToday = todayEntries.length > 0;

  return (
    <div className="space-y-4 md:space-y-5">
      <Card className="border-indigo-100/80 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
                  <Target className="h-4 w-4" />
                </span>
                Daily Goal
              </CardTitle>
            </div>

            {!isEditingGoal ? (
              <Button type="button" variant="outline" onClick={() => setIsEditingGoal(true)}>
                <Pencil className="h-4 w-4" />
                Edit goal
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {goalError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Failed to load water goal. You can still try setting a new goal.
            </div>
          ) : null}

          {isEditingGoal ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Goal (liters per day)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="20"
                  value={goalInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || parseFloat(value) >= 0) {
                      setGoalInput(value);
                    }
                  }}
                  className="client-form__control"
                  placeholder="e.g. 3.5"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleSaveGoal}
                  disabled={updateGoalMutation.isPending}
                >
                  {updateGoalMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {updateGoalMutation.isPending ? "Saving..." : "Save goal"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditingGoal(false);
                    setGoalInput(goalData?.data?.goal?.toString() || "3.5");
                  }}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-indigo-700 md:text-4xl">{todayGoal}L</p>
              <p className="pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">/ day</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-50 text-cyan-600">
              <Droplets className="h-4 w-4" />
            </span>
            Log Water Intake
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          <div className="grid grid-cols-3 gap-2">
            {quickGlassOptions.map((option) => (
              <Button
                key={option.label}
                type="button"
                variant="secondary"
                disabled={logMutation.isPending}
                onClick={() => handleQuickLog(option.amount)}
                className="h-14 flex-col gap-0.5 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100 px-2 text-emerald-800 hover:from-emerald-100 hover:to-green-200"
              >
                <WaterDoseGlassIcon fillRatio={option.fillRatio} />
                <span className="text-[11px] font-semibold leading-none">{option.label}</span>
              </Button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="client-form__control pr-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Custom (L)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.01"
                max="100"
                placeholder="0.5"
                value={amountInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || parseFloat(value) >= 0) {
                    setAmountInput(value);
                  }
                }}
                className="client-form__control"
              />
            </div>
          </div>

          {showNotesField ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes (optional)
              </label>
              <textarea
                placeholder="Add notes about your water intake..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="client-form__control client-form__control--textarea"
                rows={3}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleCustomLog}
              disabled={logMutation.isPending}
            >
              {logMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              {logMutation.isPending ? "Adding..." : "Add custom"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (showNotesField) {
                  setNotesInput("");
                }
                setShowNotesField((prev) => !prev);
              }}
            >
              {showNotesField ? (
                <>
                  <X className="h-4 w-4" />
                  Hide notes
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Notes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Today&apos;s Progress</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {todayLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Loading...
            </div>
          ) : todayError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Could not load today.
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 px-3 py-3">
                  <p className="text-xs uppercase tracking-wide text-cyan-700">Taken</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-700">{todayAmount.toFixed(1)}L</p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-3">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Progress</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{todayPercentage}%</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                      style={{ width: `${Math.min(todayPercentageValue, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-3">
                  <p className="text-xs uppercase tracking-wide text-amber-700">Left</p>
                  <p className="mt-1 text-2xl font-bold text-amber-700">
                    {Math.max(0, todayGoal - todayAmount).toFixed(1)}L
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">Entries</h3>
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {todayEntries.length} logged
                  </Badge>
                </div>

                {hasEntriesToday ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {todayEntries.map((entry) => (
                      <div
                        key={entry._id}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5"
                      >
                        <p className="text-lg font-bold text-cyan-700">{entry.amountLiters}L</p>
                        {entry.createdAt ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            {new Date(entry.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Kolkata",
                            })}
                          </p>
                        ) : null}
                        {entry.notes ? (
                          <p className="mt-2 line-clamp-2 text-xs text-slate-600">{entry.notes}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-3 text-sm text-slate-600">No logs yet.</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <LineChartIcon className="h-4 w-4" />
                </span>
                Weekly Trend
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{summary.daysTracked} tracked days</Badge>
              <Badge variant="default">Total: {summary.totalAmount}L</Badge>
              <Badge variant="success">Avg/day: {summary.averagePerDay}L</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {analyticsLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Loading trend...
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-[330px] w-full rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50/70 to-white p-2 sm:p-3">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 12, left: -10, bottom: 4 }}>
                  <defs>
                    <linearGradient id="waterAmountFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.26" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
                    </linearGradient>
                    <linearGradient id="waterAmountStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="dayLabel"
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                    interval={0}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[0, "auto"]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(value) => Number(value ?? 0).toFixed(1)}
                  />
                  <Tooltip
                    cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.75rem",
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                    }}
                    formatter={(value: number | string) => `${Number(value ?? 0).toFixed(1)}L`}
                    labelFormatter={(label) => {
                      const matched = chartData.find((point) => point.dayLabel === label);
                      const date = new Date(matched?.date ?? label);
                      if (Number.isNaN(date.getTime())) return label;
                      return date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />

                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "0.75rem", paddingBottom: "6px" }}
                  />

                  <Area
                    type="monotone"
                    dataKey="amountValue"
                    stroke="none"
                    fill="url(#waterAmountFill)"
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="amountValue"
                    stroke="url(#waterAmountStroke)"
                    strokeWidth={2.8}
                    dot={{ fill: "#0ea5e9", r: 4, stroke: "#ffffff", strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: "#ffffff", stroke: "#0ea5e9", strokeWidth: 2 }}
                    name="Amount (L)"
                  />
                  <Line
                    type="monotone"
                    dataKey="goalValue"
                    stroke="#10b981"
                    strokeWidth={2.2}
                    strokeDasharray="6 6"
                    dot={false}
                    activeDot={{ r: 5, fill: "#10b981" }}
                    name="Goal (L)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No weekly data yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
