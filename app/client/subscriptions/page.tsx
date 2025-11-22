"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CLIENT_SUBSCRIPTIONS_KEY,
  CURRENT_PLAN_KEY,
  useClientSubscriptions,
  useCurrentPlan,
} from "@/lib/queries/subscriptions";
import api from "@/lib/axios";
import { toast } from "sonner";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export default function ClientSubscriptionsPage() {
  const queryClient = useQueryClient();
  const {
    data: currentPlan,
    isLoading: loadingCurrent,
    error: currentError,
  } = useCurrentPlan();
  const {
    data: history = [],
    isLoading: loadingHistory,
    error: historyError,
  } = useClientSubscriptions();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const cancelSubscription = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/subscriptions/${id}/cancel`);
    },
    onMutate: (id) => {
      setCancellingId(id);
    },
    onSuccess: () => {
      toast.success("Subscription cancelled");
      queryClient.invalidateQueries({ queryKey: CLIENT_SUBSCRIPTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: CURRENT_PLAN_KEY });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message ?? "Unable to cancel subscription";
      toast.error(message);
    },
    onSettled: () => setCancellingId(null),
  });

  const handleCancel = (id: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }
    cancelSubscription.mutate(id);
  };

  if (loadingCurrent || loadingHistory) {
    return (
      <div className="client-page">
        <div className="client-page__inner">
          <div className="client-card">
            <p className="client-card__subtitle">Loading subscription details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentError || historyError) {
    return (
      <div className="client-page">
        <div className="client-page__inner">
          <div className="client-card">
            <p className="client-card__subtitle" style={{ color: "#dc2626" }}>
              Failed to load subscription details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasHistory = history.length > 0;

  return (
    <div className="client-page">
      <div className="client-page__inner">
        <header
          className="client-page__header"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
            width: "100%",
            textAlign: "left",
          }}
        >
          <div>
            <h1 className="client-page__title">My Subscriptions</h1>
            <p className="client-page__subtitle">
              Review your current plan, track pending requests, and view past subscriptions.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <a
              href="/client/plan"
              className="client-button"
              style={{ textDecoration: "none" }}
            >
              Explore Available Plans
            </a>
          </div>
        </header>

        <section className="client-page__sections">
          <h2 className="client-section-title">Current Plan</h2>
          <div className="client-card">
          {currentPlan ? (
            currentPlan.type === "subscription" ? (
              <div className="client-page__sections">
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.75rem", alignItems: "center" }}>
                  <div>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      Active Plan
                    </p>
                    <h3 className="client-card__title">
                      {currentPlan.subscription.planId?.title || currentPlan.subscription.planTitle || "Coach Plan"}
                    </h3>
                  </div>
                  <span className="client-pill" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                    Active Subscription
                  </span>
                </div>

                <div className="client-page__sections">
                  <div>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      Duration
                    </p>
                    <p className="client-card__subtitle" style={{ fontWeight: 600, color: "#111827" }}>
                      {currentPlan.subscription.durationWeeks ?? currentPlan.subscription.planId?.durationWeeks ?? "-"} weeks
                    </p>
                  </div>
                  <div>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      Billing
                    </p>
                    <p className="client-card__subtitle" style={{ fontWeight: 600, color: "#111827" }}>
                      Rs {(currentPlan.subscription.amount ?? currentPlan.subscription.planId?.price ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      Start Date
                    </p>
                    <p className="client-card__subtitle" style={{ fontWeight: 600, color: "#111827" }}>
                      {formatDate(currentPlan.subscription.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      End Date
                    </p>
                    <p className="client-card__subtitle" style={{ fontWeight: 600, color: "#111827" }}>
                      {formatDate(currentPlan.subscription.endDate)}
                    </p>
                  </div>
                </div>

                {currentPlan.subscription.planId?.description && (
                  <div className="client-card" style={{ backgroundColor: "#f9fafb" }}>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      Description
                    </p>
                    <p className="client-card__subtitle" style={{ marginTop: "0.25rem" }}>
                      {currentPlan.subscription.planId.description}
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => handleCancel(currentPlan.subscription._id)}
                    disabled={cancelSubscription.isPending && cancellingId === currentPlan.subscription._id}
                    className="client-button client-button--danger"
                    style={{ backgroundColor: "#ffffff", color: "#dc2626" }}
                  >
                    {cancelSubscription.isPending && cancellingId === currentPlan.subscription._id
                      ? "Cancelling..."
                      : "Cancel Subscription"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="client-page__sections">
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.75rem", alignItems: "center" }}>
                  <div>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      Default Plan
                    </p>
                    <h3 className="client-card__title">
                      {currentPlan.plan.title}
                    </h3>
                  </div>
                  <span className="client-pill">
                    Assigned Automatically
                  </span>
                </div>
                <div className="client-page__sections">
                  <div>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      Duration
                    </p>
                    <p className="client-card__subtitle" style={{ fontWeight: 600, color: "#111827" }}>
                      {currentPlan.plan.durationWeeks ?? "-"} weeks
                    </p>
                  </div>
                  <div>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      Cost
                    </p>
                    <p className="client-card__subtitle" style={{ fontWeight: 600, color: "#111827" }}>
                      Rs {(currentPlan.plan.price ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                {currentPlan.plan.description && (
                  <div className="client-card" style={{ backgroundColor: "#f9fafb" }}>
                    <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.78rem" }}>
                      Description
                    </p>
                    <p className="client-card__subtitle" style={{ marginTop: "0.25rem" }}>
                      {currentPlan.plan.description}
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <p className="client-card__subtitle">
              No plan information available yet. Once a coach assigns a default plan, it will appear here.
            </p>
          )}
          </div>
        </section>

        <section className="client-page__sections">
          <h2 className="client-section-title">Subscription History</h2>
          {hasHistory ? (
            <div className="client-table-wrapper">
              <table className="client-table">
                <thead>
                <tr>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((sub) => {
                  const planTitle = sub.planId?.title || sub.planTitle || "Coach Plan";
                  const isCurrentActive =
                    currentPlan?.type === "subscription" && currentPlan.subscription._id === sub._id;
                  const showCancel = sub.status === "pending" || (sub.status === "approved" && isCurrentActive);
                  return (
                    <tr key={sub._id}>
                      <td>
                        <div>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>{planTitle}</span>
                          {sub.planId?.goal && (
                            <span style={{ display: "block", fontSize: "0.78rem", color: "#6b7280" }}>
                              Goal: {sub.planId.goal}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{sub.status}</td>
                      <td>Rs {(sub.amount ?? 0).toFixed(2)}</td>
                      <td>{formatDate(sub.startDate)}</td>
                      <td>{formatDate(sub.endDate)}</td>
                      <td>{formatDate(sub.createdAt)}</td>
                      <td>
                        {showCancel && !isCurrentActive ? (
                          <button
                            type="button"
                            onClick={() => handleCancel(sub._id)}
                            disabled={cancelSubscription.isPending && cancellingId === sub._id}
                            className="client-button client-button--danger"
                            style={{ backgroundColor: "#ffffff", color: "#dc2626", padding: "0.3rem 0.7rem", fontSize: "0.78rem" }}
                          >
                            {cancelSubscription.isPending && cancellingId === sub._id ? "Cancelling..." : "Cancel"}
                          </button>
                        ) : isCurrentActive ? (
                          <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>Manage above</span>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          ) : (
            <p className="client-card__subtitle">
              You have not requested any plan changes yet. Explore available plans and subscribe to customise your journey.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
