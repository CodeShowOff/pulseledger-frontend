// app/coach/diet-plans/create/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DietPlanForm from "@/components/coach/DietPlanForm";

export default function CreateDietPlanPage() {
  const router = useRouter();

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

        <h1 className="admin-page-header__title">Create Diet Plan</h1>
        <p className="admin-page-header__description">
          Create a new diet and nutrition plan for your clients
        </p>
      </div>

      <DietPlanForm />
    </div>
  );
}
