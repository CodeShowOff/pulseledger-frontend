// app/coach/diet-plans/[id]/edit/page.tsx
"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DietPlanForm from "@/components/coach/DietPlanForm";
import { useCoachDietPlan } from "@/lib/queries/diet";

export default function EditDietPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params?.id as string;

  const { data: plan, isLoading, error } = useCoachDietPlan(planId);

  if (isLoading) {
    return (
      <div className="admin-page" style={{ padding: "2rem", textAlign: "center" }}>
        Loading plan...
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="admin-page" style={{ padding: "2rem", textAlign: "center" }}>
        Plan not found
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
          Back
        </button>

        <h1 className="admin-page-header__title">Edit Diet Plan</h1>
        <p className="admin-page-header__description">
          Update your diet and nutrition plan
        </p>
      </div>

      <DietPlanForm plan={plan} />
    </div>
  );
}
