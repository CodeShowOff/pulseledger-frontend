// app/coach/workout-plans/[id]/edit/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "@/lib/motion";
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import WorkoutPlanForm from "@/components/coach/WorkoutPlanForm";
import { useCoachWorkoutPlan } from "@/lib/queries/workouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function EditWorkoutPlanPage() {
  const params = useParams();
  const planIdParam = params?.id;
  const planId = Array.isArray(planIdParam) ? planIdParam[0] : planIdParam;
  const safePlanId = typeof planId === "string" ? planId : "";

  const { data: plan, isLoading, error } = useCoachWorkoutPlan(safePlanId);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            Loading plan...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm font-medium text-rose-700">Plan not found.</p>
            <Link href="/coach/workout-plans" className="w-fit">
              <Button variant="outline" size="sm">
                Back to Workout Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-5 md:gap-4 md:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="space-y-1.5">
                <Badge className="w-fit border-white/25 bg-white/15 text-[11px] text-white sm:text-xs">
                  Workout Builder
                </Badge>
                <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                  Edit workout plan
                </CardTitle>
                <CardDescription className="max-w-2xl text-xs !text-white/90 sm:text-sm md:text-base">
                  Update schedule structure, exercises, and coaching notes while keeping your delivery system consistent.
                </CardDescription>
              </div>

              <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:gap-2 md:justify-end">
                <Link href="/coach/workout-plans" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Workouts
                  </Button>
                </Link>

                <Link href={`/coach/workout-plans/${safePlanId}`} className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    View Plan
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
        className="space-y-2"
      >
        <div className="px-1">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 md:text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </span>
            Plan setup
          </h2>
        </div>

        <WorkoutPlanForm plan={plan} />
      </motion.section>
    </div>
  );
}
