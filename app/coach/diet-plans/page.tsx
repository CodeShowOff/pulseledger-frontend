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
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge className="mb-2 w-fit border-white/25 bg-white/10 text-white">Nutrition System</Badge>
                <CardTitle className="text-2xl font-bold text-white">Diet plans</CardTitle>
                <CardDescription className="!text-white/90">
                  Craft premium nutrition plans with consistent structure, outcomes, and delivery quality.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/coach/food-items">
                  <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <Utensils className="h-4 w-4" />
                    Custom Food Items
                  </Button>
                </Link>
                <Link href="/coach/diet-plans/templates">
                  <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <FileText className="h-4 w-4" />
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/coach/diet-plans/create">
                  <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <Plus className="h-4 w-4" />
                    Create Plan
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
