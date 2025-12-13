// src/app/(coach)/plans/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import PlanList from "@/components/coach/PlanList";
import { Plus, CreditCard, ClipboardList } from "lucide-react";
import { useCoachPendingPlanRequests } from "@/lib/queries/planRequests";

export default function CoachPlansPage() {
  const { data: pendingRequests = [] } = useCoachPendingPlanRequests();
  const pendingCount = pendingRequests.length;

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
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Link
              href="/coach/plan-requests"
              className="btn btn--outline"
              style={{ 
                position: "relative",
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.5rem" 
              }}
            >
              <ClipboardList className="btn__icon" /> 
              Plan Requests
              {pendingCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "9999px",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                  padding: "0.15rem 0.4rem",
                  minWidth: "20px",
                  textAlign: "center",
                  border: "2px solid white",
                  lineHeight: 1
                }}>
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
            <Link
              href="/coach/plans/create"
              className="btn btn--primary"
            >
              <Plus className="btn__icon" /> New Plan
            </Link>
          </div>
        </div>
      </section>

      <div className="admin-card">
        <PlanList />
      </div>
    </div>
  );
}
