// app/admin/diet-templates/create/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import DietTemplateForm from "@/components/admin/DietTemplateForm";

export default function AdminCreateDietTemplatePage() {
  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Create Diet Template</h1>
          <p className="admin-page-header__subtitle">
            Create a global diet template coaches can clone
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/diet-templates" className="btn btn--outline">
            Back
          </Link>
        </div>
      </section>

      <DietTemplateForm />
    </div>
  );
}
