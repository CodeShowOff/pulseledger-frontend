// app/client/diet/today/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Utensils,
  CheckCircle2,
  Flame,
  ChevronRight,
  ChevronDown,
  Plus,
  Coffee,
  Sun,
  Moon,
  Dumbbell,
} from "lucide-react";
import {
  useClientDietPlans,
  useClientDietLogByDate,
  Meal,
  LoggedMeal,
  MealFood,
} from "@/lib/queries/diet";

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const MEAL_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  breakfast: Coffee,
  mid_morning_snack: Sun,
  lunch: Sun,
  afternoon_snack: Sun,
  dinner: Moon,
  evening_snack: Moon,
  pre_workout: Dumbbell,
  post_workout: Dumbbell,
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
};

export default function ClientDietTodayPage() {
  const today = new Date();

  // Fetch assigned diet plans
  const { data: plans = [], isLoading: plansLoading } = useClientDietPlans();

  // Fetch today's diet log
  const { data: todayLog, isLoading: todayLoading } = useClientDietLogByDate(
    formatLocalDate(today)
  );

  // Get active diet plan
  const activePlan = plans.find((p) => p.isActive);

  if (plansLoading || todayLoading) {
    return (
      <div className="client-page__sections">
        <div className="client-card" style={{ padding: "3rem", textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #e5e7eb",
              borderTopColor: "#16a34a",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }}
          />
          <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading today&apos;s nutrition plan...</p>
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="client-page__sections">
        <header style={{ marginBottom: "1rem" }}>
          <Link
            href="/client/diet"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Back to Nutrition
          </Link>
        </header>
        <div className="client-card" style={{ padding: "3rem", textAlign: "center" }}>
          <Utensils style={{ width: 48, height: 48, color: "#d1d5db", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No Diet Plan Assigned
          </h2>
          <p style={{ color: "#6b7280" }}>
            Your coach hasn&apos;t assigned a diet plan yet. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  // Use today's meals if available, otherwise fall back to regular meals
  const mealsToShow = activePlan.todaysMeals || activePlan.meals || [];
  const totalCaloriesTarget = activePlan.dailyTargets?.calories || 0;
  const totalCaloriesConsumed = todayLog?.dailyTotals?.calories || 0;
  const caloriesPercentage = totalCaloriesTarget > 0 
    ? Math.min((totalCaloriesConsumed / totalCaloriesTarget) * 100, 100) 
    : 0;

  return (
    <div className="client-page__sections">
      <header style={{ marginBottom: "1rem" }}>
        <Link
          href="/client/diet"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#6b7280",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
          Back to Nutrition
        </Link>
      </header>

      {/* Today's Overview */}
      <div
        className="client-card"
        style={{
          background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
          color: "#fff",
          padding: "1.5rem",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          Today&apos;s Nutrition
        </h1>
        <p style={{ opacity: 0.9 }}>{activePlan.name}</p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.85rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Utensils style={{ width: 16, height: 16 }} />
            {mealsToShow.length} meals planned
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Flame style={{ width: 16, height: 16 }} />
            {totalCaloriesTarget} kcal target
          </span>
        </div>
      </div>

      {/* Daily Progress */}
      <div
        className="client-card"
        style={{
          padding: "1rem",
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600 }}>Today&apos;s Progress</h3>
          <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
            {today.toLocaleDateString()}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.75rem",
          }}
        >
          {/* Calories */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                position: "relative",
                width: "60px",
                height: "60px",
                margin: "0 auto 0.5rem",
              }}
            >
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min(caloriesPercentage, 100)}, 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Flame style={{ width: 16, height: 16, color: "#f97316" }} />
              </div>
            </div>
            <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              {totalCaloriesConsumed}
            </p>
            <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>
              / {totalCaloriesTarget} kcal
            </p>
          </div>

          {/* Protein */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                position: "relative",
                width: "60px",
                height: "60px",
                margin: "0 auto 0.5rem",
              }}
            >
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min(
                    ((todayLog?.dailyTotals?.protein || 0) / (activePlan.dailyTargets?.protein || 1)) * 100,
                    100
                  )}, 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#ef4444",
                }}
              >
                P
              </div>
            </div>
            <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              {todayLog?.dailyTotals?.protein || 0}g
            </p>
            <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>
              / {activePlan.dailyTargets?.protein || 0}g
            </p>
          </div>

          {/* Carbs */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                position: "relative",
                width: "60px",
                height: "60px",
                margin: "0 auto 0.5rem",
              }}
            >
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min(
                    ((todayLog?.dailyTotals?.carbs || 0) / (activePlan.dailyTargets?.carbohydrates || 1)) * 100,
                    100
                  )}, 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#3b82f6",
                }}
              >
                C
              </div>
            </div>
            <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              {todayLog?.dailyTotals?.carbs || 0}g
            </p>
            <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>
              / {activePlan.dailyTargets?.carbohydrates || 0}g
            </p>
          </div>

          {/* Fat */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                position: "relative",
                width: "60px",
                height: "60px",
                margin: "0 auto 0.5rem",
              }}
            >
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min(
                    ((todayLog?.dailyTotals?.fat || 0) / (activePlan.dailyTargets?.fat || 1)) * 100,
                    100
                  )}, 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#eab308",
                }}
              >
                F
              </div>
            </div>
            <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              {todayLog?.dailyTotals?.fat || 0}g
            </p>
            <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>
              / {activePlan.dailyTargets?.fat || 0}g
            </p>
          </div>
        </div>
      </div>

      {/* Today's Meals */}
      <div className="client-card" style={{ padding: "1rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem" }}>
          Today&apos;s Meals
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {mealsToShow.map((meal: Meal, index: number) => {
            const loggedMeal = todayLog?.meals?.find(
              (m: LoggedMeal) => m.mealType === meal.mealType
            );
            const isLogged = !!loggedMeal;
            const MealIcon = MEAL_ICONS[meal.mealType] || Utensils;
            const mealColor = MEAL_COLORS[meal.mealType] || "#6b7280";
            const hasSuggestedFoods = meal.foods && meal.foods.length > 0;

            return (
              <Link
                key={index}
                href={`/client/diet/log?meal=${meal.mealType}`}
                className="client-card"
                style={{
                  borderLeft: isLogged
                    ? `4px solid ${mealColor}`
                    : "4px solid #e5e7eb",
                  overflow: "hidden",
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {isLogged ? (
                      <CheckCircle2
                        style={{ width: 20, height: 20, color: mealColor }}
                      />
                    ) : (
                      <MealIcon
                        style={{ width: 20, height: 20, color: "#9ca3af" }}
                      />
                    )}
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                        {meal.name || meal.mealType.replace(/_/g, " ")}
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                        {meal.time || "Not scheduled"} •{" "}
                        {isLogged
                          ? `${loggedMeal.foods?.length || 0} items logged`
                          : `${meal.foods?.length || 0} suggested items`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight style={{ width: 20, height: 20, color: "#9ca3af" }} />
                </div>

                {/* Assigned (Planned) Foods */}
                {hasSuggestedFoods && (
                  <div
                    style={{
                      padding: "0 1rem 1rem 1rem",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem", color: "#6b7280" }}>
                      Assigned Foods:
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {meal.foods?.map((food: MealFood, foodIndex: number) => (
                        <div
                          key={foodIndex}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.5rem",
                            background: "#f9fafb",
                            borderRadius: "6px",
                          }}
                        >
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                              {food.foodName}
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              {food.quantity} {food.unit}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f97316" }}>
                              {food.calories || 0} cal
                            </p>
                            <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                              P: {food.protein || 0}g • C: {food.carbs || 0}g • F: {food.fat || 0}g
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Log Button */}
        <Link
          href="/client/diet/log"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.85rem 1rem",
            marginTop: "1rem",
            fontSize: "1rem",
            fontWeight: 600,
            background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
            color: "#ffffff",
            borderRadius: "8px",
            textDecoration: "none",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <Plus style={{ width: 18, height: 18 }} />
          Quick Log Food
        </Link>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
