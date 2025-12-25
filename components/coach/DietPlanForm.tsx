// components/coach/DietPlanForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  useCreateCoachDietPlan,
  useUpdateCoachDietPlan,
  useFoodItems,
  type CoachDietPlan,
  type FoodItem,
} from "@/lib/queries/diet";

// Schema
const foodSchema = z.object({
  foodItemId: z.string().optional(),
  foodName: z.string().min(1),
  quantity: z.coerce.number().min(0.1),
  unit: z.string().default("g"),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  notes: z.string().optional(),
});

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

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function DietPlanForm({ plan, onSuccess }: Props) {
  const router = useRouter();
  const [planMode, setPlanMode] = useState<"template" | "weekly">(
    plan?.weeklySchedule && plan.weeklySchedule.length > 0 ? "weekly" : "template"
  );
  const [expandedMeals, setExpandedMeals] = useState<number[]>([0]);
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
      return res.data.data;
    },
  });
  const subscriptionPlans = coachPlansData ?? [];

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
    meals: [...defaultMeals],
    notes: "",
  }));

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
      meals: plan?.meals || defaultMeals,
      weeklySchedule: plan?.weeklySchedule || defaultWeeklySchedule,
      dietaryRestrictions: plan?.dietaryRestrictions || [],
      allergyNotes: plan?.allergyNotes || "",
      foodsToAvoid: plan?.foodsToAvoid || [],
      customInstructions: plan?.customInstructions || "",
      subscriptionPlanIds: plan?.subscriptionPlanIds?.map((p) => p._id) || [],
      isDraft: plan?.isDraft ?? false,
    },
  });

  const watchMeals = watch("meals") || [];
  const watchWeeklySchedule = watch("weeklySchedule") || [];

  const toggleDay = (dayIndex: number) => {
    setExpandedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const toggleMeal = (mealIndex: number) => {
    setExpandedMeals((prev) =>
      prev.includes(mealIndex)
        ? prev.filter((m) => m !== mealIndex)
        : [...prev, mealIndex]
    );
  };

  const addMeal = () => {
    const currentMeals = watchMeals;
    const newMeal = {
      mealType: "lunch",
      name: `Meal ${currentMeals.length + 1}`,
      time: "",
      foods: [],
    };
    setValue("meals", [...currentMeals, newMeal]);
    setExpandedMeals((prev) => [...prev, currentMeals.length]);
  };

  const removeMeal = (mealIndex: number) => {
    const currentMeals = [...watchMeals];
    currentMeals.splice(mealIndex, 1);
    setValue("meals", currentMeals);
    setExpandedMeals((prev) => prev.filter((m) => m !== mealIndex));
  };

  const updateMeal = (mealIndex: number, field: string, value: any) => {
    const currentMeals = [...watchMeals];
    currentMeals[mealIndex] = { ...currentMeals[mealIndex], [field]: value };
    setValue("meals", currentMeals);
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

    if (planMode === "weekly" && dayIndex !== undefined) {
      const currentSchedule = [...watchWeeklySchedule];
      const day = currentSchedule[dayIndex];
      if (day.meals) {
        const meal = day.meals[mealIndex];
        meal.foods = [...(meal.foods || []), newFood];
        setValue("weeklySchedule", currentSchedule);
      }
    } else {
      const currentMeals = [...watchMeals];
      const meal = currentMeals[mealIndex];
      meal.foods = [...(meal.foods || []), newFood];
      setValue("meals", currentMeals);
    }

    setShowFoodPicker(null);
    setFoodSearch("");
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number, dayIndex?: number) => {
    if (planMode === "weekly" && dayIndex !== undefined) {
      const currentSchedule = [...watchWeeklySchedule];
      const day = currentSchedule[dayIndex];
      if (day.meals) {
        const foods = [...(day.meals[mealIndex].foods || [])];
        foods.splice(foodIndex, 1);
        day.meals[mealIndex].foods = foods;
        setValue("weeklySchedule", currentSchedule);
      }
    } else {
      const currentMeals = [...watchMeals];
      const foods = [...(currentMeals[mealIndex].foods || [])];
      foods.splice(foodIndex, 1);
      currentMeals[mealIndex].foods = foods;
      setValue("meals", currentMeals);
    }
  };

  const updateFoodInMeal = (
    mealIndex: number,
    foodIndex: number,
    field: string,
    value: any,
    dayIndex?: number
  ) => {
    if (planMode === "weekly" && dayIndex !== undefined) {
      const currentSchedule = [...watchWeeklySchedule];
      const day = currentSchedule[dayIndex];
      if (day.meals) {
        const foods = [...(day.meals[mealIndex].foods || [])];
        foods[foodIndex] = { ...foods[foodIndex], [field]: value };
        day.meals[mealIndex].foods = foods;
        setValue("weeklySchedule", currentSchedule);
      }
    } else {
      const currentMeals = [...watchMeals];
      const foods = [...(currentMeals[mealIndex].foods || [])];
      foods[foodIndex] = { ...foods[foodIndex], [field]: value };
      currentMeals[mealIndex].foods = foods;
      setValue("meals", currentMeals);
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
    try {
      if (plan) {
        await updateMutation.mutateAsync({
          id: plan._id,
          data: data as any,
        });
        toast.success("Diet plan updated");
      } else {
        await createMutation.mutateAsync(data as any);
        toast.success("Diet plan created");
      }
      onSuccess?.();
      router.push("/coach/diet-plans");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save diet plan");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="coach-plan-form">
      {/* Basic Info Section */}
      <div className="coach-plan-form__section coach-plan-form__section--main">
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
          Basic Information
        </h2>

        <div className="coach-plan-form__row">
          <div className="auth-form__field" style={{ flex: 2 }}>
            <label className="auth-form__label">Plan Name *</label>
            <input
              {...register("name")}
              className="auth-form__input"
              placeholder="e.g., High Protein Weight Loss Plan"
            />
            {errors.name && (
              <p className="auth-form__error">{errors.name.message}</p>
            )}
          </div>

          <div className="auth-form__field" style={{ flex: 1 }}>
            <label className="auth-form__label">Dietary Type</label>
            <select {...register("dietaryType")} className="auth-form__input">
              {DIETARY_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="coach-plan-form__row">
          <div className="auth-form__field" style={{ flex: 1 }}>
            <label className="auth-form__label">Goal</label>
            <select {...register("goal")} className="auth-form__input">
              <option value="">Select...</option>
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-form__field" style={{ flex: 1 }}>
            <label className="auth-form__label">Meals Per Day</label>
            <input
              type="number"
              {...register("mealsPerDay")}
              className="auth-form__input"
              min={1}
              max={8}
            />
          </div>
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label">Description</label>
          <textarea
            {...register("description")}
            className="auth-form__input"
            rows={3}
            placeholder="Describe what this diet plan is about..."
          />
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label">Link to Subscription Plans</label>
          <Controller
            name="subscriptionPlanIds"
            control={control}
            render={({ field }) => (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {subscriptionPlans.map((sp: any) => (
                  <label
                    key={sp._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: field.value?.includes(sp._id)
                        ? "#f0fdf4"
                        : "#fff",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={field.value?.includes(sp._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...(field.value || []), sp._id]);
                        } else {
                          field.onChange(
                            field.value?.filter((id: string) => id !== sp._id)
                          );
                        }
                      }}
                    />
                    {sp.title}
                  </label>
                ))}
                {subscriptionPlans.length === 0 && (
                  <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                    No subscription plans available
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Daily Targets Section */}
      <div className="coach-plan-form__section">
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
          Daily Nutritional Targets
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
        >
          <div className="auth-form__field">
            <label className="auth-form__label">Calories (kcal)</label>
            <input
              type="number"
              {...register("dailyTargets.calories")}
              className="auth-form__input"
            />
          </div>
          <div className="auth-form__field">
            <label className="auth-form__label">Protein (g)</label>
            <input
              type="number"
              {...register("dailyTargets.protein")}
              className="auth-form__input"
            />
          </div>
          <div className="auth-form__field">
            <label className="auth-form__label">Carbs (g)</label>
            <input
              type="number"
              {...register("dailyTargets.carbohydrates")}
              className="auth-form__input"
            />
          </div>
          <div className="auth-form__field">
            <label className="auth-form__label">Fat (g)</label>
            <input
              type="number"
              {...register("dailyTargets.fat")}
              className="auth-form__input"
            />
          </div>
          <div className="auth-form__field">
            <label className="auth-form__label">Fiber (g)</label>
            <input
              type="number"
              {...register("dailyTargets.fiber")}
              className="auth-form__input"
            />
          </div>
          <div className="auth-form__field">
            <label className="auth-form__label">Water (L)</label>
            <input
              type="number"
              step="0.1"
              {...register("dailyTargets.water")}
              className="auth-form__input"
            />
          </div>
        </div>
      </div>

      {/* Meals Section */}
      <div className="coach-plan-form__section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            Meal Plan
          </h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* Mode Toggle */}
            <div
              style={{
                display: "inline-flex",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                overflow: "hidden",
                fontSize: "0.75rem",
              }}
            >
              <button
                type="button"
                onClick={() => setPlanMode("template")}
                style={{
                  padding: "0.4rem 0.75rem",
                  backgroundColor: planMode === "template" ? "#16a34a" : "#fff",
                  color: planMode === "template" ? "#fff" : "#6b7280",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: planMode === "template" ? 600 : 400,
                }}
              >
                Single Day Template
              </button>
              <button
                type="button"
                onClick={() => setPlanMode("weekly")}
                style={{
                  padding: "0.4rem 0.75rem",
                  backgroundColor: planMode === "weekly" ? "#16a34a" : "#fff",
                  color: planMode === "weekly" ? "#fff" : "#6b7280",
                  border: "none",
                  borderLeft: "1px solid #e5e7eb",
                  cursor: "pointer",
                  fontWeight: planMode === "weekly" ? 600 : 400,
                }}
              >
                Weekly Schedule (Day-wise)
              </button>
            </div>
            {planMode === "template" && (
              <button
                type="button"
                onClick={addMeal}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.8rem",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #dcfce7",
                  borderRadius: "6px",
                  color: "#16a34a",
                  cursor: "pointer",
                }}
              >
                <Plus style={{ width: 14, height: 14 }} />
                Add Meal
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "1rem" }}>
          {planMode === "template"
            ? "Create a single-day meal template that will repeat daily for clients."
            : "Create a detailed week-long meal plan with different meals for each day."}
        </p>

        {/* Template Mode - Single Day */}
        {planMode === "template" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {watchMeals.map((meal, mealIndex) => {
            const isExpanded = expandedMeals.includes(mealIndex);

            return (
              <div
                key={mealIndex}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                {/* Meal Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    borderBottom: isExpanded ? "1px solid #e5e7eb" : "none",
                  }}
                  onClick={() => toggleMeal(mealIndex)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <Utensils
                      style={{ width: 16, height: 16, color: "#16a34a" }}
                    />
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {meal.name || MEAL_TYPES.find((m) => m.value === meal.mealType)?.label || "Meal"}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        backgroundColor: "#f0fdf4",
                        color: "#16a34a",
                      }}
                    >
                      {meal.foods?.length || 0} foods
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {mealIndex > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMeal(mealIndex);
                        }}
                        style={{
                          padding: "0.25rem",
                          backgroundColor: "#fee2e2",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2
                          style={{ width: 14, height: 14, color: "#dc2626" }}
                        />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp
                        style={{ width: 18, height: 18, color: "#6b7280" }}
                      />
                    ) : (
                      <ChevronDown
                        style={{ width: 18, height: 18, color: "#6b7280" }}
                      />
                    )}
                  </div>
                </div>

                {/* Meal Content */}
                {isExpanded && (
                  <div style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "0.75rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            display: "block",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Meal Type
                        </label>
                        <select
                          value={meal.mealType}
                          onChange={(e) =>
                            updateMeal(mealIndex, "mealType", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "0.4rem 0.5rem",
                            fontSize: "0.85rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                          }}
                        >
                          {MEAL_TYPES.map((mt) => (
                            <option key={mt.value} value={mt.value}>
                              {mt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            display: "block",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          value={meal.name || ""}
                          onChange={(e) =>
                            updateMeal(mealIndex, "name", e.target.value)
                          }
                          placeholder="e.g., Power Breakfast"
                          style={{
                            width: "100%",
                            padding: "0.4rem 0.5rem",
                            fontSize: "0.85rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            display: "block",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Time
                        </label>
                        <input
                          type="time"
                          value={meal.time || ""}
                          onChange={(e) =>
                            updateMeal(mealIndex, "time", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "0.4rem 0.5rem",
                            fontSize: "0.85rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Foods List */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {meal.foods?.map((food, foodIndex) => (
                        <div
                          key={foodIndex}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 80px 80px 80px auto",
                            gap: "0.5rem",
                            alignItems: "center",
                            padding: "0.5rem",
                            backgroundColor: "#f9fafb",
                            borderRadius: "6px",
                          }}
                        >
                          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                            {food.foodName}
                          </span>
                          <input
                            type="number"
                            value={food.quantity}
                            onChange={(e) =>
                              updateFoodInMeal(
                                mealIndex,
                                foodIndex,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            style={{
                              padding: "0.35rem",
                              fontSize: "0.8rem",
                              border: "1px solid #e5e7eb",
                              borderRadius: "4px",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              textAlign: "center",
                            }}
                          >
                            {food.calories || 0} kcal
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              textAlign: "center",
                            }}
                          >
                            {food.protein || 0}g P
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              textAlign: "center",
                            }}
                          >
                            {food.carbs || 0}g C
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              removeFoodFromMeal(mealIndex, foodIndex)
                            }
                            style={{
                              padding: "0.35rem",
                              backgroundColor: "#fee2e2",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2
                              style={{ width: 14, height: 14, color: "#dc2626" }}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Food Button / Picker */}
                    {showFoodPicker?.mealIndex === mealIndex ? (
                      <div
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "0.75rem",
                          backgroundColor: "#fff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <Search
                            style={{ width: 16, height: 16, color: "#9ca3af" }}
                          />
                          <input
                            type="text"
                            placeholder="Search foods..."
                            value={foodSearch}
                            onChange={(e) => setFoodSearch(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "0.4rem",
                              fontSize: "0.85rem",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowFoodPicker(null);
                              setFoodSearch("");
                            }}
                            style={{
                              padding: "0.4rem 0.75rem",
                              fontSize: "0.8rem",
                              backgroundColor: "#f3f4f6",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                        <div
                          style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                          }}
                        >
                          {foodItems.map((food) => (
                            <button
                              key={food._id}
                              type="button"
                              onClick={() => addFoodToMeal(mealIndex, food)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "0.5rem",
                                padding: "0.5rem 0.75rem",
                                fontSize: "0.85rem",
                                backgroundColor: "#f9fafb",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span>{food.name}</span>
                                {food.isCustom && (
                                  <span
                                    style={{
                                      fontSize: "0.6rem",
                                      padding: "0.1rem 0.35rem",
                                      backgroundColor: "#f3e8ff",
                                      color: "#8b5cf6",
                                      borderRadius: "999px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    CUSTOM
                                  </span>
                                )}
                              </div>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  color: "#9ca3af",
                                }}
                              >
                                {food.nutrition.calories} kcal |{" "}
                                {food.nutrition.protein}g P
                              </span>
                            </button>
                          ))}
                          {foodItems.length === 0 && (
                            <p
                              style={{
                                padding: "1rem",
                                textAlign: "center",
                                color: "#6b7280",
                                fontSize: "0.85rem",
                              }}
                            >
                              No foods found. Admin needs to add food items to
                              the library.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowFoodPicker({ mealIndex })}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 1rem",
                          fontSize: "0.85rem",
                          backgroundColor: "#f0fdf4",
                          border: "1px solid #dcfce7",
                          borderRadius: "6px",
                          color: "#16a34a",
                          cursor: "pointer",
                        }}
                      >
                        <Plus style={{ width: 16, height: 16 }} />
                        Add Food
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        {/* Weekly Schedule Mode - Day-wise */}
        {planMode === "weekly" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {watchWeeklySchedule.map((day, dayIndex) => {
              const isDayExpanded = expandedDays.includes(dayIndex);

              return (
                <div
                  key={dayIndex}
                  style={{
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                  }}
                >
                  {/* Day Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.85rem 1rem",
                      cursor: "pointer",
                      backgroundColor: "#f9fafb",
                      borderBottom: isDayExpanded ? "2px solid #e5e7eb" : "none",
                      borderRadius: isDayExpanded ? "6px 6px 0 0" : "6px",
                    }}
                    onClick={() => toggleDay(dayIndex)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "#16a34a" }}>
                        Day {dayIndex + 1}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {day.dayName || DAYS_OF_WEEK[dayIndex].label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          backgroundColor: "#f0fdf4",
                          color: "#16a34a",
                          fontWeight: 600,
                        }}
                      >
                        {day.meals?.length || 0} meals
                      </span>
                    </div>
                    {isDayExpanded ? (
                      <ChevronUp style={{ width: 20, height: 20, color: "#6b7280" }} />
                    ) : (
                      <ChevronDown style={{ width: 20, height: 20, color: "#6b7280" }} />
                    )}
                  </div>

                  {/* Day Content */}
                  {isDayExpanded && (
                    <div style={{ padding: "1rem" }}>
                      {/* Day Meals */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {day.meals?.map((meal, mealIndex) => (
                          <div
                            key={mealIndex}
                            style={{
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                            }}
                          >
                            {/* Meal Header */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.6rem 0.85rem",
                                backgroundColor: "#fafafa",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Utensils style={{ width: 14, height: 14, color: "#16a34a" }} />
                                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                  {meal.name || MEAL_TYPES.find((m) => m.value === meal.mealType)?.label}
                                </span>
                                <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                                  ({meal.foods?.length || 0} foods)
                                </span>
                              </div>
                              {mealIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeMealFromDay(dayIndex, mealIndex)}
                                  style={{
                                    padding: "0.25rem",
                                    backgroundColor: "#fee2e2",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                  }}
                                >
                                  <Trash2 style={{ width: 12, height: 12, color: "#dc2626" }} />
                                </button>
                              )}
                            </div>

                            {/* Meal Details */}
                            <div style={{ padding: "0.75rem" }}>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr 1fr",
                                  gap: "0.5rem",
                                  marginBottom: "0.75rem",
                                }}
                              >
                                <div>
                                  <label style={{ fontSize: "0.7rem", color: "#6b7280", display: "block", marginBottom: "0.2rem" }}>
                                    Meal Type
                                  </label>
                                  <select
                                    value={meal.mealType}
                                    onChange={(e) => updateMealInDay(dayIndex, mealIndex, "mealType", e.target.value)}
                                    style={{
                                      width: "100%",
                                      padding: "0.35rem 0.4rem",
                                      fontSize: "0.8rem",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    {MEAL_TYPES.map((mt) => (
                                      <option key={mt.value} value={mt.value}>
                                        {mt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label style={{ fontSize: "0.7rem", color: "#6b7280", display: "block", marginBottom: "0.2rem" }}>
                                    Name
                                  </label>
                                  <input
                                    type="text"
                                    value={meal.name || ""}
                                    onChange={(e) => updateMealInDay(dayIndex, mealIndex, "name", e.target.value)}
                                    placeholder="e.g., Power Breakfast"
                                    style={{
                                      width: "100%",
                                      padding: "0.35rem 0.4rem",
                                      fontSize: "0.8rem",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "4px",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: "0.7rem", color: "#6b7280", display: "block", marginBottom: "0.2rem" }}>
                                    Time
                                  </label>
                                  <input
                                    type="time"
                                    value={meal.time || ""}
                                    onChange={(e) => updateMealInDay(dayIndex, mealIndex, "time", e.target.value)}
                                    style={{
                                      width: "100%",
                                      padding: "0.35rem 0.4rem",
                                      fontSize: "0.8rem",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "4px",
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Foods in this meal */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem" }}>
                                {meal.foods?.map((food, foodIndex) => (
                                  <div
                                    key={foodIndex}
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "2fr 1fr 70px 70px 70px auto",
                                      gap: "0.4rem",
                                      alignItems: "center",
                                      padding: "0.4rem",
                                      backgroundColor: "#f9fafb",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                                      {food.foodName}
                                    </span>
                                    <input
                                      type="number"
                                      value={food.quantity}
                                      onChange={(e) =>
                                        updateFoodInMeal(
                                          mealIndex,
                                          foodIndex,
                                          "quantity",
                                          parseFloat(e.target.value) || 0,
                                          dayIndex
                                        )
                                      }
                                      style={{
                                        padding: "0.3rem",
                                        fontSize: "0.75rem",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "4px",
                                      }}
                                    />
                                    <span style={{ fontSize: "0.7rem", color: "#6b7280", textAlign: "center" }}>
                                      {food.calories || 0} kcal
                                    </span>
                                    <span style={{ fontSize: "0.7rem", color: "#6b7280", textAlign: "center" }}>
                                      {food.protein || 0}g P
                                    </span>
                                    <span style={{ fontSize: "0.7rem", color: "#6b7280", textAlign: "center" }}>
                                      {food.carbs || 0}g C
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeFoodFromMeal(mealIndex, foodIndex, dayIndex)}
                                      style={{
                                        padding: "0.3rem",
                                        backgroundColor: "#fee2e2",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <Trash2 style={{ width: 12, height: 12, color: "#dc2626" }} />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Add Food to this meal */}
                              {showFoodPicker?.mealIndex === mealIndex && showFoodPicker?.dayIndex === dayIndex ? (
                                <div
                                  style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "6px",
                                    padding: "0.6rem",
                                    backgroundColor: "#fff",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
                                    <Search style={{ width: 14, height: 14, color: "#9ca3af" }} />
                                    <input
                                      type="text"
                                      placeholder="Search foods..."
                                      value={foodSearch}
                                      onChange={(e) => setFoodSearch(e.target.value)}
                                      style={{
                                        flex: 1,
                                        padding: "0.35rem",
                                        fontSize: "0.8rem",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "4px",
                                      }}
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowFoodPicker(null);
                                        setFoodSearch("");
                                      }}
                                      style={{
                                        padding: "0.35rem 0.6rem",
                                        fontSize: "0.75rem",
                                        backgroundColor: "#f3f4f6",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                    {foodItems.map((food) => (
                                      <button
                                        key={food._id}
                                        type="button"
                                        onClick={() => addFoodToMeal(mealIndex, food, dayIndex)}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          gap: "0.4rem",
                                          padding: "0.4rem 0.6rem",
                                          fontSize: "0.8rem",
                                          backgroundColor: "#f9fafb",
                                          border: "none",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          textAlign: "left",
                                        }}
                                      >
                                        <span>{food.name}</span>
                                        <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                                          {food.nutrition.calories} kcal
                                        </span>
                                      </button>
                                    ))}
                                    {foodItems.length === 0 && (
                                      <p style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280", fontSize: "0.8rem" }}>
                                        No foods found
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setShowFoodPicker({ mealIndex, dayIndex })}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                    padding: "0.4rem 0.8rem",
                                    fontSize: "0.8rem",
                                    backgroundColor: "#f0fdf4",
                                    border: "1px solid #dcfce7",
                                    borderRadius: "4px",
                                    color: "#16a34a",
                                    cursor: "pointer",
                                  }}
                                >
                                  <Plus style={{ width: 14, height: 14 }} />
                                  Add Food
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Add Meal to Day Button */}
                        <button
                          type="button"
                          onClick={() => addMealToDay(dayIndex)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.5rem 0.85rem",
                            fontSize: "0.8rem",
                            backgroundColor: "#f0fdf4",
                            border: "1px dashed #16a34a",
                            borderRadius: "6px",
                            color: "#16a34a",
                            cursor: "pointer",
                            justifyContent: "center",
                          }}
                        >
                          <Plus style={{ width: 14, height: 14 }} />
                          Add Meal to {day.dayName}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Additional Instructions */}
      <div className="coach-plan-form__section">
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
          Additional Instructions
        </h2>

        <div className="auth-form__field">
          <label className="auth-form__label">Allergy Notes</label>
          <input
            {...register("allergyNotes")}
            className="auth-form__input"
            placeholder="Any allergy-related notes..."
          />
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label">Custom Instructions</label>
          <textarea
            {...register("customInstructions")}
            className="auth-form__input"
            rows={3}
            placeholder="Any additional guidelines for the client..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="coach-plan-form__actions">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn--outline"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            setValue("isDraft", true);
            handleSubmit(onSubmit)();
          }}
          className="btn btn--outline"
          disabled={isSubmitting}
        >
          Save as Draft
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
        </button>
      </div>
    </form>
  );
}
