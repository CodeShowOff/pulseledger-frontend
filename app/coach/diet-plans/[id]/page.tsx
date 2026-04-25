"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "@/lib/motion";
import {
  Apple,
  ArrowLeft,
  Calendar,
  Droplets,
  Edit2,
  Flame,
  Sparkles,
  Target,
  Utensils,
} from "lucide-react";
import {
  useCoachDietPlan,
  type CoachDietPlan,
  type Meal,
  type MealFood,
} from "@/lib/queries/diet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DAYS_SUNDAY_FIRST = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAYS_MONDAY_FIRST = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  mid_morning_snack: "Mid-Morning Snack",
  lunch: "Lunch",
  afternoon_snack: "Afternoon Snack",
  dinner: "Dinner",
  evening_snack: "Evening Snack",
  pre_workout: "Pre-Workout",
  post_workout: "Post-Workout",
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

type DietPlanDay = NonNullable<CoachDietPlan["weeklySchedule"]>[number];

type DisplayMealFood = Omit<MealFood, "foodItemId"> & {
  foodItemId?: string | { name?: string; servingUnit?: string };
};

function prettifyLabel(value?: string) {
  if (!value) return "Not set";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getDayLabel(day: DietPlanDay, dayIndex: number) {
  if (day.dayName?.trim()) return day.dayName;

  if (typeof day.dayOfWeek === "number" && day.dayOfWeek >= 0 && day.dayOfWeek < 7) {
    return DAYS_SUNDAY_FIRST[day.dayOfWeek];
  }

  if (typeof day.dayNumber === "number" && day.dayNumber >= 1 && day.dayNumber <= 7) {
    return DAYS_MONDAY_FIRST[day.dayNumber - 1];
  }

  return DAYS_SUNDAY_FIRST[dayIndex] || `Day ${dayIndex + 1}`;
}

function getMealLabel(meal: Meal, mealIndex: number) {
  if (meal.name?.trim()) return meal.name;
  if (meal.mealType?.trim()) {
    return MEAL_TYPE_LABELS[meal.mealType] || prettifyLabel(meal.mealType);
  }

  return `Meal ${mealIndex + 1}`;
}

function getFoodName(food: DisplayMealFood) {
  if (typeof food.foodItemId === "object" && food.foodItemId?.name) {
    return food.foodItemId.name;
  }

  return food.foodName || "Food item";
}

function getFoodUnit(food: DisplayMealFood) {
  if (food.unit) return food.unit;

  if (typeof food.foodItemId === "object" && food.foodItemId?.servingUnit) {
    return food.foodItemId.servingUnit;
  }

  return "";
}

export default function ViewDietPlanPage() {
  const params = useParams();
  const planIdParam = params?.id;
  const planId = Array.isArray(planIdParam) ? planIdParam[0] : planIdParam;
  const safePlanId = typeof planId === "string" ? planId : "";

  const { data: plan, isLoading, error } = useCoachDietPlan(safePlanId);

  const nutritionTargets = useMemo(() => {
    if (!plan?.dailyTargets) return [];

    const { calories, protein, carbohydrates, fat, fiber, water } = plan.dailyTargets;

    return [
      calories != null
        ? {
            key: "calories",
            label: "Calories",
            value: `${calories} kcal`,
            tone: "border-orange-200 bg-orange-50 text-orange-700",
          }
        : null,
      protein != null
        ? {
            key: "protein",
            label: "Protein",
            value: `${protein}g`,
            tone: "border-rose-200 bg-rose-50 text-rose-700",
          }
        : null,
      carbohydrates != null
        ? {
            key: "carbohydrates",
            label: "Carbs",
            value: `${carbohydrates}g`,
            tone: "border-blue-200 bg-blue-50 text-blue-700",
          }
        : null,
      fat != null
        ? {
            key: "fat",
            label: "Fat",
            value: `${fat}g`,
            tone: "border-amber-200 bg-amber-50 text-amber-700",
          }
        : null,
      fiber != null
        ? {
            key: "fiber",
            label: "Fiber",
            value: `${fiber}g`,
            tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
          }
        : null,
      water != null
        ? {
            key: "water",
            label: "Water",
            value: `${water} L`,
            tone: "border-cyan-200 bg-cyan-50 text-cyan-700",
          }
        : null,
    ].filter((target): target is NonNullable<typeof target> => target !== null);
  }, [plan?.dailyTargets]);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            Loading plan...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm font-medium text-rose-700">Plan not found.</p>
            <Link href="/coach/diet-plans" className="w-fit">
              <Button variant="outline" size="sm">
                Back to Diet Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {plan.isDraft ? (
                  <Badge className="w-fit !border-amber-200 !bg-amber-100 !text-amber-900 text-[10px] sm:text-xs">
                    Draft
                  </Badge>
                ) : null}

                <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl">
                  {plan.name}
                </h1>

                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  {plan.description ||
                    "Review your meal structure, targets, and schedule before assigning this plan."}
                </CardDescription>
              </div>

              <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <Link href="/coach/diet-plans" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none !text-white hover:bg-white/20 hover:!text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Diet Plans
                  </Button>
                </Link>

                <Link href={`/coach/diet-plans/${safePlanId}/edit`} className="min-w-0 flex-1 sm:flex-none">
                  <Button className="h-9 w-full justify-center gap-1.5 whitespace-nowrap rounded-xl !bg-white px-2 text-[11px] font-semibold leading-none !text-indigo-700 hover:!bg-indigo-50 sm:h-10 sm:w-auto sm:px-3 sm:text-sm">
                    <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Edit Plan
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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Target className="h-4 w-4" />
              </span>
              Plan overview
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Goal</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Target className="h-3.5 w-3.5 text-emerald-600" />
                  {prettifyLabel(plan.goal)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Dietary Type</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Apple className="h-3.5 w-3.5 text-blue-600" />
                  {prettifyLabel(plan.dietaryType)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Meals / Day</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Utensils className="h-3.5 w-3.5 text-amber-600" />
                  {plan.mealsPerDay || plan.meals?.length || 0}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Days / Week</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-pink-600" />
                  {plan.daysPerWeek || plan.weeklySchedule?.length || 0} days
                </p>
              </div>
            </div>

            {nutritionTargets.length > 0 ? (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Flame className="h-4 w-4 text-slate-500" />
                  Daily targets
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {nutritionTargets.map((target) => (
                    <Badge
                      key={target.key}
                      className={cn(
                        "border px-2 py-0.5 text-[11px] normal-case tracking-normal",
                        target.tone
                      )}
                    >
                      {target.label}: {target.value}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {(plan.dietaryRestrictions && plan.dietaryRestrictions.length > 0) ||
            (plan.foodsToAvoid && plan.foodsToAvoid.length > 0) ? (
              <div className="grid gap-3 md:grid-cols-2">
                {plan.dietaryRestrictions && plan.dietaryRestrictions.length > 0 ? (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-800">Dietary restrictions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.dietaryRestrictions.map((restriction, index) => (
                        <Badge
                          key={`${restriction}-${index}`}
                          variant="secondary"
                          className="px-2 py-0.5 text-[11px] normal-case tracking-normal"
                        >
                          {prettifyLabel(restriction)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                {plan.foodsToAvoid && plan.foodsToAvoid.length > 0 ? (
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Droplets className="h-4 w-4 text-slate-500" />
                      Foods to avoid
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.foodsToAvoid.map((food, index) => (
                        <Badge
                          key={`${food}-${index}`}
                          variant="danger"
                          className="px-2 py-0.5 text-[11px] normal-case tracking-normal"
                        >
                          {prettifyLabel(food)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.section>

      {plan.subscriptionPlanIds && plan.subscriptionPlanIds.length > 0 ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                Linked subscription plans
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {plan.subscriptionPlanIds.map((subscriptionPlan) => (
                  <Badge
                    key={subscriptionPlan._id}
                    className="border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] normal-case tracking-normal text-indigo-700"
                  >
                    {subscriptionPlan.title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar className="h-4 w-4" />
              </span>
              Meal schedule
            </CardTitle>
            <CardDescription>Daily meal structure with foods and nutrition cues.</CardDescription>
          </CardHeader>

          <CardContent>
            {plan.weeklySchedule && plan.weeklySchedule.length > 0 ? (
              <div className="space-y-2">
                {plan.weeklySchedule.map((day: DietPlanDay, dayIndex: number) => {
                  const dayLabel = getDayLabel(day, dayIndex);
                  const meals = day.meals ?? [];

                  return (
                    <article
                      key={`${day.dayName || day.dayNumber || day.dayOfWeek || "day"}-${dayIndex}`}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-emerald-50/60 px-3 py-2.5">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900">{dayLabel}</h3>
                          {day.notes ? (
                            <p className="text-xs text-slate-600">{day.notes}</p>
                          ) : null}
                        </div>

                        <Badge
                          variant="secondary"
                          className="border border-slate-200 bg-white px-2 py-0.5 text-[11px] normal-case tracking-normal text-slate-700"
                        >
                          {meals.length} {meals.length === 1 ? "meal" : "meals"}
                        </Badge>
                      </div>

                      {meals.length > 0 ? (
                        <div className="space-y-2 p-3">
                          {meals.map((meal: Meal, mealIndex: number) => {
                            const foods = (meal.foods ?? []) as DisplayMealFood[];

                            return (
                              <section
                                key={`${meal.mealType || "meal"}-${mealIndex}`}
                                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {getMealLabel(meal, mealIndex)}
                                  </p>

                                  <div className="flex items-center gap-1.5">
                                    {meal.time ? (
                                      <Badge
                                        variant="secondary"
                                        className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                                      >
                                        {meal.time}
                                      </Badge>
                                    ) : null}

                                    <Badge
                                      variant="secondary"
                                      className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                                    >
                                      {foods.length} items
                                    </Badge>
                                  </div>
                                </div>

                                {foods.length > 0 ? (
                                  <ul className="mt-2 space-y-1.5">
                                    {foods.map((food, foodIndex) => {
                                      const macros = [
                                        food.calories != null ? `${food.calories} kcal` : null,
                                        food.protein != null ? `${food.protein}g P` : null,
                                        food.carbs != null ? `${food.carbs}g C` : null,
                                        food.fat != null ? `${food.fat}g F` : null,
                                      ].filter(Boolean);

                                      return (
                                        <li
                                          key={`${food.foodName || "food"}-${foodIndex}`}
                                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5"
                                        >
                                          <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-xs font-medium text-slate-800">
                                              {getFoodName(food)}
                                            </p>
                                            <p className="shrink-0 text-[11px] font-semibold text-slate-500">
                                              {food.quantity} {getFoodUnit(food)}
                                            </p>
                                          </div>

                                          {macros.length > 0 ? (
                                            <p className="mt-1 text-[10px] text-slate-500">
                                              {macros.join(" • ")}
                                            </p>
                                          ) : null}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                ) : (
                                  <p className="mt-2 text-xs text-slate-500">No foods in this meal.</p>
                                )}

                                {meal.notes ? (
                                  <p className="mt-2 text-[11px] text-slate-500">Note: {meal.notes}</p>
                                ) : null}
                              </section>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-3 py-3 text-sm text-slate-500">No meals added for this day.</div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : plan.meals && plan.meals.length > 0 ? (
              <div className="space-y-2">
                <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 bg-emerald-50/60 px-3 py-2.5">
                    <h3 className="text-sm font-semibold text-slate-900">Daily meals</h3>
                  </div>

                  <div className="space-y-2 p-3">
                    {plan.meals.map((meal: Meal, mealIndex: number) => {
                      const foods = (meal.foods ?? []) as DisplayMealFood[];

                      return (
                        <section
                          key={`${meal.mealType || "daily-meal"}-${mealIndex}`}
                          className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800">
                              {getMealLabel(meal, mealIndex)}
                            </p>

                            <div className="flex items-center gap-1.5">
                              {meal.time ? (
                                <Badge
                                  variant="secondary"
                                  className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                                >
                                  {meal.time}
                                </Badge>
                              ) : null}

                              <Badge
                                variant="secondary"
                                className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                              >
                                {foods.length} items
                              </Badge>
                            </div>
                          </div>

                          {foods.length > 0 ? (
                            <ul className="mt-2 space-y-1.5">
                              {foods.map((food, foodIndex) => (
                                <li
                                  key={`${food.foodName || "food"}-${foodIndex}`}
                                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-2.5 py-1.5"
                                >
                                  <p className="truncate text-xs font-medium text-slate-800">
                                    {getFoodName(food)}
                                  </p>
                                  <p className="shrink-0 text-[11px] font-semibold text-slate-500">
                                    {food.quantity} {getFoodUnit(food)}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-xs text-slate-500">No foods in this meal.</p>
                          )}

                          {meal.notes ? (
                            <p className="mt-2 text-[11px] text-slate-500">Note: {meal.notes}</p>
                          ) : null}
                        </section>
                      );
                    })}
                  </div>
                </article>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
                No meals configured for this plan.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {plan.allergyNotes || plan.customInstructions ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                Additional notes
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {plan.allergyNotes ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Allergy notes
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{plan.allergyNotes}</p>
                </div>
              ) : null}

              {plan.customInstructions ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Custom instructions
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{plan.customInstructions}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.section>
      ) : null}
    </div>
  );
}