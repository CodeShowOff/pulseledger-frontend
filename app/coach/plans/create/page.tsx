"use client";

import React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "@/lib/motion";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PlanForm = dynamic(() => import("@/components/coach/PlanForm"), {
  loading: () => <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">Loading form...</div>,
  ssr: false
});

export default function CoachPlanCreatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="border-indigo-100/80 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <Badge className="w-fit border-white/25 bg-white/15 text-white">Plan Builder</Badge>
                <CardTitle className="text-2xl font-bold text-white">Create new plan</CardTitle>
                <CardDescription className="!text-white/90">
                  Build a structured, premium coaching plan with clear outcomes and smooth assignment flow.
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
              Plan details
            </CardTitle>
            <CardDescription>Use consistent structure, pricing, and duration to keep your plan system scalable.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlanForm
              variant="page"
              onClose={() => router.push("/coach/plans")}
            />
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
