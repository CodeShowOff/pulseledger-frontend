// app/coach/workout-plans/templates/[id]/page.tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Target,
  Clock,
  Zap,
  Award,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkoutTemplate, useCreateFromWorkoutTemplate } from "@/lib/queries/workouts";
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

export default function CoachViewWorkoutTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  const { data: template, isLoading, error } = useWorkoutTemplate(templateId);
  const createFromTemplate = useCreateFromWorkoutTemplate();

  const handleUseTemplate = () => {
    createFromTemplate.mutate(
      { templateId, data: {} },
      {
        onSuccess: (res) => {
          const planId = (res as { data?: { _id?: string } })?.data?._id;
          toast.success("Workout plan created from template");
          if (planId) router.push(`/coach/workout-plans/${planId}/edit`);
          else router.push("/coach/workout-plans");
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
            <Dumbbell style={{ width: 16, height: 16 }} />
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
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Category</p>
            <p style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {template.category?.replace(/_/g, " ") || "Not set"}
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
          <Zap style={{ width: 20, height: 20, color: "#16a34a" }} />
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Difficulty</p>
            <p style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {template.difficulty || "Not set"}
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
              {template.durationWeeks ? `${template.durationWeeks} weeks` : "Not set"}
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
              {template.daysPerWeek || template.weeklySchedule?.length || 0} days
            </p>
          </div>
        </div>
      </div>

      {/* Target Audience */}
      {template.targetAudience && (
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
              Target Audience
            </h2>
          </div>
          <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
            {template.targetAudience}
          </p>
        </div>
      )}

      {/* Equipment Required */}
      {template.equipmentRequired && template.equipmentRequired.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}
          >
            Equipment Required
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {template.equipmentRequired.map((equipment, idx) => (
              <span
                key={idx}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.85rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                  textTransform: "capitalize",
                }}
              >
                {equipment.replace(/_/g, " ")}
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
          {DAYS.map((day) => {
            const scheduleDay = template.weeklySchedule?.find(
              (d) => d.dayNumber === day.num
            );

            if (!scheduleDay) return null;

            return (
              <div
                key={day.num}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: scheduleDay.isRestDay ? "#f9fafb" : "#f0fdf4",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {scheduleDay.dayName || day.name}
                    </h3>
                    {scheduleDay.focusArea && !scheduleDay.isRestDay && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "#6b7280",
                          margin: 0,
                        }}
                      >
                        Focus: {scheduleDay.focusArea}
                      </p>
                    )}
                  </div>
                  {scheduleDay.isRestDay && (
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.75rem",
                        backgroundColor: "#e5e7eb",
                        borderRadius: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Rest Day
                    </span>
                  )}
                  {scheduleDay.estimatedDuration && !scheduleDay.isRestDay && (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                      }}
                    >
                      ~{scheduleDay.estimatedDuration} min
                    </span>
                  )}
                </div>

                {!scheduleDay.isRestDay && scheduleDay.exercises && scheduleDay.exercises.length > 0 && (
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
                            Exercise
                          </th>
                          <th
                            style={{
                              textAlign: "center",
                              padding: "0.5rem",
                              fontWeight: 500,
                              color: "#6b7280",
                            }}
                          >
                            Sets
                          </th>
                          <th
                            style={{
                              textAlign: "center",
                              padding: "0.5rem",
                              fontWeight: 500,
                              color: "#6b7280",
                            }}
                          >
                            Reps
                          </th>
                          <th
                            style={{
                              textAlign: "center",
                              padding: "0.5rem",
                              fontWeight: 500,
                              color: "#6b7280",
                            }}
                          >
                            Rest
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleDay.exercises.map((ex, exIndex) => {
                          const exerciseName =
                            typeof ex.exerciseId === "object" && ex.exerciseId?.name
                              ? ex.exerciseId.name
                              : "Exercise";

                          return (
                            <tr
                              key={exIndex}
                              style={{
                                borderBottom:
                                  exIndex < scheduleDay.exercises!.length - 1
                                    ? "1px solid #f3f4f6"
                                    : "none",
                              }}
                            >
                              <td
                                style={{
                                  padding: "0.5rem 0.5rem 0.5rem 0",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <Dumbbell
                                  style={{ width: 14, height: 14, color: "#16a34a" }}
                                />
                                {exerciseName}
                              </td>
                              <td style={{ textAlign: "center", padding: "0.5rem" }}>
                                {ex.sets || "-"}
                              </td>
                              <td style={{ textAlign: "center", padding: "0.5rem" }}>
                                {ex.reps || (ex.duration ? `${ex.duration}s` : "-")}
                              </td>
                              <td style={{ textAlign: "center", padding: "0.5rem" }}>
                                {ex.restSeconds ? `${ex.restSeconds}s` : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {!scheduleDay.isRestDay &&
                  (!scheduleDay.exercises || scheduleDay.exercises.length === 0) && (
                    <div
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "0.85rem",
                      }}
                    >
                      No exercises for this day
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

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
