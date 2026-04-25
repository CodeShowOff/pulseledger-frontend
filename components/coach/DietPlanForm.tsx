// components/coach/DietPlanForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Utensils,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  useCreateCoachDietPlan,
  useUpdateCoachDietPlan,
  useFoodItems,
  type CoachDietPlan,
  type FoodItem,
} from "@/lib/queries/diet";

// Schema
const foodSchema = z
  .object({
    foodItemId: z.any().optional(),
    foodName: z.string().optional(),
    quantity: z.coerce.number().min(0.1),
    unit: z.string().default("g"),
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (food) => Boolean(food.foodName?.trim()) || Boolean(food.foodItemId),
    {
      message: "Food name is required",
      path: ["foodName"],
    }
  );

const mealSchema = z.object({
  mealType: z.string(),
  name: z.string().optional(),
  time: z.string().optional(),
  foods: z.array(foodSchema).optional(),
  notes: z.string().optional(),
});

const dietDaySchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayNumber: z.number().min(1).max(7).optional(),
  dayName: z.string().optional(),
  meals: z.array(mealSchema).optional(),
  notes: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  goal: z.string().optional(),
  dietaryType: z.string().optional(),
  dailyTargets: z.object({
    calories: z.coerce.number().optional(),
    protein: z.coerce.number().optional(),
    carbohydrates: z.coerce.number().optional(),
    fat: z.coerce.number().optional(),
    fiber: z.coerce.number().optional(),
    water: z.coerce.number().optional(),
  }).optional(),
  mealsPerDay: z.coerce.number().min(1).max(8).optional(),
  daysPerWeek: z.coerce.number().min(1).max(7).optional(),
  meals: z.array(mealSchema).optional(),
  weeklySchedule: z.array(dietDaySchema).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergyNotes: z.string().optional(),
  foodsToAvoid: z.array(z.string()).optional(),
  customInstructions: z.string().optional(),
  subscriptionPlanIds: z.array(z.string()).optional(),
  isDraft: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const GOALS = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "maintenance", label: "Maintenance" },
  { value: "clean_eating", label: "Clean Eating" },
  { value: "keto", label: "Keto" },
  { value: "high_protein", label: "High Protein" },
  { value: "low_carb", label: "Low Carb" },
  { value: "balanced", label: "Balanced" },
  { value: "bulking", label: "Bulking" },
  { value: "cutting", label: "Cutting" },
  { value: "custom", label: "Custom" },
];

const DIETARY_TYPES = [
  { value: "any", label: "Any" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
];

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "mid_morning_snack", label: "Mid-Morning Snack" },
  { value: "lunch", label: "Lunch" },
  { value: "afternoon_snack", label: "Afternoon Snack" },
  { value: "dinner", label: "Dinner" },
  { value: "evening_snack", label: "Evening Snack" },
  { value: "pre_workout", label: "Pre-Workout" },
  { value: "post_workout", label: "Post-Workout" },
];

type Props = {
  plan?: CoachDietPlan;
  onSuccess?: () => void;
};

type SubscriptionPlan = {
  _id: string;
  title: string;
};

function normalizeSubscriptionPlans(payload: unknown): SubscriptionPlan[] {
  if (Array.isArray(payload)) return payload as SubscriptionPlan[];

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    const direct = obj["data"];
    if (Array.isArray(direct)) return direct as SubscriptionPlan[];

    if (direct && typeof direct === "object") {
      const nested = direct as Record<string, unknown>;
      if (Array.isArray(nested["data"])) return nested["data"] as SubscriptionPlan[];
      if (Array.isArray(nested["plans"])) return nested["plans"] as SubscriptionPlan[];
    }

    if (Array.isArray(obj["plans"])) return obj["plans"] as SubscriptionPlan[];
  }

  return [];
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

type FoodItemReference = {
  _id?: string;
  name?: string;
  servingUnit?: string;
};

function normalizeMealFoodsForForm(foods?: Array<Record<string, unknown>>) {
  return (foods || []).map((food) => {
    const foodItemRef =
      typeof food.foodItemId === "object" && food.foodItemId !== null
        ? (food.foodItemId as FoodItemReference)
        : null;

    const quantity = Number(food.quantity);

    return {
      ...food,
      foodItemId:
        typeof food.foodItemId === "string"
          ? food.foodItemId
          : foodItemRef?._id,
      foodName:
        (typeof food.foodName === "string" ? food.foodName : "") ||
        foodItemRef?.name ||
        "",
      unit:
        (typeof food.unit === "string" ? food.unit : "") ||
        foodItemRef?.servingUnit ||
        "g",
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      calories: typeof food.calories === "number" ? food.calories : undefined,
      protein: typeof food.protein === "number" ? food.protein : undefined,
      carbs: typeof food.carbs === "number" ? food.carbs : undefined,
      fat: typeof food.fat === "number" ? food.fat : undefined,
    };
  });
}

function normalizeMealsForForm(meals?: Array<Record<string, unknown>>) {
  return (meals || []).map((meal) => ({
    ...meal,
    foods: normalizeMealFoodsForForm(
      Array.isArray(meal.foods) ? (meal.foods as Array<Record<string, unknown>>) : []
    ),
  }));
}

function normalizeWeeklyScheduleForForm(schedule?: CoachDietPlan["weeklySchedule"]) {
  return (schedule || []).map((day, dayIndex) => ({
    dayOfWeek: typeof day.dayOfWeek === "number" ? day.dayOfWeek : dayIndex,
    dayNumber: day.dayNumber ?? dayIndex + 1,
    dayName: day.dayName || DAYS_OF_WEEK[dayIndex]?.label || `Day ${dayIndex + 1}`,
    meals: normalizeMealsForForm(
      Array.isArray(day.meals) ? (day.meals as Array<Record<string, unknown>>) : []
    ),
    notes: day.notes || "",
  }));
}

function toFoodItemIdString(foodItemId: unknown): string | undefined {
  if (typeof foodItemId === "string") {
    return foodItemId;
  }

  if (foodItemId && typeof foodItemId === "object") {
    const nestedId = (foodItemId as { _id?: unknown })._id;
    if (typeof nestedId === "string") {
      return nestedId;
    }
  }

  return undefined;
}

export default function DietPlanForm({ plan, onSuccess }: Props) {
  const router = useRouter();
  const [expandedDays, setExpandedDays] = useState<number[]>([0]);
  const [foodSearch, setFoodSearch] = useState("");
  const [showFoodPicker, setShowFoodPicker] = useState<{
    mealIndex: number;
    dayIndex?: number;
  } | null>(null);

  const createMutation = useCreateCoachDietPlan();
  const updateMutation = useUpdateCoachDietPlan();

  // Fetch coach's subscription plans
  const { data: coachPlansData } = useQuery({
    queryKey: ["coachPlans"],
    queryFn: async () => {
      const res = await api.get("/plans?limit=100");
      return res.data;
    },
  });
  const subscriptionPlans = normalizeSubscriptionPlans(coachPlansData);

  // Fetch food items for picker
  const { data: foodItemsData } = useFoodItems({
    limit: 50,
    search: foodSearch || undefined,
  });
  const foodItems: FoodItem[] = foodItemsData?.data ?? [];

  const defaultMeals = [
    { mealType: "breakfast", name: "Breakfast", time: "08:00", foods: [] },
    { mealType: "lunch", name: "Lunch", time: "13:00", foods: [] },
    { mealType: "dinner", name: "Dinner", time: "19:00", foods: [] },
  ];

  const defaultWeeklySchedule = Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    dayNumber: i + 1,
    dayName: DAYS_OF_WEEK[i].label,
    meals: defaultMeals.map((meal) => ({
      ...meal,
      foods: [],
    })),
    notes: "",
  }));

  const normalizedMeals = normalizeMealsForForm(
    Array.isArray(plan?.meals) ? (plan?.meals as Array<Record<string, unknown>>) : []
  );
  const normalizedWeeklySchedule = normalizeWeeklyScheduleForForm(plan?.weeklySchedule);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      goal: plan?.goal || "",
      dietaryType: plan?.dietaryType || "any",
      dailyTargets: plan?.dailyTargets || {
        calories: 2000,
        protein: 150,
        carbohydrates: 200,
        fat: 65,
        fiber: 30,
        water: 3,
      },
      mealsPerDay: plan?.mealsPerDay || 3,
      daysPerWeek: plan?.daysPerWeek || 7,
      meals: normalizedMeals.length > 0 ? normalizedMeals : defaultMeals,
      weeklySchedule:
        normalizedWeeklySchedule.length > 0 ? normalizedWeeklySchedule : defaultWeeklySchedule,
      dietaryRestrictions: plan?.dietaryRestrictions || [],
      allergyNotes: plan?.allergyNotes || "",
      foodsToAvoid: plan?.foodsToAvoid || [],
      customInstructions: plan?.customInstructions || "",
      subscriptionPlanIds: plan?.subscriptionPlanIds?.map((p) => p._id) || [],
      isDraft: plan?.isDraft ?? false,
    },
  });

  const watchWeeklySchedule = watch("weeklySchedule") || [];

  const toggleDay = (dayIndex: number) => {
    setExpandedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const addFoodToMeal = (mealIndex: number, food: FoodItem, dayIndex?: number) => {
    const servingSize = food.servingSize || 100;

    const newFood = {
      foodItemId: food._id,
      foodName: food.name,
      quantity: servingSize,
      unit: food.servingUnit || "g",
      calories: food.nutrition.calories,
      protein: food.nutrition.protein,
      carbs: food.nutrition.carbohydrates,
      fat: food.nutrition.fat,
    };

    if (dayIndex !== undefined) {
      const currentSchedule = [...watchWeeklySchedule];
      const day = currentSchedule[dayIndex];
      if (day.meals) {
        const meal = day.meals[mealIndex];
        meal.foods = [...(meal.foods || []), newFood];
        setValue("weeklySchedule", currentSchedule);
      }
    }

    setShowFoodPicker(null);
    setFoodSearch("");
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number, dayIndex?: number) => {
    if (dayIndex !== undefined) {
      const currentSchedule = [...watchWeeklySchedule];
      const day = currentSchedule[dayIndex];
      if (day.meals) {
        const foods = [...(day.meals[mealIndex].foods || [])];
        foods.splice(foodIndex, 1);
        day.meals[mealIndex].foods = foods;
        setValue("weeklySchedule", currentSchedule);
      }
    }
  };

  const onInvalid = (formErrors: FieldErrors<FormValues>) => {
    void formErrors;
    toast.error("Please review required fields before saving.");
  };

  const handleCancel = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/coach/diet-plans");
  };

  const updateFoodInMeal = (
    mealIndex: number,
    foodIndex: number,
    field: string,
    value: any,
    dayIndex?: number
  ) => {
    if (dayIndex !== undefined) {
      const currentSchedule = [...watchWeeklySchedule];
      const day = currentSchedule[dayIndex];
      if (day.meals) {
        const foods = [...(day.meals[mealIndex].foods || [])];
        foods[foodIndex] = { ...foods[foodIndex], [field]: value };
        day.meals[mealIndex].foods = foods;
        setValue("weeklySchedule", currentSchedule);
      }
    }
  };

  const addMealToDay = (dayIndex: number) => {
    const currentSchedule = [...watchWeeklySchedule];
    const day = currentSchedule[dayIndex];
    if (day.meals) {
      const newMeal = {
        mealType: "lunch",
        name: `Meal ${day.meals.length + 1}`,
        time: "",
        foods: [],
      };
      day.meals.push(newMeal);
      setValue("weeklySchedule", currentSchedule);
    }
  };

  const removeMealFromDay = (dayIndex: number, mealIndex: number) => {
    const currentSchedule = [...watchWeeklySchedule];
    const day = currentSchedule[dayIndex];
    if (day.meals) {
      day.meals.splice(mealIndex, 1);
      setValue("weeklySchedule", currentSchedule);
    }
  };

  const updateMealInDay = (dayIndex: number, mealIndex: number, field: string, value: any) => {
    const currentSchedule = [...watchWeeklySchedule];
    const day = currentSchedule[dayIndex];
    if (day.meals) {
      day.meals[mealIndex] = {
        ...day.meals[mealIndex],
        [field]: value,
      };
      setValue("weeklySchedule", currentSchedule);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const sanitizedData: FormValues = {
      ...data,
      meals: data.meals?.map((meal) => ({
        ...meal,
        foods: meal.foods?.map((food) => ({
          ...food,
          foodItemId: toFoodItemIdString((food as { foodItemId?: unknown }).foodItemId),
        })),
      })),
      weeklySchedule: data.weeklySchedule?.map((day) => ({
        ...day,
        meals: day.meals?.map((meal) => ({
          ...meal,
          foods: meal.foods?.map((food) => ({
            ...food,
            foodItemId: toFoodItemIdString((food as { foodItemId?: unknown }).foodItemId),
          })),
        })),
      })),
    };

    try {
      if (plan) {
        await updateMutation.mutateAsync({
          id: plan._id,
          data: sanitizedData as any,
        });
        toast.success("Diet plan updated");
      } else {
        await createMutation.mutateAsync(sanitizedData as any);
        toast.success("Diet plan created");
      }
      onSuccess?.();
      router.push("/coach/diet-plans");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save diet plan");
    }
  };

  const labelClass = "mb-1.5 block text-[0.82rem] font-semibold tracking-wide text-slate-700";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";
  const compactInputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-5">
      <section className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Basic Information</h2>
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
            Step 1
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Plan Name *</label>
            <input
              {...register("name")}
              className={inputClass}
              placeholder="e.g., High Protein Weight Loss Plan"
            />
            {errors.name && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Dietary Type</label>
            <select {...register("dietaryType")} className={inputClass}>
              {DIETARY_TYPES.map((dietType) => (
                <option key={dietType.value} value={dietType.value}>
                  {dietType.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Goal</label>
            <select {...register("goal")} className={inputClass}>
              <option value="">Select...</option>
              {GOALS.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Meals Per Day</label>
            <input
              type="number"
              {...register("mealsPerDay")}
              className={inputClass}
              min={1}
              max={8}
            />
          </div>

          <div>
            <label className={labelClass}>Days Per Week</label>
            <input
              type="number"
              {...register("daysPerWeek")}
              className={inputClass}
              min={1}
              max={7}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            {...register("description")}
            className={`${inputClass} min-h-[120px] resize-y`}
            rows={3}
            placeholder="Describe what this diet plan is about..."
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4">
          <label className={labelClass}>Link to Subscription Plans</label>
          <Controller
            name="subscriptionPlanIds"
            control={control}
            render={({ field }) => (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {subscriptionPlans.map((subscriptionPlan) => {
                  const selected = field.value?.includes(subscriptionPlan._id);
                  return (
                    <label
                      key={subscriptionPlan._id}
                      className={`inline-flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-all ${
                        selected
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onChange={(event) => {
                          if (event.target.checked) {
                            field.onChange([...(field.value || []), subscriptionPlan._id]);
                          } else {
                            field.onChange(
                              field.value?.filter((id: string) => id !== subscriptionPlan._id)
                            );
                          }
                        }}
                      />
                      <span
                        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? "border-indigo-500 bg-indigo-500 !text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="min-w-0 truncate font-medium">{subscriptionPlan.title}</span>
                    </label>
                  );
                })}

                {subscriptionPlans.length === 0 ? (
                  <p className="text-sm text-slate-500">No subscription plans available</p>
                ) : null}
              </div>
            )}
          />
          <p className="mt-1 text-xs text-slate-500">
            Clients subscribed to these plans can be assigned this diet plan faster.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Daily Nutritional Targets</h2>
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
            Step 2
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Calories (kcal)</label>
            <input type="number" {...register("dailyTargets.calories")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Protein (g)</label>
            <input type="number" {...register("dailyTargets.protein")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Carbs (g)</label>
            <input type="number" {...register("dailyTargets.carbohydrates")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fat (g)</label>
            <input type="number" {...register("dailyTargets.fat")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fiber (g)</label>
            <input type="number" {...register("dailyTargets.fiber")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Water (L)</label>
            <input
              type="number"
              step="0.1"
              {...register("dailyTargets.water")}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Weekly Meal Plan</h2>
            <p className="mt-1 text-sm text-slate-500">
              Build a complete week-long schedule with meals and food items for each day.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
            Step 3
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {watchWeeklySchedule.map((day, dayIndex) => {
            const isDayExpanded = expandedDays.includes(dayIndex);

            return (
              <div
                key={dayIndex}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50/70"
                  onClick={() => toggleDay(dayIndex)}
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-slate-800">
                      Day {dayIndex + 1} · {day.dayName || DAYS_OF_WEEK[dayIndex].label}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      {day.meals?.length || 0} meals
                    </span>
                  </div>
                  {isDayExpanded ? (
                    <ChevronUp className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                  )}
                </button>

                {isDayExpanded ? (
                  <div className="space-y-4 border-t border-slate-200 px-4 py-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Day Name</label>
                        <input
                          type="text"
                          value={day.dayName || ""}
                          onChange={(event) =>
                            setValue(`weeklySchedule.${dayIndex}.dayName`, event.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Day Notes</label>
                        <input
                          type="text"
                          value={day.notes || ""}
                          onChange={(event) =>
                            setValue(`weeklySchedule.${dayIndex}.notes`, event.target.value)
                          }
                          className={inputClass}
                          placeholder="Optional note for this day"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {day.meals?.map((meal, mealIndex) => (
                        <div
                          key={`${meal.mealType || "meal"}-${mealIndex}`}
                          className="rounded-xl border border-slate-200 bg-white"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border-b border-slate-200 bg-slate-50 px-3 py-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <Utensils className="h-3.5 w-3.5 text-emerald-600" />
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {meal.name || MEAL_TYPES.find((m) => m.value === meal.mealType)?.label || "Meal"}
                              </p>
                              <span className="text-xs text-slate-500">
                                ({meal.foods?.length || 0} foods)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMealFromDay(dayIndex, mealIndex)}
                              className="h-7 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="space-y-3 p-3">
                            <div className="grid gap-2 sm:grid-cols-3">
                              <div>
                                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                  Meal Type
                                </label>
                                <select
                                  value={meal.mealType}
                                  onChange={(event) =>
                                    updateMealInDay(dayIndex, mealIndex, "mealType", event.target.value)
                                  }
                                  className={compactInputClass}
                                >
                                  {MEAL_TYPES.map((mealType) => (
                                    <option key={mealType.value} value={mealType.value}>
                                      {mealType.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={meal.name || ""}
                                  onChange={(event) =>
                                    updateMealInDay(dayIndex, mealIndex, "name", event.target.value)
                                  }
                                  placeholder="e.g., Power Breakfast"
                                  className={compactInputClass}
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                  Time
                                </label>
                                <input
                                  type="time"
                                  value={meal.time || ""}
                                  onChange={(event) =>
                                    updateMealInDay(dayIndex, mealIndex, "time", event.target.value)
                                  }
                                  className={compactInputClass}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              {meal.foods?.map((food, foodIndex) => (
                                <div
                                  key={`${food.foodName || "food"}-${foodIndex}`}
                                  className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]"
                                >
                                  <div>
                                    <p className="truncate text-xs font-semibold text-slate-800">{food.foodName}</p>
                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                      {(food.calories ?? "—") + " kcal"} • {(food.protein ?? "—") + "g P"} • {(food.carbs ?? "—") + "g C"} • {(food.fat ?? "—") + "g F"}
                                    </p>
                                  </div>

                                  <div>
                                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                      Quantity
                                    </label>
                                    <input
                                      type="number"
                                      min={0.1}
                                      step={0.1}
                                      value={food.quantity}
                                      onChange={(event) =>
                                        updateFoodInMeal(
                                          mealIndex,
                                          foodIndex,
                                          "quantity",
                                          parseFloat(event.target.value) || 0,
                                          dayIndex
                                        )
                                      }
                                      className={compactInputClass}
                                    />
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFoodFromMeal(mealIndex, foodIndex, dayIndex)}
                                    className="h-9 self-end px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:self-auto"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}

                              {(!meal.foods || meal.foods.length === 0) ? (
                                <div className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-3 text-xs text-slate-500">
                                  No foods added for this meal yet.
                                </div>
                              ) : null}
                            </div>

                            {showFoodPicker?.mealIndex === mealIndex &&
                            showFoodPicker?.dayIndex === dayIndex ? (
                              <div className="rounded-lg border border-slate-200 bg-white p-3">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white px-2">
                                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                                    <input
                                      type="text"
                                      placeholder="Search foods..."
                                      value={foodSearch}
                                      onChange={(event) => setFoodSearch(event.target.value)}
                                      className="w-full border-0 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                                      autoFocus
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setShowFoodPicker(null);
                                      setFoodSearch("");
                                    }}
                                    className="h-9"
                                  >
                                    Cancel
                                  </Button>
                                </div>

                                <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto">
                                  {foodItems.map((foodItem) => (
                                    <button
                                      key={foodItem._id}
                                      type="button"
                                      onClick={() => addFoodToMeal(mealIndex, foodItem, dayIndex)}
                                      className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                                    >
                                      <span className="truncate font-medium">{foodItem.name}</span>
                                      <span className="shrink-0 text-[11px] text-slate-400">
                                        {foodItem.nutrition.calories} kcal
                                      </span>
                                    </button>
                                  ))}

                                  {foodItems.length === 0 ? (
                                    <p className="px-2 py-4 text-center text-sm text-slate-500">No foods found</p>
                                  ) : null}
                                </div>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFoodPicker({ mealIndex, dayIndex })}
                                className="h-9 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add Food
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addMealToDay(dayIndex)}
                        className="h-10 w-full justify-center gap-2 border-emerald-300 border-dashed bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Plus className="h-4 w-4" />
                        Add Meal to {day.dayName || DAYS_OF_WEEK[dayIndex].label}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Additional Instructions</h2>
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
            Step 4
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Dietary Restrictions</label>
            <Controller
              name="dietaryRestrictions"
              control={control}
              render={({ field }) => (
                <input
                  value={(field.value || []).join(", ")}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                  className={inputClass}
                  placeholder="e.g., lactose_free, gluten_free"
                />
              )}
            />
            <p className="mt-1 text-xs text-slate-500">Comma-separated values.</p>
          </div>

          <div>
            <label className={labelClass}>Foods to Avoid</label>
            <Controller
              name="foodsToAvoid"
              control={control}
              render={({ field }) => (
                <input
                  value={(field.value || []).join(", ")}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                  className={inputClass}
                  placeholder="e.g., refined_sugar, deep_fried_foods"
                />
              )}
            />
            <p className="mt-1 text-xs text-slate-500">Comma-separated values.</p>
          </div>
        </div>

        <div>
          <label className={labelClass}>Allergy Notes</label>
          <input
            {...register("allergyNotes")}
            className={inputClass}
            placeholder="Any allergy-related notes..."
          />
        </div>

        <div>
          <label className={labelClass}>Custom Instructions</label>
          <textarea
            {...register("customInstructions")}
            className={`${inputClass} min-h-[110px] resize-y`}
            rows={3}
            placeholder="Any additional guidelines for the client..."
          />
        </div>
      </section>

      <div className="mt-1 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onClick={handleCancel}
          variant="outline"
          size="lg"
          className="h-11 w-full rounded-2xl border-slate-300 px-5 text-sm font-semibold text-slate-700 sm:w-auto"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={() => {
            setValue("isDraft", true);
            handleSubmit(onSubmit, onInvalid)();
          }}
          variant="outline"
          size="lg"
          className="h-11 w-full rounded-2xl border-slate-300 px-5 text-sm font-semibold text-slate-700 sm:w-auto"
          disabled={isSubmitting}
        >
          Save as Draft
        </Button>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-2xl px-6 text-sm font-semibold sm:w-auto"
          onClick={() => setValue("isDraft", false)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </form>
  );
}
