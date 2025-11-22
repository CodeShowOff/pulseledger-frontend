"use client";

import React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PlanForm = dynamic(() => import("@/components/coach/PlanForm"), {
  loading: () => <div className="p-6 text-center">Loading form...</div>,
  ssr: false
});

export default function CoachPlanCreatePage() {
  const router = useRouter();

  return (
    <div>
      <section className="admin-page-header">
        <h1 className="admin-page-header__title coach-page-header__title">
          Create New Plan
        </h1>
        <p className="admin-page-header__subtitle coach-page-header__subtitle">
          Set up a new template or client-specific plan.
        </p>
      </section>

      <div className="admin-card">
        <PlanForm
          variant="page"
          onClose={() => router.push("/coach/plans")}
        />
      </div>
    </div>
  );
}
