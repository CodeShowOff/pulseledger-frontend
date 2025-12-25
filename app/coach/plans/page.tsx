// src/app/(coach)/plans/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import PlanList from "@/components/coach/PlanList";
import { Plus, CreditCard, ClipboardList, Dumbbell, Utensils } from "lucide-react";
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

          <Link
            href="/coach/subscriptions"
            className="btn btn--outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CreditCard className="btn__icon" /> Client Subscriptions
          </Link>

          <Link href="/coach/plans/create" className="btn btn--primary" style={{ marginLeft: "auto" }}>
            <Plus className="btn__icon" /> New Plan
          </Link>
        </div>
      </section>

      <div className="admin-card">
        <PlanList />
      </div>

      <section style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {/* Workout Plans */}
          <div
            className="admin-card"
            style={{ padding: "1.25rem", display: "flex", flexDirection: "column", minHeight: "200px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🏋️</span>
              <h2 className="admin-page-header__title" style={{ fontSize: "1rem", margin: 0 }}>
                Workout Plans
              </h2>
            </div>
            <p className="admin-page-header__subtitle" style={{ fontSize: "0.875rem", marginBottom: "1rem", flex: 1 }}>
              Create and manage workout plans for your clients.
            </p>
            <Link
              href="/coach/workout-plans"
              className="btn btn--primary"
              style={{ padding: "0.65rem 1.25rem", marginTop: "auto", width: "fit-content" }}
            >
              Manage Workouts
            </Link>
          </div>

          {/* Diet Plans */}
          <div
            className="admin-card"
            style={{ padding: "1.25rem", display: "flex", flexDirection: "column", minHeight: "200px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🥗</span>
              <h2 className="admin-page-header__title" style={{ fontSize: "1rem", margin: 0 }}>
                Diet Plans
              </h2>
            </div>
            <p className="admin-page-header__subtitle" style={{ fontSize: "0.875rem", marginBottom: "1rem", flex: 1 }}>
              Create and manage nutrition plans for your clients.
            </p>
            <Link
              href="/coach/diet-plans"
              className="btn btn--primary"
              style={{ padding: "0.65rem 1.25rem", marginTop: "auto", width: "fit-content" }}
            >
              Manage Diet Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Exercises and Food Items */}
      <section className="admin-page-header" style={{ marginTop: "2rem" }}>
        <h2 className="admin-page-header__title coach-page-header__title" style={{ fontSize: "1.5rem" }}>
          Custom Library
        </h2>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <Link
          href="/coach/exercises"
          className="admin-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textDecoration: "none",
            transition: "all 0.3s ease",
            cursor: "pointer",
            border: "2px solid transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#8b5cf6";
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Dumbbell size={48} style={{ color: "#8b5cf6", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem", color: "inherit" }}>
            Custom Exercises
          </h3>
          <p style={{ color: "#666", textAlign: "center", fontSize: "0.9rem" }}>
            Create and manage your own custom exercises
          </p>
        </Link>

        <Link
          href="/coach/food-items"
          className="admin-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textDecoration: "none",
            transition: "all 0.3s ease",
            cursor: "pointer",
            border: "2px solid transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#8b5cf6";
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Utensils size={48} style={{ color: "#8b5cf6", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem", color: "inherit" }}>
            Custom Food Items
          </h3>
          <p style={{ color: "#666", textAlign: "center", fontSize: "0.9rem" }}>
            Create and manage your own custom food items
          </p>
        </Link>
      </div>
    </div>
  );
}
