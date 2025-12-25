// app/coach/workout-plans/create/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WorkoutPlanForm from "@/components/coach/WorkoutPlanForm";

export default function CreateWorkoutPlanPage() {
  return (
    <div>
      <section className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/coach/workout-plans"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18, color: "#374151" }} />
          </Link>
          <div>
            <h1 className="admin-page-header__title coach-page-header__title">
              Create Workout Plan
            </h1>
            <p className="admin-page-header__subtitle coach-page-header__subtitle">
              Build a custom workout plan for your clients
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <WorkoutPlanForm />
      </section>
    </div>
  );
}
