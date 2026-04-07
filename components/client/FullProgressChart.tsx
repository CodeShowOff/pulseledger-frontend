// src/components/client/FullProgressChart.tsx
"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  CLIENT_PROGRESS_QUERY_KEY,
  fetchClientProgressEntries,
} from "@/lib/queries/clientProgress";
import api from "@/lib/axios";

const ProgressFullAreaChart = dynamic(
  () => import("@/components/charts/ProgressFullAreaChart"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: "400px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          background: "linear-gradient(to bottom, #f8fafc, #ffffff)",
        }}
      />
    ),
  }
);

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

  const shouldEnableHorizontalScroll = data.length > 8;

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
    if (entries > 18) return 2;
    if (entries > 10) return 1;
    return 0; // Show all ticks
  }, [data.length]);

  const values = useMemo(
    () =>
      data
        .map((d) => d[chartConfig.dataKey])
        .filter((v) => v != null && typeof v === "number") as number[],
    [data, chartConfig.dataKey]
  );

  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const latestValue = data[data.length - 1]?.[chartConfig.dataKey];

  const yAxisDomain = useMemo<[number, number]>(() => {
    if (values.length === 0) return [0, 100];

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return [0, 100];
    }

    if (min === max) {
      const padding = Math.max(1, Math.abs(min) * 0.03);
      const lower = Math.max(0, min - padding);
      const upper = max + padding;
      return [Number(lower.toFixed(2)), Number(upper.toFixed(2))];
    }

    const range = max - min;
    const padding = Math.max(range * 0.15, 0.5);
    const lower = Math.max(0, min - padding);
    const upper = max + padding;

    return [Number(lower.toFixed(2)), Number(upper.toFixed(2))];
  }, [values]);

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
        overflowX: shouldEnableHorizontalScroll ? "auto" : "visible"
      }}>
        <div style={{ minWidth: shouldEnableHorizontalScroll ? `${Math.max(data.length * 58, 560)}px` : "100%" }}>
          <ProgressFullAreaChart
            data={data}
            chartId={chartConfig.id}
            dataKey={chartConfig.dataKey}
            color={chartConfig.color}
            chartHeight={chartHeight}
            tickInterval={tickInterval}
            yAxisDomain={yAxisDomain}
          />
        </div>
        {shouldEnableHorizontalScroll && (
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
