// src/components/client/DetailedProgressCharts.tsx
"use client";

import React, { useState, useMemo } from "react";
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
  date: string; // label used on X axis
  isoDate?: string; // full ISO date for precise ordering
  [key: string]: string | number | null | undefined;
};

interface DetailedProgressChartsProps {
  clientId?: string; // Optional: for coach/admin view
}

export default function DetailedProgressCharts({ clientId }: DetailedProgressChartsProps = {}) {
  const [activeChart, setActiveChart] = useState<string>("weight");

  const charts = useMemo(
    () => [
      { id: "weight", label: "Weight", unit: "kg", color: "#3b82f6", dataKey: "weight" },
      { id: "height", label: "Height", unit: "cm", color: "#8b5cf6", dataKey: "height" },
      { id: "bmi", label: "BMI", unit: "", color: "#10b981", dataKey: "bmi" },
      { id: "bodyFat", label: "Body Fat %", unit: "%", color: "#ef4444", dataKey: "bodyFatPercentage" },
      { id: "visceralFat", label: "Visceral Fat", unit: "", color: "#f97316", dataKey: "visceralFatLevel" },
      { id: "muscleMass", label: "Muscle Mass", unit: "kg", color: "#06b6d4", dataKey: "muscleMass" },
      { id: "metabolicAge", label: "Metabolic Age", unit: "years", color: "#a855f7", dataKey: "metabolicAge" },
      { id: "bodyWater", label: "Body Water %", unit: "%", color: "#0ea5e9", dataKey: "bodyWaterPercentage" },
      { id: "boneMass", label: "Bone Mass", unit: "kg", color: "#64748b", dataKey: "boneMass" },
      { id: "bloodSugarFasting", label: "Blood Sugar (Fasting)", unit: "mg/dL", color: "#dc2626", dataKey: "bloodSugarFasting" },
      { id: "bloodSugarRandom", label: "Blood Sugar (Random)", unit: "mg/dL", color: "#f59e0b", dataKey: "bloodSugarRandom" },
      { id: "bpSystolic", label: "BP Systolic", unit: "mmHg", color: "#e11d48", dataKey: "bloodPressureSystolic" },
      { id: "bpDiastolic", label: "BP Diastolic", unit: "mmHg", color: "#2563eb", dataKey: "bloodPressureDiastolic" },
    ],
    []
  );

  const currentChart = useMemo(
    () => charts.find((c) => c.id === activeChart) || charts[0],
    [charts, activeChart]
  );

  const { data, isLoading } = useQuery({
    queryKey: clientId ? ["clientProgress", clientId] : CLIENT_PROGRESS_QUERY_KEY,
    queryFn: async () => {
      if (clientId) {
        // Fetch for specific client (coach/admin view)
        const res = await api.get(`/progress/client/${clientId}`);
        return res.data;
      }
      // Fetch for logged-in user
      return fetchClientProgressEntries();
    },
    select: (response): ChartPoint[] => {
      const entries = response.data || [];
      return entries
        .filter((e: any) => e && e.date)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((entry: any) => {
          const d = new Date(entry.date);
          return {
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), // label only
            isoDate: entry.date, // preserve full date for precise comparisons if needed
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
          };
        });
    },
  });

  // Check if current chart has any data
  const hasData = useMemo(
    () => data ? data.some((point) => point[currentChart.dataKey] != null) : false,
    [data, currentChart.dataKey]
  );

  if (isLoading) {
    return (
      <div className="client-card">
        <p className="client-card__subtitle">Loading charts...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="client-card">
        <p className="client-card__subtitle">No data available for charts yet. Add your first progress entry!</p>
      </div>
    );
  }

  return (
    <div className="client-card">
      <div style={{ marginBottom: "1rem" }}>
        <h2 className="client-card__section-title">Progress Charts</h2>
        <p className="client-card__section-subtitle">Visual representation of your health metrics over time</p>
      </div>

      {/* Chart Selector Buttons */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", overflowY: "hidden", flexWrap: "nowrap", marginBottom: "1.5rem", paddingBottom: "0.5rem", scrollBehavior: "smooth" }}>
        {charts.map((chart) => (
          <button
            key={chart.id}
            type="button"
            className={`btn ${activeChart === chart.id ? "btn--primary" : "btn--outline"}`}
            onClick={() => setActiveChart(chart.id)}
            style={{ fontSize: "0.85rem", flexShrink: 0, whiteSpace: "nowrap" }}
          >
            {chart.label}
          </button>
        ))}
      </div>

      {/* Chart Display */}
      <div style={{ background: "linear-gradient(to bottom, #f8fafc, #ffffff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#1e293b" }}>
          {currentChart.label} {currentChart.unit && `(${currentChart.unit})`}
        </h3>
        
        {!hasData ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "#64748b" }}>
            <p>No data available for {currentChart.label}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${currentChart.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentChart.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={currentChart.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="isoDate" 
                stroke="#64748b"
                tickFormatter={(value: string) => {
                  try {
                    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  } catch {
                    return value;
                  }
                }}
                style={{ fontSize: "0.75rem" }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: "0.75rem" }}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelFormatter={(value: string) => {
                  try {
                    return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
                  } catch {
                    return value;
                  }
                }}
                labelStyle={{ color: "#1e293b", fontWeight: "600" }}
              />
              <Area
                type="monotone"
                dataKey={currentChart.dataKey}
                stroke={currentChart.color}
                strokeWidth={3}
                fill={`url(#gradient-${currentChart.id})`}
                connectNulls
                dot={{ fill: currentChart.color, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {hasData && (
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-around", fontSize: "0.875rem", color: "#64748b" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.125rem" }}>
                  {data.filter((d) => d[currentChart.dataKey] != null).length}
                </p>
                <p>Entries</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.125rem" }}>
                  {(() => {
                    // Find newest by isoDate among non-null values
                    let latest: { isoDate: string; value: any } | null = null;
                    for (const point of data) {
                      const value = point[currentChart.dataKey];
                      if (value != null) {
                        const fullDate = (point.isoDate || point.date) as string;
                        if (!latest || new Date(fullDate) > new Date(latest.isoDate)) {
                          latest = { isoDate: fullDate, value };
                        }
                      }
                    }
                    if (!latest) return "-";
                    return typeof latest.value === "number" ? latest.value.toFixed(1) : latest.value;
                  })()}
                </p>
                <p>Latest</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.125rem" }}>
                  {(() => {
                    const values = data
                      .map((d) => d[currentChart.dataKey])
                      .filter((v) => v != null && typeof v === "number") as number[];
                    if (values.length === 0) return "-";
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    return avg.toFixed(1);
                  })()}
                </p>
                <p>Average</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
