// src/components/client/ClientStats.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import React from "react";
import { fetchClientProgressEntries } from "@/lib/queries/clientProgress";

type StatsResp = {
  success: boolean;
  data?: {
    latestWeight?: number | null;
    latestBMI?: number | null;
    bloodPressureSystolic?: number | null;
    bloodPressureDiastolic?: number | null;
    completedTasksCount?: number;
    activePlanTitle?: string | null;
  };
};

const fetchClientSummary = async (): Promise<StatsResp> => {
  // We will derive small summary by calling progress and plans endpoints.
  // Backend might have a dedicated endpoint — replace if available.
  const [progressResponse, plansRes] = await Promise.all([
    fetchClientProgressEntries(),
    api.get("/plans/my"),
  ]);
  const plans = Array.isArray(plansRes.data.data) ? plansRes.data.data : [];
  const progress = progressResponse.data || [];

  // Robust latest finder (max date among entries having the field)
  const getLatestValue = (fieldName: string): any => {
    let latest: { date: string; value: any } | null = null;
    for (const raw of progress) {
      const entry = raw as any;
      if (entry[fieldName] != null) {
        if (!latest || new Date(entry.date) > new Date(latest.date)) {
          latest = { date: entry.date, value: entry[fieldName] };
        }
      }
    }
    return latest ? latest.value : null;
  };

  return {
    success: true,
    data: {
      latestWeight: getLatestValue('weight'),
      latestBMI: getLatestValue('bmi'),
      bloodPressureSystolic: getLatestValue('bloodPressureSystolic'),
      bloodPressureDiastolic: getLatestValue('bloodPressureDiastolic'),
      activePlanTitle: plans[0]?.title ?? null,
    },
  };
};

const ClientStats = React.memo(function ClientStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["clientSummary"],
    queryFn: fetchClientSummary,
    staleTime: 60 * 1000,
  });

  if (isLoading) return <p>Loading summary...</p>;

  const stats = data?.data;

  return (
    <section>
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ 
          fontSize: "1rem", 
          fontWeight: "700", 
          color: "#111827",
          margin: "0"
        }}>
          Quick Stats
        </h3>
        <p style={{ 
          fontSize: "0.8rem", 
          color: "#6b7280",
          marginTop: "0.25rem"
        }}>
          Track your latest health metrics
        </p>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
          borderRadius: "1rem",
          border: "1px solid #e0e7ff",
          padding: "1.25rem",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.08)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem"
            }}>
              ⚖️
            </div>
            <p style={{ 
              fontSize: "0.75rem", 
              textTransform: "uppercase", 
              letterSpacing: "0.05em", 
              color: "#6b7280",
              fontWeight: "600",
              margin: "0"
            }}>
              Latest Weight
            </p>
          </div>
          <p style={{ 
            fontSize: "2rem", 
            fontWeight: "700", 
            color: "#111827",
            margin: "0",
            lineHeight: "1",
            display: "flex",
            alignItems: "baseline",
            gap: "0.35rem"
          }}>
            <span>{stats?.latestWeight != null ? stats.latestWeight : "-"}</span>
            {stats?.latestWeight != null && (
              <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "500" }}>kg</span>
            )}
          </p>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
          borderRadius: "1rem",
          border: "1px solid #dcfce7",
          padding: "1.25rem",
          boxShadow: "0 4px 12px rgba(34, 197, 94, 0.08)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem"
            }}>
              📐
            </div>
            <p style={{ 
              fontSize: "0.75rem", 
              textTransform: "uppercase", 
              letterSpacing: "0.05em", 
              color: "#6b7280",
              fontWeight: "600",
              margin: "0"
            }}>
              Latest BMI
            </p>
          </div>
          <p style={{ 
            fontSize: "2rem", 
            fontWeight: "700", 
            color: "#111827",
            margin: "0",
            lineHeight: "1"
          }}>
            {stats?.latestBMI ?? "-"}
          </p>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)",
          borderRadius: "1rem",
          border: "1px solid #fde68a",
          padding: "1.25rem",
          boxShadow: "0 4px 12px rgba(245, 158, 11, 0.08)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem"
            }}>
              ❤️
            </div>
            <p style={{ 
              fontSize: "0.75rem", 
              textTransform: "uppercase", 
              letterSpacing: "0.05em", 
              color: "#6b7280",
              fontWeight: "600",
              margin: "0"
            }}>
              Blood Pressure
            </p>
          </div>
          <p style={{ 
            fontSize: "2rem", 
            fontWeight: "700", 
            color: "#111827",
            margin: "0",
            lineHeight: "1",
            display: "flex",
            alignItems: "baseline",
            gap: "0.35rem"
          }}>
            <span>{stats?.bloodPressureSystolic != null && stats?.bloodPressureDiastolic != null
              ? `${Math.round(stats.bloodPressureSystolic)}/${Math.round(stats.bloodPressureDiastolic)}`
              : "-"}</span>
            {stats?.bloodPressureSystolic != null && stats?.bloodPressureDiastolic != null && (
              <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "500" }}>mmHg</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
});

export default ClientStats;
