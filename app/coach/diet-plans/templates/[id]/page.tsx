// app/coach/diet-plans/templates/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Target,
  Users,
  Award,
  Utensils,
  Apple,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useDietTemplate, useCreateFromDietTemplate } from "@/lib/queries/diet";
import getErrorMessage from "@/lib/getErrorMessage";

const DAYS = [
  { num: 1, name: "Monday" },
  { num: 2, name: "Tuesday" },
  { num: 3, name: "Wednesday" },
  { num: 4, name: "Thursday" },
  { num: 5, name: "Friday" },
  { num: 6, name: "Saturday" },
  { num: 7, name: "Sunday" },
];

const MEAL_TIMES = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];

export default function CoachViewDietTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;
  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  const { data: template, isLoading, error } = useDietTemplate(templateId);
  const createFromTemplate = useCreateFromDietTemplate();

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(i => i !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleUseTemplate = () => {
    createFromTemplate.mutate(
      { templateId, data: {} },
      {
        onSuccess: (res) => {
          const planId = (res as { data?: { _id?: string } })?.data?._id;
          toast.success("Diet plan created from template");
          if (planId) router.push(`/coach/diet-plans/${planId}/edit`);
          else router.push("/coach/diet-plans");
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, "Failed to create plan")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="admin-page" style={{ padding: "2rem", textAlign: "center" }}>
        Loading template...
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="admin-page" style={{ padding: "2rem", textAlign: "center" }}>
        Template not found
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
          Back to Templates
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
                {template.name}
              </h1>
              {template.isFeatured && (
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    fontSize: "0.75rem",
                    backgroundColor: "#fef3c7",
                    color: "#d97706",
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Award style={{ width: 12, height: 12 }} />
                  Featured
                </span>
              )}
            </div>
            {template.description && (
              <p
                className="admin-page-header__description"
                style={{ marginTop: "0.5rem" }}
              >
                {template.description}
              </p>
            )}
          </div>
          <button
            onClick={handleUseTemplate}
            disabled={createFromTemplate.isPending}
            className="btn btn--primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Utensils style={{ width: 16, height: 16 }} />
            {createFromTemplate.isPending ? "Creating..." : "Use This Template"}
          </button>
        </div>
      </div>

      {/* Template Info Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#dbeafe",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Target style={{ width: 20, height: 20, color: "#2563eb" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Goal</p>
            <p style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {template.goal?.replace(/_/g, " ") || "Not set"}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#dcfce7",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Apple style={{ width: 20, height: 20, color: "#16a34a" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Dietary Type</p>
            <p style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {template.dietaryType?.replace(/_/g, " ") || "Not set"}
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
          <Utensils style={{ width: 20, height: 20, color: "#d97706" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Meals/Day</p>
            <p style={{ fontWeight: 600 }}>
              {template.mealsPerDay || "Not set"}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fce7f3",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Calendar style={{ width: 20, height: 20, color: "#db2777" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Duration</p>
            <p style={{ fontWeight: 600 }}>
              Ongoing
            </p>
          </div>
        </div>
      </div>

      {/* Daily Targets */}
      {template.dailyTargets && (
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Daily Nutrition Targets
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            {template.dailyTargets.calories && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                }}
              >
                <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Calories</p>
                <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                  {template.dailyTargets.calories} kcal
                </p>
              </div>
            )}
            {template.dailyTargets.protein && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#fef3c7",
                  borderRadius: "6px",
                }}
              >
                <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Protein</p>
                <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                  {template.dailyTargets.protein}g
                </p>
              </div>
            )}
            {template.dailyTargets.carbohydrates && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#dbeafe",
                  borderRadius: "6px",
                }}
              >
                <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Carbs</p>
                <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                  {template.dailyTargets.carbohydrates}g
                </p>
              </div>
            )}
            {template.dailyTargets.fat && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#dcfce7",
                  borderRadius: "6px",
                }}
              >
                <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Fats</p>
                <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                  {template.dailyTargets.fat}g
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guidelines */}
      {template.guidelines && template.guidelines.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <Users style={{ width: 18, height: 18, color: "#6b7280" }} />
            <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            Guidelines
          </h2>
        </div>
        <ul style={{ color: "#4b5563", lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          {template.guidelines.map((guideline: string, idx: number) => (
            <li key={idx} style={{ marginBottom: "0.5rem" }}>{guideline}</li>
          ))}
        </ul>
      </div>
      )}

      {/* Foods to Avoid */}
      {template.foodsToAvoid && template.foodsToAvoid.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Foods to Avoid
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {template.foodsToAvoid.map((food: string, idx: number) => (
              <span
                key={idx}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.85rem",
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "6px",
                  textTransform: "capitalize",
                }}
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Tags
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {template.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.85rem",
                  backgroundColor: "#e0e7ff",
                  color: "#4338ca",
                  borderRadius: "6px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sample Meals */}
      {template.sampleMeals && template.sampleMeals.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Sample Daily Meals
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {template.sampleMeals.map((meal: any, idx: number) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  {meal.mealType || MEAL_TIMES[idx] || `Meal ${idx + 1}`}
                </h3>
                {meal.foods && meal.foods.length > 0 && (
                  <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
                    {meal.foods.map((food: any, foodIdx: number) => {
                      const foodName =
                        typeof food.foodItemId === "object" && food.foodItemId?.name
                          ? food.foodItemId.name
                          : food.foodName || "Food item";
                      return (
                        <li key={foodIdx} style={{ marginBottom: "0.25rem" }}>
                          {foodName} - {food.quantity} {food.unit || ""}
                          {typeof food.foodItemId === "object" &&
                            food.foodItemId?.servingUnit &&
                            ` (${food.foodItemId.servingUnit})`}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Schedule */}
      {template.weeklySchedule && template.weeklySchedule.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Weekly Meal Schedule
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {template.weeklySchedule.map((day: any, dayIdx: number) => {
              const isExpanded = expandedDays.includes(dayIdx);
              
              return (
                <div
                  key={dayIdx}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() => toggleDay(dayIdx)}
                    style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "#f0fdf4",
                      borderBottom: isExpanded ? "1px solid #e5e7eb" : "none",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{day.dayName || `Day ${day.dayNumber || dayIdx + 1}`}</span>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 400 }}>
                        ({day.meals?.length || 0} meals)
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp style={{ width: 18, height: 18, color: "#16a34a" }} />
                    ) : (
                      <ChevronDown style={{ width: 18, height: 18, color: "#16a34a" }} />
                    )}
                  </div>
                  
                  {isExpanded && (
                    <div style={{ padding: "1rem" }}>
                  {day.meals && day.meals.length > 0 ? (
                    day.meals.map((meal: any, mealIdx: number) => (
                      <div
                        key={mealIdx}
                        style={{
                          marginBottom: mealIdx < day.meals.length - 1 ? "1rem" : 0,
                          paddingBottom: mealIdx < day.meals.length - 1 ? "1rem" : 0,
                          borderBottom:
                            mealIdx < day.meals.length - 1
                              ? "1px solid #f3f4f6"
                              : "none",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            textTransform: "capitalize",
                          }}
                        >
                          {meal.mealType?.replace(/_/g, " ") || "Meal"}
                          {meal.time && (
                            <span
                              style={{
                                fontWeight: 400,
                                color: "#6b7280",
                                marginLeft: "0.5rem",
                              }}
                            >
                              ({meal.time})
                            </span>
                          )}
                        </h4>
                        {meal.foods && meal.foods.length > 0 && (
                          <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                            {meal.foods.map((food: any, foodIdx: number) => {
                              const foodName =
                                typeof food.foodItemId === "object" &&
                                food.foodItemId?.name
                                  ? food.foodItemId.name
                                  : food.foodName || "Food item";
                              return (
                                <li
                                  key={foodIdx}
                                  style={{
                                    fontSize: "0.85rem",
                                    marginBottom: "0.25rem",
                                    color: "#4b5563",
                                  }}
                                >
                                  {foodName} - {food.quantity} {food.unit || ""}
                                  {typeof food.foodItemId === "object" &&
                                    food.foodItemId?.servingUnit &&
                                    ` (${food.foodItemId.servingUnit})`}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        {meal.notes && (
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              marginTop: "0.5rem",
                              fontStyle: "italic",
                            }}
                          >
                            Note: {meal.notes}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                      No meals planned for this day
                    </p>
                  )}
                  {day.notes && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                        marginTop: "0.75rem",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid #f3f4f6",
                        fontStyle: "italic",
                      }}
                    >
                      {day.notes}
                    </p>
                  )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* Usage Stats */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
          This template has been used{" "}
          <span style={{ fontWeight: 600, color: "#374151" }}>
            {template.usageCount || 0}
          </span>{" "}
          times by coaches
        </p>
      </div>
    </div>
  );
}
