// components/coach/WorkoutPlanList.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  Dumbbell,
  Calendar,
  Target,
  ChevronLeft,
  ChevronRight,
  Plus,
  Link as LinkIcon,
  Copy,
} from "lucide-react";
import {
  useCoachWorkoutPlans,
  useDeleteCoachWorkoutPlan,
  type CoachWorkoutPlan,
} from "@/lib/queries/workouts";

const PLANS_PER_PAGE = 6;

function categoryLabel(category?: string) {
  const labels: Record<string, string> = {
    strength: "Strength",
    cardio: "Cardio",
    weight_loss: "Weight Loss",
    muscle_gain: "Muscle Gain",
    yoga: "Yoga",
    hiit: "HIIT",
    flexibility: "Flexibility",
    endurance: "Endurance",
    general_fitness: "General Fitness",
    custom: "Custom",
  };
  return labels[category || ""] || category || "—";
}

function difficultyColor(difficulty?: string) {
  switch (difficulty) {
    case "beginner":
      return { bg: "#dcfce7", color: "#16a34a" };
    case "intermediate":
      return { bg: "#fef3c7", color: "#d97706" };
    case "advanced":
      return { bg: "#fee2e2", color: "#dc2626" };
    default:
      return { bg: "#f3f4f6", color: "#6b7280" };
  }
}

export default function WorkoutPlanList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCoachWorkoutPlans({
    page: currentPage,
    limit: PLANS_PER_PAGE,
    search: search || undefined,
  });

  const deleteMutation = useDeleteCoachWorkoutPlan();

  const plans: CoachWorkoutPlan[] = data?.data ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, totalPages: 1 };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this workout plan? This action cannot be undone.")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Workout plan deleted"),
        onError: () => toast.error("Failed to delete workout plan"),
      });
    }
  };

  if (isLoading) {
    return (
      <p style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
        Loading workout plans...
      </p>
    );
  }

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search workout plans..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "100%",
            maxWidth: "300px",
            padding: "0.5rem 0.75rem",
            fontSize: "0.85rem",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            outline: "none",
          }}
        />
      </div>

      {/* Summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          fontSize: "0.85rem",
          color: "#6b7280",
        }}
      >
        <span>Total plans: {pagination.total}</span>
        <span>
          Showing {(currentPage - 1) * PLANS_PER_PAGE + 1}-
          {Math.min(currentPage * PLANS_PER_PAGE, pagination.total)} of{" "}
          {pagination.total}
        </span>
      </div>

      {/* Card-based layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {plans.map((p) => {
          const diffStyle = difficultyColor(p.difficulty);
          const linkedPlans = p.subscriptionPlanIds || [];

          return (
            <div
              key={p._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "1rem",
                backgroundColor: p.isDraft ? "#fffbeb" : "#fafafa",
              }}
            >
              {/* Plan Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.75rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <Dumbbell
                      style={{ width: "18px", height: "18px", color: "#2563eb" }}
                    />
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#111827",
                        margin: 0,
                      }}
                    >
                      {p.name}
                    </h3>
                    {p.isDraft && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          backgroundColor: "#fef3c7",
                          color: "#d97706",
                          fontWeight: 500,
                        }}
                      >
                        Draft
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                        margin: "0.35rem 0 0 0",
                        lineHeight: 1.4,
                      }}
                    >
                      {p.description.length > 100
                        ? p.description.slice(0, 100) + "..."
                        : p.description}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "999px",
                    backgroundColor: diffStyle.bg,
                    color: diffStyle.color,
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {p.difficulty || "—"}
                </span>
              </div>

              {/* Plan Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <Target
                    style={{ width: "14px", height: "14px", color: "#6b7280" }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                        display: "block",
                      }}
                    >
                      Category
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {categoryLabel(p.category)}
                    </span>
                  </div>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <Calendar
                    style={{ width: "14px", height: "14px", color: "#6b7280" }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                        display: "block",
                      }}
                    >
                      Duration
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {p.durationWeeks ? `${p.durationWeeks} weeks` : "—"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    gridColumn: "1 / -1",
                  }}
                >
                  <LinkIcon
                    style={{ width: "14px", height: "14px", color: "#6b7280" }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                        display: "block",
                      }}
                    >
                      Linked Plans
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {linkedPlans.length > 0
                        ? linkedPlans.map((lp) => lp.title).join(", ")
                        : "Not linked to any subscription plan"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid #e5e7eb",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href={`/coach/workout-plans/${p._id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.8rem",
                    borderRadius: "6px",
                    border: "1px solid #dbeafe",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  <Dumbbell style={{ width: "14px", height: "14px" }} />
                  View
                </Link>
                <Link
                  href={`/coach/workout-plans/${p._id}/edit`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.8rem",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                    color: "#374151",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  <Edit style={{ width: "14px", height: "14px" }} />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(p._id)}
                  disabled={deleteMutation.isPending}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.8rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <Trash2 style={{ width: "14px", height: "14px" }} />
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "#6b7280",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              border: "1px dashed #e5e7eb",
            }}
          >
            <Dumbbell
              style={{
                width: "48px",
                height: "48px",
                color: "#d1d5db",
                margin: "0 auto 1rem",
              }}
            />
            <p style={{ margin: 0 }}>
              No workout plans found. Create your first workout plan!
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: currentPage === 1 ? "#f3f4f6" : "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft
              style={{ width: "18px", height: "18px", color: "#374151" }}
            />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  style={{
                    minWidth: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border:
                      page === currentPage ? "none" : "1px solid #e5e7eb",
                    backgroundColor: page === currentPage ? "#2563eb" : "#fff",
                    color: page === currentPage ? "#fff" : "#374151",
                    fontSize: "0.85rem",
                    fontWeight: page === currentPage ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={currentPage === pagination.totalPages}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor:
                currentPage === pagination.totalPages ? "#f3f4f6" : "#fff",
              cursor:
                currentPage === pagination.totalPages
                  ? "not-allowed"
                  : "pointer",
              opacity: currentPage === pagination.totalPages ? 0.5 : 1,
            }}
          >
            <ChevronRight
              style={{ width: "18px", height: "18px", color: "#374151" }}
            />
          </button>
        </div>
      )}
    </div>
  );
}
