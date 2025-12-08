"use client";

import { useAuthStore } from "@/lib/store";
import CoachStats from "@/components/coach/CoachStats";
import CoachClientTable from "@/components/coach/CoachClientTable";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/shared/RoleGuard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import SubscriptionWarningPopup from "@/components/coach/SubscriptionWarningPopup";

const CoachChart = dynamic(() => import("@/components/coach/CoachChart"), {
  loading: () => <div className="p-6 text-center">Loading chart...</div>,
  ssr: false
});

interface SubscriptionStatus {
  status: "trial" | "active" | "expired" | "suspended";
  isValid: boolean;
  daysRemaining: number;
  trialEndsAt: string;
  subscriptionExpiresAt: string | null;
  platformFee: number;
  totalPaid: number;
}

export default function CoachDashboard() {
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  // Fetch subscription status
  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["platformSubscription"],
    queryFn: async () => {
      const res = await api.get("/platform-subscription/status");
      return res.data.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const publicProfileUrl =
    typeof window !== "undefined" && user?.referralCode
      ? `${window.location.origin}/public/${encodeURIComponent(user.referralCode)}`
      : "";

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div>
      <RoleGuard role="coach" />
      <SubscriptionWarningPopup />

      {/* Subscription Status Banner */}
      {subscription && (subscription.daysRemaining <= 28 || subscription.status === "expired") && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.5rem",
            borderRadius: "0.75rem",
            border: "2px solid",
            borderColor: subscription.status === "expired" ? "#ef4444" : subscription.daysRemaining <= 3 ? "#ef4444" : subscription.daysRemaining <= 7 ? "#f59e0b" : "#3b82f6",
            backgroundColor: subscription.status === "expired" ? "#fee2e2" : subscription.daysRemaining <= 3 ? "#fee2e2" : subscription.daysRemaining <= 7 ? "#fef3c7" : "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {subscription.status === "expired" ? (
              <AlertCircle style={{ width: 28, height: 28, color: "#dc2626", flexShrink: 0 }} />
            ) : (
              <Clock style={{ width: 28, height: 28, color: subscription.daysRemaining <= 3 ? "#dc2626" : subscription.daysRemaining <= 7 ? "#d97706" : "#2563eb", flexShrink: 0 }} />
            )}
            <div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                  color: subscription.status === "expired" ? "#991b1b" : subscription.daysRemaining <= 3 ? "#991b1b" : subscription.daysRemaining <= 7 ? "#92400e" : "#1e40af",
                }}
              >
                {subscription.status === "expired"
                  ? "Subscription Expired"
                  : subscription.status === "trial"
                  ? `Free Trial Ends in ${subscription.daysRemaining} Day${subscription.daysRemaining !== 1 ? "s" : ""}`
                  : `Subscription Expires in ${subscription.daysRemaining} Day${subscription.daysRemaining !== 1 ? "s" : ""}`}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: subscription.status === "expired" ? "#7f1d1d" : subscription.daysRemaining <= 3 ? "#7f1d1d" : subscription.daysRemaining <= 7 ? "#78350f" : "#1e3a8a",
                }}
              >
                {subscription.status === "expired"
                  ? `Pay ₹${subscription.platformFee} to restore platform access`
                  : `Pay ₹${subscription.platformFee} now to avoid service interruption`}
              </p>
            </div>
          </div>
          <Link
            href="/coach/platform-subscription"
            className="btn btn--primary"
            style={{
              backgroundColor: subscription.status === "expired" || subscription.daysRemaining <= 3 ? "#dc2626" : subscription.daysRemaining <= 7 ? "#d97706" : "#2563eb",
              borderColor: subscription.status === "expired" || subscription.daysRemaining <= 3 ? "#dc2626" : subscription.daysRemaining <= 7 ? "#d97706" : "#2563eb",
              whiteSpace: "nowrap",
            }}
          >
            {subscription.status === "expired" ? "Pay Now" : "Manage Subscription"}
          </Link>
        </div>
      )}

      <section className="admin-page-header">
        <h1 className="admin-page-header__title coach-page-header__title">
          Coach Dashboard
        </h1>
        <p className="admin-page-header__subtitle coach-page-header__subtitle">
          Overview of your clients, plans, and performance.
        </p>
      </section>

      <section
        style={{
          marginTop: "1.25rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        <div className="admin-card" style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
          <h2
            className="admin-page-header__title"
            style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}
          >
            💰 Earnings Dashboard
          </h2>
          <p className="admin-page-header__subtitle" style={{ marginBottom: "0.9rem", flex: 1 }}>
            Track your income from subscriptions and product orders.
          </p>
          <a href="/coach/earnings" className="btn btn--primary">
            View Earnings
          </a>
        </div>

        <div className="admin-card" style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
          <h2
            className="admin-page-header__title"
            style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}
          >
            🥗 Indian Food Nutrition Index
          </h2>
          <p className="admin-page-header__subtitle" style={{ marginBottom: "0.9rem", flex: 1 }}>
            Search macros and micros for popular Indian dishes.
          </p>
          <a href="/indian-nutrition-index" className="btn btn--primary">
            Open Nutrition Index
          </a>
        </div>

        <div className="admin-card" style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
          <h2
            className="admin-page-header__title"
            style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}
          >
            🧮 Daily Calorie Calculator
          </h2>
          <p className="admin-page-header__subtitle" style={{ marginBottom: "0.9rem", flex: 1 }}>
            Estimate your daily calorie needs and suggested macros.
          </p>
          <a href="/calorie-calculator" className="btn btn--primary">
            Open Calorie Calculator
          </a>
        </div>
      </section>

      {user?.role === "coach" && (
        <section style={{ marginTop: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            <div className="admin-card" style={{ borderLeft: "4px solid var(--admin-color-primary)" }}>
              <p className="admin-card__label">Your Referral Code</p>
              <p className="admin-card__value" style={{ color: "var(--admin-color-primary-dark)", fontSize: "1.1rem" }}>
                {user.referralCode || "Generating..."}
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--admin-color-muted)", marginTop: "0.35rem" }}>
                Share this code with clients so they automatically link to you during registration.
              </p>
              {publicProfileUrl && (
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(publicProfileUrl);
                        setCopied(true);
                      } catch {
                        setCopied(false);
                      }
                    }}
                  >
                    {copied ? "Link copied!" : "Copy public profile link"}
                  </button>
                  <a
                    href={publicProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary"
                  >
                    Visit Public Profile
                  </a>
                  <span style={{ fontSize: "0.75rem", color: "var(--admin-color-muted)" }}>
                    {publicProfileUrl}
                  </span>
                </div>
              )}
            </div>

            <div className="admin-card" style={{ borderLeft: "4px solid #10b981" }}>
              <p className="admin-card__label">Platform Fee Management</p>
              <p className="admin-card__value" style={{ color: "#10b981", fontSize: "1.1rem" }}>
                {subscription ? (
                  <>
                    {subscription.daysRemaining} Day{subscription.daysRemaining !== 1 ? "s" : ""} Left
                  </>
                ) : (
                  "Loading..."
                )}
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--admin-color-muted)", marginTop: "0.35rem" }}>
                Track your platform subscription payments, history, and renewal dates.
              </p>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Link
                  href="/coach/platform-fee"
                  className="btn btn--primary"
                  style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                >
                  💳 Manage Platform Fee
                </Link>
                {subscription && subscription.totalPaid > 0 && (
                  <span style={{ fontSize: "0.75rem", color: "var(--admin-color-muted)", alignSelf: "center" }}>
                    Total Paid: ₹{subscription.totalPaid}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section style={{ marginTop: "1.5rem" }}>
        <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
          Quick Stats
        </h2>
        <div className="admin-card-grid admin-card-grid--stats">
          <CoachStats />
        </div>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <div className="admin-card-grid">
          <div className="admin-card coach-card--stat">
            <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
              Client Progress Overview
            </h2>
            <CoachChart />
          </div>
          <div className="coach-card--stat" style={{ padding: 0 }}>
            <CoachClientTable />
          </div>
        </div>
      </section>
    </div>
  );
}
