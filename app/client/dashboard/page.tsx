// src/app/(client)/dashboard/page.tsx
"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Calculator,
  Dumbbell,
  Sparkles,
  UserCircle2,
  Waves,
} from "lucide-react";
import ClientStats from "@/components/client/ClientStats";
const ProgressCharts = dynamic(() => import("@/components/client/ProgressCharts"), { ssr: false });
import AssignedPlans from "@/components/client/AssignedPlans";
import WaterIntakeWidget from "@/components/client/WaterIntakeWidget";
import GoalWeightWidget from "@/components/client/GoalWeightWidget";
import { useMyCoachQuery } from "@/lib/queries/coach";
import RoleGuard from "@/components/shared/RoleGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const todayCoreActions = [
  {
    title: "Today's Workout",
    description: "Open your workout plan for today and track execution quickly.",
    href: "/client/workouts/today",
    Icon: Dumbbell,
    iconTone: "from-orange-500 to-amber-500",
    cardTone: "from-orange-50 to-amber-50",
  },
  {
    title: "Today's Nutrition",
    description: "Follow your current meal plan and stay consistent with intake.",
    href: "/client/diet/today",
    Icon: Waves,
    iconTone: "from-emerald-500 to-lime-500",
    cardTone: "from-emerald-50 to-lime-50",
  },
] as const;

const quickActions = [
  {
    title: "Indian nutrition index",
    description: "Look up macro and micronutrient values for Indian foods.",
    href: "/indian-nutrition-index",
    cta: "Open index",
    Icon: BookOpenText,
    iconTone: "from-cyan-500 to-sky-500",
    cardTone: "from-cyan-50 to-sky-50",
  },
  {
    title: "Calorie calculator",
    description: "Estimate daily calorie and macro targets for your goals.",
    href: "/calorie-calculator",
    cta: "Open calculator",
    Icon: Calculator,
    iconTone: "from-violet-500 to-fuchsia-500",
    cardTone: "from-violet-50 to-fuchsia-50",
  },
] as const;

function ConnectedWithCompanyName({ companyName }: { companyName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);
  const [marqueeShiftPx, setMarqueeShiftPx] = useState(0);

  useEffect(() => {
    const updateOverflow = () => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!container || !text) return;

      const overflow = Math.max(0, text.scrollWidth - container.clientWidth);
      setShouldMarquee(overflow > 2);
      setMarqueeShiftPx(overflow);
    };

    updateOverflow();

    const container = containerRef.current;
    const text = textRef.current;

    if (!container || !text) return;

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateOverflow);
      return () => window.removeEventListener("resize", updateOverflow);
    }

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(container);
    observer.observe(text);
    window.addEventListener("resize", updateOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [companyName]);

  if (!shouldMarquee || marqueeShiftPx <= 0) {
    return (
      <div ref={containerRef} className="min-w-0 w-[44vw] max-w-[220px]">
        <span ref={textRef} className="block truncate text-xs font-semibold text-white sm:text-sm">
          {companyName}
        </span>
      </div>
    );
  }

  const durationSeconds = Math.max(4, marqueeShiftPx / 22);

  return (
    <div ref={containerRef} className="min-w-0 w-[44vw] max-w-[220px] overflow-hidden" aria-label={companyName}>
      <span
        ref={textRef}
        className="block whitespace-nowrap text-xs font-semibold text-white [will-change:transform] sm:text-sm"
        style={
          {
            animation: `clientDashboardMarquee ${durationSeconds.toFixed(2)}s cubic-bezier(0.33, 1, 0.68, 1) infinite alternate`,
            ["--marquee-shift" as const]: `${marqueeShiftPx}px`,
          } as CSSProperties
        }
      >
        {companyName}
      </span>
    </div>
  );
}

export default function ClientDashboardPage() {
  const { data: coach, isLoading } = useMyCoachQuery();

  return (
    <div className="client-page__sections space-y-4 md:space-y-5">
      <style jsx>{`
        @keyframes clientDashboardMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-1 * var(--marquee-shift)));
          }
        }
      `}</style>

      <RoleGuard role="client" />

      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28 }}>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="space-y-2">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <h1 className="whitespace-nowrap text-lg font-bold tracking-tight text-white sm:text-3xl">My dashboard</h1>

                {!isLoading && coach ? (
                  <Link href="/client/coach" className="shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-white/25 bg-white/10 px-2 text-[10px] text-white hover:bg-white/20 hover:text-white sm:h-9 sm:px-3.5 sm:text-sm"
                    >
                      <UserCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="sm:hidden">Coach Profile</span>
                      <span className="hidden sm:inline">View Coach Profile</span>
                    </Button>
                  </Link>
                ) : null}
              </div>

              <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                Track workouts, nutrition, hydration, and progress from one focused dashboard.
              </CardDescription>
            </div>

            {!isLoading ? (
              <div className="inline-flex max-w-full min-w-0 flex-nowrap items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-100" aria-hidden="true" />
                <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-blue-100 sm:text-[11px]">Connected with</span>
                <ConnectedWithCompanyName companyName={coach?.companyName || "FitCoach"} />
              </div>
            ) : (
              <p className="text-sm text-blue-100">Checking coach assignment...</p>
            )}
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.04 }}
        className="space-y-2 sm:space-y-3"
      >
        <div className="flex items-center gap-2 px-1">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </span>
          <h2 className="text-base font-semibold text-slate-900 md:text-lg">Today's tasks</h2>
        </div>

        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3">
          {todayCoreActions.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.05 + index * 0.03 }}
              whileHover={{ y: -2 }}
            >
              <Link href={item.href} className="group block h-full">
                <div
                  className={cn(
                    "relative flex h-full min-h-[78px] items-center gap-2.5 overflow-hidden rounded-2xl border border-slate-200 p-3 transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_12px_24px_-20px_rgba(79,70,229,0.55)] md:min-h-[112px] md:items-start md:p-4",
                    `bg-gradient-to-br ${item.cardTone}`
                  )}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/60 blur-xl" />

                  <div className="relative z-[1] flex min-w-0 items-center gap-2.5 md:items-start md:gap-3">
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                        item.iconTone
                      )}
                    >
                      <item.Icon className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 space-y-1">
                      <h2 className="text-sm font-semibold leading-tight text-slate-900">{item.title}</h2>
                      <p className="hidden text-xs leading-5 text-slate-600 md:block">{item.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.08 }}
        aria-labelledby="wellness-widgets-heading"
        className="space-y-3"
      >
        <div className="flex items-center gap-2 px-1">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
            <Waves className="h-4 w-4" />
          </span>
          <h2 id="wellness-widgets-heading" className="text-base font-semibold text-slate-900 md:text-lg">
            Daily Wellness Widgets
          </h2>
        </div>
        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3">
          <div className="min-w-0 h-full">
            <WaterIntakeWidget compact />
          </div>
          <div className="min-w-0 h-full">
            <GoalWeightWidget compact />
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.12 }}
      >
        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="h-4 w-4" />
              </span>
              Daily shortcuts
            </CardTitle>
            <CardDescription>Jump into your most-used pages in one tap.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.07 + index * 0.03 }}
                  whileHover={{ y: -2 }}
                >
                  <Link href={item.href} className="group block h-full">
                    <div
                      className={cn(
                        "relative flex h-full min-h-[152px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.55)]",
                        `bg-gradient-to-br ${item.cardTone}`
                      )}
                    >
                      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/60 blur-xl" />

                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={cn(
                            "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                            item.iconTone
                          )}
                        >
                          <item.Icon className="h-5 w-5" />
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
                        <p className="text-xs leading-5 text-slate-600">{item.description}</p>
                      </div>

                      <p className="text-xs font-semibold text-indigo-700 transition-colors group-hover:text-indigo-900">
                        {item.cta}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {isLoading ? (
        <Card className="border-slate-200/80 bg-white/95">
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Checking coach assignment...</p>
          </CardContent>
        </Card>
      ) : coach ? null : (
        <Card className="border-amber-200/80 bg-amber-50/70">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800">
              You do not have a coach assigned yet. Once a coach is linked to your account, their details will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28, delay: 0.14 }}>
        <AssignedPlans />
      </motion.section>

      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28, delay: 0.16 }}>
        <Card className="border-slate-200/80 bg-white/95">
          <CardContent className="p-4 sm:p-5">
            <ClientStats />
          </CardContent>
        </Card>
      </motion.section>

      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28, delay: 0.18 }}>
        <ProgressCharts />
      </motion.section>

    </div>
  );
}
