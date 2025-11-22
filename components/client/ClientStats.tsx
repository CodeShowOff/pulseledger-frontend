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
      <div style={{ marginBottom: "0.65rem" }}>
        <p className="client-section-title">Quick Stats</p>
      </div>
      <div className="client-stats-row">
        <div className="client-stats-card">
          <p className="client-stats-card__label">Latest Weight</p>
          <p className="client-stats-card__value">{stats?.latestWeight != null ? `${stats.latestWeight} kg` : "-"}</p>
        </div>

        <div className="client-stats-card">
          <p className="client-stats-card__label">Latest BMI</p>
          <p className="client-stats-card__value">{stats?.latestBMI ?? "-"}</p>
        </div>

        <div className="client-stats-card">
          <p className="client-stats-card__label">Blood Pressure</p>
          <p className="client-stats-card__value">
            {stats?.bloodPressureSystolic != null && stats?.bloodPressureDiastolic != null
              ? `${Math.round(stats.bloodPressureSystolic)}/${Math.round(stats.bloodPressureDiastolic)} mmHg`
              : "-"}
          </p>
        </div>

        {/* Completed Tasks section removed as requested */}
      </div>
    </section>
  );
});

export default ClientStats;
