"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "@/lib/motion";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PlanForm = dynamic(() => import("@/components/coach/PlanForm"), {
  loading: () => <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">Loading form...</div>,
  ssr: false
});

export default function CoachPlanCreatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl">Create new plan</h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  Build a premium coaching plan with clear outcomes.
                </CardDescription>
              </div>

              <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <Link href="/coach/plans" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    Back to plans
                  </Button>
                </Link>
              </div>
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
