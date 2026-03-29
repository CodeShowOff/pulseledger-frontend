"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import RoleGuard from "@/components/shared/RoleGuard";
import api from "@/lib/axios";
import { Inter } from "next/font/google";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ArrowRight,
  AlertCircle,
  BookOpen,
  ClipboardList,
  Clock,
  Dumbbell,
  Link2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserCircle2,
  UserPlus,
  Users,
  UtensilsCrossed,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type ProgressPoint = {
  week: string;
  avgBMI: number;
};

type CoachStats = {
  clients: number;
  plans: number;
  products: number;
};

type CoachClient = {
  _id: string;
  fullName: string;
  email: string;
  bmi?: number;
  latestProgress?: {
    bmi?: number;
  } | null;
};

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

  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["platformSubscription"],
    queryFn: async () => {
      const res = await api.get("/platform-subscription/status");
      return res.data.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<CoachStats>({
    queryKey: ["coachStats"],
    queryFn: async () => {
      const res = await api.get("/coach/stats");
      return res.data;
    },
  });

  const { data: progressData, isLoading: progressLoading } = useQuery<ProgressPoint[]>({
    queryKey: ["coachProgress"],
    queryFn: async () => {
      const res = await api.get("/coach/client-progress");
      return (res.data ?? []) as ProgressPoint[];
    },
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<CoachClient[]>({
    queryKey: ["coachDashboardClients"],
    queryFn: async () => {
      const res = await api.get("/coach/clients?limit=6");
      return (res.data?.data ?? []) as CoachClient[];
    },
  });

  const publicProfileUrl =
    typeof window !== "undefined" && user?.referralCode
      ? `${window.location.origin}/public/${encodeURIComponent(user.referralCode)}`
      : "";

  const subscriptionTone =
    subscription?.status === "expired"
      ? "danger"
      : subscription?.status === "trial"
      ? "info"
      : subscription && subscription.daysRemaining <= 3
      ? "danger"
      : subscription && subscription.daysRemaining <= 7
      ? "warn"
      : "ok";

  const dashboardActions = [
    {
      label: "Visit My Profile",
      description: "Open your public and business profile details to keep everything up to date.",
      href: "/profile",
      Icon: UserCircle2,
      color: "from-sky-500 to-cyan-500",
      bg: "from-sky-50 to-cyan-50",
    },
    {
      label: "Platform Fee",
      description: "Manage subscription status and avoid interruptions in coach dashboard access.",
      href: "/coach/platform-fee",
      Icon: CreditCard,
      color: "from-indigo-500 to-blue-500",
      bg: "from-indigo-50 to-blue-50",
    },
    {
      label: "Workouts",
      description: "Build and assign workout plans with structure and consistency.",
      href: "/coach/workout-plans",
      Icon: Dumbbell,
      color: "from-orange-500 to-amber-500",
      bg: "from-orange-50 to-amber-50",
    },
    {
      label: "Nutrition",
      description: "Create diet plans and optimize meal strategies for every client segment.",
      href: "/coach/diet-plans",
      Icon: UtensilsCrossed,
      color: "from-emerald-500 to-lime-500",
      bg: "from-emerald-50 to-lime-50",
    },
    {
      label: "Revenue",
      description: "Review earnings, payouts, and business performance trends.",
      href: "/coach/earnings",
      Icon: Wallet,
      color: "from-violet-500 to-fuchsia-500",
      bg: "from-violet-50 to-fuchsia-50",
    },
    {
      label: "Reviews",
      description: "Read testimonials and improve trust through client feedback.",
      href: "/coach/reviews",
      Icon: Star,
      color: "from-rose-500 to-pink-500",
      bg: "from-rose-50 to-pink-50",
    },
  ];

  const primaryActionLabels = ["Workouts", "Nutrition", "Reviews"];
  const primaryActions = dashboardActions.filter((item) => primaryActionLabels.includes(item.label));
  const secondaryActions = dashboardActions.filter((item) => !primaryActionLabels.includes(item.label));

  const quickCards = [
    {
      title: "Earnings Center",
      description: "Track monthly revenue and client order value in one place.",
      href: "/coach/earnings",
      cta: "Open Revenue",
      Icon: Wallet,
      badge: "Finance",
    },
    {
      title: "Public Profile",
      description: "Share your profile link so prospects can book and onboard fast.",
      href: publicProfileUrl || "#",
      cta: "Open Profile",
      Icon: Link2,
      isExternal: true,
      badge: "Growth",
    },
    {
      title: "Subscription",
      description: "Keep platform access active and prevent service interruptions.",
      href: "/coach/platform-fee",
      cta: "Manage Billing",
      Icon: CreditCard,
      badge:
        subscription && Number.isFinite(subscription.daysRemaining)
          ? `${subscription.daysRemaining} Day${subscription.daysRemaining !== 1 ? "s" : ""} Left`
          : "Checking status",
    },
    // {
    //   title: "Workout Plans",
    //   description: "Design and assign high-converting coaching workout templates.",
    //   href: "/coach/workout-plans",
    //   cta: "Open Workouts",
    //   Icon: Dumbbell,
    //   badge: "Training",
    // },
    // {
    //   title: "Diet Plans",
    //   description: "Create nutrition journeys and reusable premium meal plans.",
    //   href: "/coach/diet-plans",
    //   cta: "Open Nutrition",
    //   Icon: UtensilsCrossed,
    //   badge: "Nutrition",
    // },
    // {
    //   title: "Client Reviews",
    //   description: "Turn feedback into trust by showcasing top testimonials.",
    //   href: "/coach/reviews",
    //   cta: "Open Reviews",
    //   Icon: Star,
    //   badge: "Reputation",
    // },
  ];

  const kpis = [
    {
      title: "Total Clients",
      value: statsLoading ? "--" : `${stats?.clients ?? 0}`,
      Icon: Users,
      delta: "+12% this month",
      tone: "from-blue-500 to-indigo-500",
    },
    {
      title: "Active Plans",
      value: statsLoading ? "--" : `${stats?.plans ?? 0}`,
      Icon: ClipboardList,
      delta: "+6% weekly",
      tone: "from-violet-500 to-fuchsia-500",
    },
    {
      title: "Products",
      value: statsLoading ? "--" : `${stats?.products ?? 0}`,
      Icon: BookOpen,
      delta: "Stable",
      tone: "from-emerald-500 to-teal-500",
    },
    {
      title: "Subscription",
      value:
        subscription && Number.isFinite(subscription.daysRemaining)
          ? `${subscription.daysRemaining} days`
          : "Active",
      Icon: Clock,
      delta: subscription?.status === "expired" ? "Action required" : "On track",
      tone: "from-amber-500 to-orange-500",
    },
  ];

  const chartData = progressData?.length
    ? progressData
    : [
        { week: "W1", avgBMI: 26.1 },
        { week: "W2", avgBMI: 25.7 },
        { week: "W3", avgBMI: 25.4 },
        { week: "W4", avgBMI: 25.1 },
      ];

  return (
    <div className={cn(inter.className, "min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100/70 p-2 md:p-4") }>
      <RoleGuard role="coach" />

      <div className="mx-auto w-full max-w-[1640px]">
        <div className="grid min-h-[calc(100vh-108px)] grid-cols-1 gap-3">
          <div className="space-y-3">
            {subscription && (subscription.status === "expired" || subscription.status === "trial" || (subscription.status === "active" && subscription.daysRemaining <= 3)) ? (
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card
                  className={cn(
                    "border",
                    subscriptionTone === "danger"
                      ? "border-rose-200 bg-rose-50/90"
                      : subscriptionTone === "warn"
                      ? "border-amber-200 bg-amber-50/90"
                      : "border-blue-200 bg-blue-50/90"
                  )}
                >
                  <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-white/80 p-2">
                        {subscription.status === "expired" ? (
                          <AlertCircle className="h-5 w-5 text-rose-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {subscription.status === "expired"
                            ? "Subscription expired"
                            : subscription.status === "trial"
                            ? `Trial ends in ${subscription.daysRemaining} day${subscription.daysRemaining !== 1 ? "s" : ""}`
                            : `Subscription ends in ${subscription.daysRemaining} day${subscription.daysRemaining !== 1 ? "s" : ""}`}
                        </p>
                        <p className="text-sm text-slate-600">
                          Pay ₹{subscription.platformFee} to keep uninterrupted access to all coach tools.
                        </p>
                      </div>
                    </div>

                    <Link href="/coach/platform-fee">
                      <Button size="sm">Manage Subscription</Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}

            <section className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }}>
                <Card className="h-full overflow-hidden border-slate-200/80 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
                  <CardHeader>
                    <Badge className="w-fit border-white/30 bg-white/10 text-white">Performance Hub</Badge>
                    <CardTitle className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                      Welcome back, {user?.fullName?.split(" ")[0] || "Coach"}
                    </CardTitle>
                    <CardDescription className="max-w-xl text-white/95">
                      Your command center is ready — track progress, optimize nutrition workflows, and scale coaching outcomes from one clean workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-blue-100">Focus</p>
                      <p className="mt-1 text-sm font-semibold">Client retention</p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-blue-100">Today</p>
                      <p className="mt-1 text-sm font-semibold">Plan improvements</p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-blue-100">Status</p>
                      <p className="mt-1 text-sm font-semibold">All systems healthy</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <Card className="h-full border-slate-200/80 bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Target className="h-4 w-4" />
                      </span>
                      Quick links
                    </CardTitle>
                    <CardDescription>Frequently used tools for your daily workflow.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {quickCards.slice(0, 4).map((card) => (
                      <Link key={card.title} href={card.href} className="block">
                        <div className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 transition-all hover:border-indigo-200 hover:bg-indigo-50/50">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-600 shadow-sm group-hover:text-indigo-600">
                              <card.Icon className="h-4 w-4" />
                            </span>
                            <p className="text-sm font-medium text-slate-700">{card.title}</p>
                          </div>
                          <span className="text-slate-400 group-hover:text-indigo-600">→</span>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            <section>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.28 }}>
                <Card className="overflow-hidden border-slate-200/80 bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      Workspace modules
                    </CardTitle>
                    <CardDescription>
                      Core areas of your coaching business, now placed where they belong — in your dashboard workflow.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {primaryActions.map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.14 + index * 0.03, duration: 0.24 }}
                            whileHover={{ y: -3 }}
                          >
                            <Link href={item.href} className="block h-full">
                              <div className={cn(
                                "group relative flex h-full min-h-[142px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.55)]",
                                `bg-gradient-to-br ${item.bg}`
                              )}>
                                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/50 blur-xl" />

                                <div className="flex items-start justify-between gap-3">
                                  <span className={cn(
                                    "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                                    item.color
                                  )}>
                                    <item.Icon className="h-5 w-5" />
                                  </span>

                                  <div className="flex items-end gap-1 opacity-70">
                                    <span className={cn("h-3 w-1 rounded-full bg-gradient-to-b", item.color)} />
                                    <span className={cn("h-5 w-1 rounded-full bg-gradient-to-b", item.color)} />
                                    <span className={cn("h-4 w-1 rounded-full bg-gradient-to-b", item.color)} />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h3 className="text-sm font-semibold text-slate-900">{item.label}</h3>
                                  <p className="text-xs leading-5 text-slate-600">{item.description}</p>
                                </div>

                                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 transition-colors group-hover:text-indigo-900">
                                  Open {item.label}
                                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {secondaryActions.map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.03, duration: 0.24 }}
                          whileHover={{ y: -3 }}
                        >
                          <Link href={item.href} className="block h-full">
                            <div className={cn(
                              "group relative flex h-full min-h-[142px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.55)]",
                              `bg-gradient-to-br ${item.bg}`
                            )}>
                              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/50 blur-xl" />

                              <div className="flex items-start justify-between gap-3">
                                <span className={cn(
                                  "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                                  item.color
                                )}>
                                  <item.Icon className="h-5 w-5" />
                                </span>

                                <div className="flex items-end gap-1 opacity-70">
                                  <span className={cn("h-3 w-1 rounded-full bg-gradient-to-b", item.color)} />
                                  <span className={cn("h-5 w-1 rounded-full bg-gradient-to-b", item.color)} />
                                  <span className={cn("h-4 w-1 rounded-full bg-gradient-to-b", item.color)} />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-900">{item.label}</h3>
                                <p className="text-xs leading-5 text-slate-600">{item.description}</p>
                              </div>

                              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 transition-colors group-hover:text-indigo-900">
                                Open {item.label}
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.25 }}>
              <Card className="relative overflow-hidden border-indigo-200/80 bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50">
                <CardContent className="relative p-4 sm:p-5">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-300/20 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-violet-300/20 blur-2xl" />

                  <div className="relative grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
                          <Link2 className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Referral</p>
                          <p className="text-sm text-slate-600">
                            Share your public profile link with prospects and grow your client base faster.
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-indigo-200/80 bg-white/90 px-3 py-2">
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                          Code
                        </Badge>
                        <p className="truncate font-mono text-sm font-semibold text-slate-800">
                          {user?.referralCode || "Generating..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-indigo-200 bg-white/80 text-indigo-700 hover:bg-indigo-50"
                        onClick={async () => {
                          if (!publicProfileUrl) return;
                          try {
                            await navigator.clipboard.writeText(publicProfileUrl);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1600);
                          } catch {
                            setCopied(false);
                          }
                        }}
                      >
                        {copied ? "Copied" : "Copy Link"}
                      </Button>
                      <Link href={publicProfileUrl || "#"} target="_blank">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          Open Public Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.04, duration: 0.25 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="border-slate-200/80 bg-white/95 transition-all hover:shadow-[0_16px_40px_-30px_rgba(79,70,229,0.5)]">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.title}</p>
                        <span className={cn("grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-white", item.tone)}>
                          <item.Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.delta}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </section>

            <section className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Card className="h-full border-slate-200/80 bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                      </span>
                      Client progress trend
                    </CardTitle>
                    <CardDescription>
                      Minimal weekly BMI trendline with smooth gradient fill.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {progressLoading ? (
                      <p className="text-sm text-slate-500">Loading chart data...</p>
                    ) : (
                      <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="coachBmiGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#e2e8f0" strokeDasharray="2 8" vertical={false} />
                            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                            <Tooltip
                              cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                              content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                  <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg">
                                    <p className="font-semibold text-slate-700">{label}</p>
                                    <p className="text-slate-500">Avg BMI: <span className="font-semibold text-slate-800">{Number(payload[0].value).toFixed(1)}</span></p>
                                  </div>
                                );
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="avgBMI"
                              stroke="#6366f1"
                              strokeWidth={2.5}
                              fill="url(#coachBmiGradient)"
                              dot={{ r: 3, fill: "#6366f1", stroke: "#fff", strokeWidth: 1.5 }}
                              activeDot={{ r: 5 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Card className="h-full border-slate-200/80 bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      Activity feed
                    </CardTitle>
                    <CardDescription>Recent momentum across your coaching business.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "New lead joined your profile", time: "20m ago", Icon: UserPlus },
                      { label: "Nutrition plan accepted", time: "1h ago", Icon: UtensilsCrossed },
                      { label: "Workout completed by client", time: "3h ago", Icon: Dumbbell },
                      { label: "Positive review submitted", time: "Today", Icon: Star },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-600 shadow-sm">
                          <item.Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            <section>
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Card className="border-slate-200/80 bg-white/95">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">Recent clients</CardTitle>
                      <CardDescription>Most recent client records and health signal.</CardDescription>
                    </div>
                    <Link href="/coach/clients">
                      <Button variant="outline" size="sm">View all</Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {clientsLoading ? (
                      <p className="text-sm text-slate-500">Loading clients...</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] border-separate border-spacing-y-2 text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                              <th className="px-3">Name</th>
                              <th className="px-3">Email</th>
                              <th className="px-3">BMI</th>
                              <th className="px-3">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(clients ?? []).map((client) => {
                              const bmiValue =
                                typeof client.bmi === "number"
                                  ? client.bmi
                                  : typeof client.latestProgress?.bmi === "number"
                                  ? client.latestProgress?.bmi
                                  : undefined;

                              return (
                                <tr key={client._id} className="rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700">
                                  <td className="rounded-l-xl px-3 py-2.5 font-medium">{client.fullName}</td>
                                  <td className="px-3 py-2.5 text-slate-500">{client.email}</td>
                                  <td className="px-3 py-2.5">
                                    <Badge variant="secondary" className="text-[10px]">
                                      {typeof bmiValue === "number" ? bmiValue.toFixed(1) : "-"}
                                    </Badge>
                                  </td>
                                  <td className="rounded-r-xl px-3 py-2.5">
                                    <Link href={`/coach/clients/${client._id}`}>
                                      <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                                        Open
                                      </Button>
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
