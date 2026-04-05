"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Flame,
  ListChecks,
  Sparkles,
  Target,
  Utensils,
} from "lucide-react";
import {
  LoggedMeal,
  Meal,
  MealFood,
  useClientDietLogByDate,
  useClientDietPlans,
} from "@/lib/queries/diet";
import { formatISTDate, getISTDayOfWeek } from "@/lib/ist";
import { cn } from "@/lib/utils";

type PageView = "today" | "plans";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TAB_OPTIONS: Array<{ key: PageView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "today", label: "Today", icon: Sparkles },
  { key: "plans", label: "Plans", icon: ListChecks },
];

const PREVIEW_ROW_THEMES = [
  "border-emerald-200 bg-emerald-50/90",
  "border-cyan-200 bg-cyan-50/90",
  "border-violet-200 bg-violet-50/90",
  "border-amber-200 bg-amber-50/90",
];

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeText = (value?: string) => {
  if (!value) return "-";
  return value.replace(/_/g, " ");
};

const calculateProgress = (value: number, target: number) => {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
};

export default function ClientDietPage() {
  const [view, setView] = useState<PageView>("today");

  const today = new Date();
  const dayOfWeek = getISTDayOfWeek(today);
  const todayDateLabel = formatISTDate(today);
  const todayDateKey = formatLocalDate(today);

  const { data: plans = [], isLoading: plansLoading } = useClientDietPlans();
  const { data: todayLog, isLoading: todayLoading } = useClientDietLogByDate(todayDateKey);

  const activePlan = plans.find((plan) => plan.isActive) || plans[0];
  const mealsToShow = activePlan?.todaysMeals || activePlan?.meals || [];

  const loggedMeals = useMemo(() => {
    return new Set((todayLog?.meals || []).map((meal: LoggedMeal) => meal.mealType));
  }, [todayLog?.meals]);

  const totals = todayLog?.dailyTotals;
  const targets = activePlan?.dailyTargets;

  const macroCards = [
    {
      label: "Calories",
      consumed: totals?.calories || 0,
      target: targets?.calories || 0,
      unit: "kcal",
      tint: "text-orange-700",
      icon: Flame,
    },
    {
      label: "Protein",
      consumed: totals?.protein || 0,
      target: targets?.protein || 0,
      unit: "g",
      tint: "text-rose-700",
      icon: Target,
    },
    {
      label: "Carbs",
      consumed: totals?.carbs || 0,
      target: targets?.carbohydrates || 0,
      unit: "g",
      tint: "text-blue-700",
      icon: Sparkles,
    },
    {
      label: "Fat",
      consumed: totals?.fat || 0,
      target: targets?.fat || 0,
      unit: "g",
      tint: "text-amber-700",
      icon: Utensils,
    },
  ];

  const renderTodayView = () => {
    if (todayLoading) {
      return (
        <section className="space-y-2.5">
          {[1, 2, 3].map((item) => (
            <div
              key={`diet-today-loading-${item}`}
              className="h-[88px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </section>
      );
    }

    if (!activePlan) {
      return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <Utensils className="mx-auto h-8 w-8 text-slate-300" />
          <h2 className="mt-3 text-sm font-semibold text-slate-900">No diet plan assigned yet</h2>
          <p className="mt-1 text-xs text-slate-500">Your coach will share one soon. Stay hydrated meanwhile 💧</p>
        </section>
      );
    }

    return (
      <>
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Meal queue</p>
            </div>
            <Link
              href="/client/diet/log"
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-emerald-600"
            >
              Log now
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {mealsToShow.length ? (
            <div className="space-y-2.5">
              {mealsToShow.map((meal: Meal, index: number) => {
                const loggedMeal = todayLog?.meals?.find((entry: LoggedMeal) => entry.mealType === meal.mealType);
                const isLogged = loggedMeals.has(meal.mealType);
                const plannedFoods = (meal.foods || []) as MealFood[];

                return (
                  <Link
                    key={`${meal.mealType}-${index}`}
                    href={`/client/diet/log?meal=${meal.mealType}`}
                    className={cn(
                      "block rounded-2xl border px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-sm",
                      PREVIEW_ROW_THEMES[index % PREVIEW_ROW_THEMES.length]
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {isLogged ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                          )}
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {meal.name || normalizeText(meal.mealType)}
                          </p>
                        </div>

                        <p className="mt-1 text-xs text-slate-600">
                          {meal.time || "Any time"} · {isLogged
                            ? `${loggedMeal?.foods?.length || 0} item(s) logged`
                            : `${plannedFoods.length} item(s) suggested`}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                          isLogged ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {isLogged ? "Logged" : "Pending"}
                      </span>
                    </div>

                    {plannedFoods.length ? (
                      <div className="mt-2 w-full space-y-1.5">
                        {plannedFoods.slice(0, 3).map((food, foodIndex) => (
                          <div
                            key={`${food.foodName || "food"}-${foodIndex}`}
                            className="flex w-full items-center justify-between rounded-lg border border-white/70 bg-white/70 px-2.5 py-1.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-medium text-slate-700">
                                {food.foodName || "Food item"}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {food.quantity} {food.unit || "g"}
                              </p>
                            </div>

                            {typeof food.calories === "number" ? (
                              <span className="ml-2 shrink-0 text-[10px] font-semibold text-orange-600">
                                {food.calories} kcal
                              </span>
                            ) : null}
                          </div>
                        ))}

                        {plannedFoods.length > 3 ? (
                          <p className="px-1 text-[10px] font-medium text-slate-500">
                            +{plannedFoods.length - 3} more suggested item(s)
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-sm font-medium text-slate-700">No meals configured for today.</p>
              <p className="mt-1 text-xs text-slate-500">Your coach may still be updating this plan.</p>
            </div>
          )}
        </section>
      </>
    );
  };

  const renderPlansView = () => {
    if (plansLoading) {
      return (
        <section className="space-y-2.5">
          {[1, 2, 3].map((item) => (
            <div key={`plan-loading-${item}`} className="h-[88px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </section>
      );
    }

    if (!plans.length) {
      return (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
          <Utensils className="mx-auto h-7 w-7 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-800">No diet plans yet</p>
          <p className="mt-1 text-xs text-slate-500">Your coach will assign one soon.</p>
        </section>
      );
    }

    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Plan library</p>
            <p className="text-xs text-slate-500">Open a plan to view full weekly structure and food details.</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {plans.map((plan, index) => {
            const intensity = Math.max(20, Math.min(95, ((plan.mealsPerDay || 1) / 8) * 100));

            return (
              <Link
                key={plan._id}
                href={`/client/diet/plan/${plan._id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{plan.name}</p>
                      {plan.isActive ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                          Active
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {normalizeText(plan.goal)} · {normalizeText(plan.dietaryType)}
                    </p>

                    <p className="mt-1.5 text-[11px] font-medium text-emerald-600">
                      {plan.mealsPerDay || 0} meals/day · {plan.dailyTargets?.calories || 0} kcal target
                    </p>
                  </div>

                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                </div>

                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      index % 3 === 0
                        ? "bg-gradient-to-r from-emerald-500 to-green-500"
                        : index % 3 === 1
                          ? "bg-gradient-to-r from-cyan-500 to-teal-500"
                          : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    )}
                    style={{ width: `${intensity}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="client-page__sections space-y-4 pb-6 md:space-y-5">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="client-page__title !text-[1.15rem] !font-semibold leading-tight sm:!text-[1.2rem]">
              Nutrition Studio
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="font-semibold text-emerald-600">{DAY_LABELS[dayOfWeek]}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{todayDateLabel}</span>
            </p>
          </div>

          <Link
            href="/client/diet/history"
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Calendar className="h-3.5 w-3.5" />
            History
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70">
            {macroCards.map((item, index) => {
              const Icon = item.icon;
              const progress = calculateProgress(item.consumed, item.target);
              const isTopRow = index < 2;
              const isLeftCol = index % 2 === 0;

              return (
                <div
                  key={item.label}
                  className={cn(
                    "px-3 py-2.5",
                    isTopRow && "border-b border-slate-100",
                    isLeftCol && "border-r border-slate-100"
                  )}
                >
                  <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", item.tint)}>
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {item.consumed}
                    <span className="ml-1 text-xs font-medium text-slate-500">{item.unit}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Target: {item.target || 0}
                    {item.unit} · {progress}%
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-1.5">
          {TAB_OPTIONS.map((tab) => {
            const Icon = tab.icon;
            const selected = view === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setView(tab.key)}
                className={cn(
                  "flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition",
                  selected
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {view === "today" ? renderTodayView() : null}
      {view === "plans" ? renderPlansView() : null}
    </div>
  );
}
