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
          <CardHeader className="gap-3 p-4 sm:p-5 md:gap-4 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="space-y-1.5">
                <Badge className="w-fit border-white/25 bg-white/15 text-[11px] text-white sm:text-xs">
                  Plan Builder
                </Badge>
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">Create new plan</CardTitle>
                <CardDescription className="text-xs !text-white/90 sm:text-sm">
                  Build a premium coaching plan with clear outcomes.
                </CardDescription>
              </div>

              <Link href="/coach/plans" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
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
