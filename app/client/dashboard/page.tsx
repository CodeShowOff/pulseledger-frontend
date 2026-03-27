// src/app/(client)/dashboard/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import ClientStats from "@/components/client/ClientStats";
import dynamic from "next/dynamic";
const ProgressCharts = dynamic(() => import("@/components/client/ProgressCharts"), { ssr: false });
import AssignedPlans from "@/components/client/AssignedPlans";
import WaterIntakeWidget from "@/components/client/WaterIntakeWidget";
import GoalWeightWidget from "@/components/client/GoalWeightWidget";
import { useMyCoachQuery } from "@/lib/queries/coach";
import RoleGuard from "@/components/shared/RoleGuard";
import styles from "./dashboard.module.css";

export default function ClientDashboardPage() {
  const { data: coach, isLoading } = useMyCoachQuery();

  return (
    <div className={`client-page__sections ${styles.dashboardRoot}`}>
      <RoleGuard role="client" />
      <header className="client-page__header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h1 className="client-page__title">Your Dashboard</h1>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {!isLoading && coach && (
              <Link href="/client/coach" className="client-button" style={{ whiteSpace: "nowrap" }}>
                View Coach Profile
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Company Name Display */}
      {!isLoading && (
        <div className={styles.brandRow}>
          <span className={`navbar-modern__logo-text ${styles.brandText}`}>
            {coach?.companyName || "FitCoach"}
          </span>
        </div>
      )}

      {/* Water Intake and Goal Weight Widgets - Same Row */}
      <div className={styles.widgetsGrid}>
        <WaterIntakeWidget />
        <GoalWeightWidget />
      </div>

      {/* Workout and Diet Quick Access - Same Row */}
      <div className={styles.quickAccessGrid}>
        <div className={`client-card client-card--highlight ${styles.quickCard}`}>
          <div className={`client-card__header ${styles.quickCardHeader}`}>
            <div className={styles.quickCardTitleRow}>
              <span className={styles.quickCardEmoji}>💪</span>
              <p className={`client-card__title ${styles.quickCardTitle}`}>Today's Workout</p>
            </div>
            <p className="client-card__subtitle">
              View today's workout plan and track your progress.
            </p>
          </div>
          <Link 
            href="/client/workouts/today" 
            className={`client-button ${styles.quickCardAction}`}
          >
            View Today's Workout
          </Link>
        </div>

        <div className={`client-card client-card--highlight ${styles.quickCard}`}>
          <div className={`client-card__header ${styles.quickCardHeader}`}>
            <div className={styles.quickCardTitleRow}>
              <span className={styles.quickCardEmoji}>🥗</span>
              <p className={`client-card__title ${styles.quickCardTitle}`}>Today's Nutrition</p>
            </div>
            <p className="client-card__subtitle">
              Track today's meals and stay on top of your nutrition goals.
            </p>
          </div>
          <Link 
            href="/client/diet/today" 
            className={`client-button ${styles.quickCardAction}`}
          >
            View Today's Nutrition
          </Link>
        </div>
      </div>

      {/* Nutrition Index and Calorie Calculator - Same Row */}
      <div className={styles.quickAccessGrid}>
        <div className={`client-card client-card--highlight ${styles.quickCard}`}>
          <div className={`client-card__header ${styles.quickCardHeader}`}>
            <div className={styles.quickCardTitleRow}>
              <span className={styles.quickCardEmoji}>📊</span>
              <p className={`client-card__title ${styles.quickCardTitle}`}>Indian Food Nutrition Index</p>
            </div>
            <p className="client-card__subtitle">
              Search macros and micros for popular Indian dishes.
            </p>
          </div>
          <Link 
            href="/indian-nutrition-index" 
            className={`client-button ${styles.quickCardAction}`}
          >
            Open Nutrition Index
          </Link>
        </div>

        <div className={`client-card client-card--highlight ${styles.quickCard}`}>
          <div className={`client-card__header ${styles.quickCardHeader}`}>
            <div className={styles.quickCardTitleRow}>
              <span className={styles.quickCardEmoji}>🧮</span>
              <p className={`client-card__title ${styles.quickCardTitle}`}>Daily Calorie Calculator</p>
            </div>
            <p className="client-card__subtitle">
              Estimate your daily calorie needs and suggested macros.
            </p>
          </div>
          <Link 
            href="/calorie-calculator" 
            className={`client-button ${styles.quickCardAction}`}
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
      <AssignedPlans />

      {/* Quick Stats */}
      <div className="client-card">
        <ClientStats />
      </div>

      {/* Progress Charts */}
      <ProgressCharts />
    </div>
  );
}
