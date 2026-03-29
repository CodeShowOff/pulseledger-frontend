"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useCoachPendingPlanRequests } from "@/lib/queries/planRequests";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CreditCard,
  Layers3,
  ListTree,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

const RECENT_REQUESTS_PAGE_SIZE = 6;

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const STATUS_LABELS: Record<(typeof STATUS_KEYS)[number], string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  expired: "Expired",
  cancelled: "Cancelled",
};

const STATUS_VALUE_TONE: Record<(typeof STATUS_KEYS)[number], string> = {
  approved: "text-emerald-700",
  pending: "text-amber-700",
  rejected: "text-rose-700",
  expired: "text-slate-700",
  cancelled: "text-slate-700",
};

const ASSIGNMENT_TYPE_TONE: Record<AssignmentAggregate["type"], string> = {
  subscription: "border-emerald-100 bg-emerald-50 text-emerald-700",
  default: "border-indigo-100 bg-indigo-50 text-indigo-700",
  none: "border-slate-200 bg-slate-100 text-slate-700",
};

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CoachSubscriptionsPage() {
  const [recentRequestsPage, setRecentRequestsPage] = useState(1);

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
  const pendingCount = pendingRequests.length;
  const totalRecentRequestPages = Math.max(
    1,
    Math.ceil(subscriptions.length / RECENT_REQUESTS_PAGE_SIZE)
  );
  const currentRecentRequestsPage = Math.min(
    recentRequestsPage,
    totalRecentRequestPages
  );
  const recentRequests = useMemo(() => {
    const start = (currentRecentRequestsPage - 1) * RECENT_REQUESTS_PAGE_SIZE;
    return subscriptions.slice(start, start + RECENT_REQUESTS_PAGE_SIZE);
  }, [subscriptions, currentRecentRequestsPage]);
  const recentRequestRangeStart = subscriptions.length
    ? (currentRecentRequestsPage - 1) * RECENT_REQUESTS_PAGE_SIZE + 1
    : 0;
  const recentRequestRangeEnd = subscriptions.length
    ? Math.min(
        currentRecentRequestsPage * RECENT_REQUESTS_PAGE_SIZE,
        subscriptions.length
      )
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <div className="h-[210px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`subscription-loading-${idx}`}
              className="h-[120px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4 md:pt-6">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-rose-700">
              Failed to load subscriptions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-4 p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className="w-fit border-white/25 bg-white/15 text-white">
                  Subscriptions
                </Badge>
                <CardTitle className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Client subscriptions at a glance
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm !text-white/90 md:text-base">
                  Monitor approvals, pending requests, and plan performance from a
                  single workspace.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <Link href="/coach/plan-requests">
                  <Button
                    variant="outline"
                    className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <ClipboardList className="h-4 w-4" />
                    View Plan Requests
                    {pendingCount > 0 ? (
                      <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    ) : null}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-100">
                  Total requests
                </p>
                <p className="mt-1 text-xl font-semibold">{summaryStats.total}</p>
              </div>
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-100">
                  Approved
                </p>
                <p className="mt-1 text-xl font-semibold">{summaryStats.approved}</p>
              </div>
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-100">
                  Pending
                </p>
                <p className="mt-1 text-xl font-semibold">{summaryStats.pending}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Layers3 className="h-4 w-4" />
              </span>
              Plan status matrix
            </CardTitle>
            <CardDescription>
              Compare subscription outcomes across each plan.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {planSummary.length ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-[760px] divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Plan
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Total
                      </th>
                      {STATUS_KEYS.map((status) => (
                        <th
                          key={`status-col-${status}`}
                          scope="col"
                          className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {STATUS_LABELS[status]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {planSummary.map((plan) => (
                      <tr key={plan.planKey} className="hover:bg-indigo-50/20">
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-slate-900">{plan.title}</div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-900">
                          {plan.total}
                        </td>
                        {STATUS_KEYS.map((status) => (
                          <td
                            key={`${plan.planKey}-${status}`}
                            className={cn(
                              "px-3 py-2.5 text-right font-medium",
                              STATUS_VALUE_TONE[status]
                            )}
                          >
                            {plan[status]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <CreditCard className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No subscriptions yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Plan insights will appear after your first client requests.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {pendingRequests.length ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                  <ClipboardList className="h-4 w-4" />
                </span>
                Pending plan requests
              </CardTitle>
              <CardDescription>
                Requests waiting for approval and subscription conversion.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pendingRequests.map((req: any, index: number) => (
                  <motion.article
                    key={req._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="h-full"
                  >
                    <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/20">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {req.planId?.title ?? "Plan removed"}
                        </h3>
                        <Badge
                          variant="warning"
                          className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                        >
                          Pending
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Client: {req.clientId?.fullName ?? "Unknown"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Requested: {formatDate(req.createdAt)}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      {planAssignments.length ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.14 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <ListTree className="h-4 w-4" />
                </span>
                Current plan assignments
              </CardTitle>
              <CardDescription>
                Active assignment sources for client plans.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Plan
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Clients
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {planAssignments.map((assignment) => (
                      <tr key={assignment.planKey} className="hover:bg-indigo-50/20">
                        <td className="px-3 py-2.5 font-medium text-slate-900">
                          {assignment.title}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
                              ASSIGNMENT_TYPE_TONE[assignment.type]
                            )}
                          >
                            {assignment.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-900">
                          {assignment.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      {subscriptions.length ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.18 }}
        >
          <Card className="border-slate-200/80 bg-white/95">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="h-4 w-4" />
                </span>
                Recent requests
              </CardTitle>
              <CardDescription>
                Latest subscription activity from your clients.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recentRequests.map((sub, index) => (
                <motion.article
                  key={sub._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.015 }}
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {sub.planId?.title ?? sub.planTitle ?? "Plan removed"}
                      </p>
                      <Badge
                        className={cn(
                          "px-2 py-0.5 text-[10px] normal-case tracking-normal",
                          sub.status === "approved"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : sub.status === "pending"
                            ? "border-amber-100 bg-amber-50 text-amber-700"
                            : sub.status === "rejected"
                            ? "border-rose-100 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-slate-100 text-slate-700"
                        )}
                      >
                        {STATUS_LABELS[sub.status]}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      Client: {sub.clientId?.fullName ?? "Unknown"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created: {formatDate(sub.createdAt)}
                    </p>
                  </div>
                </motion.article>
              ))}

              {totalRecentRequestPages > 1 ? (
                <div className="sm:col-span-2 xl:col-span-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                    <p className="text-sm text-slate-600">
                      Showing {recentRequestRangeStart}-{recentRequestRangeEnd} of{" "}
                      {subscriptions.length}
                    </p>

                    <nav
                      className="flex items-center gap-2"
                      aria-label="Recent requests pagination"
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRecentRequestsPage(
                            Math.max(1, currentRecentRequestsPage - 1)
                          )
                        }
                        disabled={currentRecentRequestsPage === 1}
                      >
                        Previous
                      </Button>

                      <span className="text-xs font-medium text-slate-500">
                        Page {currentRecentRequestsPage} of {totalRecentRequestPages}
                      </span>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRecentRequestsPage(
                            Math.min(
                              totalRecentRequestPages,
                              currentRecentRequestsPage + 1
                            )
                          )
                        }
                        disabled={
                          currentRecentRequestsPage === totalRecentRequestPages
                        }
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.section>
      ) : (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.18 }}
        >
          <Card className="border-slate-200/80 bg-white/95">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No recent activity
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  New subscription requests will show up here as clients engage
                  with your plans.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </div>
  );
}
