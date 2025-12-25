// app/admin/workout-templates/[id]/edit/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import WorkoutTemplateForm from "@/components/admin/WorkoutTemplateForm";
import { useWorkoutTemplate } from "@/lib/queries/workouts";

export default function AdminEditWorkoutTemplatePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: template, isLoading, isError } = useWorkoutTemplate(id);

  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Edit Workout Template</h1>
          <p className="admin-page-header__subtitle">
            Update the template and weekly schedule
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/workout-templates" className="btn btn--outline">
            Back
          </Link>
        </div>
      </section>

      {isLoading ? (
        <div className="admin-card">Loading template...</div>
      ) : isError || !template ? (
        <div className="admin-card">Failed to load template.</div>
      ) : (
        <WorkoutTemplateForm template={template} />
      )}
    </div>
  );
}
