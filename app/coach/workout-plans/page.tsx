// app/coach/workout-plans/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Plus, Dumbbell, FileText } from "lucide-react";
import WorkoutPlanList from "@/components/coach/WorkoutPlanList";

export default function CoachWorkoutPlansPage() {
  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title coach-page-header__title">
            Workout Plans
          </h1>
          <p className="admin-page-header__subtitle coach-page-header__subtitle">
            Create and manage workout plans for your clients
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link
            href="/coach/exercises"
            className="btn btn--outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Dumbbell className="btn__icon" style={{ width: 16, height: 16 }} />
            Custom Exercises
          </Link>
          <Link
            href="/coach/workout-plans/templates"
            className="btn btn--outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FileText className="btn__icon" style={{ width: 16, height: 16 }} />
            Browse Templates
          </Link>
          <Link
            href="/coach/workout-plans/create"
            className="btn btn--primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Plus className="btn__icon" style={{ width: 16, height: 16 }} />
            Create Plan
          </Link>
        </div>
      </section>

      <section
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "1.25rem",
          marginTop: "1.5rem",
        }}
      >
        <WorkoutPlanList />
      </section>
    </div>
  );
}
