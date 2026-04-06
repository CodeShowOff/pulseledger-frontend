// src/app/coach/clients/[id]/detailed/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "@/lib/motion";
import { ArrowLeft, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FullProgressChart = dynamic(() => import("@/components/client/FullProgressChart"), {
  loading: () => (
    <Card className="border-slate-200/80 bg-white/95">
      <div className="p-6 text-center text-sm text-slate-500">Loading chart...</div>
    </Card>
  ),
  ssr: false,
});

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const chartOptions = [
  { id: "weight", label: "Weight" },
  { id: "height", label: "Height" },
  { id: "bmi", label: "BMI" },
  { id: "bodyFat", label: "Body Fat %" },
  { id: "visceralFat", label: "Visceral Fat" },
  { id: "muscleMass", label: "Muscle Mass" },
  { id: "metabolicAge", label: "Metabolic Age" },
  { id: "bodyWater", label: "Body Water %" },
  { id: "boneMass", label: "Bone Mass" },
  { id: "bloodSugarFasting", label: "Blood Sugar (Fasting)" },
  { id: "bloodSugarRandom", label: "Blood Sugar (Random)" },
  { id: "bpSystolic", label: "BP Systolic" },
  { id: "bpDiastolic", label: "BP Diastolic" },
] as const;

function DetailedChartContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const chartType = searchParams.get("chart") || "weight";
  const clientId = params.id as string;

  const validChartIds = new Set(chartOptions.map((option) => option.id));
  const resolvedChartType = validChartIds.has(chartType as (typeof chartOptions)[number]["id"])
    ? chartType
    : "weight";

  const handleChartChange = (nextChartType: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("chart", nextChartType);
    router.push(`/coach/clients/${clientId}/detailed?${nextParams.toString()}`);
  };

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <div className="flex items-center">
        <Link href={`/coach/clients/${clientId}`}>
          <Button variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Client Details
          </Button>
        </Link>
      </div>

      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28 }}>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-4 p-5 sm:p-6">
            <div className="space-y-2">
              <Badge className="w-fit border-white/25 bg-white/15 text-white">Client analytics</Badge>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                <LineChart className="h-6 w-6" />
                Detailed Progress Chart
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm !text-white/90 md:text-base">
                Full historical view of client progress metrics with trend details.
              </CardDescription>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {chartOptions.map((option) => {
                const active = option.id === resolvedChartType;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleChartChange(option.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "border-white/40 bg-white text-indigo-700"
                        : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
      >
        <FullProgressChart chartType={resolvedChartType} clientId={clientId} />
      </motion.section>
    </div>
  );
}

export default function CoachClientDetailedChartPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-slate-500">Loading...</div>}>
        <DetailedChartContent />
    </Suspense>
  );
}
