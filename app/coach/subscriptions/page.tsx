"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useCoachPendingPlanRequests } from "@/lib/queries/planRequests";

const STATUS_KEYS = ["approved", "pending", "rejected", "expired", "cancelled"] as const;

type CoachSubscription = {
  _id: string;
  status: (typeof STATUS_KEYS)[number];
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  planTitle?: string;
  planId?: {
    _id: string;
    title: string;
  } | null;
  clientId?: {
    _id: string;
    fullName?: string;
    email?: string;
  } | null;
};

type PlanAggregate = {
  planKey: string;
  planId?: string | null;
  title: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  expired: number;
  cancelled: number;
};

type AssignmentAggregate = {
  planKey: string;
  title: string;
  type: "subscription" | "default" | "none";
  count: number;
};

type CoachSubscriptionsResponse = {
  success: boolean;
  data: CoachSubscription[];
  summary?: {
    totals: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
      expired: number;
      cancelled: number;
    };
    planCounts: PlanAggregate[];
    assignments: AssignmentAggregate[];
  };
};

const EMPTY_TOTALS = {
  total: 0,
  approved: 0,
  pending: 0,
  rejected: 0,
  expired: 0,
  cancelled: 0,
};

export default function CoachSubscriptionsPage() {
  const { data, isLoading, error } = useQuery<CoachSubscriptionsResponse>({
    queryKey: ["coachSubscriptions"],
    queryFn: async () => {
      const res = await api.get("/subscriptions/coach");
      return res.data as CoachSubscriptionsResponse;
    },
  });

  const subscriptions = data?.data ?? [];
  const { data: pendingRequests = [] } = useCoachPendingPlanRequests();

  const fallbackTotals = useMemo(() => {
    const base = subscriptions.reduce((acc, sub) => {
      acc.total += 1;
      if (STATUS_KEYS.includes(sub.status)) acc[sub.status] += 1;
      return acc;
    }, { ...EMPTY_TOTALS });
    // Include pending plan requests that are not yet subscriptions
    base.total += pendingRequests.length;
    base.pending += pendingRequests.length;
    return base;
  }, [subscriptions, pendingRequests]);

  const fallbackPlanSummary = useMemo<PlanAggregate[]>(() => {
    const map = new Map<string, PlanAggregate>();
    // Subscriptions summary
    subscriptions.forEach((sub) => {
      const key = sub.planId?._id ?? "unassigned";
      const title = sub.planId?.title ?? sub.planTitle ?? "Plan removed";
      if (!map.has(key)) {
        map.set(key, { planKey: key, planId: sub.planId?._id ?? null, title, total: 0, approved: 0, pending: 0, rejected: 0, expired: 0, cancelled: 0 });
      }
      const entry = map.get(key)!;
      entry.total += 1;
      if (STATUS_KEYS.includes(sub.status)) entry[sub.status] += 1;
    });
    // Pending plan requests summary augment
    pendingRequests.forEach((req: any) => {
      const key = req.planId?._id ?? "unassigned";
      const title = req.planId?.title ?? "Plan removed";
      if (!map.has(key)) {
        map.set(key, { planKey: key, planId: req.planId?._id ?? null, title, total: 0, approved: 0, pending: 0, rejected: 0, expired: 0, cancelled: 0 });
      }
      const entry = map.get(key)!;
      entry.total += 1; // count request in total
      entry.pending += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [subscriptions, pendingRequests]);

  const planSummary = data?.summary?.planCounts?.length
    ? (() => {
        // Start with backend counts then augment with pending requests
        const base = data.summary.planCounts.map((p) => ({ ...p }));
        if (pendingRequests.length) {
          pendingRequests.forEach((req: any) => {
            const key = req.planId?._id ?? "unassigned";
            const title = req.planId?.title ?? "Plan removed";
            const existing = base.find((b) => b.planKey === key);
            if (existing) {
              existing.total += 1;
              existing.pending += 1;
            } else {
              base.push({
                planKey: key,
                planId: req.planId?._id ?? null,
                title,
                total: 1,
                approved: 0,
                pending: 1,
                rejected: 0,
                expired: 0,
                cancelled: 0,
              });
            }
          });
        }
        return base.sort((a, b) => b.total - a.total);
      })()
    : fallbackPlanSummary;

  const summaryStats = (() => {
    const base = data?.summary?.totals ? { ...data.summary.totals } : { ...fallbackTotals };
    if (pendingRequests.length) {
      // If backend already includes pending they would appear; we detect by comparing pending count
      const backendPending = data?.summary?.totals?.pending ?? 0;
      // Assume backend totals do NOT include plan requests (current behavior). If future backend includes them, prevent double count.
      if (backendPending < pendingRequests.length || !data?.summary?.totals) {
        base.total += pendingRequests.length;
        base.pending += pendingRequests.length;
      }
    }
    return base;
  })();
  const planAssignments = data?.summary?.assignments ?? [];

  if (isLoading) {
    return <p>Loading subscriptions...</p>;
  }

  if (error) {
    return <p className="text-red-600">Failed to load subscriptions.</p>;
  }

  return (
    <div>
      <section className="admin-page-header">
        <h1 className="admin-page-header__title coach-page-header__title">Client Subscriptions</h1>
        <div className="admin-page-header__actions">
          <Link
            href="/coach/plan-requests"
            className="btn btn--outline"
          >
            View Plan Requests
          </Link>
        </div>
      </section>

      <div className="admin-card-grid admin-card-grid--stats">
        <div className="admin-card admin-card--stat">
          <p className="admin-card__label">Total Requests</p>
          <p className="admin-card__value">{summaryStats.total}</p>
        </div>
        <div className="admin-card admin-card--stat">
          <p className="admin-card__label">Approved</p>
          <p className="admin-card__value">{summaryStats.approved}</p>
        </div>
        <div className="admin-card admin-card--stat">
          <p className="admin-card__label">Pending</p>
          <p className="admin-card__value">{summaryStats.pending}</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        {planSummary.length ? (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Total</th>
                  <th>Approved</th>
                  <th>Pending</th>
                  <th>Rejected</th>
                  <th>Expired</th>
                  <th>Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {planSummary.map((plan) => (
                  <tr key={plan.planKey}>
                    <td>{plan.title}</td>
                    <td>{plan.total}</td>
                    <td>{plan.approved}</td>
                    <td>{plan.pending}</td>
                    <td>{plan.rejected}</td>
                    <td>{plan.expired}</td>
                    <td>{plan.cancelled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-page-header__subtitle">No subscriptions yet.</p>
        )}
      </div>

      {pendingRequests.length ? (
        <div style={{ marginTop: "1.5rem" }}>
          <h2 className="admin-page-header__title" style={{ fontSize: "1rem" }}>
            Pending Plan Requests
          </h2>
          <div className="admin-card-grid" style={{ marginTop: "0.75rem" }}>
            {pendingRequests.map((req: any) => (
              <div key={req._id} className="admin-card">
                <p className="admin-card__label">{req.planId?.title ?? "Plan removed"}</p>
                <p className="admin-page-header__subtitle">
                  Client: {req.clientId?.fullName ?? "Unknown"}
                </p>
                <p className="admin-page-header__subtitle">
                  Requested: {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {planAssignments.length ? (
        <div style={{ marginTop: "1.5rem" }}>
          <h2 className="admin-page-header__title" style={{ fontSize: "1rem" }}>
            Current Plan Assignments
          </h2>
          <div className="admin-table-wrapper" style={{ marginTop: "0.75rem" }}>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Type</th>
                    <th>Clients</th>
                  </tr>
                </thead>
                <tbody>
                  {planAssignments.map((assignment) => (
                    <tr key={assignment.planKey}>
                      <td>{assignment.title}</td>
                      <td style={{ textTransform: "capitalize" }}>{assignment.type}</td>
                      <td>{assignment.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {subscriptions.length ? (
        <div style={{ marginTop: "1.5rem" }}>
          <h2 className="admin-page-header__title" style={{ fontSize: "1rem" }}>
            Recent Requests
          </h2>
          <div className="admin-card-grid" style={{ marginTop: "0.75rem" }}>
            {subscriptions.slice(0, 10).map((sub) => (
              <div key={sub._id} className="admin-card">
                <p className="admin-card__label">
                  {sub.planId?.title ?? sub.planTitle ?? "Plan removed"}
                </p>
                <p className="admin-page-header__subtitle">
                  Client: {sub.clientId?.fullName ?? "Unknown"}
                </p>
                <p className="admin-page-header__subtitle" style={{ textTransform: "capitalize" }}>
                  Status: {sub.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
