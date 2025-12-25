// app/admin/workout-templates/create/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import WorkoutTemplateForm from "@/components/admin/WorkoutTemplateForm";

export default function AdminCreateWorkoutTemplatePage() {
  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Create Workout Template</h1>
          <p className="admin-page-header__subtitle">
            Create a global workout template coaches can clone
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/workout-templates" className="btn btn--outline">
            Back
          </Link>
        </div>
      </section>

      <WorkoutTemplateForm />
    </div>
  );
}
