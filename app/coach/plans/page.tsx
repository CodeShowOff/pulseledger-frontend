// src/app/(coach)/plans/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import PlanListView from "@/components/coach/PlanListView";
import { motion } from "@/lib/motion";
import { Plus, CreditCard, ClipboardList, Dumbbell, Utensils, Layers3, Sparkles, ArrowRight } from "lucide-react";
import { useCoachPendingPlanRequests } from "@/lib/queries/planRequests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeInUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export default function CoachPlansPage() {
  const { data: pendingRequests = [], isLoading: pendingLoading, isError: pendingError } = useCoachPendingPlanRequests();
  const pendingCount = pendingRequests.length;

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-4 p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="w-fit border-white/25 bg-white/15 text-white">Plans Workspace</Badge>
                  {pendingCount > 0 ? (
                    <Badge
                      variant="warning"
                      className="w-fit border-rose-300/50 bg-rose-500 text-white"
                      aria-label={`${pendingCount} pending plan request${pendingCount === 1 ? "" : "s"}`}
                    >
                      {pendingCount > 99 ? "99+" : pendingCount} Pending Requests
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Build and scale premium client plans
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm !text-white/90 md:text-base">
                  Manage plans, requests, and subscriptions from one place.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <Link href="/coach/plan-requests">
                  <Button variant="outline" className="relative border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <ClipboardList className="h-4 w-4" />
                    Plan Requests
                    {pendingCount > 0 ? (
                      <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    ) : null}
                  </Button>
                </Link>
                <Link href="/coach/subscriptions">
                  <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <CreditCard className="h-4 w-4" />
                    Client Subscriptions
                  </Button>
                </Link>
                <Link href="/coach/plans/create">
                  <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <Plus className="h-4 w-4" />
                    New Plan
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-1">
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-100">Pending approvals</p>
                <p className="mt-1 text-xl font-semibold">
                  {pendingLoading ? "--" : pendingError ? "!" : pendingCount}
                </p>
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
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Layers3 className="h-4 w-4" />
              </span>
              Plan catalog
            </CardTitle>
            <CardDescription>Manage pricing, duration, statuses, and client assignments in a unified layout.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlanListView />
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.1 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        {[
          {
            title: "Workout Plans",
            description: "Build high-performance workout templates and reusable coaching systems.",
            href: "/coach/workout-plans",
            cta: "Manage Workouts",
            Icon: Dumbbell,
          },
          {
            title: "Diet Plans",
            description: "Design modern nutrition journeys with clarity, structure, and repeatability.",
            href: "/coach/diet-plans",
            cta: "Manage Diet Plans",
            Icon: Utensils,
          },
        ].map((item, idx) => (
          <motion.div key={item.title} whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                    <item.Icon className="h-4 w-4" />
                  </span>
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={item.href}>
                  <Button variant="default">
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.14 }}
      >
        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <Sparkles className="h-4 w-4" />
              </span>
              Custom library
            </CardTitle>
            <CardDescription>Create proprietary movement and food libraries that differentiate your coaching service.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Custom Exercises",
                description: "Create and manage your private movement library.",
                href: "/coach/exercises",
                Icon: Dumbbell,
              },
              {
                title: "Custom Food Items",
                description: "Maintain your own nutrition inventory and macro presets.",
                href: "/coach/food-items",
                Icon: Utensils,
              },
            ].map((item) => (
              <motion.div key={item.title} whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
                <Link href={item.href} className="group block cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-indigo-200 hover:bg-indigo-50/40">
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm transition-colors group-hover:text-violet-600">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </Link>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
