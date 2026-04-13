// src/components/client/DetailedProgressCharts.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  CLIENT_PROGRESS_QUERY_KEY,
  fetchClientProgressEntries,
} from "@/lib/queries/clientProgress";
import api from "@/lib/axios";
import { LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ProgressPreviewAreaChart = dynamic(
  () => import("@/components/charts/ProgressPreviewAreaChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] w-full min-w-0 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70" />
    ),
  }
);

type ChartPoint = {
  date: string; // label used on X axis
  isoDate?: string; // full ISO date for precise ordering
  [key: string]: string | number | null | undefined;
};

interface DetailedProgressChartsProps {
  clientId?: string; // Optional: for coach/admin view
  viewerRole?: "client" | "coach" | "admin"; // Role of the viewer
}

interface ChartConfig {
  id: string;
  label: string;
  unit: string;
  color: string;
  dataKey: string;
  primaryLabel?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  secondaryLabel?: string;
}

export default function DetailedProgressCharts({ clientId, viewerRole = "client" }: DetailedProgressChartsProps = {}) {
  const router = useRouter();
  const [activeChart, setActiveChart] = useState<string>("weight");

  const charts = useMemo<ChartConfig[]>(
    () => [
      { id: "weight", label: "Weight", unit: "kg", color: "#3b82f6", dataKey: "weight" },
      // { id: "height", label: "Height", unit: "cm", color: "#8b5cf6", dataKey: "height" },
      { id: "bmi", label: "BMI", unit: "", color: "#10b981", dataKey: "bmi" },
      { id: "bodyFat", label: "Body Fat %", unit: "", color: "#ef4444", dataKey: "bodyFatPercentage" },
      { id: "visceralFat", label: "Visceral Fat", unit: "", color: "#f97316", dataKey: "visceralFatLevel" },
      { id: "muscleMass", label: "Muscle Mass", unit: "kg", color: "#06b6d4", dataKey: "muscleMass" },
      { id: "metabolicAge", label: "Metabolic Age", unit: "years", color: "#a855f7", dataKey: "metabolicAge" },
      // { id: "bodyWater", label: "Body Water %", unit: "", color: "#0ea5e9", dataKey: "bodyWaterPercentage" },
      { id: "boneMass", label: "Bone Mass", unit: "kg", color: "#64748b", dataKey: "boneMass" },
      // { id: "bloodSugarFasting", label: "Blood Sugar (Fasting)", unit: "mg/dL", color: "#dc2626", dataKey: "bloodSugarFasting" },
      // { id: "bloodSugarRandom", label: "Blood Sugar (Random)", unit: "mg/dL", color: "#f59e0b", dataKey: "bloodSugarRandom" },
      {
        id: "bloodPressure",
        label: "Blood Pressure",
        unit: "mmHg",
        color: "#e11d48",
        dataKey: "bloodPressureSystolic",
        primaryLabel: "Systolic",
        secondaryDataKey: "bloodPressureDiastolic",
        secondaryColor: "#2563eb",
        secondaryLabel: "Diastolic",
      },
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
            // height: typeof entry.height === "number" ? entry.height : null,
            bmi: typeof entry.bmi === "number" ? entry.bmi : null,
            bodyFatPercentage: typeof entry.bodyFatPercentage === "number" ? entry.bodyFatPercentage : null,
            visceralFatLevel: typeof entry.visceralFatLevel === "number" ? entry.visceralFatLevel : null,
            muscleMass: typeof entry.muscleMass === "number" ? entry.muscleMass : null,
            metabolicAge: typeof entry.metabolicAge === "number" ? entry.metabolicAge : null,
            // bodyWaterPercentage: typeof entry.bodyWaterPercentage === "number" ? entry.bodyWaterPercentage : null,
            boneMass: typeof entry.boneMass === "number" ? entry.boneMass : null,
            // bloodSugarFasting: typeof entry.bloodSugarFasting === "number" ? entry.bloodSugarFasting : null,
            // bloodSugarRandom: typeof entry.bloodSugarRandom === "number" ? entry.bloodSugarRandom : null,
            bloodPressureSystolic: typeof entry.bloodPressureSystolic === "number" ? entry.bloodPressureSystolic : null,
            bloodPressureDiastolic: typeof entry.bloodPressureDiastolic === "number" ? entry.bloodPressureDiastolic : null,
          };
        });
    },
  });

  // Filter data to only show points where the current chart's field has a value
  const filteredData = useMemo(() => {
    if (!allData) return [];
    return allData.filter((point) => {
      const hasPrimaryValue = point[currentChart.dataKey] != null;
      if (!currentChart.secondaryDataKey) {
        return hasPrimaryValue;
      }

      const hasSecondaryValue = point[currentChart.secondaryDataKey] != null;
      return hasPrimaryValue || hasSecondaryValue;
    });
  }, [allData, currentChart.dataKey, currentChart.secondaryDataKey]);

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
    router.push(url);
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200/80 bg-white/95">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">Loading charts...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-slate-200/80 bg-white/95">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <LineChart className="h-4 w-4" />
            </span>
            Progress charts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-600">
            No data available for charts yet. Add your first progress entry!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/80 bg-white/95">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <LineChart className="h-4 w-4" />
              </span>
              Progress charts
            </CardTitle>
          </div>

          {hasData && filteredData.length > 7 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleViewFullChart}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              View full chart
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {charts.map((chart) => {
            const active = activeChart === chart.id;
            return (
              <button
                key={chart.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveChart(chart.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {chart.unit ? `${chart.label} (${chart.unit})` : chart.label}
              </button>
            );
          })}
        </div>

        <div>
          {!hasData ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-slate-600">
              No data available for {currentChart.label}
            </div>
          ) : (
            <div className="h-[350px] w-full min-w-0">
              <ProgressPreviewAreaChart
                data={data}
                chartId={currentChart.id}
                dataKey={currentChart.dataKey}
                color={currentChart.color}
                primaryName={currentChart.primaryLabel ?? currentChart.label}
                secondaryDataKey={currentChart.secondaryDataKey}
                secondaryColor={currentChart.secondaryColor}
                secondaryName={currentChart.secondaryLabel}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
