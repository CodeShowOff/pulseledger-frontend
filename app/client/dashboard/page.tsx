// src/app/(client)/dashboard/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import ClientStats from "@/components/client/ClientStats";
import dynamic from "next/dynamic";
const ProgressCharts = dynamic(() => import("@/components/client/ProgressCharts"), { ssr: false });
import AssignedPlans from "@/components/client/AssignedPlans";
import WaterIntakeWidget from "@/components/client/WaterIntakeWidget";
import { useMyCoachQuery } from "@/lib/queries/coach";
import RoleGuard from "@/components/shared/RoleGuard";

export default function ClientDashboardPage() {
  const { data: coach, isLoading } = useMyCoachQuery();

  return (
    <div className="client-page__sections">
      <RoleGuard role="client" />
      <header className="client-page__header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h1 className="client-page__title">Your Dashboard</h1>
          {!isLoading && coach && (
            <Link href="/client/coach" className="client-button" style={{ whiteSpace: "nowrap" }}>
              View Coach Profile
            </Link>
          )}
        </div>
        <p className="client-page__subtitle">
          Keep an eye on your current plan, recent progress and coach.
        </p>
      </header>

      {/* Water Intake Widget - Full Width */}
      <WaterIntakeWidget />

      {/* Nutrition Index and Calorie Calculator - Same Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <div className="client-card client-card--highlight" style={{ display: "flex", flexDirection: "column" }}>
          <div className="client-card__header" style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2rem" }}>🥗</span>
              <p className="client-card__title" style={{ margin: 0 }}>Indian Food Nutrition Index</p>
            </div>
            <p className="client-card__subtitle">
              Search macros and micros for popular Indian dishes.
            </p>
          </div>
          <Link 
            href="/indian-nutrition-index" 
            className="client-button"
            style={{ 
              marginTop: "auto",
              textAlign: "center",
              padding: "0.65rem 1.5rem",
              fontSize: "0.9rem"
            }}
          >
            Open Nutrition Index
          </Link>
        </div>

        <div className="client-card client-card--highlight" style={{ display: "flex", flexDirection: "column" }}>
          <div className="client-card__header" style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2rem" }}>🧮</span>
              <p className="client-card__title" style={{ margin: 0 }}>Daily Calorie Calculator</p>
            </div>
            <p className="client-card__subtitle">
              Estimate your daily calorie needs and suggested macros.
            </p>
          </div>
          <Link 
            href="/calorie-calculator" 
            className="client-button"
            style={{ 
              marginTop: "auto",
              textAlign: "center",
              padding: "0.65rem 1.5rem",
              fontSize: "0.9rem"
            }}
          >
            Open Calorie Calculator
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

      {/* Your Current Plan */}
      <div className="client-card">
        <AssignedPlans />
      </div>

      {/* Quick Stats */}
      <div className="client-card">
        <ClientStats />
      </div>

      {/* Progress Charts */}
      <div className="client-card">
        <ProgressCharts />
      </div>
    </div>
  );
}
