"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "@/lib/motion";
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import DietPlanForm from "@/components/coach/DietPlanForm";
import { useCoachDietPlan } from "@/lib/queries/diet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function EditDietPlanPage() {
  const params = useParams();
  const planIdParam = params?.id;
  const planId = Array.isArray(planIdParam) ? planIdParam[0] : planIdParam;
  const safePlanId = typeof planId === "string" ? planId : "";

  const { data: plan, isLoading, error } = useCoachDietPlan(safePlanId);

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
            <Link href="/coach/diet-plans" className="w-fit">
              <Button variant="outline" size="sm">
                Back to Diet Plans
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
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="whitespace-nowrap text-lg font-bold tracking-tight text-white sm:text-3xl">
                  Edit diet plan
                </h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  Update nutrition targets, meal structure, and daily guidance while keeping your delivery consistent.
                </CardDescription>
              </div>

              <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <Link href="/coach/diet-plans" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Diet Plans
                  </Button>
                </Link>

                <Link href={`/coach/diet-plans/${safePlanId}`} className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
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

        <DietPlanForm plan={plan} />
      </motion.section>
    </div>
  );
}
