// app/coach/diet-plans/[id]/page.tsx
"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Target,
  Utensils,
  Flame,
  Droplets,
} from "lucide-react";
import { useCoachDietPlan } from "@/lib/queries/diet";

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

export default function ViewDietPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params?.id as string;

  const { data: plan, isLoading, error } = useCoachDietPlan(planId);

  if (isLoading) {
    return (
      <div className="admin-page" style={{ padding: "2rem", textAlign: "center" }}>
        Loading plan...
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="admin-page" style={{ padding: "2rem", textAlign: "center" }}>
        Plan not found
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ paddingBottom: "2rem" }}>
      <div className="admin-page-header">
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--admin-color-text-secondary)",
            marginBottom: "1rem",
          }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
          Back
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 className="admin-page-header__title" style={{ margin: 0 }}>
                {plan.name}
              </h1>
              {plan.isDraft && (
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    fontSize: "0.75rem",
                    backgroundColor: "#fef3c7",
                    color: "#d97706",
                    borderRadius: "999px",
                  }}
                >
                  Draft
                </span>
              )}
            </div>
            {plan.description && (
              <p
                className="admin-page-header__description"
                style={{ marginTop: "0.5rem" }}
              >
                {plan.description}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push(`/coach/diet-plans/${planId}/edit`)}
            className="btn btn--primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Edit2 style={{ width: 16, height: 16 }} />
            Edit Plan
          </button>
        </div>
      </div>

      {/* Plan Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f0fdf4",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Target style={{ width: 20, height: 20, color: "#16a34a" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Goal</p>
            <p style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {plan.goal?.replace(/_/g, " ") || "Not set"}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fef3c7",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Flame style={{ width: 20, height: 20, color: "#d97706" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Daily Calories</p>
            <p style={{ fontWeight: 600 }}>
              {plan.dailyTargets?.calories || 0} kcal
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#eff6ff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Utensils style={{ width: 20, height: 20, color: "#2563eb" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Meals/Day</p>
            <p style={{ fontWeight: 600 }}>
              {plan.mealsPerDay || plan.meals?.length || 0}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f0f9ff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Droplets style={{ width: 20, height: 20, color: "#0ea5e9" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Water</p>
            <p style={{ fontWeight: 600 }}>
              {plan.dailyTargets?.water || 0} L/day
            </p>
          </div>
        </div>
      </div>

      {/* Daily Targets */}
      {plan.dailyTargets && (
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Daily Nutritional Targets
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "1rem",
              padding: "1rem",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Calories</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f97316" }}>
                {plan.dailyTargets.calories || 0}
              </p>
              <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>kcal</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Protein</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ef4444" }}>
                {plan.dailyTargets.protein || 0}
              </p>
              <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>g</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Carbs</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#3b82f6" }}>
                {plan.dailyTargets.carbohydrates || 0}
              </p>
              <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>g</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Fat</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#eab308" }}>
                {plan.dailyTargets.fat || 0}
              </p>
              <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>g</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Fiber</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#22c55e" }}>
                {plan.dailyTargets.fiber || 0}
              </p>
              <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>g</p>
            </div>
          </div>
        </div>
      )}

      {/* Linked Subscription Plans */}
      {plan.subscriptionPlanIds && plan.subscriptionPlanIds.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Linked Subscription Plans
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {plan.subscriptionPlanIds.map((sp: any) => (
              <span
                key={sp._id}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.85rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                }}
              >
                {sp.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Meal Plan */}
      <div>
        <h2
          style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
        >
          Meal Plan
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {plan.meals?.map((meal: any, mealIndex: number) => (
            <div
              key={mealIndex}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "#f0fdf4",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
                >
                  <Utensils style={{ width: 16, height: 16, color: "#16a34a" }} />
                  <span style={{ fontWeight: 600 }}>
                    {meal.name || MEAL_TYPE_LABELS[meal.mealType] || "Meal"}
                  </span>
                  {meal.time && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        color: "#6b7280",
                      }}
                    >
                      {meal.time}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.2rem 0.5rem",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "4px",
                    color: "#6b7280",
                  }}
                >
                  {meal.foods?.length || 0} items
                </span>
              </div>

              {meal.foods && meal.foods.length > 0 && (
                <div style={{ padding: "0.75rem 1rem" }}>
                  <table style={{ width: "100%", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "0.5rem 0.5rem 0.5rem 0",
                            fontWeight: 500,
                            color: "#6b7280",
                          }}
                        >
                          Food
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            padding: "0.5rem",
                            fontWeight: 500,
                            color: "#6b7280",
                          }}
                        >
                          Quantity
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            padding: "0.5rem",
                            fontWeight: 500,
                            color: "#6b7280",
                          }}
                        >
                          Calories
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            padding: "0.5rem",
                            fontWeight: 500,
                            color: "#6b7280",
                          }}
                        >
                          Protein
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            padding: "0.5rem",
                            fontWeight: 500,
                            color: "#6b7280",
                          }}
                        >
                          Carbs
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            padding: "0.5rem",
                            fontWeight: 500,
                            color: "#6b7280",
                          }}
                        >
                          Fat
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {meal.foods.map((food: any, foodIndex: number) => (
                        <tr
                          key={foodIndex}
                          style={{
                            borderBottom:
                              foodIndex < meal.foods.length - 1
                                ? "1px solid #f3f4f6"
                                : "none",
                          }}
                        >
                          <td style={{ padding: "0.5rem 0.5rem 0.5rem 0" }}>
                            {food.foodName ||
                              food.foodItemId?.name ||
                              "Food item"}
                          </td>
                          <td style={{ textAlign: "center", padding: "0.5rem" }}>
                            {food.quantity} {food.unit || "g"}
                          </td>
                          <td style={{ textAlign: "center", padding: "0.5rem" }}>
                            {food.calories || "-"} kcal
                          </td>
                          <td style={{ textAlign: "center", padding: "0.5rem" }}>
                            {food.protein || "-"}g
                          </td>
                          <td style={{ textAlign: "center", padding: "0.5rem" }}>
                            {food.carbs || "-"}g
                          </td>
                          <td style={{ textAlign: "center", padding: "0.5rem" }}>
                            {food.fat || "-"}g
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(!meal.foods || meal.foods.length === 0) && (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "0.85rem",
                  }}
                >
                  No foods added for this meal
                </div>
              )}
            </div>
          ))}

          {(!plan.meals || plan.meals.length === 0) && (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#9ca3af",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
              }}
            >
              No meals configured for this plan
            </div>
          )}
        </div>
      </div>

      {/* Additional Instructions */}
      {(plan.allergyNotes || plan.customInstructions) && (
        <div style={{ marginTop: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Additional Notes
          </h2>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
            }}
          >
            {plan.allergyNotes && (
              <div style={{ marginBottom: plan.customInstructions ? "1rem" : 0 }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  Allergy Notes
                </p>
                <p style={{ fontSize: "0.9rem" }}>{plan.allergyNotes}</p>
              </div>
            )}
            {plan.customInstructions && (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  Custom Instructions
                </p>
                <p style={{ fontSize: "0.9rem" }}>{plan.customInstructions}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
