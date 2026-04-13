// src/app/(coach)/plans/page.tsx
"use client";

import Link from "next/link";
import PlanListView from "@/components/coach/PlanListView";
import { motion } from "@/lib/motion";
import { Plus, CreditCard, ClipboardList, Dumbbell, Utensils, Layers3, Sparkles, ArrowRight } from "lucide-react";
import { useCoachPendingPlanRequests } from "@/lib/queries/planRequests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export default function CoachPlansPage() {
  const { data: pendingRequests = [] } = useCoachPendingPlanRequests();
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
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl">
                  Scale premium client plans
                </h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  Manage plans and requests.
                </CardDescription>
              </div>

              <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <Link href="/coach/plan-requests" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="relative h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ClipboardList className="h-4 w-4 shrink-0" />
                    <span className="sm:hidden">Requests</span>
                    <span className="hidden sm:inline">Plan Requests</span>
                    {pendingCount > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    ) : null}
                  </Button>
                </Link>
                <Link href="/coach/subscriptions" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="sm:hidden">Subs</span>
                    <span className="hidden sm:inline">Client Subscriptions</span>
                  </Button>
                </Link>
                <Link href="/coach/plans/create" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap rounded-xl !bg-white px-2 text-[11px] font-semibold leading-none !text-indigo-700 hover:!bg-indigo-50 sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="sm:hidden">New</span>
                    <span className="hidden sm:inline">New Plan</span>
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
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Layers3 className="h-4 w-4" />
              </span>
              Plan catalog
            </CardTitle>
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
            description: "Create and manage workout templates.",
            href: "/coach/workout-plans",
            cta: "Manage Workouts",
            Icon: Dumbbell,
          },
          {
            title: "Diet Plans",
            description: "Create and manage diet plans.",
            href: "/coach/diet-plans",
            cta: "Manage Diet Plans",
            Icon: Utensils,
          },
        ].map((item) => (
          <motion.div key={item.title} whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={item.href} className="block w-full">
                  <Button variant="default" className="h-11 w-full justify-between rounded-xl px-4 text-base font-semibold">
                    {item.cta}
                    <ArrowRight className="h-5 w-5" />
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
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Custom Exercises",
                description: "Manage your private exercise library.",
                href: "/coach/exercises",
                Icon: Dumbbell,
              },
              {
                title: "Custom Food Items",
                description: "Manage your private food library.",
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
