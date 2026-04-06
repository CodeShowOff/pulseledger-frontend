"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/axios";
import axios from "axios";
import Link from "next/link";
import { motion } from "@/lib/motion";
import { ArrowLeft, Sparkles, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PlanForm = dynamic(() => import("@/components/coach/PlanForm"), {
  loading: () => <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">Loading form...</div>,
  ssr: false
});

export default function CoachPlanEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const planId = params?.id as string;
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await api.get(`/plans/${planId}`);
        if (!active) return;
        setPlan(res.data.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const msg = (err as any).response?.data?.message || (err as any).message;
          setError(msg || "Failed to load plan");
        } else if (err instanceof Error) {
          setError(err.message || "Failed to load plan");
        } else {
          setError(String(err) || "Failed to load plan");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    if (planId) load();
    return () => {
      active = false;
    };
  }, [planId]);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">Loading plan...</div>;
  }

  if (error || !plan) {
    return (
      <Card className="border-rose-200 bg-rose-50/80">
        <CardContent className="flex items-center gap-3 p-5 text-rose-700">
          <TriangleAlert className="h-4 w-4" />
          <p className="text-sm font-medium">{error || "Plan not found"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="border-indigo-100/80 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <Badge className="w-fit border-white/25 bg-white/15 text-white">Plan Editor</Badge>
                <CardTitle className="text-2xl font-bold text-white">Edit plan</CardTitle>
                <CardDescription className="!text-white/90">
                  Fine-tune pricing, duration, and outcomes while keeping your system design consistent.
                </CardDescription>
              </div>
              <Link href="/coach/plans">
                <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <ArrowLeft className="h-4 w-4" />
                  Back to plans
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.04 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="h-4 w-4" />
              </span>
              Update plan details
            </CardTitle>
            <CardDescription>Maintain clean structure and consistent quality across all active coaching plans.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlanForm
              variant="page"
              plan={plan}
              onClose={() => router.push("/coach/plans")}
            />
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
