"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Coffee,
  Dumbbell,
  Moon,
  Plus,
  Search,
  Sun,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  FoodItem,
  LoggedFood,
  useAddMealToLog,
  useClientDietLogByDate,
  useClientDietPlans,
  useCreateDietLog,
} from "@/lib/queries/diet";
import { cn } from "@/lib/utils";

type MealTypeOption = {
  value: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  softBg: string;
  softBorder: string;
};

type FoodNutritionReference = {
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const MEAL_TYPES: MealTypeOption[] = [
  {
    value: "breakfast",
    label: "Breakfast",
    icon: Coffee,
    accent: "text-amber-700",
    softBg: "bg-amber-50",
    softBorder: "border-amber-200",
  },
  {
    value: "mid_morning_snack",
    label: "Morning Snack",
    icon: Sun,
    accent: "text-lime-700",
    softBg: "bg-lime-50",
    softBorder: "border-lime-200",
  },
  {
    value: "lunch",
    label: "Lunch",
    icon: Sun,
    accent: "text-emerald-700",
    softBg: "bg-emerald-50",
    softBorder: "border-emerald-200",
  },
  {
    value: "afternoon_snack",
    label: "Afternoon Snack",
    icon: Sun,
    accent: "text-cyan-700",
    softBg: "bg-cyan-50",
    softBorder: "border-cyan-200",
  },
  {
    value: "dinner",
    label: "Dinner",
    icon: Moon,
    accent: "text-violet-700",
    softBg: "bg-violet-50",
    softBorder: "border-violet-200",
  },
  {
    value: "evening_snack",
    label: "Evening Snack",
    icon: Moon,
    accent: "text-fuchsia-700",
    softBg: "bg-fuchsia-50",
    softBorder: "border-fuchsia-200",
  },
  {
    value: "pre_workout",
    label: "Pre-workout",
    icon: Dumbbell,
    accent: "text-pink-700",
    softBg: "bg-pink-50",
    softBorder: "border-pink-200",
  },
  {
    value: "post_workout",
    label: "Post-workout",
    icon: Dumbbell,
    accent: "text-rose-700",
    softBg: "bg-rose-50",
    softBorder: "border-rose-200",
  },
];

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function DietLogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMeal = searchParams.get("meal") || "breakfast";

  const [selectedMealType, setSelectedMealType] = useState(initialMeal);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<LoggedFood[]>([]);
  const [foodNutritionReferences, setFoodNutritionReferences] = useState<
    Record<string, FoodNutritionReference>
  >({});
  const [showMealSelector, setShowMealSelector] = useState(false);

  const today = formatLocalDate(new Date());

  const { data: plans = [] } = useClientDietPlans();
  const { data: todayLog } = useClientDietLogByDate(today);
  const addMealMutation = useAddMealToLog();
  const createLogMutation = useCreateDietLog();

  const activePlan = plans.find((plan) => plan.isActive) || plans[0];

  const currentMeal = useMemo(() => {
    return MEAL_TYPES.find((meal) => meal.value === selectedMealType) || MEAL_TYPES[0];
  }, [selectedMealType]);

  useEffect(() => {
    const searchFoods = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await api.get(`/food-items?search=${encodeURIComponent(searchQuery)}&limit=20`);
        setSearchResults(res.data.data || []);
      } catch {
        toast.error("Failed to search foods");
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchFoods, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addFood = (food: FoodItem) => {
    const servingSize = food.servingSize || 100;
    const nutritionReference: FoodNutritionReference = {
      servingSize,
      calories: food.nutrition?.calories || 0,
      protein: food.nutrition?.protein || 0,
      carbs: food.nutrition?.carbohydrates || 0,
      fat: food.nutrition?.fat || 0,
    };

    const nextFood: LoggedFood = {
      foodItemId: food._id,
      foodName: food.name,
      quantity: servingSize,
      unit: food.servingUnit || "g",
      calories: nutritionReference.calories,
      protein: nutritionReference.protein,
      carbs: nutritionReference.carbs,
      fat: nutritionReference.fat,
    };

    setSelectedFoods((previous) => [...previous, nextFood]);
    setFoodNutritionReferences((previous) => ({
      ...previous,
      [food._id]: nutritionReference,
    }));
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFood = (index: number) => {
    setSelectedFoods((previous) => previous.filter((_, i) => i !== index));
  };

  const updateFoodQuantity = (index: number, quantity: number) => {
    setSelectedFoods((previous) =>
      previous.map((food, itemIndex) => {
        if (itemIndex !== index) return food;

        const sanitizedQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;

        const reference = food.foodItemId
          ? foodNutritionReferences[food.foodItemId]
          : undefined;

        if (reference) {
          const referenceServingSize = reference.servingSize > 0 ? reference.servingSize : 100;
          const ratio = sanitizedQuantity / referenceServingSize;

          return {
            ...food,
            quantity: sanitizedQuantity,
            calories: Math.max(0, Math.round(reference.calories * ratio)),
            protein: Math.max(0, Math.round(reference.protein * ratio * 10) / 10),
            carbs: Math.max(0, Math.round(reference.carbs * ratio * 10) / 10),
            fat: Math.max(0, Math.round(reference.fat * ratio * 10) / 10),
          };
        }

        const previousQuantity = food.quantity || 1;
        const ratio = previousQuantity > 0 ? sanitizedQuantity / previousQuantity : 1;

        return {
          ...food,
          quantity: sanitizedQuantity,
          calories: Math.max(0, Math.round((food.calories || 0) * ratio)),
          protein: Math.max(0, Math.round((food.protein || 0) * ratio * 10) / 10),
          carbs: Math.max(0, Math.round((food.carbs || 0) * ratio * 10) / 10),
          fat: Math.max(0, Math.round((food.fat || 0) * ratio * 10) / 10),
        };
      })
    );
  };

  const totalNutrition = selectedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const isSaving = addMealMutation.isPending || createLogMutation.isPending;
  const CurrentMealIcon = currentMeal.icon;

  const saveMeal = async () => {
    if (!selectedFoods.length) {
      toast.error("Please add at least one food item");
      return;
    }

    if (!activePlan) {
      toast.error("No active diet plan found");
      return;
    }

    const mealPayload = {
      mealType: selectedMealType,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      foods: selectedFoods,
    };

    try {
      const existingLogId = todayLog?._id;

      if (existingLogId) {
        await addMealMutation.mutateAsync({ logId: existingLogId, meal: mealPayload });
      } else {
        await createLogMutation.mutateAsync({
          dietPlanId: activePlan._id,
          date: today,
          mealsLogged: [mealPayload],
        });
      }

      toast.success(`${currentMeal.label} logged successfully`);
      router.push("/client/diet");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to log meal");
    }
  };

  return (
    <div className="client-page__sections space-y-4 pb-24">
      <Link
        href="/client/diet"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to nutrition
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => setShowMealSelector((previous) => !previous)}
          className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-left"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CurrentMealIcon className={cn("h-4 w-4", currentMeal.accent)} />
            {currentMeal.label}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 text-slate-500 transition-transform", showMealSelector && "rotate-180")}
          />
        </button>

        {showMealSelector ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {MEAL_TYPES.map((meal) => {
              const MealIcon = meal.icon;
              const selected = meal.value === selectedMealType;

              return (
                <button
                  key={meal.value}
                  type="button"
                  onClick={() => {
                    setSelectedMealType(meal.value);
                    setShowMealSelector(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition",
                    selected
                      ? `${meal.softBorder} ${meal.softBg} ${meal.accent}`
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <MealIcon className="h-4 w-4" />
                  {meal.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Add foods</h3>
        <p className="mt-1 text-xs text-slate-500">Search from your food database and tap to add.</p>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search food items..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {isSearching ? (
          <p className="mt-3 text-xs text-slate-500">Searching...</p>
        ) : null}

        {searchResults.length ? (
          <div className="mt-3 max-h-[260px] space-y-2 overflow-y-auto">
            {searchResults.map((food) => (
              <button
                key={food._id}
                type="button"
                onClick={() => addFood(food)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{food.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {food.servingSize} {food.servingUnit} · {food.nutrition?.calories || 0} kcal
                  </p>
                </div>
                <Plus className="h-4 w-4 text-emerald-600" />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={saveMeal}
          disabled={!selectedFoods.length || isSaving}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold !text-white shadow-lg transition",
            !selectedFoods.length || isSaving
              ? "cursor-not-allowed bg-slate-400"
              : "bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110"
          )}
        >
          {isSaving ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {isSaving ? "Saving..." : `Save ${currentMeal.label}`}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Selected foods</h3>
          <span className="text-xs text-slate-500">{selectedFoods.length} item(s)</span>
        </div>

        {selectedFoods.length ? (
          <div className="space-y-2.5">
            {selectedFoods.map((food, index) => (
              <div key={`${food.foodName}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{food.foodName}</p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      {food.calories || 0} kcal · P {food.protein || 0}g · C {food.carbs || 0}g · F {food.fat || 0}g
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFood(index)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                    aria-label={`Remove ${food.foodName}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={food.quantity}
                    onChange={(event) => updateFoodQuantity(index, Number(event.target.value))}
                    className="h-9 w-24 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                  <span className="text-xs font-medium text-slate-500">{food.unit || "g"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-6 text-center">
            <Utensils className="mx-auto h-6 w-6 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-700">No foods selected yet</p>
            <p className="mt-1 text-xs text-slate-500">Search and add foods to build this meal.</p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-2 py-2 text-center">
            <p className="font-semibold text-orange-700">{totalNutrition.calories}</p>
            <p className="text-[10px] text-orange-600">kcal</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-2 py-2 text-center">
            <p className="font-semibold text-rose-700">{totalNutrition.protein.toFixed(1)}g</p>
            <p className="text-[10px] text-rose-600">Protein</p>
          </div>
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-2 py-2 text-center">
            <p className="font-semibold text-cyan-700">{totalNutrition.carbs.toFixed(1)}g</p>
            <p className="text-[10px] text-cyan-600">Carbs</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-center">
            <p className="font-semibold text-amber-700">{totalNutrition.fat.toFixed(1)}g</p>
            <p className="text-[10px] text-amber-600">Fat</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default function DietLogPage() {
  return (
    <Suspense
      fallback={
        <div className="client-page__sections">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading meal logger...
          </div>
        </div>
      }
    >
      <DietLogContent />
    </Suspense>
  );
}
