// src/components/client/AssignedPlans.tsx
"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import getErrorMessage from "@/lib/getErrorMessage";
import { AlertCircle, CalendarDays, ClipboardList, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type CurrentPlanPayload =
  | {
      type: "subscription";
      subscription: {
        _id: string;
        startDate?: string;
        endDate?: string;
        status: string;
        planId: {
          _id: string;
          title: string;
          description?: string;
          durationWeeks?: number;
          goal?: string;
        };
      };
    }
  | {
      type: "default";
      plan: {
        _id: string;
        title: string;
        description?: string;
        durationWeeks?: number;
        goal?: string;
      };
    }
  | null;

type NormalizedPlan = {
  _id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

function formatPlanDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const fetchMyCurrentPlan = async (): Promise<NormalizedPlan | null> => {
  const res = await api.get("/subscriptions/my/current");
  const data: CurrentPlanPayload = res.data?.data ?? null;

  if (!data) return null;

  if (data.type === "subscription") {
    const { subscription } = data;
    const plan = subscription.planId;
    return {
      _id: plan._id,
      title: plan.title,
      description: plan.description,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
    };
  }

  // default/fallback plan
  return {
    _id: data.plan._id,
    title: data.plan.title,
    description: data.plan.description,
    startDate: undefined,
    endDate: undefined,
  };
};

export default function AssignedPlans() {
  const { data: plan, isLoading, error } = useQuery({
    queryKey: ["myCurrentPlan"],
    queryFn: fetchMyCurrentPlan,
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200/80 bg-white/95">
        <CardContent className="flex items-center gap-2.5 p-4 sm:p-5">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-600">Loading your current plan...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200/80 bg-rose-50/70">
        <CardContent className="space-y-3 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-rose-700">
            <AlertCircle className="h-4 w-4" />
            {getErrorMessage(error, "Unable to load your current plan.")}
          </p>
          <Link
            href="/client/subscriptions"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
          >
            <CreditCard className="h-4 w-4" />
            My subscriptions
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="border-amber-200/80 bg-amber-50/80">
        <CardContent className="space-y-3 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-800">
            <ClipboardList className="h-4 w-4" />
            No current plan assigned yet.
          </p>
          <Link
            href="/client/subscriptions"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
          >
            <CreditCard className="h-4 w-4" />
            View subscriptions
          </Link>
        </CardContent>
      </Card>
    );
  }

  const startedLabel = formatPlanDate(plan.startDate);
  const endLabel = formatPlanDate(plan.endDate);

  return (
    <Card className="overflow-hidden border-indigo-100/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <CardContent className="space-y-4 p-4 pt-5 sm:p-6 sm:pt-6">
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Your current plan</p>
            <h3 className="break-words text-3xl font-bold leading-tight text-slate-900">{plan.title}</h3>
        </div>

        {startedLabel || endLabel ? (
          <div className="flex flex-wrap items-center gap-2">
            {startedLabel ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-100/85 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <CalendarDays className="h-3.5 w-3.5" />
                Started {startedLabel}
              </span>
            ) : null}

            {endLabel ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
                Ends {endLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        {plan.description ? (
          <p className="text-sm leading-6 text-slate-700">{plan.description}</p>
        ) : (
          <p className="text-sm text-slate-600">
            You have an active plan assigned. Visit subscriptions to view full plan details.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/client/subscriptions"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-semibold !text-white shadow-[0_10px_30px_-12px_rgba(79,70,229,0.45)] transition-all hover:bg-indigo-700 hover:!text-white visited:!text-white"
            style={{ color: "#fff" }}
          >
            <CreditCard className="h-4 w-4" />
            My subscriptions
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
