// app/client/diet/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Utensils,
  Calendar,
  Flame,
  ChevronRight,
  CheckCircle2,
  Plus,
} from "lucide-react";
import {
  useClientDietPlans,
  useClientDietLogByDate,
  useClientDietStats,
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

export default function ClientDietPage() {
  const [view, setView] = useState<"today" | "plans" | "history">("today");
  const today = new Date();

  // Fetch assigned diet plans
  const { data: plans = [], isLoading: plansLoading } = useClientDietPlans();

  // Fetch today's diet log
  const { data: todayLog, isLoading: todayLoading } = useClientDietLogByDate(
    formatLocalDate(today)
  );

  // Fetch diet stats (unused for now but available)
  useClientDietStats();

  // Get active diet plan
  const activePlan = plans.find((p) => p.isActive);

  // Use today's meals if available
  const mealsToShow = activePlan?.todaysMeals || activePlan?.meals || [];

  return (
    <div className="client-page__sections">
      <header className="client-page__header">
        <h1 className="client-page__title">
          <Utensils
            style={{
              width: 28,
              height: 28,
              marginRight: "0.5rem",
              color: "#16a34a",
            }}
          />
          My Nutrition
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Track your meals and stay on top of your nutrition goals
        </p>
      </header>

      {/* Daily Overview - Always show if there's an active plan */}
      {activePlan?.dailyTargets && (
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
                    strokeDasharray={`${Math.min(
                      ((todayLog?.dailyTotals?.calories || 0) / (activePlan.dailyTargets.calories || 1)) * 100,
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
                  }}
                >
                  <Flame style={{ width: 16, height: 16, color: "#f97316" }} />
                </div>
              </div>
              <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                {todayLog?.dailyTotals?.calories || 0}
              </p>
              <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>
                / {activePlan.dailyTargets.calories} kcal
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
                      ((todayLog?.dailyTotals?.protein || 0) / (activePlan.dailyTargets.protein || 1)) * 100,
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
                / {activePlan.dailyTargets.protein}g
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
                      ((todayLog?.dailyTotals?.carbs || 0) / (activePlan.dailyTargets.carbohydrates || 1)) * 100,
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
                / {activePlan.dailyTargets.carbohydrates}g
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
                      ((todayLog?.dailyTotals?.fat || 0) / (activePlan.dailyTargets.fat || 1)) * 100,
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
                / {activePlan.dailyTargets.fat}g
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "0.5rem",
        }}
      >
        {[
          { key: "today", label: "Today" },
          { key: "plans", label: "My Plans" },
          { key: "history", label: "History" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key as any)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              fontWeight: view === tab.key ? 600 : 400,
              color: view === tab.key ? "#16a34a" : "#6b7280",
              backgroundColor: "transparent",
              border: "none",
              borderBottom:
                view === tab.key ? "2px solid #16a34a" : "2px solid transparent",
              marginBottom: "-0.6rem",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      {view === "today" && activePlan && (
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Link
            href="/client/diet/today"
            className="client-button"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
            }}
          >
            <Utensils style={{ width: 18, height: 18 }} />
            Start Today&apos;s Plan
          </Link>
          <Link
            href="/client/diet/log"
            className="client-button"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
            }}
          >
            <Plus style={{ width: 18, height: 18 }} />
            Quick Log
          </Link>
        </div>
      )}

      {/* Today's Meals */}
      {view === "today" && (
        <div>
          {todayLoading ? (
            <div
              className="client-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              Loading...
            </div>
          ) : activePlan ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {mealsToShow.map((meal: Meal, index: number) => {
                const loggedMeal = todayLog?.meals?.find(
                  (m: LoggedMeal) => m.mealType === meal.mealType
                );
                const isLogged = !!loggedMeal;
                const hasSuggestedFoods = meal.foods && meal.foods.length > 0;

                return (
                  <Link
                    key={index}
                    href={`/client/diet/log?meal=${meal.mealType}`}
                    className="client-card"
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                      borderLeft: isLogged
                        ? "4px solid #16a34a"
                        : "4px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {isLogged ? (
                          <CheckCircle2
                            style={{ width: 20, height: 20, color: "#16a34a" }}
                          />
                        ) : (
                          <Utensils
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
                      <ChevronRight
                        style={{ width: 20, height: 20, color: "#9ca3af" }}
                      />
                    </div>

                    {/* Assigned (Planned) Foods */}
                    {hasSuggestedFoods && (
                      <div
                        style={{
                          padding: "0 1rem 1rem 1rem",
                          borderTop: "1px solid #f3f4f6",
                        }}
                      >
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

              {/* Quick Log Button */}
              <Link
                href="/client/diet/log"
                className="client-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                }}
              >
                <Plus style={{ width: 18, height: 18 }} />
                Quick Log Food
              </Link>
            </div>
          ) : (
            <div
              className="client-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <Utensils
                style={{
                  width: 48,
                  height: 48,
                  color: "#d1d5db",
                  margin: "0 auto 1rem",
                }}
              />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                No Diet Plan Assigned
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Your coach hasn&apos;t assigned a diet plan yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      )}

      {/* My Plans */}
      {view === "plans" && (
        <div>
          {plansLoading ? (
            <div
              className="client-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              Loading plans...
            </div>
          ) : plans.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {plans.map((plan: any) => (
                <Link
                  key={plan._id}
                  href={`/client/diet/plan/${plan._id}`}
                  className="client-card"
                  style={{
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
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                          {plan.name}
                        </h3>
                        {plan.isActive && (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              padding: "0.15rem 0.5rem",
                              backgroundColor: "#dcfce7",
                              color: "#16a34a",
                              borderRadius: "999px",
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                        {plan.goal?.replace(/_/g, " ")} •{" "}
                        {plan.dietaryType} •{" "}
                        {plan.dailyTargets?.calories || 0} kcal/day
                      </p>
                    </div>
                    <ChevronRight style={{ width: 20, height: 20, color: "#9ca3af" }} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="client-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <Calendar
                style={{
                  width: 48,
                  height: 48,
                  color: "#d1d5db",
                  margin: "0 auto 1rem",
                }}
              />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                No Plans Yet
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Your coach will assign diet plans to you.
              </p>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {view === "history" && (
        <div>
          <Link
            href="/client/diet/history"
            className="client-card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Calendar style={{ width: 20, height: 20, color: "#16a34a" }} />
              <span style={{ fontWeight: 500 }}>View Nutrition History</span>
            </div>
            <ChevronRight style={{ width: 20, height: 20, color: "#9ca3af" }} />
          </Link>
        </div>
      )}
    </div>
  );
}
