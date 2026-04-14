"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "@/lib/motion";
import {
  Apple,
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Leaf,
  Sparkles,
  Star,
  Target,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateFromDietTemplate,
  useDietTemplate,
  type DietDay,
  type MealFood,
} from "@/lib/queries/diet";
import getErrorMessage from "@/lib/getErrorMessage";
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

const DAYS = [
  { num: 1, name: "Monday" },
  { num: 2, name: "Tuesday" },
  { num: 3, name: "Wednesday" },
  { num: 4, name: "Thursday" },
  { num: 5, name: "Friday" },
  { num: 6, name: "Saturday" },
  { num: 7, name: "Sunday" },
];

const DAY_NAMES_BY_INDEX: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const MEAL_TIMES = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

type TemplateFood = Omit<MealFood, "foodItemId"> & {
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

function resolveFoodName(food: TemplateFood) {
  if (typeof food.foodItemId === "object" && food.foodItemId?.name) {
    return food.foodItemId.name;
  }
  return food.foodName || "Food item";
}

function resolveServingUnit(food: TemplateFood) {
  if (food.unit) return food.unit;
  if (typeof food.foodItemId === "object" && food.foodItemId?.servingUnit) {
    return food.foodItemId.servingUnit;
  }
  return "";
}

function resolveDayLabel(day: DietDay, index: number) {
  if (day.dayName?.trim()) return day.dayName;
  if (typeof day.dayNumber === "number") {
    return DAYS.find((item) => item.num === day.dayNumber)?.name ?? `Day ${day.dayNumber}`;
  }
  if (typeof day.dayOfWeek === "number") {
    return DAY_NAMES_BY_INDEX[day.dayOfWeek] ?? `Day ${index + 1}`;
  }
  return `Day ${index + 1}`;
}

export default function CoachViewDietTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateIdParam = params?.id;
  const templateId = Array.isArray(templateIdParam) ? templateIdParam[0] : templateIdParam;
  const safeTemplateId = typeof templateId === "string" ? templateId : "";

  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  const { data: template, isLoading, error } = useDietTemplate(safeTemplateId);
  const createFromTemplate = useCreateFromDietTemplate();

  const sortedSchedule = useMemo(() => {
    const schedule = template?.weeklySchedule ?? [];
    return [...schedule].sort((a, b) => {
      const aOrder =
        typeof a.dayNumber === "number"
          ? a.dayNumber
          : typeof a.dayOfWeek === "number"
            ? a.dayOfWeek === 0
              ? 7
              : a.dayOfWeek
            : Number.MAX_SAFE_INTEGER;
      const bOrder =
        typeof b.dayNumber === "number"
          ? b.dayNumber
          : typeof b.dayOfWeek === "number"
            ? b.dayOfWeek === 0
              ? 7
              : b.dayOfWeek
            : Number.MAX_SAFE_INTEGER;

      return aOrder - bOrder;
    });
  }, [template?.weeklySchedule]);

  const nutritionTargets = useMemo(() => {
    if (!template?.dailyTargets) return [];

    const { calories, protein, carbohydrates, fat, fiber, water } = template.dailyTargets;

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
            value: `${water}L`,
            tone: "border-cyan-200 bg-cyan-50 text-cyan-700",
          }
        : null,
    ].filter((item): item is NonNullable<typeof item> => item !== null);
  }, [template?.dailyTargets]);

  const recommendedFoods = useMemo(
    () =>
      (template?.recommendedFoods ?? [])
        .map((food) => (typeof food === "string" ? food : food?.name))
        .filter((food): food is string => Boolean(food?.trim())),
    [template?.recommendedFoods]
  );

  const hasHighlights =
    (template?.guidelines?.length ?? 0) > 0 ||
    (template?.foodsToAvoid?.length ?? 0) > 0 ||
    recommendedFoods.length > 0 ||
    (template?.tags?.length ?? 0) > 0;

  const toggleDay = (dayIndex: number) => {
    setExpandedDays((currentDays) =>
      currentDays.includes(dayIndex)
        ? currentDays.filter((item) => item !== dayIndex)
        : [...currentDays, dayIndex]
    );
  };

  const handleUseTemplate = () => {
    if (!safeTemplateId) return;

    createFromTemplate.mutate(
      { templateId: safeTemplateId, data: {} },
      {
        onSuccess: (res) => {
          const planId = (res as { data?: { _id?: string } })?.data?._id;
          toast.success("Diet plan created from template");
          if (planId) router.push(`/coach/diet-plans/${planId}/edit`);
          else router.push("/coach/diet-plans");
        },
        onError: (err: unknown) =>
          toast.error(getErrorMessage(err, "Failed to create plan")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">Loading template...</CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm font-medium text-rose-700">Template not found.</p>
            <Link href="/coach/diet-plans/templates" className="w-fit">
              <Button variant="outline" size="sm">
                Back to Templates
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
                {template.isFeatured ? (
                  <Badge className="w-fit !border-amber-200 !bg-amber-100 !text-amber-900 text-[10px] sm:text-xs">
                    <Star className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                ) : null}

                <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl">
                  {template.name}
                </h1>

                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  {template.description ||
                    "Review this nutrition template and clone it into your coaching workspace."}
                </CardDescription>
              </div>

              <div className="grid w-full grid-cols-2 gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <Link href="/coach/diet-plans/templates" className="min-w-0">
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Templates
                  </Button>
                </Link>

                <Link href="/coach/diet-plans" className="min-w-0">
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <UtensilsCrossed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Diet Plans
                  </Button>
                </Link>

                <Button
                  type="button"
                  onClick={handleUseTemplate}
                  disabled={createFromTemplate.isPending || !safeTemplateId}
                  className="col-span-2 h-9 w-full justify-center gap-1.5 rounded-xl !bg-white px-2 text-[11px] font-semibold leading-none !text-indigo-700 hover:!bg-indigo-50 sm:h-10 sm:px-3 sm:text-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {createFromTemplate.isPending ? "Creating..." : "Use Template"}
                </Button>
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
              Template overview
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Goal</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {prettifyLabel(template.goal)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Dietary type</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {prettifyLabel(template.dietaryType)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Meals / Day</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {template.mealsPerDay ?? "Not set"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Days / Week</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {template.daysPerWeek ?? template.weeklySchedule?.length ?? "Not set"}
                </p>
              </div>
            </div>

            {nutritionTargets.length > 0 ? (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Apple className="h-4 w-4 text-slate-500" />
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

            <p className="text-xs text-slate-500">
              Used <span className="font-semibold text-slate-700">{template.usageCount || 0}</span> times by coaches.
            </p>
          </CardContent>
        </Card>
      </motion.section>

      {hasHighlights ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                Guidance & preferences
              </CardTitle>
              <CardDescription>Practical notes to keep this template actionable.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {template.guidelines && template.guidelines.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Guidelines</p>
                  <ul className="grid gap-1.5 text-sm text-slate-600">
                    {template.guidelines.map((guideline, index) => (
                      <li key={`${guideline}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2">
                        {guideline}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {template.foodsToAvoid && template.foodsToAvoid.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Foods to avoid</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.foodsToAvoid.map((food, index) => (
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

              {recommendedFoods.length > 0 ? (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Leaf className="h-4 w-4 text-slate-500" />
                    Recommended foods
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedFoods.map((food, index) => (
                      <Badge
                        key={`${food}-${index}`}
                        variant="success"
                        className="px-2 py-0.5 text-[11px] normal-case tracking-normal"
                      >
                        {prettifyLabel(food)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {template.tags && template.tags.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags.map((tag, index) => (
                      <Badge
                        key={`${tag}-${index}`}
                        className="border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] normal-case tracking-normal text-indigo-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      {template.sampleMeals && template.sampleMeals.length > 0 ? (
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
                  <Utensils className="h-4 w-4" />
                </span>
                Sample daily meals
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {template.sampleMeals.map((meal, mealIndex) => {
                  const mealFoods = (meal.foods ?? []) as TemplateFood[];

                  return (
                    <article
                      key={`${meal.mealType || "sample-meal"}-${mealIndex}`}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {meal.name ||
                            prettifyLabel(meal.mealType) ||
                            MEAL_TIMES[mealIndex] ||
                            `Meal ${mealIndex + 1}`}
                        </h3>
                        {meal.time ? (
                          <Badge
                            variant="secondary"
                            className="px-2 py-0.5 text-[11px] normal-case tracking-normal"
                          >
                            {meal.time}
                          </Badge>
                        ) : null}
                      </div>

                      {mealFoods.length > 0 ? (
                        <ul className="space-y-1.5">
                          {mealFoods.map((food, foodIndex) => {
                            const servingUnit = resolveServingUnit(food);

                            return (
                              <li
                                key={`${food.foodName || "food"}-${foodIndex}`}
                                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-2.5 py-1.5"
                              >
                                <p className="truncate text-xs text-slate-700">{resolveFoodName(food)}</p>
                                <p className="shrink-0 text-[11px] font-semibold text-slate-500">
                                  {food.quantity} {servingUnit}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500">No food items added.</p>
                      )}

                      {meal.notes ? (
                        <p className="mt-2 text-xs italic text-slate-500">Note: {meal.notes}</p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar className="h-4 w-4" />
              </span>
              Weekly meal schedule
            </CardTitle>
            <CardDescription>Day-wise structure and meal composition.</CardDescription>
          </CardHeader>

          <CardContent>
            {sortedSchedule.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
                No weekly schedule available in this template.
              </div>
            ) : (
              <div className="space-y-2">
                {sortedSchedule.map((day, dayIndex) => {
                  const isExpanded = expandedDays.includes(dayIndex);
                  const dayMeals = day.meals ?? [];

                  return (
                    <article
                      key={`${resolveDayLabel(day, dayIndex)}-${dayIndex}`}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => toggleDay(dayIndex)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 border-b border-transparent px-3 py-2.5 text-left transition-colors",
                          isExpanded ? "border-slate-200 bg-emerald-50/60" : "bg-slate-50 hover:bg-slate-100"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {resolveDayLabel(day, dayIndex)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {dayMeals.length} {dayMeals.length === 1 ? "meal" : "meals"}
                          </p>
                        </div>

                        <span className="text-slate-500">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      </button>

                      {isExpanded ? (
                        <div className="space-y-2 p-3">
                          {dayMeals.length > 0 ? (
                            dayMeals.map((meal, mealIndex) => {
                              const mealFoods = (meal.foods ?? []) as TemplateFood[];

                              return (
                                <div
                                  key={`${meal.mealType || "meal"}-${mealIndex}`}
                                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-slate-800">
                                      {meal.name || prettifyLabel(meal.mealType) || "Meal"}
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
                                        {mealFoods.length} items
                                      </Badge>
                                    </div>
                                  </div>

                                  {mealFoods.length > 0 ? (
                                    <ul className="mt-2 space-y-1.5">
                                      {mealFoods.map((food, foodIndex) => {
                                        const servingUnit = resolveServingUnit(food);

                                        return (
                                          <li
                                            key={`${food.foodName || "food"}-${foodIndex}`}
                                            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-2.5 py-1.5"
                                          >
                                            <p className="truncate text-xs text-slate-700">{resolveFoodName(food)}</p>
                                            <p className="shrink-0 text-[11px] font-semibold text-slate-500">
                                              {food.quantity} {servingUnit}
                                            </p>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  ) : (
                                    <p className="mt-2 text-xs text-slate-500">No foods added for this meal.</p>
                                  )}

                                  {meal.notes ? (
                                    <p className="mt-2 text-xs italic text-slate-500">Note: {meal.notes}</p>
                                  ) : null}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-sm text-slate-500">No meals planned for this day.</p>
                          )}

                          {day.notes ? (
                            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs italic text-slate-500">
                              {day.notes}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}