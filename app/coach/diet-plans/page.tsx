// app/coach/diet-plans/page.tsx
"use client";

import Link from "next/link";
import { motion } from "@/lib/motion";
import { Plus, Utensils, FileText, Sparkles } from "lucide-react";
import DietPlanList from "@/components/coach/DietPlanList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoachDietPlansPage() {
  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl">Diet plans</h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  Craft premium nutrition plans with clear outcomes.
                </CardDescription>
              </div>

              <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <Link href="/coach/food-items" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Utensils className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="sm:hidden">Food</span>
                    <span className="hidden sm:inline">Custom Food Items</span>
                  </Button>
                </Link>
                <Link href="/coach/diet-plans/templates" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="sm:hidden">Templates</span>
                    <span className="hidden sm:inline">Browse Templates</span>
                  </Button>
                </Link>
                <Link href="/coach/diet-plans/create" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap rounded-xl !bg-white px-2 text-[11px] font-semibold leading-none !text-indigo-700 hover:!bg-indigo-50 sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="sm:hidden">Create</span>
                    <span className="hidden sm:inline">Create Plan</span>
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="h-4 w-4" />
              </span>
              Active diet plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DietPlanList />
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
