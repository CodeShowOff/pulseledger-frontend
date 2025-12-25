// app/client/workouts/plan/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  Calendar,
  ChevronDown,
  ChevronUp,
  Play,
  Target,
  Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import ExerciseAnimation from "@/components/shared/ExerciseAnimation";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Exercise {
  _id?: string;
  exerciseId?: {
    _id: string;
    name: string;
    animationUrl?: string;
    thumbnailUrl?: string;
    instructions?: string[];
    tips?: string[];
    muscleGroups?: string[];
    equipment?: string[];
    difficulty?: string;
  };
  exerciseName?: string;
  exerciseAnimationUrl?: string;
  sets?: number;
  reps?: number;
  repsMin?: number;
  repsMax?: number;
  duration?: number;
  restSeconds?: number;
  weight?: string;
  notes?: string;
  order: number;
}

interface WorkoutSession {
  _id?: string;
  name?: string;
  description?: string;
  estimatedDuration?: number;
  exercises?: Exercise[];
}

interface WorkoutDay {
  _id?: string;
  dayOfWeek?: number;
  dayNumber?: number;
  dayName?: string;
  isRestDay: boolean;
  restDayNotes?: string;
  focusArea?: string;
  workouts?: WorkoutSession[];
}

interface WorkoutPlan {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  weeklySchedule?: WorkoutDay[];
  equipmentRequired?: string[];
  isActive: boolean;
}

export default function ClientWorkoutPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params?.id as string;

  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);

  // Fetch workout plan details
  const { data: plan, isLoading, error } = useQuery({
    queryKey: ["clientWorkoutPlan", planId],
    queryFn: async () => {
      const res = await api.get(`/client/workouts/plans/${planId}`);
      return res.data.data as WorkoutPlan;
    },
    enabled: !!planId,
  });

  const toggleDay = (dayIndex: number) => {
    setExpandedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const toggleExercise = (exerciseKey: string) => {
    setExpandedExercises((prev) =>
      prev.includes(exerciseKey)
        ? prev.filter((e) => e !== exerciseKey)
        : [...prev, exerciseKey]
    );
  };

  const getTodayDayIndex = () => new Date().getDay();

  if (isLoading) {
    return (
      <div className="client-page__sections">
        <div
          className="client-card"
          style={{ padding: "3rem", textAlign: "center" }}
        >
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
          <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading workout plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="client-page__sections">
        <div
          className="client-card"
          style={{ padding: "3rem", textAlign: "center" }}
        >
          <Dumbbell
            style={{ width: 48, height: 48, color: "#d1d5db", margin: "0 auto 1rem" }}
          />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Workout Plan Not Found
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
            This plan may have been removed or is not assigned to you.
          </p>
          <button
            onClick={() => router.back()}
            className="client-button"
            style={{ margin: "0 auto" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const todayDayIndex = getTodayDayIndex();

  return (
    <div className="client-page__sections">
      {/* Header */}
      <header style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/client/workouts"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#6b7280",
            textDecoration: "none",
            fontSize: "0.9rem",
            marginBottom: "1rem",
          }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
          Back to Workouts
        </Link>

        <div
          className="client-card"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
            color: "#fff",
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "12px",
              }}
            >
              <Dumbbell style={{ width: 28, height: 28 }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                {plan.name}
              </h1>
              {plan.description && (
                <p style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "0.75rem" }}>
                  {plan.description}
                </p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.85rem" }}>
                {plan.category && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Target style={{ width: 14, height: 14 }} />
                    {plan.category.replace(/_/g, " ")}
                  </span>
                )}
                {plan.difficulty && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Info style={{ width: 14, height: 14 }} />
                    {plan.difficulty}
                  </span>
                )}
                {plan.durationWeeks && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Calendar style={{ width: 14, height: 14 }} />
                    {plan.durationWeeks} weeks
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Equipment Required */}
      {plan.equipmentRequired && plan.equipmentRequired.length > 0 && (
        <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Equipment Needed
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {plan.equipmentRequired.map((eq) => (
              <span
                key={eq}
                style={{
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.75rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "999px",
                  color: "#4b5563",
                }}
              >
                {eq.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Schedule */}
      <section>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            marginBottom: "1rem",
            color: "#374151",
          }}
        >
          Weekly Schedule
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {plan.weeklySchedule?.map((day, dayIndex) => {
            const scheduleDayIndex =
              day.dayOfWeek ?? (day.dayNumber ? day.dayNumber - 1 : 0);
            const isToday =
              day.dayOfWeek === todayDayIndex ||
              day.dayNumber === todayDayIndex + 1;
            const isExpanded = expandedDays.includes(dayIndex);
            const allExercises = day.workouts?.flatMap((w) => w.exercises || []) || [];
            const totalExercises = allExercises.length;

            return (
              <div
                key={dayIndex}
                className="client-card"
                style={{
                  overflow: "hidden",
                  border: isToday ? "2px solid #16a34a" : "1px solid #e5e7eb",
                }}
              >
                {/* Day Header */}
                <button
                  onClick={() => toggleDay(dayIndex)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    backgroundColor: isToday ? "#f0fdf4" : "#fff",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        backgroundColor: day.isRestDay
                          ? "#fef3c7"
                          : isToday
                          ? "#dcfce7"
                          : "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                      }}
                    >
                      {day.isRestDay ? "🧘" : "💪"}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                          {day.dayName || DAYS[scheduleDayIndex]}
                        </h3>
                        {isToday && (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              padding: "0.15rem 0.5rem",
                              backgroundColor: "#16a34a",
                              color: "#fff",
                              borderRadius: "999px",
                              fontWeight: 600,
                            }}
                          >
                            TODAY
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0 }}>
                        {day.isRestDay
                          ? "Rest Day"
                          : day.focusArea
                          ? day.focusArea
                          : `${totalExercises} exercises`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {!day.isRestDay && totalExercises > 0 && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "#dbeafe",
                          color: "#2563eb",
                          borderRadius: "6px",
                        }}
                      >
                        {totalExercises} exercises
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp style={{ width: 20, height: 20, color: "#9ca3af" }} />
                    ) : (
                      <ChevronDown style={{ width: 20, height: 20, color: "#9ca3af" }} />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #e5e7eb" }}>
                    {day.isRestDay ? (
                      <div style={{ padding: "2rem", textAlign: "center" }}>
                        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧘‍♀️</p>
                        <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Rest & Recover</h4>
                        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                          {day.restDayNotes || "Take this day to rest and let your muscles recover. Stay hydrated!"}
                        </p>
                      </div>
                    ) : allExercises.length > 0 ? (
                      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {allExercises.map((exercise, exIndex) => {
                          const exerciseKey = `${dayIndex}-${exIndex}`;
                          const isExerciseExpanded = expandedExercises.includes(exerciseKey);
                          const exerciseData = exercise.exerciseId;
                          const animationUrl = exerciseData?.animationUrl || exercise.exerciseAnimationUrl;
                          const thumbnailUrl = exerciseData?.thumbnailUrl;
                          const instructions = exerciseData?.instructions;
                          const exerciseName = exerciseData?.name || exercise.exerciseName || "Exercise";
                          const repsDisplay = exercise.repsMin && exercise.repsMax 
                            ? `${exercise.repsMin}-${exercise.repsMax}` 
                            : exercise.reps;

                          return (
                            <div
                              key={exIndex}
                              style={{
                                backgroundColor: "#fff",
                                borderRadius: "12px",
                                border: "1px solid #e5e7eb",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "1rem",
                                  padding: "1rem",
                                  cursor: "pointer",
                                }}
                                onClick={() => toggleExercise(exerciseKey)}
                              >
                                {/* Animation */}
                                <ExerciseAnimation
                                  animationUrl={animationUrl}
                                  thumbnailUrl={thumbnailUrl}
                                  exerciseName={exerciseName}
                                  size="medium"
                                  showControls={true}
                                />

                                {/* Exercise Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      marginBottom: "0.5rem",
                                    }}
                                  >
                                    <h4
                                      style={{
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        margin: 0,
                                        color: "#111827",
                                      }}
                                    >
                                      {exercise.order}. {exerciseName}
                                    </h4>
                                    {isExerciseExpanded ? (
                                      <ChevronUp style={{ width: 18, height: 18, color: "#9ca3af" }} />
                                    ) : (
                                      <ChevronDown style={{ width: 18, height: 18, color: "#9ca3af" }} />
                                    )}
                                  </div>

                                  {/* Sets/Reps/Duration badges */}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: "0.5rem",
                                      marginBottom: "0.5rem",
                                    }}
                                  >
                                    {exercise.sets ? (
                                      <span
                                        style={{
                                          fontSize: "0.75rem",
                                          padding: "0.2rem 0.5rem",
                                          backgroundColor: "#f3f4f6",
                                          color: "#6b7280",
                                          borderRadius: "6px",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {exercise.sets} sets
                                      </span>
                                    ) : null}
                                    {repsDisplay && (
                                      <span
                                        style={{
                                          fontSize: "0.75rem",
                                          padding: "0.2rem 0.5rem",
                                          backgroundColor: "#dbeafe",
                                          color: "#2563eb",
                                          borderRadius: "6px",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {repsDisplay} reps
                                      </span>
                                    )}
                                    {exercise.duration ? (
                                      <span
                                        style={{
                                          fontSize: "0.75rem",
                                          padding: "0.2rem 0.5rem",
                                          backgroundColor: "#fef3c7",
                                          color: "#d97706",
                                          borderRadius: "6px",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {exercise.duration}s
                                      </span>
                                    ) : null}
                                    {exercise.restSeconds && exercise.restSeconds > 0 && (
                                      <span
                                        style={{
                                          fontSize: "0.75rem",
                                          padding: "0.2rem 0.5rem",
                                          backgroundColor: "#f3f4f6",
                                          color: "#6b7280",
                                          borderRadius: "6px",
                                        }}
                                      >
                                        {exercise.restSeconds}s rest
                                      </span>
                                    )}
                                  </div>

                                  {/* Muscle groups */}
                                  {exerciseData?.muscleGroups && exerciseData.muscleGroups.length > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "0.25rem",
                                      }}
                                    >
                                      {exerciseData.muscleGroups.slice(0, 3).map((mg) => (
                                        <span
                                          key={mg}
                                          style={{
                                            fontSize: "0.65rem",
                                            padding: "0.1rem 0.4rem",
                                            backgroundColor: "#f0fdf4",
                                            color: "#16a34a",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          {mg.replace(/_/g, " ")}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Notes preview */}
                                  {exercise.notes && (
                                    <p
                                      style={{
                                        fontSize: "0.8rem",
                                        color: "#6b7280",
                                        margin: "0.5rem 0 0",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      📝 {exercise.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Expanded Instructions */}
                              {isExerciseExpanded && (
                                <div
                                  style={{
                                    padding: "1rem",
                                    borderTop: "1px solid #e5e7eb",
                                    backgroundColor: "#f9fafb",
                                  }}
                                >
                                  {instructions && instructions.length > 0 ? (
                                    <>
                                      <h5
                                        style={{
                                          fontSize: "0.85rem",
                                          fontWeight: 600,
                                          marginBottom: "0.75rem",
                                          color: "#374151",
                                        }}
                                      >
                                        How to perform:
                                      </h5>
                                      <ol
                                        style={{
                                          margin: 0,
                                          paddingLeft: "1.25rem",
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.5rem",
                                        }}
                                      >
                                        {instructions.map((instruction, idx) => (
                                          <li
                                            key={idx}
                                            style={{
                                              fontSize: "0.85rem",
                                              color: "#4b5563",
                                              lineHeight: 1.5,
                                            }}
                                          >
                                            {instruction}
                                          </li>
                                        ))}
                                      </ol>
                                    </>
                                  ) : (
                                    <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
                                      No detailed instructions available for this exercise.
                                    </p>
                                  )}

                                  {/* Tips */}
                                  {exerciseData?.tips && exerciseData.tips.length > 0 && (
                                    <div style={{ marginTop: "1rem" }}>
                                      <h5
                                        style={{
                                          fontSize: "0.85rem",
                                          fontWeight: 600,
                                          marginBottom: "0.5rem",
                                          color: "#374151",
                                        }}
                                      >
                                        💡 Tips:
                                      </h5>
                                      <ul
                                        style={{
                                          margin: 0,
                                          paddingLeft: "1.25rem",
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.25rem",
                                        }}
                                      >
                                        {exerciseData.tips.map((tip, idx) => (
                                          <li
                                            key={idx}
                                            style={{
                                              fontSize: "0.8rem",
                                              color: "#6b7280",
                                            }}
                                          >
                                            {tip}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Weight info */}
                                  {exercise.weight && (
                                    <div
                                      style={{
                                        marginTop: "1rem",
                                        padding: "0.75rem",
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #e5e7eb",
                                      }}
                                    >
                                      <span style={{ fontSize: "0.85rem", color: "#374151" }}>
                                        <strong>Suggested Weight:</strong> {exercise.weight}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Start Workout Button */}
                        {isToday && (
                          <Link
                            href="/client/workouts/today"
                            className="client-button"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                              marginTop: "0.5rem",
                            }}
                          >
                            <Play style={{ width: 18, height: 18 }} />
                            Start Today&apos;s Workout
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: "2rem", textAlign: "center" }}>
                        <p style={{ color: "#6b7280" }}>No exercises scheduled for this day.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

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
