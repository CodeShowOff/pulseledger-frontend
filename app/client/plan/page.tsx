"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CLIENT_PLANS_KEY, useClientPlans } from "@/lib/queries/plans";
import {
  CLIENT_SUBSCRIPTIONS_KEY,
  CURRENT_PLAN_KEY,
  useClientSubscriptions,
  useCurrentPlan,
} from "@/lib/queries/subscriptions";
import {
  CLIENT_PLAN_REQUESTS_KEY,
  useClientPlanRequests,
} from "@/lib/queries/planRequests";
import api from "@/lib/axios";

export default function MyPlanPage() {
  const { data: plans = [], isLoading, error } = useClientPlans();
  const { data: currentPlan } = useCurrentPlan();
  const { data: subscriptions = [] } = useClientSubscriptions();
  const { data: planRequests = [] } = useClientPlanRequests();
  const queryClient = useQueryClient();

  // One-click request: removing modal state

  const templates = plans; // All plans are subscription plans

  const personalPlans: typeof plans = []; // No more personal plans

  const selectedPlan = null; // modal removed

  const activePlanId = useMemo(() => {
    if (!currentPlan) return null;
    if (currentPlan.type === "subscription") {
      return currentPlan.subscription.planId?._id || null;
    }
    if (currentPlan.type === "default") {
      return templates.find((plan) => plan.isDefault)?._id || null;
    }
    return null;
  }, [currentPlan, templates]);

  const pendingPlanIds = useMemo(() => {
    // Track pending by either existing pending subscription OR pending plan request
    const ids = new Set<string>();
    subscriptions
      .filter((sub) => sub.status === "pending" && sub.planId?._id)
      .forEach((sub) => ids.add(sub.planId!._id));
    planRequests
      .filter((req) => req.status === "pending" && req.planId?._id)
      .forEach((req) => ids.add(req.planId!._id));
    return ids;
  }, [subscriptions, planRequests]);

  const createPlanRequest = useMutation({
    mutationFn: async (planId: string) => {
      // No longer directly submitting - redirect to payment page instead
      return planId;
    },
    onSuccess: (planId: string) => {
      // Redirect to payment page
      window.location.href = `/client/plan-payment/${planId}`;
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message ?? "Unable to proceed";
      toast.error(message);
    },
  });

  const handleRequest = (planId: string) => {
    createPlanRequest.mutate(planId);
  };

  // Modal submit removed

  if (isLoading) {
    return (
      <div className="client-page">
        <div className="client-page__inner">
          <div className="client-card">
            <p className="client-card__subtitle">Loading plans...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-page">
        <div className="client-page__inner">
          <div className="client-card">
            <p className="client-card__subtitle" style={{ color: "#dc2626" }}>
              Failed to load available plans.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="client-page">
      <div className="client-page__inner">
        <header className="client-page__header">
          <h1 className="client-page__title">Available Plans</h1>
          <p className="client-page__subtitle">
            Choose a plan that suits your goals. Requests are reviewed by your coach before activation.
          </p>
        </header>

        {personalPlans.length ? (
          <section className="client-page__sections">
            <h2 className="client-section-title">My Assigned Plans</h2>
            {personalPlans.map((plan) => (
              <div key={plan._id} className="client-card">
                <div className="client-card__header">
                  <h3 className="client-card__title">{plan.title}</h3>
                  {plan.status && (
                    <span className="client-pill">Status: {plan.status}</span>
                  )}
                </div>
                {plan.description && (
                  <p className="client-card__subtitle">{plan.description}</p>
                )}
                <div className="client-meta-row">
                  <span>Duration: {plan.durationWeeks ?? "-"} weeks</span>
                  {plan.startDate && (
                    <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                  )}
                </div>
                {plan.tasks?.length ? (
                  <div style={{ marginTop: "0.75rem" }}>
                    <p className="client-section-title" style={{ fontSize: "0.8rem" }}>
                      Tasks Overview
                    </p>
                    <ul style={{ marginTop: "0.3rem", paddingLeft: "1rem" }}>
                      {plan.tasks.slice(0, 3).map((task, index) => (
                        <li key={`${plan._id}-task-${index}`} className="client-card__subtitle">
                          - {task.title}
                        </li>
                      ))}
                      {plan.tasks.length > 3 && (
                        <li className="client-card__subtitle" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                          +{plan.tasks.length - 3} more tasks
                        </li>
                      )}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}

        {templates.length ? (
          <section className="client-page__sections">
            {templates.map((plan) => {
            const price = typeof plan.price === "number" ? plan.price : Number(plan.price ?? 0);
            const isActive = activePlanId === plan._id;
            const isPending = pendingPlanIds.has(plan._id);
            const buttonLabel = isActive
              ? "Current Plan"
              : isPending
              ? "Awaiting Approval"
              : "Request Plan";

            return (
              <div key={plan._id} className="client-card">
                <div className="client-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div>
                    <h3 className="client-card__title">{plan.title}</h3>
                    {plan.goal && (
                      <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.75rem", color: "#1d4ed8" }}>
                        Goal: {plan.goal}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                    {plan.isDefault && (
                      <span className="client-pill">Default Plan</span>
                    )}
                    <span className="client-card__subtitle" style={{ fontWeight: 600, color: "#111827" }}>
                      Rs {price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {plan.description && (
                  <p className="client-card__subtitle">{plan.description}</p>
                )}

                <div className="client-meta-row">
                  <span>Duration: {plan.durationWeeks ?? "-"} weeks</span>
                  <span>Coach: {plan.coachId?.fullName ?? "-"}</span>
                </div>

                <button
                  type="button"
                  disabled={isActive || isPending || createPlanRequest.isPending}
                  onClick={() => handleRequest(plan._id)}
                  className={
                    "client-button" +
                    (isActive
                      ? ""
                      : isPending
                      ? ""
                      : "")
                  }
                  style={
                    isActive
                      ? { backgroundColor: "#ecfdf5", borderColor: "#22c55e", color: "#15803d", width: "100%", marginTop: "0.85rem" }
                      : isPending
                      ? { backgroundColor: "#fef9c3", borderColor: "#f59e0b", color: "#92400e", width: "100%", marginTop: "0.85rem" }
                      : { width: "100%", marginTop: "0.85rem" }
                  }
                >
                  {isActive || isPending ? buttonLabel : createPlanRequest.isPending ? "Requesting..." : buttonLabel}
                </button>
              </div>
            );
          })}
          </section>
        ) : (
          <p className="client-card__subtitle">
            Your coach has not published any shared plans yet. Please check back later or contact your coach.
          </p>
        )}

        {/* Plan request history */}
        {planRequests.length ? (
          <section className="client-page__sections">
            <h2 className="client-section-title">My Plan Requests</h2>
            {planRequests.map((req) => {
              const statusStyles: Record<string, string> = {
                pending: "#f59e0b",
                approved: "#16a34a",
                declined: "#dc2626",
              };
              return (
                <div key={req._id} className="client-card">
                  <div className="client-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div>
                      <p className="client-card__title">{req.planId?.title ?? "Plan removed"}</p>
                      <p className="client-card__subtitle" style={{ fontSize: "0.8rem" }}>
                        Requested {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      {req.notes && (
                        <p className="client-card__subtitle" style={{ marginTop: "0.3rem" }}>
                          Notes: {req.notes}
                        </p>
                      )}
                    </div>
                    <span
                      className="client-pill"
                      style={{
                        backgroundColor: "#f1f5f9",
                        color: statusStyles[req.status] || "#4b5563",
                      }}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>
        ) : null}

        {/* Modal removed for one-click plan requests */}
      </div>
    </div>
  );
}
