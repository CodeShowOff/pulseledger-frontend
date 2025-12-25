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
      {subscription && (subscription.status === "expired" || subscription.status === "trial" || (subscription.status === "active" && subscription.daysRemaining <= 3)) && (
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

      <section className="admin-page-header" style={{ marginBottom: "0.5rem" }}>
        <h1 className="admin-page-header__title coach-page-header__title" style={{ marginBottom: "0.5rem" }}>
          Coach Dashboard
        </h1>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
          <span className="navbar-modern__logo-text" style={{ fontSize: "1.3rem" }}>
            {user?.companyName || "PulseLedger"}
          </span>
        </div>
      </section>

      <section
        style={{
          marginTop: "1.25rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Earnings Dashboard */}
        <div className="admin-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", minHeight: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>💰</span>
            <h2 className="admin-page-header__title" style={{ fontSize: "1rem", margin: 0 }}>
              Earnings Dashboard
            </h2>
          </div>
          <p className="admin-page-header__subtitle" style={{ fontSize: "0.875rem", marginBottom: "1rem", flex: 1 }}>
            Track income from subscriptions and orders.
          </p>
          <a href="/coach/earnings" className="btn btn--primary" style={{ padding: "0.65rem 1.25rem", marginTop: "auto" }}>
            View Earnings
          </a>
        </div>

        {/* Referral Code */}
        <div className="admin-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", minHeight: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🔗</span>
              <h2 className="admin-page-header__title" style={{ fontSize: "1rem", margin: 0 }}>
                Referral Code
              </h2>
            </div>
            {publicProfileUrl && (
              <button
                type="button"
                className="btn btn--outline"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(publicProfileUrl);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            )}
          </div>
          <p className="admin-card__value" style={{ color: "var(--admin-color-primary-dark)", fontSize: "1.1rem", marginBottom: "0.5rem", fontWeight: 600 }}>
            {user?.referralCode || "Generating..."}
          </p>
          <p className="admin-page-header__subtitle" style={{ fontSize: "0.875rem", marginBottom: "1rem", flex: 1 }}>
            Share with clients to link to you.
          </p>
          {publicProfileUrl && (
            <a
              href={publicProfileUrl}
              rel="noopener noreferrer"
              className="btn btn--primary"
              style={{ padding: "0.65rem 1.25rem", marginTop: "auto" }}
            >
              Visit Public Profile
            </a>
          )}
        </div>

        {/* Platform Fee */}
        <div className="admin-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", minHeight: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>💳</span>
            <h2 className="admin-page-header__title" style={{ fontSize: "1rem", margin: 0 }}>
              Platform Fee
            </h2>
          </div>
          <p className="admin-card__value" style={{ color: "#10b981", fontSize: "1.1rem", marginBottom: "0.5rem", fontWeight: 600 }}>
            {subscription ? (
              <>
                {subscription.daysRemaining} Day{subscription.daysRemaining !== 1 ? "s" : ""} Left
              </>
            ) : (
              "Loading..."
            )}
          </p>
          <p className="admin-page-header__subtitle" style={{ fontSize: "0.875rem", marginBottom: "0.5rem", flex: 1 }}>
            Track subscription & renewals.
          </p>
          {subscription && subscription.totalPaid > 0 && (
            <p style={{ fontSize: "0.8rem", color: "var(--admin-color-muted)", marginBottom: "0.75rem" }}>
              Total Paid: ₹{subscription.totalPaid}
            </p>
          )}
          <Link
            href="/coach/platform-fee"
            className="btn btn--primary"
            style={{ padding: "0.65rem 1.25rem", marginTop: "auto" }}
          >
            Manage Fee
          </Link>
        </div>


        {/* Workout Plans */}
        <div className="admin-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", minHeight: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🏋️</span>
            <h2 className="admin-page-header__title" style={{ fontSize: "1rem", margin: 0 }}>
              Workout Plans
            </h2>
          </div>
          <p className="admin-page-header__subtitle" style={{ fontSize: "0.875rem", marginBottom: "1rem", flex: 1 }}>
            Create and manage workout plans for your clients.
          </p>
          <a href="/coach/workout-plans" className="btn btn--primary" style={{ padding: "0.65rem 1.25rem", marginTop: "auto" }}>
            Manage Workouts
          </a>
        </div>

        {/* Diet Plans */}
        <div className="admin-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", minHeight: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🥗</span>
            <h2 className="admin-page-header__title" style={{ fontSize: "1rem", margin: 0 }}>
              Diet Plans
            </h2>
          </div>
          <p className="admin-page-header__subtitle" style={{ fontSize: "0.875rem", marginBottom: "1rem", flex: 1 }}>
            Create and manage nutrition plans for your clients.
          </p>
          <a href="/coach/diet-plans" className="btn btn--primary" style={{ padding: "0.65rem 1.25rem", marginTop: "auto" }}>
            Manage Diet Plans
          </a>
        </div>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
          Quick Stats
        </h2>
        <CoachStats />
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
          Client Progress Overview
        </h2>
        <div className="admin-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
          <CoachChart />
        </div>
        <div style={{ padding: 0 }}>
          <CoachClientTable />
        </div>
      </section>
    </div>
  );
}
