// app/coach/diet-plans/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "@/lib/motion";
import { Plus, Utensils, FileText, Sparkles } from "lucide-react";
import DietPlanList from "@/components/coach/DietPlanList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoachDietPlansPage() {
  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-5 md:gap-4 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="space-y-1.5">
                <Badge className="w-fit border-white/25 bg-white/10 text-[11px] text-white sm:text-xs">
                  Nutrition System
                </Badge>
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">Diet plans</CardTitle>
                <CardDescription className="text-xs !text-white/90 sm:text-sm">
                  Craft premium nutrition plans with clear outcomes.
                </CardDescription>
              </div>

              <div className="grid w-full grid-cols-3 gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:gap-2">
                <Link href="/coach/food-items" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full gap-1.5 border-white/25 bg-white/10 px-2 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Utensils className="h-4 w-4 shrink-0" />
                    <span className="sm:hidden">Food</span>
                    <span className="hidden sm:inline">Custom Food Items</span>
                  </Button>
                </Link>
                <Link href="/coach/diet-plans/templates" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full gap-1.5 border-white/25 bg-white/10 px-2 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="sm:hidden">Templates</span>
                    <span className="hidden sm:inline">Browse Templates</span>
                  </Button>
                </Link>
                <Link href="/coach/diet-plans/create" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full gap-1.5 border-white/25 bg-white/10 px-2 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
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
