// src/app/(coach)/plans/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import PlanList from "@/components/coach/PlanList";
import { Plus, CreditCard } from "lucide-react";

export default function CoachPlansPage() {
  return (
    <div>
      <section className="admin-page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <h1 className="admin-page-header__title coach-page-header__title">My Plans</h1>
          <Link
            href="/coach/subscriptions"
            className="btn btn--primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <CreditCard className="btn__icon" /> Client Subscriptions
          </Link>
        </div>
        <div className="admin-page-header__actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="admin-page-header__subtitle coach-page-header__subtitle">
              Create and manage plans available to your clients.
            </p>
          </div>
          <Link
            href="/coach/plans/create"
            className="btn btn--primary"
          >
            <Plus className="btn__icon" /> New Plan
          </Link>
        </div>
      </section>

      <div className="admin-card">
        <PlanList />
      </div>
    </div>
  );
}
