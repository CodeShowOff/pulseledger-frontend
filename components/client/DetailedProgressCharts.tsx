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
  viewerRole?: "client" | "coach" | "admin"; // Role of the viewer
}

export default function DetailedProgressCharts({ clientId, viewerRole = "client" }: DetailedProgressChartsProps = {}) {
  const [activeChart, setActiveChart] = useState<string>("weight");

  const charts = useMemo(
    () => [
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
    ],
    []
  );

  const currentChart = useMemo(
    () => charts.find((c) => c.id === activeChart) || charts[0],
    [charts, activeChart]
  );

  const { data: allData, isLoading } = useQuery({
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

  // Filter data to only show points where the current chart's field has a value
  const filteredData = useMemo(() => {
    if (!allData) return [];
    return allData.filter((point) => point[currentChart.dataKey] != null);
  }, [allData, currentChart.dataKey]);

  // Show only last 7 entries for preview
  const data = useMemo(() => {
    if (!filteredData) return [];
    return filteredData.slice(-7);
  }, [filteredData]);

  // Check if current chart has any data
  const hasData = useMemo(
    () => filteredData && filteredData.length > 0,
    [filteredData]
  );

  const handleViewFullChart = () => {
    // Navigate to full chart view with the current chart type
    // Route based on viewer role
    let url: string;
    if (clientId) {
      // Coach or admin viewing client data
      if (viewerRole === "admin") {
        url = `/admin/clients/${clientId}/detailed?chart=${activeChart}`;
      } else {
        url = `/coach/clients/${clientId}/detailed?chart=${activeChart}`;
      }
    } else {
      // Client viewing own data
      url = `/client/progress/detailed?chart=${activeChart}`;
    }
    window.location.href = url;
  };

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
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 className="client-card__section-title">Progress Charts</h2>
          <p className="client-card__section-subtitle">Visual representation of your health metrics over time (Last 7 entries)</p>
        </div>
        {hasData && filteredData.length > 7 && (
          <button
            type="button"
            className="btn btn--outline"
            onClick={handleViewFullChart}
            style={{ fontSize: "0.85rem" }}
          >
            View Full Chart
          </button>
        )}
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
                labelFormatter={(value: unknown) => {
                  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) {
                    return value as React.ReactNode;
                  }
                  const date = new Date(value);
                  if (Number.isNaN(date.getTime())) {
                    return String(value);
                  }
                  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
                }}
                labelStyle={{ color: "#1e293b", fontWeight: "600" }}
              />
              <Area
                type="monotone"
                dataKey={currentChart.dataKey}
                stroke={currentChart.color}
                strokeWidth={3}
                fill={`url(#gradient-${currentChart.id})`}
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
                  {filteredData.length}
                </p>
                <p>Total Entries</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.125rem" }}>
                  {(() => {
                    // Data is already filtered to only include non-null values for this field
                    // Get the last entry (most recent)
                    if (data.length === 0) return "-";
                    const latestPoint = data[data.length - 1];
                    const value = latestPoint[currentChart.dataKey];
                    return typeof value === "number" ? value.toFixed(1) : value || "-";
                  })()}
                </p>
                <p>Latest</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "1.125rem" }}>
                  {(() => {
                    const values = filteredData
                      .map((d) => d[currentChart.dataKey])
                      .filter((v) => v != null && typeof v === "number") as number[];
                    if (values.length === 0) return "-";
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    return avg.toFixed(1);
                  })()}
                </p>
                <p>Overall Average</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
