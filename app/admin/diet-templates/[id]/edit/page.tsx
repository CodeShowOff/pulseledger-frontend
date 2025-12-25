// app/admin/diet-templates/[id]/edit/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DietTemplateForm from "@/components/admin/DietTemplateForm";
import { useDietTemplate } from "@/lib/queries/diet";

export default function AdminEditDietTemplatePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: template, isLoading, isError } = useDietTemplate(id);

  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Edit Diet Template</h1>
          <p className="admin-page-header__subtitle">
            Update the template meals and guidance
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/diet-templates" className="btn btn--outline">
            Back
          </Link>
        </div>
      </section>

      {isLoading ? (
        <div className="admin-card">Loading template...</div>
      ) : isError || !template ? (
        <div className="admin-card">Failed to load template.</div>
      ) : (
        <DietTemplateForm template={template} />
      )}
    </div>
  );
}
