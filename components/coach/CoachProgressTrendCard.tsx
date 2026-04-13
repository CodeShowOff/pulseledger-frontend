"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type CoachProgressPoint = {
  week: string;
  avgBMI: number;
};

type CoachProgressTrendCardProps = {
  chartData: CoachProgressPoint[];
  isLoading: boolean;
};

export default function CoachProgressTrendCard({ chartData, isLoading }: CoachProgressTrendCardProps) {
  return (
    <Card className="h-full border-slate-200/80 bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp className="h-4 w-4" />
          </span>
          Client progress trend
        </CardTitle>
        <CardDescription>Weekly BMI trend overview.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading chart data...</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-slate-500">No progress data available yet.</p>
        ) : (
          <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="coachBmiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="2 8" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg">
                        <p className="font-semibold text-slate-700">{label}</p>
                        <p className="text-slate-500">
                          Avg BMI: <span className="font-semibold text-slate-800">{Number(payload[0].value).toFixed(1)}</span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgBMI"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#coachBmiGradient)"
                  dot={{ r: 3, fill: "#6366f1", stroke: "#fff", strokeWidth: 1.5 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
