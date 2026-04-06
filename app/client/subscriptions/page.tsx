"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  CLIENT_SUBSCRIPTIONS_KEY,
  CURRENT_PLAN_KEY,
  useClientSubscriptionsPage,
  useCurrentPlan,
} from "@/lib/queries/subscriptions";
import api from "@/lib/axios";
import { toast } from "sonner";
import { motion } from "@/lib/motion";
import {
  ArrowRight,
  ClipboardList,
  CreditCard,
  Dumbbell,
  Sparkles,
  UtensilsCrossed,
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

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const formatAmount = (value?: number | null) => `₹${Number(value ?? 0).toFixed(2)}`;

const getSubscriptionStatusTone = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "approved":
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "cancelled":
    case "rejected":
    case "expired":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};

export default function ClientSubscriptionsPage() {
  const queryClient = useQueryClient();
  const historyPageSize = 5;

  const {
    data: currentPlan,
    isLoading: loadingCurrent,
    error: currentError,
  } = useCurrentPlan();

  const [historyPage, setHistoryPage] = useState(1);

  const {
    data: historyResponse,
    isLoading: loadingHistory,
    error: historyError,
  } = useClientSubscriptionsPage({
    page: historyPage,
    limit: historyPageSize,
    sort: "latest",
  });

  const history = historyResponse?.items ?? [];
  const totalHistoryPages = historyResponse?.pagination.totalPages ?? 1;
  const currentHistoryPage = historyResponse?.pagination.currentPage ?? historyPage;
  const totalHistoryItems = historyResponse?.pagination.totalItems ?? history.length;

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

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
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error?.response?.data?.message ?? "Unable to cancel subscription";
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
      <div className="space-y-4 pt-4 md:pt-6" aria-live="polite">
        <div className="h-[210px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-[140px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
          <div className="h-[140px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        </div>
      </div>
    );
  }

  if (currentError || historyError) {
    return (
      <div className="pt-4 md:pt-6">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-rose-700">
              Failed to load subscription details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasHistory = totalHistoryItems > 0;

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
                <Badge className="w-fit border-white/25 bg-white/15 text-white">Subscription center</Badge>
                <CardTitle className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  My Subscriptions
                </CardTitle>
                <CardDescription className="max-w-xl text-xs !text-white/85 md:text-sm">
                  Manage your active plan and subscription history.
                </CardDescription>
              </div>

              <Link href="/client/plan">
                <Button
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  Explore Available Plans
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Dumbbell className="h-4 w-4" />
              </span>
              My Workouts
            </CardTitle>
            <CardDescription>
              View your assigned workout plans and keep progress on track.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/client/workouts">
              <Button>View Workouts</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <UtensilsCrossed className="h-4 w-4" />
              </span>
              My Nutrition
            </CardTitle>
            <CardDescription>
              Track your meal strategy and stay aligned with nutrition goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/client/diet">
              <Button>View Nutrition</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <CreditCard className="h-4 w-4" />
              </span>
              Current plan
            </CardTitle>
            <CardDescription>
              Active subscription details and default assignment information.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentPlan ? (
              currentPlan.type === "subscription" ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Active plan</p>
                      <p className="text-base font-semibold text-slate-900">
                        {currentPlan.subscription.planId?.title ||
                          currentPlan.subscription.planTitle ||
                          "Coach Plan"}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
                        getSubscriptionStatusTone(currentPlan.subscription.status)
                      )}
                    >
                      {currentPlan.subscription.status || "active"}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Duration</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {currentPlan.subscription.durationWeeks ??
                          currentPlan.subscription.planId?.durationWeeks ??
                          "-"}{" "}
                        weeks
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Billing</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatAmount(
                          currentPlan.subscription.amount ?? currentPlan.subscription.planId?.price
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Start date</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDate(currentPlan.subscription.startDate)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">End date</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDate(currentPlan.subscription.endDate)}
                      </p>
                    </div>
                  </div>

                  {currentPlan.subscription.planId?.description ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {currentPlan.subscription.planId.description}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCancel(currentPlan.subscription._id)}
                      disabled={
                        cancelSubscription.isPending &&
                        cancellingId === currentPlan.subscription._id
                      }
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      {cancelSubscription.isPending &&
                      cancellingId === currentPlan.subscription._id
                        ? "Cancelling..."
                        : "Cancel Subscription"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Default plan</p>
                      <p className="text-base font-semibold text-slate-900">{currentPlan.plan.title}</p>
                    </div>

                    <Badge variant="secondary" className="normal-case tracking-normal">
                      Assigned automatically
                    </Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Duration</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {currentPlan.plan.durationWeeks ?? "-"} weeks
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Cost</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatAmount(currentPlan.plan.price)}
                      </p>
                    </div>
                  </div>

                  {currentPlan.plan.description ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {currentPlan.plan.description}
                      </p>
                    </div>
                  ) : null}
                </>
              )
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-6 text-sm text-slate-600">
                No plan information available yet. Once a coach assigns a default plan, it will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

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
                <ClipboardList className="h-4 w-4" />
              </span>
              Subscription history
            </CardTitle>
            <CardDescription>
              Timeline of subscription requests, approvals, and billing windows.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {hasHistory ? (
              <>
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-[920px] w-full text-sm">
                    <caption className="sr-only">Subscription history table</caption>
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Plan</th>
                        <th className="px-3 py-2.5 font-semibold">Status</th>
                        <th className="px-3 py-2.5 font-semibold">Amount</th>
                        <th className="px-3 py-2.5 font-semibold">Start</th>
                        <th className="px-3 py-2.5 font-semibold">End</th>
                        <th className="px-3 py-2.5 font-semibold">Requested</th>
                        <th className="px-3 py-2.5 font-semibold">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.map((sub) => {
                        const planTitle = sub.planId?.title || sub.planTitle || "Coach Plan";
                        const isCurrentActive =
                          currentPlan?.type === "subscription" &&
                          currentPlan.subscription._id === sub._id;
                        const showCancel =
                          sub.status === "pending" ||
                          (sub.status === "approved" && isCurrentActive);

                        return (
                          <tr key={sub._id} className="border-t border-slate-200/80 align-top">
                            <td className="px-3 py-3 text-slate-700">
                              <p className="font-semibold text-slate-900">{planTitle}</p>
                              {sub.planId?.goal ? (
                                <p className="mt-0.5 text-xs text-slate-500">Goal: {sub.planId.goal}</p>
                              ) : null}
                            </td>

                            <td className="px-3 py-3">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
                                  getSubscriptionStatusTone(sub.status)
                                )}
                              >
                                {sub.status}
                              </span>
                            </td>

                            <td className="px-3 py-3 font-semibold text-slate-900">
                              {formatAmount(sub.amount)}
                            </td>
                            <td className="px-3 py-3 text-slate-700">{formatDate(sub.startDate)}</td>
                            <td className="px-3 py-3 text-slate-700">{formatDate(sub.endDate)}</td>
                            <td className="px-3 py-3 text-slate-700">{formatDate(sub.createdAt)}</td>

                            <td className="px-3 py-3">
                              {showCancel && !isCurrentActive ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancel(sub._id)}
                                  disabled={
                                    cancelSubscription.isPending && cancellingId === sub._id
                                  }
                                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                >
                                  {cancelSubscription.isPending && cancellingId === sub._id
                                    ? "Cancelling..."
                                    : "Cancel"}
                                </Button>
                              ) : isCurrentActive ? (
                                <span className="text-xs text-slate-400">Manage above</span>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 md:hidden">
                  {history.map((sub) => {
                    const planTitle = sub.planId?.title || sub.planTitle || "Coach Plan";
                    const isCurrentActive =
                      currentPlan?.type === "subscription" &&
                      currentPlan.subscription._id === sub._id;
                    const showCancel =
                      sub.status === "pending" ||
                      (sub.status === "approved" && isCurrentActive);
                    const isOpen = expandedHistoryId === sub._id;

                    return (
                      <article
                        key={sub._id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{planTitle}</p>
                            <div className="mt-1">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
                                  getSubscriptionStatusTone(sub.status)
                                )}
                              >
                                {sub.status}
                              </span>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setExpandedHistoryId(isOpen ? null : sub._id)}
                            aria-expanded={isOpen}
                          >
                            {isOpen ? "Hide" : "Details"}
                          </Button>
                        </div>

                        {isOpen ? (
                          <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
                            {sub.planId?.goal ? (
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-slate-500">Goal</span>
                                <span className="text-right font-semibold text-slate-900">{sub.planId.goal}</span>
                              </div>
                            ) : null}

                            <div className="flex items-start justify-between gap-2">
                              <span className="text-slate-500">Amount</span>
                              <span className="font-semibold text-slate-900">{formatAmount(sub.amount)}</span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-slate-500">Start</span>
                              <span className="font-semibold text-slate-900">{formatDate(sub.startDate)}</span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-slate-500">End</span>
                              <span className="font-semibold text-slate-900">{formatDate(sub.endDate)}</span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-slate-500">Requested</span>
                              <span className="font-semibold text-slate-900">{formatDate(sub.createdAt)}</span>
                            </div>

                            <div className="mt-1 flex justify-end">
                              {showCancel && !isCurrentActive ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancel(sub._id)}
                                  disabled={
                                    cancelSubscription.isPending && cancellingId === sub._id
                                  }
                                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                >
                                  {cancelSubscription.isPending && cancellingId === sub._id
                                    ? "Cancelling..."
                                    : "Cancel"}
                                </Button>
                              ) : isCurrentActive ? (
                                <span className="text-xs text-slate-400">Manage above</span>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>

                {totalHistoryPages > 1 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                    <p className="text-sm text-slate-600">
                      Page {currentHistoryPage} of {totalHistoryPages}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={currentHistoryPage <= 1}
                        onClick={() => {
                          setExpandedHistoryId(null);
                          setHistoryPage((prev) => Math.max(1, prev - 1));
                        }}
                      >
                        Prev
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={currentHistoryPage >= totalHistoryPages}
                        onClick={() => {
                          setExpandedHistoryId(null);
                          setHistoryPage((prev) => Math.min(totalHistoryPages, prev + 1));
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No subscription history yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  You have not requested any plan changes yet. Explore available plans to customize your journey.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
