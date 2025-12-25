// app/client/diet/plan/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Utensils,
  Target,
  Flame,
  Clock,
  AlertCircle,
  CheckCircle2,
  Coffee,
  Sun,
  Moon,
  Dumbbell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useClientDietPlan } from "@/lib/queries/diet";

const MEAL_ICONS: Record<string, React.ElementType> = {
  breakfast: Coffee,
  mid_morning_snack: Sun,
  lunch: Sun,
  afternoon_snack: Sun,
  dinner: Moon,
  evening_snack: Moon,
  pre_workout: Dumbbell,
  post_workout: Dumbbell,
  bedtime_snack: Moon,
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: "#f59e0b",
  mid_morning_snack: "#84cc16",
  lunch: "#22c55e",
  afternoon_snack: "#14b8a6",
  dinner: "#6366f1",
  evening_snack: "#8b5cf6",
  pre_workout: "#ec4899",
  post_workout: "#f43f5e",
  bedtime_snack: "#a855f7",
};

export default function ClientDietPlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  const { data: plan, isLoading, error } = useClientDietPlan(planId);

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(i => i !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  if (isLoading) {
    return (
      <div className="client-page__sections">
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div className="loading-spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading diet plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="client-page__sections">
        <header className="client-page__header" style={{ marginBottom: "1rem" }}>
          <Link
            href="/client/diet"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-secondary)",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Back to Nutrition
          </Link>
        </header>
        <div
          className="client-card"
          style={{
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <AlertCircle
            style={{ width: 48, height: 48, color: "#ef4444", margin: "0 auto 1rem" }}
          />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Diet Plan Not Found
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            This diet plan may not be assigned to you or doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-page__sections">
      {/* Header */}
      <header className="client-page__header" style={{ marginBottom: "1rem" }}>
        <Link
          href="/client/diet"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
          }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
          Back to Nutrition
        </Link>
        <h1 className="client-page__title">
          <Utensils
            style={{
              width: 28,
              height: 28,
              marginRight: "0.5rem",
              color: "#16a34a",
            }}
          />
          {plan.name}
        </h1>
        {plan.description && (
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            {plan.description}
          </p>
        )}
      </header>

      {/* Plan Info */}
      <div
        className="client-card"
        style={{
          padding: "1rem",
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Target style={{ width: 20, height: 20, color: "#16a34a" }} />
          <span style={{ fontWeight: 600 }}>Goal: {plan.goal || "Healthy Eating"}</span>
        </div>
        {plan.dietaryType && (
          <span
            style={{
              display: "inline-block",
              padding: "0.25rem 0.75rem",
              background: "#dcfce7",
              borderRadius: "20px",
              fontSize: "0.8rem",
              color: "#16a34a",
              fontWeight: 500,
            }}
          >
            {plan.dietaryType}
          </span>
        )}
      </div>

      {/* Daily Targets */}
      {plan.dailyTargets && (
        <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Daily Targets
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0.5rem",
            }}
          >
            {plan.dailyTargets.calories && (
              <div
                style={{
                  textAlign: "center",
                  padding: "0.75rem",
                  background: "#fff7ed",
                  borderRadius: "8px",
                }}
              >
                <Flame style={{ width: 20, height: 20, color: "#f97316", margin: "0 auto 0.25rem" }} />
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f97316" }}>
                  {plan.dailyTargets.calories}
                </p>
                <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>kcal</p>
              </div>
            )}
            {plan.dailyTargets.protein && (
              <div
                style={{
                  textAlign: "center",
                  padding: "0.75rem",
                  background: "#fef2f2",
                  borderRadius: "8px",
                }}
              >
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ef4444" }}>
                  {plan.dailyTargets.protein}g
                </p>
                <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Protein</p>
              </div>
            )}
            {plan.dailyTargets.carbohydrates && (
              <div
                style={{
                  textAlign: "center",
                  padding: "0.75rem",
                  background: "#eff6ff",
                  borderRadius: "8px",
                }}
              >
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#3b82f6" }}>
                  {plan.dailyTargets.carbohydrates}g
                </p>
                <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Carbs</p>
              </div>
            )}
            {plan.dailyTargets.fat && (
              <div
                style={{
                  textAlign: "center",
                  padding: "0.75rem",
                  background: "#fefce8",
                  borderRadius: "8px",
                }}
              >
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#eab308" }}>
                  {plan.dailyTargets.fat}g
                </p>
                <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Fat</p>
              </div>
            )}
          </div>

          {plan.dailyTargets.water && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                background: "#f0f9ff",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "0.85rem", color: "#0ea5e9" }}>
                💧 Water Goal: <strong>{plan.dailyTargets.water}L</strong> per day
              </p>
            </div>
          )}
        </div>
      )}

      {/* Weekly Schedule */}
      {plan.weeklySchedule && plan.weeklySchedule.length > 0 ? (
        <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            📅 Weekly Meal Plan
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {plan.weeklySchedule.map((day, dayIndex) => {
              const dayName = day.dayName || ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day.dayOfWeek] || `Day ${dayIndex + 1}`;
              const isExpanded = expandedDays.includes(dayIndex);
              
              return (
                <div
                  key={dayIndex}
                  style={{
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() => toggleDay(dayIndex)}
                    style={{
                      padding: "1rem",
                      background: "#f9fafb",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: isExpanded ? "2px solid #e5e7eb" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                        {dayName}
                      </h4>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        ({day.meals?.length || 0} meals)
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp style={{ width: 20, height: 20, color: "#6b7280" }} />
                    ) : (
                      <ChevronDown style={{ width: 20, height: 20, color: "#6b7280" }} />
                    )}
                  </div>
                  
                  {isExpanded && (
                    <div style={{ padding: "1rem" }}>
                  {day.notes && (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontStyle: "italic" }}>
                      💡 {day.notes}
                    </p>
                  )}
                  {day.meals && day.meals.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {day.meals.map((meal, mealIndex) => {
                        const Icon = MEAL_ICONS[meal.mealType] || Utensils;
                        const color = MEAL_COLORS[meal.mealType] || "#6b7280";

                        return (
                          <div
                            key={mealIndex}
                            style={{
                              padding: "1rem",
                              border: `2px solid ${color}20`,
                              borderRadius: "12px",
                              background: `${color}08`,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Icon style={{ width: 20, height: 20, color }} />
                                <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
                                  {meal.mealType.replace(/_/g, " ")}
                                </span>
                              </div>
                              {meal.time && (
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    fontSize: "0.75rem",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  <Clock style={{ width: 14, height: 14 }} />
                                  {meal.time}
                                </span>
                              )}
                            </div>

                            {meal.name && (
                              <p style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                {meal.name}
                              </p>
                            )}

                            {meal.foods && meal.foods.length > 0 && (
                              <div style={{ marginTop: "0.5rem" }}>
                                {meal.foods.map((food, foodIndex) => (
                                  <div
                                    key={foodIndex}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      padding: "0.5rem 0",
                                      borderBottom:
                                        foodIndex < meal.foods!.length - 1
                                          ? "1px solid var(--border-color)"
                                          : "none",
                                    }}
                                  >
                                    <div>
                                      <p style={{ fontSize: "0.85rem" }}>{food.foodName}</p>
                                      <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                                        {food.quantity} {food.unit}
                                      </p>
                                    </div>
                                    {food.calories && (
                                      <span style={{ fontSize: "0.75rem", color: "#f97316", fontWeight: 500 }}>
                                        {food.calories} kcal
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {meal.notes && (
                              <p
                                style={{
                                  marginTop: "0.5rem",
                                  padding: "0.5rem",
                                  background: "white",
                                  borderRadius: "6px",
                                  fontSize: "0.8rem",
                                  color: "var(--text-secondary)",
                                  fontStyle: "italic",
                                }}
                              >
                                💡 {meal.notes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : plan.meals && plan.meals.length > 0 ? (
        <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Planned Meals ({plan.mealsPerDay || plan.meals.length}/day)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {plan.meals.map((meal, index) => {
              const Icon = MEAL_ICONS[meal.mealType] || Utensils;
              const color = MEAL_COLORS[meal.mealType] || "#6b7280";

              return (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    border: `2px solid ${color}20`,
                    borderRadius: "12px",
                    background: `${color}08`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Icon style={{ width: 20, height: 20, color }} />
                      <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
                        {meal.mealType.replace(/_/g, " ")}
                      </span>
                    </div>
                    {meal.time && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Clock style={{ width: 14, height: 14 }} />
                        {meal.time}
                      </span>
                    )}
                  </div>

                  {meal.name && (
                    <p style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                      {meal.name}
                    </p>
                  )}

                  {meal.foods && meal.foods.length > 0 && (
                    <div style={{ marginTop: "0.5rem" }}>
                      {meal.foods.map((food, foodIndex) => (
                        <div
                          key={foodIndex}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.5rem 0",
                            borderBottom:
                              foodIndex < meal.foods!.length - 1
                                ? "1px solid var(--border-color)"
                                : "none",
                          }}
                        >
                          <div>
                            <p style={{ fontSize: "0.85rem" }}>{food.foodName}</p>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                              {food.quantity} {food.unit}
                            </p>
                          </div>
                          {food.calories && (
                            <span style={{ fontSize: "0.75rem", color: "#f97316", fontWeight: 500 }}>
                              {food.calories} kcal
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {meal.notes && (
                    <p
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.5rem",
                        background: "white",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        fontStyle: "italic",
                      }}
                    >
                      💡 {meal.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Foods to Avoid */}
      {plan.foodsToAvoid && plan.foodsToAvoid.length > 0 && (
        <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            ⚠️ Foods to Avoid
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {plan.foodsToAvoid.map((food, index) => (
              <span
                key={index}
                style={{
                  padding: "0.25rem 0.75rem",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  color: "#dc2626",
                }}
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Supplements */}
      {plan.supplements && plan.supplements.length > 0 && (
        <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            💊 Supplements
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {plan.supplements.map((supplement, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "8px",
                }}
              >
                <CheckCircle2 style={{ width: 16, height: 16, color: "#22c55e" }} />
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>{supplement.name}</p>
                  {supplement.dosage && (
                    <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                      {supplement.dosage} • {supplement.timing}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allergy Notes */}
      {plan.allergyNotes && (
        <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: "#fef2f2", border: "2px solid #fecaca" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem", color: "#dc2626" }}>
            ⚠️ Allergy Notes
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#991b1b",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {plan.allergyNotes}
          </p>
        </div>
      )}

      {/* Custom Instructions */}
      {plan.customInstructions && (
        <div className="client-card" style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            📝 Coach&apos;s Notes
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {plan.customInstructions}
          </p>
        </div>
      )}
    </div>
  );
}
