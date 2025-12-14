"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const fetchProgress = async () => {
  const res = await api.get("/coach/client-progress");
  return res.data;
};

export default function CoachChart() {
  const { data, isLoading } = useQuery({ queryKey: ["coachProgress"], queryFn: fetchProgress });

  const CustomTooltip = useMemo(
    () =>
      ({ active, payload }: { active?: boolean; payload?: any[] }) => {
        if (active && payload && payload.length) {
          return (
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "0.75rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                {payload[0]?.payload?.week}
              </p>
              <p style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>
                {payload[0]?.value != null ? payload[0].value.toFixed(1) : "-"}
              </p>
            </div>
          );
        }
        return null;
      },
    []
  );

  if (isLoading) return <p>Loading chart...</p>;
  if (!data || data.length === 0) return <p>No progress data yet</p>;

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Client Progress (Avg BMI)</h3>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
        Average BMI across all clients, grouped by week
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBMI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis 
            dataKey="week" 
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="avgBMI"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#colorBMI)"
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
