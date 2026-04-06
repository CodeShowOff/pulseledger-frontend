"use client";

import { useMemo } from "react";
import { motion } from "@/lib/motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { useClientPlans } from "@/lib/queries/plans";
import {
  useClientSubscriptions,
  useCurrentPlan,
} from "@/lib/queries/subscriptions";
import {
  useClientPlanRequests,
} from "@/lib/queries/planRequests";
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

const getRequestStatusVariant = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "approved":
      return "success" as const;
    case "declined":
      return "danger" as const;
    case "pending":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
};

export default function MyPlanPage() {
  const router = useRouter();
  const { data: plans = [], isLoading, error } = useClientPlans();
  const { data: currentPlan } = useCurrentPlan();
  const { data: subscriptions = [] } = useClientSubscriptions();
  const { data: planRequests = [] } = useClientPlanRequests();

  const templates = plans; // All plans are subscription plans

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

  const pendingRequestsCount = planRequests.filter((req) => req.status === "pending").length;

  const handleRequest = (planId: string) => {
    router.push(`/client/plan-payment/${planId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 md:pt-6" aria-live="polite">
        <div className="h-[205px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-[170px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
          <div className="h-[170px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
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
            Failed to load available plans.
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
                <Badge className="w-fit border-white/25 bg-white/15 text-white">Subscription center</Badge>
                <CardTitle className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Available Plans
                </CardTitle>
                <CardDescription className="max-w-2xl text-xs !text-white/85 md:text-sm">
                  Explore coach plans, compare pricing and duration, then continue to payment in one step.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Badge className="border-white/25 bg-white/15 text-white">
                  {templates.length} {templates.length === 1 ? "Plan" : "Plans"}
                </Badge>
                <Badge
                  className={cn(
                    "border-white/25 bg-white/15 text-white",
                    pendingRequestsCount > 0 ? "bg-amber-400/20 text-amber-100 border-amber-200/50" : ""
                  )}
                >
                  {pendingRequestsCount} Pending
                </Badge>
                {activePlanId ? (
                  <Badge className="border-emerald-200/50 bg-emerald-400/20 text-emerald-100">
                    Active Plan
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/client/subscriptions">
                <Button
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  My subscriptions
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
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <CreditCard className="h-4 w-4" />
              </span>
              Plan catalog
            </CardTitle>
            <CardDescription>
              Select a plan to proceed with payment and create a request for coach approval.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {templates.length ? (
              <div className="grid gap-3 xl:grid-cols-2">
                {templates.map((plan, index) => {
                  const price = typeof plan.price === "number" ? plan.price : Number(plan.price ?? 0);
                  const isActive = activePlanId === plan._id;
                  const isPending = pendingPlanIds.has(plan._id);
                  const buttonLabel = isActive
                    ? "Current Plan"
                    : isPending
                    ? "Awaiting Approval"
                    : "Continue to Payment";

                  return (
                    <motion.article
                      key={plan._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: index * 0.03 }}
                    >
                      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/20">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-900 md:text-base">{plan.title}</h3>
                              {plan.isDefault ? (
                                <Badge variant="default" className="px-2 py-0.5 text-[10px] normal-case tracking-normal">
                                  Default
                                </Badge>
                              ) : null}
                            </div>

                            {plan.goal ? (
                              <p className="mt-1 flex items-center gap-1 text-[11px] uppercase tracking-wide text-indigo-600">
                                <Target className="h-3.5 w-3.5" />
                                {plan.goal}
                              </p>
                            ) : null}
                          </div>

                          <p className="text-base font-semibold text-slate-900 md:text-lg">{formatAmount(price)}</p>
                        </div>

                        {plan.description ? (
                          <p className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-600">
                            {plan.description}
                          </p>
                        ) : null}

                        <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                            <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{plan.durationWeeks ?? "-"} weeks</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate">{plan.coachId?.fullName ?? "Coach not assigned"}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Button
                            type="button"
                            onClick={() => handleRequest(plan._id)}
                            disabled={isActive || isPending}
                            className={cn(
                              "w-full",
                              isActive
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                : isPending
                                ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
                                : ""
                            )}
                          >
                            {buttonLabel}
                          </Button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No published plans yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Your coach has not published any shared plans yet. Please check back later.
                </p>
              </div>
            )}
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
                <ClipboardList className="h-4 w-4" />
              </span>
              My plan requests
            </CardTitle>
            <CardDescription>
              Track approval status and notes for your latest plan requests.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {planRequests.length ? (
              <div className="grid gap-3 xl:grid-cols-2">
                {planRequests.map((req, index) => (
                  <motion.article
                    key={req._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.02 }}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {req.planId?.title ?? "Plan removed"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Requested on {formatDate(req.createdAt)}</p>
                      </div>

                      <Badge
                        variant={getRequestStatusVariant(req.status)}
                        className="px-2 py-0.5 text-[10px] capitalize tracking-normal"
                      >
                        {req.status}
                      </Badge>
                    </div>

                    {req.notes ? (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                        <p className="font-semibold text-slate-700">Notes</p>
                        <p className="mt-1 leading-5">{req.notes}</p>
                      </div>
                    ) : null}
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No requests submitted yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Once you choose a plan and continue to payment, request status will show here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
