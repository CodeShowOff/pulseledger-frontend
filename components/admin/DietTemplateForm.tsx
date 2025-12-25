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

const formSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(2000).optional(),
  goal: z.string().min(1),
  dietaryType: z.string().optional(),
  difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
  mealsPerDay: z.coerce.number().min(1).max(8).optional(),
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
  sampleMeals: z
    .array(
      z.object({
        mealType: z.string().min(1),
        name: z.string().max(100).optional(),
        time: z.string().max(20).optional(),
        notes: z.string().max(500).optional(),
        foods: z
          .array(
            z.object({
              foodItemId: z.string().min(1),
              quantity: z.coerce.number().min(0.1),
              unit: z.string().max(50).optional(),
              notes: z.string().max(200).optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  template?: DietTemplate;
};

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
  const [mealPickerOpen, setMealPickerOpen] = useState<number | null>(null);

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

  const initialMeals: Meal[] = useMemo(() => {
    const src = template?.sampleMeals ?? [];
    return src.map((m) => ({
      mealType: m.mealType,
      name: m.name,
      time: m.time,
      notes: m.notes,
      foods:
        m.foods?.map((f) => ({
          foodItemId: (f.foodItemId || "") as string,
          quantity: f.quantity,
          unit: f.unit,
          notes: f.notes,
        })) ?? [],
    }));
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
      dailyTargets: template?.dailyTargets || {},
      foodsToAvoid: (template?.foodsToAvoid || []).join(", "),
      guidelines: (template?.guidelines || []).join("\n"),
      tags: (template?.tags || []).join(", "),
      isActive: template?.isActive ?? true,
      isFeatured: template?.isFeatured ?? false,
      sampleMeals: (initialMeals as any) || [],
    },
  });

  const sampleMeals = watch("sampleMeals") || [];

  const addMeal = () => {
    const next = [...sampleMeals, { mealType: "breakfast", name: "", time: "", notes: "", foods: [] }];
    setValue("sampleMeals", next as any, { shouldDirty: true });
  };

  const removeMeal = (mealIndex: number) => {
    const next = [...sampleMeals];
    next.splice(mealIndex, 1);
    setValue("sampleMeals", next as any, { shouldDirty: true });
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

    setValue(`sampleMeals.${mealIndex}.foods` as any, nextFoods as any, { shouldDirty: true });
    setMealPickerOpen(null);
    setFoodSearch("");
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const meal = sampleMeals[mealIndex];
    const current = [...(meal?.foods || [])];
    current.splice(foodIndex, 1);
    setValue(`sampleMeals.${mealIndex}.foods` as any, current as any, { shouldDirty: true });
  };

  const onSubmit = async (values: FormValues) => {
    const payload: Partial<DietTemplate> = {
      name: values.name,
      description: values.description || undefined,
      goal: values.goal,
      dietaryType: values.dietaryType || undefined,
      difficulty: values.difficulty,
      mealsPerDay: values.mealsPerDay,
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
      sampleMeals:
        values.sampleMeals?.map((m) => ({
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
    };

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
                      onChange={(e) => setValue(`sampleMeals.${mealIndex}.mealType` as any, e.target.value as any, { shouldDirty: true })}
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
                      onChange={(e) => setValue(`sampleMeals.${mealIndex}.name` as any, e.target.value as any, { shouldDirty: true })}
                      placeholder="e.g. High-protein breakfast"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Time</label>
                    <input
                      className="admin-input"
                      value={meal.time || ""}
                      onChange={(e) => setValue(`sampleMeals.${mealIndex}.time` as any, e.target.value as any, { shouldDirty: true })}
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
                  onChange={(e) => setValue(`sampleMeals.${mealIndex}.notes` as any, e.target.value as any, { shouldDirty: true })}
                />
              </div>

              <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Foods</div>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setMealPickerOpen((prev) => (prev === mealIndex ? null : mealIndex))}
                >
                  Add food
                </button>
              </div>

              {mealPickerOpen === mealIndex ? (
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
                              setValue(
                                `sampleMeals.${mealIndex}.foods.${foodIndex}.quantity` as any,
                                e.target.value as any,
                                { shouldDirty: true }
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
                              setValue(
                                `sampleMeals.${mealIndex}.foods.${foodIndex}.unit` as any,
                                e.target.value as any,
                                { shouldDirty: true }
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
                              setValue(
                                `sampleMeals.${mealIndex}.foods.${foodIndex}.notes` as any,
                                e.target.value as any,
                                { shouldDirty: true }
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
