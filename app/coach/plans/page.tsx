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
        <h1 className="admin-page-header__title coach-page-header__title">My Plans</h1>
        <div className="admin-page-header__actions">
          <Link
            href="/coach/plan-requests"
            className="btn btn--outline"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <ClipboardList className="btn__icon" /> Plan Requests
            {pendingCount > 0 && (
              <span
                style={{
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
                  lineHeight: 1,
                }}
              >
                {pendingCount > 99 ? "99+" : pendingCount}
              </span>
            )}
          </Link>

          <Link href="/coach/plans/create" className="btn btn--primary">
            <Plus className="btn__icon" /> New Plan
          </Link>

          <Link
            href="/coach/subscriptions"
            className="btn btn--outline"
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CreditCard className="btn__icon" /> Client Subscriptions
          </Link>
        </div>
      </section>

      <div className="admin-card">
        <PlanList />
      </div>
    </div>
  );
}
