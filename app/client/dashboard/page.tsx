// src/app/(client)/dashboard/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import ClientStats from "@/components/client/ClientStats";
import dynamic from "next/dynamic";
const ProgressCharts = dynamic(() => import("@/components/client/ProgressCharts"), { ssr: false });
import AssignedPlans from "@/components/client/AssignedPlans";
import { useMyCoachQuery } from "@/lib/queries/coach";
import RoleGuard from "@/components/shared/RoleGuard";

export default function ClientDashboardPage() {
  const { data: coach, isLoading } = useMyCoachQuery();

  return (
    <div className="client-page__sections">
      <RoleGuard role="client" />
      <header className="client-page__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
        <div style={{ flex: 1 }}>
          <h1 className="client-page__title">Your Dashboard</h1>
          <p className="client-page__subtitle">
            Keep an eye on your current plan, recent progress and coach.
          </p>
        </div>
        {!isLoading && coach && (
          <Link href="/client/coach" className="client-button" style={{ whiteSpace: "nowrap", flexShrink: 0, marginTop: "0.5rem" }}>
            View Coach Profile
          </Link>
        )}
      </header>

      <div
        className="client-page__sections"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        <div className="client-card client-card--highlight">
          <div className="client-card__header">
            <p className="client-card__title">💧 Water Intake Tracker</p>
            <p className="client-card__subtitle">
              Track your daily water intake and monitor hydration goals.
            </p>
          </div>
          <Link href="/client/water-intake" className="client-button">
            Track Water Intake
          </Link>
        </div>

        <div className="client-card client-card--highlight">
          <div className="client-card__header">
            <p className="client-card__title">Indian Food Nutrition Index</p>
            <p className="client-card__subtitle">
              Search macros and micros for popular Indian dishes.
            </p>
          </div>
          <Link href="/indian-nutrition-index" className="client-button">
            🥗 Open Nutrition Index
          </Link>
        </div>

        <div className="client-card client-card--highlight">
          <div className="client-card__header">
            <p className="client-card__title">Daily Calorie Calculator</p>
            <p className="client-card__subtitle">
              Estimate your daily calorie needs and suggested macros.
            </p>
          </div>
          <Link href="/calorie-calculator" className="client-button">
            🧮 Open Calorie Calculator
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="client-card client-card--highlight">
          <p className="client-card__subtitle">Checking coach assignment...</p>
        </div>
      ) : coach ? null : (
        <div className="client-card">
          <p className="client-card__subtitle">
            You do not have a coach assigned yet. Once a coach is linked to your account, their details will appear here.
          </p>
        </div>
      )}

      <div className="client-card">
        <ClientStats />
      </div>

      <div className="client-page__sections">
        <div className="client-card">
          <ProgressCharts />
        </div>
        <div className="client-card">
          <AssignedPlans />
        </div>
      </div>
    </div>
  );
}
