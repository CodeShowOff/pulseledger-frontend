// src/components/client/FullProgressChart.tsx
"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CLIENT_PROGRESS_QUERY_KEY,
  fetchClientProgressEntries,
} from "@/lib/queries/clientProgress";
import api from "@/lib/axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type ChartPoint = {
  date: string;
  isoDate?: string;
  [key: string]: string | number | null | undefined;
};

interface FullProgressChartProps {
  chartType: string;
  clientId?: string;
}

const chartConfigs = [
  { id: "weight", label: "Weight", unit: "kg", color: "#3b82f6", dataKey: "weight" },
  { id: "height", label: "Height", unit: "cm", color: "#8b5cf6", dataKey: "height" },
  { id: "bmi", label: "BMI", unit: "", color: "#10b981", dataKey: "bmi" },
  { id: "bodyFat", label: "Body Fat %", unit: "", color: "#ef4444", dataKey: "bodyFatPercentage" },
  { id: "visceralFat", label: "Visceral Fat", unit: "", color: "#f97316", dataKey: "visceralFatLevel" },
  { id: "muscleMass", label: "Muscle Mass", unit: "kg", color: "#06b6d4", dataKey: "muscleMass" },
  { id: "metabolicAge", label: "Metabolic Age", unit: "years", color: "#a855f7", dataKey: "metabolicAge" },
  { id: "bodyWater", label: "Body Water %", unit: "", color: "#0ea5e9", dataKey: "bodyWaterPercentage" },
  { id: "boneMass", label: "Bone Mass", unit: "kg", color: "#64748b", dataKey: "boneMass" },
  { id: "bloodSugarFasting", label: "Blood Sugar (Fasting)", unit: "mg/dL", color: "#dc2626", dataKey: "bloodSugarFasting" },
  { id: "bloodSugarRandom", label: "Blood Sugar (Random)", unit: "mg/dL", color: "#f59e0b", dataKey: "bloodSugarRandom" },
  { id: "bpSystolic", label: "BP Systolic", unit: "mmHg", color: "#e11d48", dataKey: "bloodPressureSystolic" },
  { id: "bpDiastolic", label: "BP Diastolic", unit: "mmHg", color: "#2563eb", dataKey: "bloodPressureDiastolic" },
];

export default function FullProgressChart({ chartType, clientId }: FullProgressChartProps) {
  const chartConfig = useMemo(
    () => chartConfigs.find((c) => c.id === chartType) || chartConfigs[0],
    [chartType]
  );

  const { data: allData, isLoading } = useQuery({
    queryKey: clientId ? ["clientProgress", clientId] : CLIENT_PROGRESS_QUERY_KEY,
    queryFn: async () => {
      if (clientId) {
        const res = await api.get(`/progress/client/${clientId}`);
        return res.data;
      }
      return fetchClientProgressEntries();
    },
    select: (response): ChartPoint[] => {
      const entries = response.data || [];
      return entries
        .filter((e: any) => e && e.date)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((entry: any) => ({
          date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          isoDate: entry.date,
          weight: typeof entry.weight === "number" ? entry.weight : null,
          height: typeof entry.height === "number" ? entry.height : null,
          bmi: typeof entry.bmi === "number" ? entry.bmi : null,
          bodyFatPercentage: typeof entry.bodyFatPercentage === "number" ? entry.bodyFatPercentage : null,
          visceralFatLevel: typeof entry.visceralFatLevel === "number" ? entry.visceralFatLevel : null,
          muscleMass: typeof entry.muscleMass === "number" ? entry.muscleMass : null,
          metabolicAge: typeof entry.metabolicAge === "number" ? entry.metabolicAge : null,
          bodyWaterPercentage: typeof entry.bodyWaterPercentage === "number" ? entry.bodyWaterPercentage : null,
          boneMass: typeof entry.boneMass === "number" ? entry.boneMass : null,
          bloodSugarFasting: typeof entry.bloodSugarFasting === "number" ? entry.bloodSugarFasting : null,
          bloodSugarRandom: typeof entry.bloodSugarRandom === "number" ? entry.bloodSugarRandom : null,
          bloodPressureSystolic: typeof entry.bloodPressureSystolic === "number" ? entry.bloodPressureSystolic : null,
          bloodPressureDiastolic: typeof entry.bloodPressureDiastolic === "number" ? entry.bloodPressureDiastolic : null,
        }));
    },
  });

  const data = useMemo(() => {
    if (!allData) return [];
    return allData.filter((point) => point[chartConfig.dataKey] != null);
  }, [allData, chartConfig.dataKey]);

  // Calculate chart height based on number of entries to avoid clutter
  const chartHeight = useMemo(() => {
    const baseHeight = 400;
    const entries = data.length;
    if (entries > 30) return 500;
    if (entries > 20) return 450;
    return baseHeight;
  }, [data.length]);

  // Calculate tick interval for x-axis to avoid clutter
  const tickInterval = useMemo(() => {
    const entries = data.length;
    if (entries > 50) return Math.floor(entries / 10);
    if (entries > 30) return Math.floor(entries / 8);
    if (entries > 15) return Math.floor(entries / 6);
    return 0; // Show all ticks
  }, [data.length]);

  if (isLoading) {
    return (
      <div className="client-card">
        <p className="client-card__subtitle">Loading chart data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="client-card">
        <p className="client-card__subtitle">No data available for {chartConfig.label}</p>
      </div>
    );
  }

  const values = data
    .map((d) => d[chartConfig.dataKey])
    .filter((v) => v != null && typeof v === "number") as number[];

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const latestValue = data[data.length - 1]?.[chartConfig.dataKey];

  return (
    <div className="client-card">
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 className="client-card__section-title">
          {chartConfig.label} {chartConfig.unit && `(${chartConfig.unit})`}
        </h2>
        <p className="client-card__section-subtitle">
          Complete history with all {data.length} entries
        </p>
      </div>

      {/* Statistics */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
        gap: "1rem", 
        marginBottom: "1.5rem",
        padding: "1rem",
        background: "linear-gradient(to bottom, #f8fafc, #ffffff)",
        borderRadius: "8px",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Total Entries</p>
          <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.25rem" }}>
            {data.length}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Latest</p>
          <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.25rem" }}>
            {typeof latestValue === "number" ? latestValue.toFixed(1) : "-"}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Average</p>
          <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.25rem" }}>
            {values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : "-"}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Highest</p>
          <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.25rem" }}>
            {maxValue.toFixed(1)}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Lowest</p>
          <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.25rem" }}>
            {minValue.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Full Chart with scroll for many entries */}
      <div style={{ 
        background: "linear-gradient(to bottom, #f8fafc, #ffffff)", 
        borderRadius: "12px", 
        padding: "1.5rem", 
        border: "1px solid #e2e8f0",
        overflowX: data.length > 15 ? "auto" : "visible"
      }}>
        <div style={{ minWidth: data.length > 15 ? `${data.length * 50}px` : "100%" }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
              <defs>
                <linearGradient id={`gradient-full-${chartConfig.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="isoDate"
                stroke="#64748b"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={tickInterval}
                tickFormatter={(value: string) => {
                  try {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric",
                      ...(data.length > 30 ? { year: "2-digit" } : {})
                    });
                  } catch {
                    return value;
                  }
                }}
                style={{ fontSize: "0.7rem" }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: "0.75rem" }}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelFormatter={(value: unknown) => {
                  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) {
                    return value as React.ReactNode;
                  }
                  const date = new Date(value);
                  if (Number.isNaN(date.getTime())) {
                    return String(value);
                  }
                  return date.toLocaleString("en-US", { 
                    month: "short", 
                    day: "numeric", 
                    year: "numeric",
                    hour: "2-digit", 
                    minute: "2-digit" 
                  });
                }}
                labelStyle={{ color: "#1e293b", fontWeight: "600" }}
              />
              <Area
                type="monotone"
                dataKey={chartConfig.dataKey}
                stroke={chartConfig.color}
                strokeWidth={2}
                fill={`url(#gradient-full-${chartConfig.id})`}
                dot={{ fill: chartConfig.color, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {data.length > 15 && (
          <p style={{ 
            marginTop: "1rem", 
            fontSize: "0.75rem", 
            color: "#64748b", 
            textAlign: "center",
            fontStyle: "italic"
          }}>
            Scroll horizontally to view all data points
          </p>
        )}
      </div>
    </div>
  );
}
