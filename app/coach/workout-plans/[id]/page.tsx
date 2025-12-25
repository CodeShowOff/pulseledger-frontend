// app/coach/workout-plans/[id]/page.tsx
"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Dumbbell,
  Target,
  Clock,
  Zap,
} from "lucide-react";
import { useCoachWorkoutPlan, WorkoutDay, WorkoutSession, PlanExercise } from "@/lib/queries/workouts";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ViewWorkoutPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params?.id as string;

  const { data: plan, isLoading, error } = useCoachWorkoutPlan(planId);

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
            onClick={() => router.push(`/coach/workout-plans/${planId}/edit`)}
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
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Category</p>
            <p style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {plan.category?.replace(/_/g, " ") || "Not set"}
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
          <Zap style={{ width: 20, height: 20, color: "#2563eb" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Difficulty</p>
            <p style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {plan.difficulty || "Not set"}
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
          <Clock style={{ width: 20, height: 20, color: "#d97706" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Duration</p>
            <p style={{ fontWeight: 600 }}>
              {plan.durationWeeks ? `${plan.durationWeeks} weeks` : "Not set"}
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
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Days/Week</p>
            <p style={{ fontWeight: 600 }}>
              {plan.daysPerWeek || plan.weeklySchedule?.length || 0} days
            </p>
          </div>
        </div>
      </div>

      {/* Linked Subscription Plans */}
      {plan.subscriptionPlanIds && plan.subscriptionPlanIds.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Linked Subscription Plans
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {plan.subscriptionPlanIds.map((sp) => (
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

      {/* Weekly Schedule */}
      <div>
        <h2
          style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
        >
          Weekly Schedule
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {plan.weeklySchedule?.map((day: WorkoutDay, dayIndex: number) => (
            <div
              key={dayIndex}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: day.isRestDay ? "#f9fafb" : "#f0fdf4",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {day.dayName || DAYS[day.dayOfWeek ?? dayIndex] || `Day ${dayIndex + 1}`}
                  </span>
                  {day.focusArea && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        color: "#6b7280",
                      }}
                    >
                      {day.focusArea}
                    </span>
                  )}
                </div>
                {day.isRestDay && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.2rem 0.5rem",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "4px",
                      color: "#6b7280",
                    }}
                  >
                    Rest Day
                  </span>
                )}
              </div>

              {!day.isRestDay && day.workouts && day.workouts.length > 0 && (
                <div style={{ padding: "0.75rem 1rem" }}>
                  {day.workouts.map((workout: WorkoutSession, wIndex: number) => (
                    <div key={wIndex} style={{ marginBottom: wIndex < day.workouts!.length - 1 ? "1rem" : 0 }}>
                      {workout.name && (
                        <p style={{ fontWeight: 500, marginBottom: "0.5rem", color: "#374151" }}>
                          {workout.name}
                          {workout.estimatedDuration && (
                            <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: "0.5rem" }}>
                              (~{workout.estimatedDuration} min)
                            </span>
                          )}
                        </p>
                      )}
                      {workout.exercises && workout.exercises.length > 0 && (
                        <table style={{ width: "100%", fontSize: "0.85rem" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                              <th style={{ textAlign: "left", padding: "0.5rem 0.5rem 0.5rem 0", fontWeight: 500, color: "#6b7280" }}>
                                Exercise
                              </th>
                              <th style={{ textAlign: "center", padding: "0.5rem", fontWeight: 500, color: "#6b7280" }}>
                                Sets
                              </th>
                              <th style={{ textAlign: "center", padding: "0.5rem", fontWeight: 500, color: "#6b7280" }}>
                                Reps
                              </th>
                              <th style={{ textAlign: "center", padding: "0.5rem", fontWeight: 500, color: "#6b7280" }}>
                                Weight
                              </th>
                              <th style={{ textAlign: "center", padding: "0.5rem", fontWeight: 500, color: "#6b7280" }}>
                                Rest
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {workout.exercises.map((ex: PlanExercise, exIndex: number) => {
                              // Handle exerciseId being either a string or populated object
                              const exerciseName = typeof ex.exerciseId === 'object' && ex.exerciseId?.name
                                ? ex.exerciseId.name
                                : ex.exerciseName || "Exercise";
                              
                              return (
                              <tr
                                key={exIndex}
                                style={{
                                  borderBottom: exIndex < workout.exercises!.length - 1 ? "1px solid #f3f4f6" : "none",
                                }}
                              >
                                <td style={{ padding: "0.5rem 0.5rem 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <Dumbbell style={{ width: 14, height: 14, color: "#16a34a" }} />
                                  {exerciseName}
                                </td>
                                <td style={{ textAlign: "center", padding: "0.5rem" }}>
                                  {ex.sets || "-"}
                                </td>
                                <td style={{ textAlign: "center", padding: "0.5rem" }}>
                                  {ex.reps || (ex.duration ? `${ex.duration}s` : "-")}
                                </td>
                                <td style={{ textAlign: "center", padding: "0.5rem" }}>
                                  {ex.weight || "-"}
                                </td>
                                <td style={{ textAlign: "center", padding: "0.5rem" }}>
                                  {ex.restSeconds ? `${ex.restSeconds}s` : "-"}
                                </td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!day.isRestDay && (!day.workouts || day.workouts.length === 0) && (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "0.85rem",
                  }}
                >
                  No exercises added for this day
                </div>
              )}
            </div>
          ))}

          {(!plan.weeklySchedule || plan.weeklySchedule.length === 0) && (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#9ca3af",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
              }}
            >
              No schedule configured for this plan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
