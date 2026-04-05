"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  Coffee,
  Dumbbell,
  Flame,
  Moon,
  Pill,
  Sparkles,
  Sun,
  Target,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useClientDietPlan } from "@/lib/queries/diet";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MEAL_META: Record<string, { icon: LucideIcon; chip: string; card: string }> = {
  breakfast: {
    icon: Coffee,
    chip: "bg-amber-100 text-amber-700",
    card: "border-amber-200 bg-amber-50/50",
  },
  mid_morning_snack: {
    icon: Sun,
    chip: "bg-lime-100 text-lime-700",
    card: "border-lime-200 bg-lime-50/50",
  },
  lunch: {
    icon: Sun,
    chip: "bg-emerald-100 text-emerald-700",
    card: "border-emerald-200 bg-emerald-50/50",
  },
  afternoon_snack: {
    icon: Sun,
    chip: "bg-cyan-100 text-cyan-700",
    card: "border-cyan-200 bg-cyan-50/50",
  },
  dinner: {
    icon: Moon,
    chip: "bg-violet-100 text-violet-700",
    card: "border-violet-200 bg-violet-50/50",
  },
  evening_snack: {
    icon: Moon,
    chip: "bg-fuchsia-100 text-fuchsia-700",
    card: "border-fuchsia-200 bg-fuchsia-50/50",
  },
  pre_workout: {
    icon: Dumbbell,
    chip: "bg-pink-100 text-pink-700",
    card: "border-pink-200 bg-pink-50/50",
  },
  post_workout: {
    icon: Dumbbell,
    chip: "bg-rose-100 text-rose-700",
    card: "border-rose-200 bg-rose-50/50",
  },
  bedtime_snack: {
    icon: Moon,
    chip: "bg-indigo-100 text-indigo-700",
    card: "border-indigo-200 bg-indigo-50/50",
  },
};

const formatText = (value?: string) => {
  if (!value) return "-";
  return value.replace(/_/g, " ");
};

export default function ClientDietPlanDetailPage() {
  const params = useParams();
  const planId = params?.id as string;

  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  const { data: plan, isLoading, error } = useClientDietPlan(planId);

  const toggleDay = (index: number) => {
    setExpandedDays((previous) =>
      previous.includes(index) ? previous.filter((dayIndex) => dayIndex !== index) : [...previous, index]
    );
  };

  if (isLoading) {
    return (
      <div className="client-page__sections space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading diet plan...
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="client-page__sections space-y-4">
        <Link
          href="/client/diet"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to nutrition
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <CircleAlert className="mx-auto h-9 w-9 text-rose-400" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Diet plan not found</h2>
          <p className="mt-1 text-sm text-slate-500">
            This plan may be inactive or no longer assigned to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-page__sections space-y-4 pb-6">
      <Link
        href="/client/diet"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to nutrition
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-slate-200 p-2.5 text-slate-700">
            <Utensils className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">{plan.name}</h1>
            {plan.description ? <p className="mt-1 text-sm text-slate-600">{plan.description}</p> : null}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
          {plan.goal ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-center">
              <Target className="mr-1 inline h-3 w-3" />
              {formatText(plan.goal)}
            </span>
          ) : null}

          {plan.dietaryType ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-center">
              <Sparkles className="mr-1 inline h-3 w-3" />
              {formatText(plan.dietaryType)}
            </span>
          ) : null}

          {plan.mealsPerDay ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-center">
              <Clock3 className="mr-1 inline h-3 w-3" />
              {plan.mealsPerDay} meals/day
            </span>
          ) : null}

          {plan.daysPerWeek ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-center">
              <Calendar className="mr-1 inline h-3 w-3" />
              {plan.daysPerWeek} days/week
            </span>
          ) : null}
        </div>
      </section>

      {plan.dailyTargets ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Daily targets</h2>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-2 py-2 text-center">
              <Flame className="mx-auto h-4 w-4 text-orange-600" />
              <p className="mt-1 font-semibold text-orange-700">{plan.dailyTargets.calories || 0}</p>
              <p className="text-[10px] text-orange-600">kcal</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-2 py-2 text-center">
              <p className="font-semibold text-rose-700">{plan.dailyTargets.protein || 0}g</p>
              <p className="text-[10px] text-rose-600">Protein</p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-2 py-2 text-center">
              <p className="font-semibold text-cyan-700">{plan.dailyTargets.carbohydrates || 0}g</p>
              <p className="text-[10px] text-cyan-600">Carbs</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-center">
              <p className="font-semibold text-amber-700">{plan.dailyTargets.fat || 0}g</p>
              <p className="text-[10px] text-amber-600">Fat</p>
            </div>
          </div>

          {plan.dailyTargets.water ? (
            <p className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700">
              💧 Water goal: {plan.dailyTargets.water}L/day
            </p>
          ) : null}
        </section>
      ) : null}

      {plan.weeklySchedule?.length ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Weekly schedule</h2>

          {plan.weeklySchedule.map((day, dayIndex) => {
            const isExpanded = expandedDays.includes(dayIndex);
            const dayName = day.dayName || (typeof day.dayOfWeek === "number" ? DAY_NAMES[day.dayOfWeek] : `Day ${dayIndex + 1}`);
            const meals = day.meals || [];

            return (
              <article key={`${dayName}-${dayIndex}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleDay(dayIndex)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{dayName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{meals.length} meal(s)</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {meals.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded ? (
                  <div className="space-y-2 border-t border-slate-200 px-3 py-3">
                    {day.notes ? (
                      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <span className="font-semibold">Coach note:</span> {day.notes}
                      </p>
                    ) : null}

                    {meals.length ? (
                      meals.map((meal, mealIndex) => {
                        const meta = MEAL_META[meal.mealType] || {
                          icon: Utensils,
                          chip: "bg-slate-100 text-slate-700",
                          card: "border-slate-200 bg-slate-50/70",
                        };
                        const MealIcon = meta.icon;

                        return (
                          <div key={`${meal.mealType}-${mealIndex}`} className={cn("rounded-2xl border p-3", meta.card)}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <MealIcon className="h-4 w-4 text-slate-600" />
                                <p className="text-sm font-semibold text-slate-900">{formatText(meal.mealType)}</p>
                              </div>
                              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.chip)}>
                                {meal.time || "Flexible"}
                              </span>
                            </div>

                            {meal.name ? <p className="mt-1 text-xs text-slate-600">{meal.name}</p> : null}

                            {meal.foods?.length ? (
                              <div className="mt-2 space-y-1.5">
                                {meal.foods.map((food, foodIndex) => (
                                  <div
                                    key={`${food.foodName}-${foodIndex}`}
                                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-medium text-slate-800">{food.foodName}</p>
                                      <p className="text-[11px] text-slate-500">
                                        {food.quantity} {food.unit || "g"}
                                      </p>
                                    </div>
                                    {food.calories ? (
                                      <span className="text-[11px] font-semibold text-orange-600">{food.calories} kcal</span>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            {meal.notes ? (
                              <p className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                                {meal.notes}
                              </p>
                            ) : null}
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        No meals configured for this day.
                      </p>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : plan.meals?.length ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Meal structure</h2>

          <div className="mt-3 space-y-2.5">
            {plan.meals.map((meal, index) => {
              const meta = MEAL_META[meal.mealType] || {
                icon: Utensils,
                chip: "bg-slate-100 text-slate-700",
                card: "border-slate-200 bg-slate-50/70",
              };
              const MealIcon = meta.icon;

              return (
                <div key={`${meal.mealType}-${index}`} className={cn("rounded-2xl border p-3", meta.card)}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MealIcon className="h-4 w-4 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-900">{formatText(meal.mealType)}</p>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.chip)}>
                      {meal.time || "Flexible"}
                    </span>
                  </div>

                  {meal.foods?.length ? (
                    <p className="mt-1 text-xs text-slate-600">
                      {meal.foods.map((food) => food.foodName).filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {plan.foodsToAvoid?.length ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-rose-900">Foods to avoid</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {plan.foodsToAvoid.map((food) => (
              <span
                key={food}
                className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-medium text-rose-700"
              >
                {food}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {plan.supplements?.length ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Supplements</h2>
          <div className="mt-2 space-y-2">
            {plan.supplements.map((supplement, index) => (
              <div key={`${supplement.name}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-start gap-2">
                  <Pill className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{supplement.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {[supplement.dosage, supplement.timing].filter(Boolean).join(" · ") || "As advised"}
                    </p>
                    {supplement.notes ? <p className="mt-1 text-xs text-slate-600">{supplement.notes}</p> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {plan.allergyNotes ? (
        <section className="rounded-3xl border border-rose-300 bg-rose-50 p-4 shadow-sm">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-rose-900">
            <CircleAlert className="h-4 w-4" />
            Allergy notes
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-rose-800">{plan.allergyNotes}</p>
        </section>
      ) : null}

      {plan.customInstructions ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Coach instructions</h2>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{plan.customInstructions}</p>
        </section>
      ) : null}

      <Link
        href="/client/diet/today"
        className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 text-sm font-semibold !text-white shadow-sm transition hover:brightness-110"
      >
        <CheckCircle2 className="h-4 w-4" />
        Open today&apos;s nutrition
      </Link>
    </div>
  );
}
