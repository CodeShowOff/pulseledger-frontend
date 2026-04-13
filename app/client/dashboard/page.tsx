// src/app/(client)/dashboard/page.tsx
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BookOpenText,
  Calculator,
  Dumbbell,
  UserCircle2,
  Utensils,
} from "lucide-react";
import { useMyCoachQuery } from "@/lib/queries/coach";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import WaterIntakeWidget from "@/components/client/WaterIntakeWidget";
import GoalWeightWidget from "@/components/client/GoalWeightWidget";
import { cn } from "@/lib/utils";

const todayCoreActions = [
  {
    title: "Workout",
    description: "Open your workout plan and track execution quickly.",
    href: "/client/workouts/today",
    Icon: Dumbbell,
    iconTone: "from-orange-500 to-amber-500",
    cardTone: "from-orange-50 to-amber-50",
  },
  {
    title: "Nutrition",
    description: "Follow your current meal plan and stay consistent with intake.",
    href: "/client/diet/today",
    Icon: Utensils,
    iconTone: "from-emerald-500 to-lime-500",
    cardTone: "from-emerald-50 to-lime-50",
  },
] as const;

const quickActions = [
  {
    title: "Nutrition Index",
    href: "/indian-nutrition-index",
    Icon: BookOpenText,
    iconTone: "bg-cyan-50 text-cyan-600",
  },
  {
    title: "Calorie Calculator",
    href: "/calorie-calculator",
    Icon: Calculator,
    iconTone: "bg-violet-50 text-violet-600",
  },
] as const;

function DashboardCardSkeleton({ label }: { label: string }) {
  return (
    <Card className="border-slate-200/80 bg-white/95">
      <CardContent className="p-4 sm:p-5">
        <p className="text-sm text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}

const ClientStats = dynamic(() => import("@/components/client/ClientStats"), {
  ssr: false,
  loading: () => <DashboardCardSkeleton label="Loading quick stats..." />,
});

function ConnectedWithCompanyName({ companyName }: { companyName: string }) {
  return (
    <div className="min-w-0 max-w-[55vw] sm:max-w-[220px]" aria-label={companyName}>
      <span className="block truncate text-xs font-semibold text-slate-700 sm:text-sm" title={companyName}>
        {companyName}
      </span>
    </div>
  );
}

export default function ClientDashboardPage() {
  const { data: coach } = useMyCoachQuery();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const quickStatsSectionRef = useRef<HTMLElement | null>(null);
  const [shouldRenderQuickStats, setShouldRenderQuickStats] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const handleChange = () => setIsMobileViewport(mediaQuery.matches);

    handleChange();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (shouldRenderQuickStats) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldRenderQuickStats(true);
      return;
    }

    const target = quickStatsSectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setShouldRenderQuickStats(true);
        observer.disconnect();
      },
      { rootMargin: "280px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldRenderQuickStats]);

  return (
    <div className="client-page__sections space-y-4 md:space-y-5">
      <section>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="space-y-2">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <h1 className="whitespace-nowrap text-lg font-bold tracking-tight text-white sm:text-3xl">My dashboard</h1>

                {coach ? (
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
          </CardHeader>
        </Card>

        {coach ? (
          <div className="mt-2 flex min-w-0 items-center justify-center gap-1.5 text-center">
            <span className="whitespace-nowrap text-xs text-slate-600 sm:text-sm">Connected with</span>
            <ConnectedWithCompanyName companyName={coach.companyName || "FitCoach"} />
          </div>
        ) : null}
      </section>

      <section>
        <div className="grid grid-cols-2 items-stretch gap-1.5 sm:grid-cols-1 sm:gap-4 xl:grid-cols-2">
          <div className="min-w-0 h-full">
            <WaterIntakeWidget compact={isMobileViewport} />
          </div>
          <div className="min-w-0 h-full">
            <GoalWeightWidget compact={isMobileViewport} />
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3">
          {todayCoreActions.map((item) => (
            <div key={item.title}>
              <Link href={item.href} className="group block h-full cursor-pointer focus-visible:outline-none">
                <div
                  className={cn(
                    "relative flex h-full min-h-[104px] cursor-pointer select-none items-center justify-center overflow-hidden rounded-2xl border-4 border-white p-3 transition-all duration-200 shadow-[0_14px_24px_-20px_rgba(15,23,42,0.4)] hover:-translate-y-0.5 hover:border-white hover:brightness-[1.02] hover:shadow-[0_20px_30px_-20px_rgba(15,23,42,0.48)] active:translate-y-[1px] active:scale-[0.99] active:shadow-[0_10px_22px_-20px_rgba(15,23,42,0.42)] group-focus-visible:ring-4 group-focus-visible:ring-indigo-200 group-focus-visible:ring-offset-2 md:min-h-[124px] md:p-4",
                    `bg-gradient-to-br ${item.cardTone}`
                  )}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 hidden h-20 w-20 rounded-full bg-white/60 blur-xl sm:block" />

                  <div className="relative z-[1] flex w-full flex-col items-center justify-center text-center">
                    <span
                      className={cn(
                        "mb-2 grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md",
                        item.iconTone
                      )}
                    >
                      <item.Icon className="h-6 w-6" />
                    </span>

                    <h2 className="text-sm font-semibold leading-tight text-slate-900 md:text-base">{item.title}</h2>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3">
          {quickActions.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group block h-full rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-3 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_28px_-24px_rgba(15,23,42,0.6)] sm:p-4"
            >
              <div className="flex min-h-[108px] flex-col items-center justify-center gap-2.5 text-center sm:min-h-[124px] sm:gap-3">
                <span
                  className={cn(
                    "grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/80 shadow-sm sm:h-14 sm:w-14",
                    item.iconTone
                  )}
                >
                  <item.Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>

                <h2 className="text-sm font-semibold leading-tight tracking-tight text-slate-900 sm:text-base">
                  {item.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section ref={quickStatsSectionRef}>
        {shouldRenderQuickStats ? (
          <Card className="border-slate-200/80 bg-white/95">
            <CardContent className="p-4 pt-5 sm:p-5">
              <ClientStats />
            </CardContent>
          </Card>
        ) : (
          <DashboardCardSkeleton label="Loading quick stats..." />
        )}
      </section>

    </div>
  );
}
