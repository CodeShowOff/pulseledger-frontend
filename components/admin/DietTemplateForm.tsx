"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useCreateDietTemplate,
  useUpdateDietTemplate,
  useDietTemplateMetadata,
  useFoodItems,
  type DietTemplate,
  type DietDay,
  type Meal,
  type FoodItem,
} from "@/lib/queries/diet";

const MEAL_TYPES = [
  "breakfast",
  "mid_morning_snack",
  "lunch",
  "afternoon_snack",
  "evening_snack",
  "dinner",
  "pre_workout",
  "post_workout",
  "bedtime_snack",
] as const;

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const mealFoodSchema = z.object({
  foodItemId: z.string().min(1),
  quantity: z.coerce.number().min(0.1),
  unit: z.string().max(50).optional(),
  notes: z.string().max(200).optional(),
});

const mealSchema = z.object({
  mealType: z.string().min(1),
  name: z.string().max(100).optional(),
  time: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  foods: z.array(mealFoodSchema).optional(),
});

const dietDaySchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  dayName: z.string().max(40).optional(),
  notes: z.string().max(500).optional(),
  meals: z.array(mealSchema).optional(),
});

const formSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(2000).optional(),
  goal: z.string().min(1),
  dietaryType: z.string().optional(),
  difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
  mealsPerDay: z.coerce.number().min(1).max(8).optional(),
  daysPerWeek: z.coerce.number().min(1).max(7).optional(),
  dailyTargets: z
    .object({
      calories: z.coerce.number().min(0).max(10000).optional(),
      protein: z.coerce.number().min(0).max(500).optional(),
      carbohydrates: z.coerce.number().min(0).max(1000).optional(),
      fat: z.coerce.number().min(0).max(500).optional(),
      fiber: z.coerce.number().min(0).max(100).optional(),
      water: z.coerce.number().min(0).max(10).optional(),
    })
    .optional(),
  foodsToAvoid: z.string().optional(),
  guidelines: z.string().optional(),
  tags: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sampleMeals: z.array(mealSchema).optional(),
  weeklySchedule: z.array(dietDaySchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type MealInput = z.infer<typeof mealSchema>;
type MealFoodInput = z.infer<typeof mealFoodSchema>;
type DietDayInput = z.infer<typeof dietDaySchema>;

type Props = {
  template?: DietTemplate;
};

type MealPickerOpen =
  | { mode: "single"; mealIndex: number }
  | { mode: "weekly"; dayIndex: number; mealIndex: number }
  | null;

function mealTypeLabel(mealType: string) {
  return mealType.replaceAll("_", " ");
}

export default function DietTemplateForm({ template }: Props) {
  const router = useRouter();
  const createMutation = useCreateDietTemplate();
  const updateMutation = useUpdateDietTemplate();

  const { data: meta } = useDietTemplateMetadata();
  const goals = meta?.goals?.length ? meta.goals : [
    "weight_loss",
    "muscle_gain",
    "maintenance",
    "balanced",
    "cutting",
    "bulking",
  ];
  const dietaryTypes = meta?.dietaryTypes?.length ? meta.dietaryTypes : [
    "any",
    "vegetarian",
    "vegan",
    "pescatarian",
    "keto",
    "paleo",
    "halal",
    "kosher",
  ];

  const [foodSearch, setFoodSearch] = useState("");
  const [mealPickerOpen, setMealPickerOpen] = useState<MealPickerOpen>(null);

  const { data: foodItemsData, isLoading: foodLoading } = useFoodItems({
    limit: 50,
    search: foodSearch || undefined,
  });

  const foodItems: FoodItem[] = foodItemsData?.data ?? [];
  const foodItemNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of foodItems) map.set(item._id, item.name);
    return map;
  }, [foodItems]);

  const initialMeals: MealInput[] = useMemo(() => {
    const src = template?.sampleMeals ?? [];
    return src.map((m) => ({
      mealType: m.mealType,
      name: m.name,
      time: m.time,
      notes: m.notes,
      foods:
        m.foods?.map((f) => ({
          foodItemId: String(f.foodItemId || ""),
          quantity: f.quantity,
          unit: f.unit,
          notes: f.notes,
        })) ?? [],
    }));
  }, [template]);

  const initialWeeklySchedule = useMemo(() => {
    const src: DietDay[] = template?.weeklySchedule ?? [];

    const toDayOfWeek = (d: DietDay) => {
      if (typeof d.dayOfWeek === "number") return d.dayOfWeek;
      if (typeof d.dayNumber === "number") {
        if (d.dayNumber === 7) return 0;
        return Math.max(0, Math.min(6, d.dayNumber - 1));
      }
      return undefined;
    };

    const byDow = new Map<number, DietDay>();
    for (const day of src) {
      const dow = toDayOfWeek(day);
      if (typeof dow === "number") byDow.set(dow, day);
    }

    return DAYS_OF_WEEK.map((d) => {
      const existing = byDow.get(d.value);
      const meals: MealInput[] = (existing?.meals ?? []).map((m: Meal) => ({
        mealType: m.mealType,
        name: m.name,
        time: m.time,
        notes: m.notes,
        foods:
          m.foods?.map((f) => ({
            foodItemId: String(f.foodItemId || ""),
            quantity: f.quantity,
            unit: f.unit,
            notes: f.notes,
          })) ?? [],
      }));

      return {
        dayOfWeek: d.value,
        dayName: existing?.dayName || d.label,
        notes: existing?.notes,
        meals,
      };
    });
  }, [template]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      goal: template?.goal || goals[0],
      dietaryType: template?.dietaryType || "any",
      difficulty: template?.difficulty || "moderate",
      mealsPerDay: template?.mealsPerDay ?? 4,
      daysPerWeek: template?.daysPerWeek ?? 7,
      dailyTargets: template?.dailyTargets || {},
      foodsToAvoid: (template?.foodsToAvoid || []).join(", "),
      guidelines: (template?.guidelines || []).join("\n"),
      tags: (template?.tags || []).join(", "),
      isActive: template?.isActive ?? true,
      isFeatured: template?.isFeatured ?? false,
      sampleMeals: initialMeals,
      weeklySchedule: initialWeeklySchedule,
    },
  });

  const setPathValue = (path: string, value: unknown) => {
    setValue(path as never, value as never, { shouldDirty: true });
  };

  const sampleMeals = watch("sampleMeals") || [];
  const weeklySchedule = watch("weeklySchedule") || [];

  const addMeal = () => {
    const next = [...sampleMeals, { mealType: "breakfast", name: "", time: "", notes: "", foods: [] }];
    setValue("sampleMeals", next, { shouldDirty: true });
  };

  const removeMeal = (mealIndex: number) => {
    const next = [...sampleMeals];
    next.splice(mealIndex, 1);
    setValue("sampleMeals", next, { shouldDirty: true });
  };

  const addFoodToMeal = (mealIndex: number, food: FoodItem) => {
    const meal = sampleMeals[mealIndex];
    const foods = meal?.foods || [];
    const nextFoods = [
      ...foods,
      {
        foodItemId: food._id,
        quantity: 100,
        unit: food.servingUnit || "g",
        notes: "",
      },
    ];

    setPathValue(`sampleMeals.${mealIndex}.foods`, nextFoods);
    setMealPickerOpen(null);
    setFoodSearch("");
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const meal = sampleMeals[mealIndex];
    const current = [...(meal?.foods || [])];
    current.splice(foodIndex, 1);
    setPathValue(`sampleMeals.${mealIndex}.foods`, current);
  };

  const addWeeklyMeal = (dayIndex: number) => {
    const day = weeklySchedule[dayIndex] || {
      dayOfWeek: DAYS_OF_WEEK[dayIndex]?.value ?? 0,
      dayName: DAYS_OF_WEEK[dayIndex]?.label ?? "Day",
      notes: "",
      meals: [],
    };
    const meals = day?.meals || [];
    const nextDay = {
      ...day,
      dayOfWeek: day.dayOfWeek ?? (DAYS_OF_WEEK[dayIndex]?.value ?? 0),
      dayName: day.dayName ?? (DAYS_OF_WEEK[dayIndex]?.label ?? "Day"),
      meals: [...meals, { mealType: "breakfast", name: "", time: "", notes: "", foods: [] }],
    };
    const next = [...weeklySchedule];
    next[dayIndex] = nextDay;
    setValue("weeklySchedule", next, { shouldDirty: true });
  };

  const removeWeeklyMeal = (dayIndex: number, mealIndex: number) => {
    const day = weeklySchedule[dayIndex];
    const meals = [...(day?.meals || [])];
    meals.splice(mealIndex, 1);
    setPathValue(`weeklySchedule.${dayIndex}.meals`, meals);
  };

  const addFoodToWeeklyMeal = (dayIndex: number, mealIndex: number, food: FoodItem) => {
    const day = weeklySchedule[dayIndex];
    const meal = day?.meals?.[mealIndex];
    const foods = meal?.foods || [];
    const nextFoods = [
      ...foods,
      {
        foodItemId: food._id,
        quantity: 100,
        unit: food.servingUnit || "g",
        notes: "",
      },
    ];
    setPathValue(`weeklySchedule.${dayIndex}.meals.${mealIndex}.foods`, nextFoods);
    setMealPickerOpen(null);
    setFoodSearch("");
  };

  const removeFoodFromWeeklyMeal = (dayIndex: number, mealIndex: number, foodIndex: number) => {
    const day = weeklySchedule[dayIndex];
    const meal = day?.meals?.[mealIndex];
    const current = [...(meal?.foods || [])];
    current.splice(foodIndex, 1);
    setPathValue(`weeklySchedule.${dayIndex}.meals.${mealIndex}.foods`, current);
  };

  const onSubmit = async (values: FormValues) => {
    const payload: Partial<DietTemplate> = {
      name: values.name,
      description: values.description || undefined,
      goal: values.goal,
      dietaryType: values.dietaryType || undefined,
      difficulty: values.difficulty,
      mealsPerDay: values.mealsPerDay,
      daysPerWeek: values.daysPerWeek,
      dailyTargets: values.dailyTargets,
      foodsToAvoid: values.foodsToAvoid
        ? values.foodsToAvoid
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      guidelines: values.guidelines
        ? values.guidelines
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      tags: values.tags
        ? values.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      isActive: values.isActive ?? true,
      isFeatured: values.isFeatured ?? false,
    };

    // Always use weekly schedule
    payload.sampleMeals = [];
    payload.daysPerWeek = 7;
    payload.weeklySchedule =
      values.weeklySchedule?.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        dayName: d.dayName || DAYS_OF_WEEK.find((x) => x.value === d.dayOfWeek)?.label,
        notes: d.notes || undefined,
        meals:
          d.meals?.map((m) => ({
            mealType: m.mealType,
            name: m.name || undefined,
            time: m.time || undefined,
            notes: m.notes || undefined,
            foods:
              m.foods?.map((f) => ({
                foodItemId: f.foodItemId,
                quantity: f.quantity,
                unit: f.unit || "g",
                notes: f.notes || undefined,
              })) ?? [],
          })) ?? [],
      })) ?? [];

    try {
      if (template?._id) {
        await updateMutation.mutateAsync({ id: template._id, data: payload });
        toast.success("Diet template updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Diet template created");
      }
      router.push("/admin/diet-templates");
    } catch {
      toast.error("Failed to save template");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-card" style={{ padding: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Name</label>
          <input {...register("name")} className="admin-input" placeholder="e.g. Fat Loss Balanced" />
          {errors.name && (
            <p style={{ color: "var(--admin-color-danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Goal</label>
          <select {...register("goal")} className="admin-input">
            {goals.map((g) => (
              <option key={g} value={g}>
                {mealTypeLabel(g)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Dietary type</label>
          <select {...register("dietaryType")} className="admin-input">
            {dietaryTypes.map((d) => (
              <option key={d} value={d}>
                {mealTypeLabel(d)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Difficulty</label>
          <select {...register("difficulty")} className="admin-input">
            <option value="easy">easy</option>
            <option value="moderate">moderate</option>
            <option value="challenging">challenging</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Meals / day</label>
          <input {...register("mealsPerDay")} type="number" className="admin-input" />
        </div>

        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          <label style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" {...register("isActive")} />
            Active
          </label>
          <label style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" {...register("isFeatured")} />
            Featured
          </label>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Description</label>
          <textarea {...register("description")} className="admin-input" rows={3} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Tags (comma-separated)</label>
          <input {...register("tags")} className="admin-input" placeholder="e.g. high protein, indian" />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Foods to avoid (comma-separated)</label>
          <input {...register("foodsToAvoid")} className="admin-input" placeholder="e.g. sugar, fried food" />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Guidelines (one per line)</label>
          <textarea {...register("guidelines")} className="admin-input" rows={4} placeholder="Drink water\nHit protein target" />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem" }}>Daily Targets</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Calories</label>
              <input {...register("dailyTargets.calories")} className="admin-input" type="number" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Protein</label>
              <input {...register("dailyTargets.protein")} className="admin-input" type="number" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Carbs</label>
              <input {...register("dailyTargets.carbohydrates")} className="admin-input" type="number" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Fat</label>
              <input {...register("dailyTargets.fat")} className="admin-input" type="number" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Fiber</label>
              <input {...register("dailyTargets.fiber")} className="admin-input" type="number" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Water (liters)</label>
              <input {...register("dailyTargets.water")} className="admin-input" type="number" step="0.1" />
            </div>
          </div>
        </div>
      </div>

      <hr style={{ margin: "1.25rem 0", borderColor: "var(--admin-color-border)" }} />

      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Weekly Meal Schedule</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--admin-color-muted)", marginTop: "0.5rem" }}>
          Create different meal plans for each day of the week
        </p>
      </div>

          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Weekly Schedule</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
              {DAYS_OF_WEEK.map((d, dayIndex) => {
                const day = (weeklySchedule[dayIndex] as DietDayInput | undefined) || {
                  dayOfWeek: d.value,
                  dayName: d.label,
                  notes: "",
                  meals: [],
                };
                const dayMeals = day?.meals || [];

                return (
                  <div
                    key={d.value}
                    style={{ border: "1px solid var(--admin-color-border)", borderRadius: 10, padding: "0.75rem" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                      <div style={{ fontWeight: 700 }}>{d.label}</div>
                      <button type="button" className="btn btn--outline" onClick={() => addWeeklyMeal(dayIndex)}>
                        Add meal
                      </button>
                    </div>

                    <div style={{ marginTop: "0.75rem" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Day notes (optional)</label>
                      <input
                        className="admin-input"
                        value={day?.notes || ""}
                        onChange={(e) =>
                          setPathValue(`weeklySchedule.${dayIndex}.notes`, e.target.value)
                        }
                        placeholder="e.g. Keep carbs lower today"
                      />
                    </div>

                    <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {dayMeals.length === 0 ? (
                        <div style={{ color: "var(--admin-color-muted)", fontSize: "0.85rem" }}>
                          No meals added for {d.label}.
                        </div>
                      ) : (
                        dayMeals.map((meal: MealInput, mealIndex: number) => (
                          <div
                            key={`${dayIndex}-${meal.mealType}-${mealIndex}`}
                            style={{ border: "1px solid var(--admin-color-border)", borderRadius: 10, padding: "0.75rem" }}
                          >
                            <div
                              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}
                            >
                              <div
                                style={{ display: "grid", gridTemplateColumns: "220px 1fr 140px", gap: "0.75rem", flex: 1 }}
                              >
                                <div>
                                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                                    Meal type
                                  </label>
                                  <select
                                    className="admin-input"
                                    value={meal.mealType}
                                    onChange={(e) =>
                                      setPathValue(
                                        `weeklySchedule.${dayIndex}.meals.${mealIndex}.mealType`,
                                        e.target.value
                                      )
                                    }
                                  >
                                    {MEAL_TYPES.map((t) => (
                                      <option key={t} value={t}>
                                        {mealTypeLabel(t)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                                    Name (optional)
                                  </label>
                                  <input
                                    className="admin-input"
                                    value={meal.name || ""}
                                    onChange={(e) =>
                                      setPathValue(
                                        `weeklySchedule.${dayIndex}.meals.${mealIndex}.name`,
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g. High-protein breakfast"
                                  />
                                </div>
                                <div>
                                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                                    Time
                                  </label>
                                  <input
                                    className="admin-input"
                                    value={meal.time || ""}
                                    onChange={(e) =>
                                      setPathValue(
                                        `weeklySchedule.${dayIndex}.meals.${mealIndex}.time`,
                                        e.target.value
                                      )
                                    }
                                    placeholder="8:00 AM"
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                className="btn btn--outline"
                                onClick={() => removeWeeklyMeal(dayIndex, mealIndex)}
                              >
                                Remove
                              </button>
                            </div>

                            <div style={{ marginTop: "0.75rem" }}>
                              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                                Notes
                              </label>
                              <input
                                className="admin-input"
                                value={meal.notes || ""}
                                onChange={(e) =>
                                  setPathValue(
                                    `weeklySchedule.${dayIndex}.meals.${mealIndex}.notes`,
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div
                              style={{
                                marginTop: "0.75rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Foods</div>
                              <button
                                type="button"
                                className="btn btn--outline"
                                onClick={() =>
                                  setMealPickerOpen((prev) =>
                                    prev?.mode === "weekly" &&
                                    prev.dayIndex === dayIndex &&
                                    prev.mealIndex === mealIndex
                                      ? null
                                      : { mode: "weekly", dayIndex, mealIndex }
                                  )
                                }
                              >
                                Add food
                              </button>
                            </div>

                            {mealPickerOpen?.mode === "weekly" &&
                            mealPickerOpen.dayIndex === dayIndex &&
                            mealPickerOpen.mealIndex === mealIndex ? (
                              <div
                                style={{
                                  marginTop: "0.75rem",
                                  border: "1px solid var(--admin-color-border)",
                                  borderRadius: 10,
                                  padding: "0.75rem",
                                }}
                              >
                                <input
                                  className="admin-input"
                                  placeholder="Search food items..."
                                  value={foodSearch}
                                  onChange={(e) => setFoodSearch(e.target.value)}
                                />
                                <div
                                  style={{
                                    marginTop: "0.75rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                    maxHeight: 220,
                                    overflow: "auto",
                                  }}
                                >
                                  {foodLoading ? (
                                    <div style={{ color: "var(--admin-color-muted)" }}>
                                      Loading food items...
                                    </div>
                                  ) : foodItems.length === 0 ? (
                                    <div style={{ color: "var(--admin-color-muted)" }}>No food items found</div>
                                  ) : (
                                    foodItems.map((fi) => (
                                      <button
                                        key={fi._id}
                                        type="button"
                                        className="btn btn--outline"
                                        style={{ justifyContent: "flex-start" }}
                                        onClick={() => addFoodToWeeklyMeal(dayIndex, mealIndex, fi)}
                                      >
                                        {fi.name}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            ) : null}

                            <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              {(meal.foods || []).length === 0 ? (
                                <div style={{ color: "var(--admin-color-muted)", fontSize: "0.85rem" }}>
                                  No foods added.
                                </div>
                              ) : (
                                (meal.foods || []).map((food: MealFoodInput, foodIndex: number) => (
                                  <div
                                    key={`${food.foodItemId}-${foodIndex}`}
                                    style={{ border: "1px solid var(--admin-color-border)", borderRadius: 10, padding: "0.75rem" }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "1rem",
                                      }}
                                    >
                                      <div style={{ fontWeight: 600 }}>
                                        {foodItemNameById.get(food.foodItemId) || food.foodItemId}
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn--outline"
                                        onClick={() => removeFoodFromWeeklyMeal(dayIndex, mealIndex, foodIndex)}
                                      >
                                        Remove
                                      </button>
                                    </div>

                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "160px 160px 1fr",
                                        gap: "0.5rem",
                                        marginTop: "0.75rem",
                                      }}
                                    >
                                      <div>
                                        <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                                          Quantity
                                        </label>
                                        <input
                                          className="admin-input"
                                          type="number"
                                          value={food.quantity ?? ""}
                                          onChange={(e) =>
                                            setPathValue(
                                              `weeklySchedule.${dayIndex}.meals.${mealIndex}.foods.${foodIndex}.quantity`,
                                              Number(e.target.value)
                                            )
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                                          Unit
                                        </label>
                                        <input
                                          className="admin-input"
                                          value={food.unit || ""}
                                          onChange={(e) =>
                                            setPathValue(
                                              `weeklySchedule.${dayIndex}.meals.${mealIndex}.foods.${foodIndex}.unit`,
                                              e.target.value
                                            )
                                          }
                                          placeholder="g"
                                        />
                                      </div>
                                      <div>
                                        <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                                          Notes
                                        </label>
                                        <input
                                          className="admin-input"
                                          value={food.notes || ""}
                                          onChange={(e) =>
                                            setPathValue(
                                              `weeklySchedule.${dayIndex}.meals.${mealIndex}.foods.${foodIndex}.notes`,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>

      {/* Sample Meals Single Day Template - Removed for weekly-only templates
      {templateType === 'single' && (
        <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Sample Meals</h3>
        <button type="button" className="btn btn--outline" onClick={addMeal}>
          Add meal
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
        {sampleMeals.length === 0 ? (
          <div style={{ color: "var(--admin-color-muted)", fontSize: "0.85rem" }}>No sample meals added.</div>
        ) : (
          sampleMeals.map((meal, mealIndex) => (
            <div
              key={`${meal.mealType}-${mealIndex}`}
              style={{ border: "1px solid var(--admin-color-border)", borderRadius: 10, padding: "0.75rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 140px", gap: "0.75rem", flex: 1 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Meal type</label>
                    <select
                      className="admin-input"
                      value={meal.mealType}
                      onChange={(e) => setPathValue(`sampleMeals.${mealIndex}.mealType`, e.target.value)}
                    >
                      {MEAL_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {mealTypeLabel(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Name (optional)</label>
                    <input
                      className="admin-input"
                      value={meal.name || ""}
                      onChange={(e) => setPathValue(`sampleMeals.${mealIndex}.name`, e.target.value)}
                      placeholder="e.g. High-protein breakfast"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Time</label>
                    <input
                      className="admin-input"
                      value={meal.time || ""}
                      onChange={(e) => setPathValue(`sampleMeals.${mealIndex}.time`, e.target.value)}
                      placeholder="8:00 AM"
                    />
                  </div>
                </div>

                <button type="button" className="btn btn--outline" onClick={() => removeMeal(mealIndex)}>
                  Remove
                </button>
              </div>

              <div style={{ marginTop: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Notes</label>
                <input
                  className="admin-input"
                  value={meal.notes || ""}
                  onChange={(e) => setPathValue(`sampleMeals.${mealIndex}.notes`, e.target.value)}
                />
              </div>

              <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Foods</div>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() =>
                    setMealPickerOpen((prev) =>
                      prev?.mode === "single" && prev.mealIndex === mealIndex
                        ? null
                        : { mode: "single", mealIndex }
                    )
                  }
                >
                  Add food
                </button>
              </div>

              {mealPickerOpen?.mode === "single" && mealPickerOpen.mealIndex === mealIndex ? (
                <div style={{ marginTop: "0.75rem", border: "1px solid var(--admin-color-border)", borderRadius: 10, padding: "0.75rem" }}>
                  <input
                    className="admin-input"
                    placeholder="Search food items..."
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                  />
                  <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 220, overflow: "auto" }}>
                    {foodLoading ? (
                      <div style={{ color: "var(--admin-color-muted)" }}>Loading food items...</div>
                    ) : foodItems.length === 0 ? (
                      <div style={{ color: "var(--admin-color-muted)" }}>No food items found</div>
                    ) : (
                      foodItems.map((fi) => (
                        <button
                          key={fi._id}
                          type="button"
                          className="btn btn--outline"
                          style={{ justifyContent: "flex-start" }}
                          onClick={() => addFoodToMeal(mealIndex, fi)}
                        >
                          {fi.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(meal.foods || []).length === 0 ? (
                  <div style={{ color: "var(--admin-color-muted)", fontSize: "0.85rem" }}>No foods added.</div>
                ) : (
                  (meal.foods || []).map((food, foodIndex) => (
                    <div
                      key={`${food.foodItemId}-${foodIndex}`}
                      style={{ border: "1px solid var(--admin-color-border)", borderRadius: 10, padding: "0.75rem" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                        <div style={{ fontWeight: 600 }}>
                          {foodItemNameById.get(food.foodItemId) || food.foodItemId}
                        </div>
                        <button
                          type="button"
                          className="btn btn--outline"
                          onClick={() => removeFoodFromMeal(mealIndex, foodIndex)}
                        >
                          Remove
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "160px 160px 1fr", gap: "0.5rem", marginTop: "0.75rem" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Quantity</label>
                          <input
                            className="admin-input"
                            type="number"
                            value={food.quantity ?? ""}
                            onChange={(e) =>
                              setPathValue(
                                `sampleMeals.${mealIndex}.foods.${foodIndex}.quantity`,
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Unit</label>
                          <input
                            className="admin-input"
                            value={food.unit || ""}
                            onChange={(e) =>
                              setPathValue(
                                `sampleMeals.${mealIndex}.foods.${foodIndex}.unit`,
                                e.target.value
                              )
                            }
                            placeholder="g"
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Notes</label>
                          <input
                            className="admin-input"
                            value={food.notes || ""}
                            onChange={(e) =>
                              setPathValue(
                                `sampleMeals.${mealIndex}.foods.${foodIndex}.notes`,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
      </>
      Single Day Template End */}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
        <button type="button" className="btn btn--outline" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {template?._id ? "Save Changes" : "Create Template"}
        </button>
      </div>
    </form>
  );
}
