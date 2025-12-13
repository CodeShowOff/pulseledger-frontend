// src/components/client/ClientProgressChart.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CLIENT_PROGRESS_QUERY_KEY,
  fetchClientProgressEntries,
} from "@/lib/queries/clientProgress";
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
  isoDate: string; // full ISO timestamp for precise positioning
  dateLabel: string; // human readable label for axis/tooltip
  [key: string]: string | number | null;
};

export default function ClientProgressChart() {
  const [metric, setMetric] = useState<"bmi" | "weight" | "bodyFat" | "muscleMass" | "vitals">("weight");

  const config = useMemo(() => {
    switch (metric) {
      case "bmi":
        return {
          title: "BMI Progress",
          dataKey: "bmi",
          color: "#16a34a",
          unit: "",
        };
      case "weight":
        return {
          title: "Weight Progress",
          dataKey: "weight",
          color: "#2563eb",
          unit: "kg",
        };
      case "bodyFat":
        return {
          title: "Body Fat Percentage",
          dataKey: "bodyFatPercentage",
          color: "#dc2626",
          unit: "%",
        };
      case "muscleMass":
        return {
          title: "Muscle Mass",
          dataKey: "muscleMass",
          color: "#16a34a",
          unit: "kg",
        };
      case "vitals":
        return {
          title: "Blood Pressure (Systolic)",
          dataKey: "bloodPressureSystolic",
          color: "#dc2626",
          unit: "mmHg",
        };
      default:
        return {
          title: "Progress",
          dataKey: "weight",
          color: "#2563eb",
          unit: "kg",
        };
    }
  }, [metric]);

  const { data: allData, isLoading } = useQuery({
    queryKey: CLIENT_PROGRESS_QUERY_KEY,
    queryFn: () => fetchClientProgressEntries(),
    select: (response): ChartPoint[] => {
      const entries = response.data || [];
      return entries
        .filter((e) => e && e.date)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((entry) => {
          const isoDate = entry.date;
          const label = new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return {
            isoDate,
            dateLabel: label,
            bmi: typeof entry.bmi === "number" ? entry.bmi : null,
            weight: typeof entry.weight === "number" ? entry.weight : null,
            bodyFatPercentage: typeof entry.bodyFatPercentage === "number" ? entry.bodyFatPercentage : null,
            muscleMass: typeof entry.muscleMass === "number" ? entry.muscleMass : null,
            visceralFatLevel: typeof entry.visceralFatLevel === "number" ? entry.visceralFatLevel : null,
            metabolicAge: typeof entry.metabolicAge === "number" ? entry.metabolicAge : null,
            bloodPressureSystolic: typeof entry.bloodPressureSystolic === "number" ? entry.bloodPressureSystolic : null,
            bloodPressureDiastolic: typeof entry.bloodPressureDiastolic === "number" ? entry.bloodPressureDiastolic : null,
          };
        });
    },
  });

  // Filter data to only show points where the current metric has a value
  const filteredData = useMemo(() => {
    if (!allData) return [];
    return allData.filter((point) => point[config.dataKey] != null);
  }, [allData, config.dataKey]);

  // Show only last 7 entries for cleaner dashboard view
  const data = useMemo(() => {
    return filteredData.slice(-7);
  }, [filteredData]);

  const hasData = useMemo(
    () => filteredData && filteredData.length > 0,
    [filteredData]
  );

  if (isLoading) return <p>Loading progress...</p>;
  if (!data || data.length === 0) return <p>No progress history yet</p>;

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <div style={{ marginBottom: "1rem" }}>
        <h3 className="text-lg font-semibold mb-3">{config.title}</h3>
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", overflowY: "hidden", flexWrap: "nowrap", paddingBottom: "0.5rem", scrollBehavior: "smooth" }}>
          <button
            type="button"
            onClick={() => setMetric("weight")}
            className={`btn ${metric === "weight" ? "btn--primary" : "btn--outline"}`}
            style={{ fontSize: "0.9rem", flexShrink: 0, whiteSpace: "nowrap" }}
          >
            Weight
          </button>
          <button
            type="button"
            onClick={() => setMetric("bmi")}
            className={`btn ${metric === "bmi" ? "btn--primary" : "btn--outline"}`}
            style={{ fontSize: "0.9rem", flexShrink: 0, whiteSpace: "nowrap" }}
          >
            BMI
          </button>
          <button
            type="button"
            onClick={() => setMetric("bodyFat")}
            className={`btn ${metric === "bodyFat" ? "btn--primary" : "btn--outline"}`}
            style={{ fontSize: "0.9rem", flexShrink: 0, whiteSpace: "nowrap" }}
          >
            Body Fat
          </button>
          <button
            type="button"
            onClick={() => setMetric("muscleMass")}
            className={`btn ${metric === "muscleMass" ? "btn--primary" : "btn--outline"}`}
            style={{ fontSize: "0.9rem", flexShrink: 0, whiteSpace: "nowrap" }}
          >
            Muscle Mass
          </button>
          <button
            type="button"
            onClick={() => setMetric("vitals")}
            className={`btn ${metric === "vitals" ? "btn--primary" : "btn--outline"}`}
            style={{ fontSize: "0.9rem", flexShrink: 0, whiteSpace: "nowrap" }}
          >
            Blood Pressure
          </button>
        </div>
      </div>

      <div style={{ background: "linear-gradient(to bottom, #f8fafc, #ffffff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        {!hasData ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "#64748b" }}>
            <p>No data available for {config.title}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0.05} />
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
                dataKey={config.dataKey}
                stroke={config.color}
                strokeWidth={3}
                fill={`url(#gradient-${metric})`}
                dot={{ fill: config.color, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
