"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { motion } from "@/lib/motion";
import {
  Banknote,
  BarChart3,
  ClipboardList,
  Package,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EarningsTrendBarChart = dynamic(
  () => import("@/components/charts/EarningsTrendBarChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] w-full animate-pulse rounded-xl bg-slate-100/70" />
    ),
  }
);

interface EarningsData {
  success: boolean;
  summary: {
    totalEarnings: number;
    subscriptionEarnings: number;
    orderEarnings: number;
    subscriptionCount: number;
    orderCount: number;
  };
  trend: Array<{
    month: string;
    subscriptionEarnings: number;
    orderEarnings: number;
    subscriptionCount: number;
    orderCount: number;
    totalEarnings: number;
  }>;
  subscriptions: Array<any>;
  orders: Array<any>;
}

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatMonthLabel(monthKey: string) {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return monthKey;
  }

  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

export default function EarningsDashboard() {
  const { data, isLoading, error } = useQuery<EarningsData>({
    queryKey: ["coachEarnings"],
    queryFn: async () => {
      const res = await api.get("/coach/earnings");
      return res.data as EarningsData;
    },
  });

  const summary = data?.summary || {
    totalEarnings: 0,
    subscriptionEarnings: 0,
    orderEarnings: 0,
    subscriptionCount: 0,
    orderCount: 0,
  };

  const trend = data?.trend || [];

  const chartData = useMemo(
    () =>
      trend.map((entry) => ({
        ...entry,
        monthLabel: formatMonthLabel(entry.month),
      })),
    [trend]
  );

  const averagePerOrder =
    summary.orderCount > 0 ? summary.orderEarnings / summary.orderCount : 0;

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <div className="h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`earnings-loading-${idx}`}
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
              Error loading earnings data.
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
          <CardHeader className="gap-3 p-4 sm:p-5 md:gap-4 md:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="space-y-1.5">
                <Badge className="w-fit border-white/25 bg-white/15 text-[11px] text-white sm:text-xs">
                  Revenue Hub
                </Badge>
                <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                  Earnings dashboard
                </CardTitle>
                <CardDescription className="max-w-2xl text-xs !text-white/90 sm:text-sm md:text-base">
                  Track subscription and order income.
                </CardDescription>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5 sm:gap-3 sm:pt-2">
              <div className="min-w-0 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 sm:px-4 sm:py-3">
                <p className="text-[10px] uppercase tracking-wide text-blue-100 sm:text-[11px]">Total revenue</p>
                <p className="mt-0.5 whitespace-nowrap text-lg font-semibold sm:mt-1 sm:text-xl">
                  {formatCurrency(summary.totalEarnings)}
                </p>
              </div>
              <div className="min-w-0 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 sm:px-4 sm:py-3">
                <p className="text-[10px] uppercase tracking-wide text-blue-100 sm:text-[11px]">Total transactions</p>
                <p className="mt-0.5 text-lg font-semibold sm:mt-1 sm:text-xl">
                  {summary.subscriptionCount + summary.orderCount}
                </p>
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
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
            title: "Total earnings",
            value: formatCurrency(summary.totalEarnings),
            subtitle: "Subscriptions + orders",
            Icon: Wallet,
            iconTone: "bg-emerald-50 text-emerald-600",
          },
          {
            title: "Subscription earnings",
            value: formatCurrency(summary.subscriptionEarnings),
            subtitle: `${summary.subscriptionCount} approved subscriptions`,
            Icon: ClipboardList,
            iconTone: "bg-blue-50 text-blue-600",
          },
          {
            title: "Order earnings",
            value: formatCurrency(summary.orderEarnings),
            subtitle: `${summary.orderCount} approved/completed orders`,
            Icon: Package,
            iconTone: "bg-amber-50 text-amber-600",
          },
          {
            title: "Average per order",
            value: formatCurrency(averagePerOrder),
            subtitle: "Order revenue average",
            Icon: Banknote,
            iconTone: "bg-violet-50 text-violet-600",
          },
        ].map((item) => (
          <Card key={item.title}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.title}
                </p>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl ${item.iconTone}`}
                >
                  <item.Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
            </CardContent>
          </Card>
        ))}
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
                <BarChart3 className="h-4 w-4" />
              </span>
              Earnings trend
            </CardTitle>
            <CardDescription>
              Monthly comparison of subscription and product order revenue.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {chartData.length > 0 ? (
              <EarningsTrendBarChart data={chartData} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No trend data available
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Monthly chart will appear when earnings start recording.
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
        transition={{ duration: 0.28, delay: 0.14 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Subscription summary</CardTitle>
            <CardDescription>Performance from approved subscriptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              {
                label: "Approved subscriptions",
                value: String(summary.subscriptionCount),
              },
              {
                label: "Total revenue",
                value: formatCurrency(summary.subscriptionEarnings),
              },
              {
                label: "Average per subscription",
                value: formatCurrency(
                  summary.subscriptionCount > 0
                    ? summary.subscriptionEarnings / summary.subscriptionCount
                    : 0
                ),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5"
              >
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Order summary</CardTitle>
            <CardDescription>Performance from approved/completed product orders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              {
                label: "Completed orders",
                value: String(summary.orderCount),
              },
              {
                label: "Total revenue",
                value: formatCurrency(summary.orderEarnings),
              },
              {
                label: "Average per order",
                value: formatCurrency(averagePerOrder),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5"
              >
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.section>

      {summary.totalEarnings === 0 ? (
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
                  No earnings yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Start by creating subscription plans and products to begin revenue tracking.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}
    </div>
  );
}
