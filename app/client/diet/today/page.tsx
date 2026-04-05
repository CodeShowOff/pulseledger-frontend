"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Circle,
  Coffee,
  Dumbbell,
  Moon,
  Plus,
  Sun,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LoggedMeal, Meal, MealFood, useClientDietLogByDate, useClientDietPlans } from "@/lib/queries/diet";
import { getISTDayOfWeek } from "@/lib/ist";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const FALLBACK_ROW_THEMES = [
  "border-amber-200 bg-amber-50/80",
  "border-emerald-200 bg-emerald-50/80",
  "border-cyan-200 bg-cyan-50/80",
  "border-violet-200 bg-violet-50/80",
];

const MEAL_META: Record<string, { icon: LucideIcon; row: string; accent: string }> = {
  breakfast: {
    icon: Coffee,
    row: "border-amber-200 bg-amber-50/80",
    accent: "text-amber-700",
  },
  mid_morning_snack: {
    icon: Sun,
    row: "border-lime-200 bg-lime-50/80",
    accent: "text-lime-700",
  },
  lunch: {
    icon: Sun,
    row: "border-emerald-200 bg-emerald-50/80",
    accent: "text-emerald-700",
  },
  afternoon_snack: {
    icon: Sun,
    row: "border-cyan-200 bg-cyan-50/80",
    accent: "text-cyan-700",
  },
  dinner: {
    icon: Moon,
    row: "border-violet-200 bg-violet-50/80",
    accent: "text-violet-700",
  },
  evening_snack: {
    icon: Moon,
    row: "border-fuchsia-200 bg-fuchsia-50/80",
    accent: "text-fuchsia-700",
  },
  pre_workout: {
    icon: Dumbbell,
    row: "border-pink-200 bg-pink-50/80",
    accent: "text-pink-700",
  },
  post_workout: {
    icon: Dumbbell,
    row: "border-rose-200 bg-rose-50/80",
    accent: "text-rose-700",
  },
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeMealLabel = (value?: string) => {
  if (!value) return "Meal";
  return value.replace(/_/g, " ");
};

const getMacroProgress = (value: number, target: number) => {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
};

export default function ClientDietTodayPage() {
  const today = new Date();
  const dayOfWeek = getISTDayOfWeek(today);
  const todayDateKey = formatLocalDate(today);

  const { data: plans = [], isLoading: plansLoading } = useClientDietPlans();
  const { data: todayLog, isLoading: todayLoading } = useClientDietLogByDate(todayDateKey);

  const activePlan = plans.find((plan) => plan.isActive) || plans[0];
  const mealsToShow = activePlan?.todaysMeals || activePlan?.meals || [];

  const loggedMealMap = useMemo(() => {
    return new Map((todayLog?.meals || []).map((meal: LoggedMeal) => [meal.mealType, meal]));
  }, [todayLog?.meals]);

  if (plansLoading || todayLoading) {
    return (
      <div className="client-page__sections space-y-4 pb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading today&apos;s nutrition...
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="client-page__sections space-y-4 pb-6">
        <Link
          href="/client/diet"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to nutrition
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Utensils className="mx-auto h-9 w-9 text-slate-300" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">No diet plan assigned today</h2>
          <p className="mt-1 text-sm text-slate-500">Your coach hasn&apos;t assigned one yet. Check back soon.</p>
        </section>
      </div>
    );
  }

  const totals = todayLog?.dailyTotals;
  const targets = activePlan.dailyTargets;

  const macroCards = [
    {
      label: "Calories",
      value: totals?.calories || 0,
      target: targets?.calories || 0,
      unit: "kcal",
      tint: "text-orange-700",
    },
    {
      label: "Protein",
      value: totals?.protein || 0,
      target: targets?.protein || 0,
      unit: "g",
      tint: "text-rose-700",
    },
    {
      label: "Carbs",
      value: totals?.carbs || 0,
      target: targets?.carbohydrates || 0,
      unit: "g",
      tint: "text-cyan-700",
    },
    {
      label: "Fat",
      value: totals?.fat || 0,
      target: targets?.fat || 0,
      unit: "g",
      tint: "text-amber-700",
    },
  ];

  return (
    <div className="client-page__sections space-y-4 pb-6">
      <Link
        href="/client/diet"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to nutrition
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stats</p>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            {DAY_LABELS[dayOfWeek]}
          </span>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70">
          {macroCards.map((card, index) => {
            const isTopRow = index < 2;
            const isLeftCol = index % 2 === 0;
            const progress = getMacroProgress(card.value, card.target);

            return (
              <div
                key={card.label}
                className={cn("px-3 py-2.5", isTopRow && "border-b border-slate-100", isLeftCol && "border-r border-slate-100")}
              >
                <p className={cn("text-[11px] font-medium", card.tint)}>{card.label}</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {card.value}
                  <span className="ml-1 text-xs font-medium text-slate-500">{card.unit}</span>
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Target {card.target || 0}
                  {card.unit} · {progress}%
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <Link
        href="/client/diet/log"
        className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 text-sm font-semibold !text-white shadow-sm transition hover:brightness-110"
      >
        <Plus className="h-4 w-4" />
        Log meal
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Today&apos;s meals</h2>
          <p className="text-xs text-slate-500">Tap to log</p>
        </div>

        {mealsToShow.length ? (
          <div className="space-y-2.5">
            {mealsToShow.map((meal: Meal, index: number) => {
              const meta = MEAL_META[meal.mealType] || {
                icon: Utensils,
                row: FALLBACK_ROW_THEMES[index % FALLBACK_ROW_THEMES.length],
                accent: "text-slate-700",
              };

              const MealIcon = meta.icon;
              const loggedMeal = loggedMealMap.get(meal.mealType);
              const isLogged = Boolean(loggedMeal);
              const plannedFoods = (meal.foods || []) as MealFood[];

              return (
                <Link
                  key={`${meal.mealType}-${index}`}
                  href={`/client/diet/log?meal=${meal.mealType}`}
                  className={cn(
                    "block rounded-2xl border px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-sm",
                    meta.row
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {isLogged ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <MealIcon className={cn("h-4 w-4 shrink-0", meta.accent)} />
                        )}
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {meal.name || normalizeMealLabel(meal.mealType)}
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-slate-600">
                        {meal.time || "Any time"} · {isLogged
                          ? `${loggedMeal?.foods?.length || 0} item(s) logged`
                          : `${plannedFoods.length} item(s) suggested`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                          isLogged ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {isLogged ? "Logged" : "Pending"}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
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
            <p className="text-sm font-medium text-slate-700">No meals scheduled for today.</p>
            <p className="mt-1 text-xs text-slate-500">Your coach might still be preparing your plan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
