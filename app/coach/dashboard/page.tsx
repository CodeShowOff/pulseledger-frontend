"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/axios";
import { NotificationItem, useLatestNotifications } from "@/lib/queries/notifications";
import { motion } from "@/lib/motion";
import {
  AlertCircle,
  ClipboardList,
  Clock,
  Dumbbell,
  FileText,
  Link2,
  Package,
  Sparkles,
  Star,
  Target,
  MessageSquare,
  UserCircle2,
  Users,
  UtensilsCrossed,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CoachProgressTrendCard = dynamic(() => import("@/components/coach/CoachProgressTrendCard"), {
  ssr: false,
  loading: () => (
    <Card className="h-full border-slate-200/80 bg-white/95">
      <CardContent className="p-4">
        <p className="text-sm text-slate-500">Loading chart data...</p>
      </CardContent>
    </Card>
  ),
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

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";

  const diffMs = Date.now() - timestamp;
  if (diffMs < 60_000) return "Just now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

function getActivityIcon(notification: NotificationItem) {
  switch (notification.type) {
    case "order":
      return ClipboardList;
    case "plan":
      return UtensilsCrossed;
    case "system":
      return Sparkles;
    default:
      return MessageSquare;
  }
}

export default function CoachDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const {
    data: latestNotificationsResponse,
    isLoading: activityLoading,
    isError: activityError,
  } = useLatestNotifications(4);

  const latestActivity = useMemo(() => {
    const notifications = latestNotificationsResponse?.data ?? [];

    return [...notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4)
      .map((notification) => ({
        _id: notification._id,
        label:
          notification.title?.trim() ||
          notification.message?.trim() ||
          notification.type.toUpperCase(),
        time: formatRelativeTime(notification.createdAt),
        Icon: getActivityIcon(notification),
        isUnread: !notification.readAt,
      }));
  }, [latestNotificationsResponse]);

  const publicProfileUrl =
    typeof window !== "undefined" && user?.referralCode
      ? `${window.location.origin}/public/${encodeURIComponent(user.referralCode)}`
      : "";
  const referralCode = user?.referralCode?.trim() ?? "";

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
      description: "Manage profile",
      href: "/profile",
      Icon: UserCircle2,
      color: "from-sky-500 to-cyan-500",
    },
    {
      label: "Platform Fee",
      description: "Manage billing",
      href: "/coach/platform-fee",
      Icon: CreditCard,
      color: "from-indigo-500 to-blue-500",
    },
    {
      label: "Workouts",
      description: "Manage workouts",
      href: "/coach/workout-plans",
      Icon: Dumbbell,
      color: "from-orange-500 to-amber-500",
    },
    {
      label: "Nutrition",
      description: "Manage nutrition",
      href: "/coach/diet-plans",
      Icon: UtensilsCrossed,
      color: "from-emerald-500 to-lime-500",
    },
    {
      label: "Revenue",
      description: "Manage revenue",
      href: "/coach/earnings",
      Icon: Wallet,
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      label: "Reviews",
      description: "Manage reviews",
      href: "/coach/reviews",
      Icon: Star,
      color: "from-rose-500 to-pink-500",
    },
  ];

  const moduleActionOrder: Record<string, number> = {
    Workouts: 1,
    Nutrition: 2,
    "Platform Fee": 3,
    Revenue: 4,
    "Visit My Profile": 5,
    Reviews: 6,
  };

  const moduleActions = [...dashboardActions].sort(
    (a, b) =>
      (moduleActionOrder[a.label] ?? Number.MAX_SAFE_INTEGER) -
      (moduleActionOrder[b.label] ?? Number.MAX_SAFE_INTEGER)
  );

  const quickCards = [
    {
      title: "Earnings Center",
      description: "Track revenue in one place.",
      href: "/coach/earnings",
      cta: "Open Revenue",
      Icon: Wallet,
      badge: "Finance",
      cardClass: "border-emerald-200/80 bg-emerald-50/80 hover:border-emerald-300 hover:bg-emerald-100/70",
      iconClass: "text-emerald-700 group-hover:text-emerald-800",
      arrowClass: "text-emerald-500 group-hover:text-emerald-700",
    },
    {
      title: "Public Profile",
      description: "Share your profile link quickly.",
      href: publicProfileUrl || "#",
      cta: "Open Profile",
      Icon: Link2,
      isExternal: true,
      badge: "Growth",
      cardClass: "border-sky-200/80 bg-sky-50/80 hover:border-sky-300 hover:bg-sky-100/70",
      iconClass: "text-sky-700 group-hover:text-sky-800",
      arrowClass: "text-sky-500 group-hover:text-sky-700",
    },
    {
      title: "Subscription",
      description: "Keep platform access active.",
      href: "/coach/platform-fee",
      cta: "Manage Billing",
      Icon: CreditCard,
      badge:
        subscription && Number.isFinite(subscription.daysRemaining)
          ? `${subscription.daysRemaining} Day${subscription.daysRemaining !== 1 ? "s" : ""} Left`
          : "Checking status",
      cardClass: "border-rose-200/80 bg-rose-50/80 hover:border-rose-300 hover:bg-rose-100/70",
      iconClass: "text-rose-700 group-hover:text-rose-800",
      arrowClass: "text-rose-500 group-hover:text-rose-700",
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
      tone: "from-blue-500 to-indigo-500",
    },
    {
      title: "Active Plans",
      value: statsLoading ? "--" : `${stats?.plans ?? 0}`,
      Icon: FileText,
      tone: "from-violet-500 to-fuchsia-500",
    },
    {
      title: "Products",
      value: statsLoading ? "--" : `${stats?.products ?? 0}`,
      Icon: Package,
      tone: "from-emerald-500 to-teal-500",
    },
  ];

  const chartData = progressData?.length ? progressData : [];

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="grid min-h-[calc(100vh-108px)] grid-cols-1 gap-3">
          <div className="space-y-3">
            <section className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
              >
                <Card className="h-full overflow-hidden border-slate-200/80 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
                  <CardHeader className="gap-3 p-4 sm:p-6">
                    <div className="space-y-2">
                      <h1 className="whitespace-nowrap text-lg font-bold tracking-tight text-white sm:text-3xl">
                        Welcome back, {user?.fullName?.split(" ")[0] || "Coach"}
                      </h1>
                      <CardDescription className="hidden max-w-2xl text-sm !text-white/90 lg:block lg:text-base">
                        Manage your coaching dashboard in one place.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="hidden gap-3 sm:grid sm:grid-cols-3">
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-blue-100">
                        Focus
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        <span className="sm:hidden">Retention</span>
                        <span className="hidden sm:inline">
                          Client retention
                        </span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-blue-100">
                        Today
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        <span className="sm:hidden">Improvements</span>
                        <span className="hidden sm:inline">
                          Plan improvements
                        </span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-blue-100">
                        Status
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        <span className="sm:hidden">Healthy</span>
                        <span className="hidden sm:inline">
                          All systems healthy
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="hidden md:block"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Card className="h-full border-slate-200/80 bg-white/95">
                  <CardHeader className="space-y-1 px-4 pb-2 pt-4">
                    <CardTitle className="flex items-center gap-2 text-[15px]">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Target className="h-3.5 w-3.5" />
                      </span>
                      Quick links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 px-4 pb-4 pt-0">
                    {quickCards.slice(0, 4).map((card) => (
                      <Link key={card.title} href={card.href} className="block">
                        <div
                          className={cn(
                            "group flex items-center justify-between rounded-xl border px-3 py-2 transition-all",
                            card.cardClass,
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "grid h-7 w-7 place-items-center rounded-md bg-white shadow-sm",
                                card.iconClass,
                              )}
                            >
                              <card.Icon className="h-3.5 w-3.5" />
                            </span>
                            <p className="text-sm font-medium text-slate-700">
                              {card.title}
                            </p>
                          </div>
                          <span
                            className={cn("transition-colors", card.arrowClass)}
                          >
                            →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {subscription &&
            (subscription.status === "expired" ||
              subscription.status === "trial" ||
              (subscription.status === "active" &&
                subscription.daysRemaining <= 3)) ? (
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card
                  className={cn(
                    "border shadow-none",
                    subscriptionTone === "danger"
                      ? "border-rose-400/90 bg-gradient-to-r from-rose-100 via-rose-100 to-red-100"
                      : subscriptionTone === "warn"
                        ? "border-amber-200 bg-amber-50/90"
                        : "border-blue-200 bg-blue-50/90",
                  )}
                >
                  <CardContent className="flex flex-col items-stretch gap-3 px-4 pb-4 pt-4 sm:px-5 sm:py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 rounded-xl p-2",
                          subscriptionTone === "danger"
                            ? "bg-rose-200/80"
                            : "bg-white/80",
                        )}
                      >
                        {subscription.status === "expired" ? (
                          <AlertCircle className="h-5 w-5 text-rose-700" />
                        ) : (
                          <Clock
                            className={cn(
                              "h-5 w-5",
                              subscriptionTone === "danger"
                                ? "text-rose-700"
                                : "text-amber-600",
                            )}
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            subscriptionTone === "danger"
                              ? "text-rose-900"
                              : "text-slate-900",
                          )}
                        >
                          {subscription.status === "expired"
                            ? "Subscription expired"
                            : subscription.status === "trial"
                              ? `Trial ends in ${subscription.daysRemaining} day${subscription.daysRemaining !== 1 ? "s" : ""}`
                              : `Subscription ends in ${subscription.daysRemaining} day${subscription.daysRemaining !== 1 ? "s" : ""}`}
                        </p>
                        <p
                          className={cn(
                            "text-sm",
                            subscriptionTone === "danger"
                              ? "text-rose-800"
                              : "text-slate-600",
                          )}
                        >
                          Pay ₹{subscription.platformFee} to keep uninterrupted
                          access to all coach tools.
                        </p>
                      </div>
                    </div>

                    <Link href="/coach/platform-fee" className="w-full">
                      <Button
                        size="sm"
                        className={cn(
                          "h-10 w-full font-semibold",
                          subscriptionTone === "danger"
                            ? "bg-rose-600 text-white hover:bg-rose-700"
                            : subscriptionTone === "warn"
                              ? "bg-amber-500 text-white hover:bg-amber-600"
                              : "bg-blue-600 text-white hover:bg-blue-700",
                        )}
                      >
                        Manage Subscription
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}

            <section>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.28 }}
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h2 className="text-base font-semibold text-slate-900 md:text-lg">
                      Workspace modules
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3 xl:grid-cols-3">
                    {moduleActions.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.14 + index * 0.03,
                          duration: 0.24,
                        }}
                        whileHover={{ y: -2 }}
                      >
                        <Link
                          href={item.href}
                          className="group block h-full cursor-pointer focus-visible:outline-none"
                        >
                          <div className="flex h-full min-h-[136px] cursor-pointer select-none items-center justify-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-3 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_28px_-24px_rgba(15,23,42,0.6)] active:translate-y-[1px] group-focus-visible:ring-4 group-focus-visible:ring-indigo-200 group-focus-visible:ring-offset-2 md:min-h-[148px] md:p-4">
                            <div className="flex w-full flex-col items-center justify-center gap-3 text-center">
                              <span
                                className={cn(
                                  "grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md",
                                  item.color,
                                )}
                              >
                                <item.Icon className="h-7 w-7" />
                              </span>

                              <p className="mt-1 text-sm font-semibold leading-tight text-slate-900 md:text-base">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.25 }}
            >
              <Card className="relative overflow-hidden border-indigo-200/80 bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50">
                <CardContent className="relative px-4 pb-4 pt-5 sm:px-5 sm:pb-5 sm:pt-6">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-300/20 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-violet-300/20 blur-2xl" />

                  <div className="relative space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
                        <Link2 className="h-4 w-4" />
                      </span>
                      <div className="flex min-h-9 items-center">
                        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
                          Invite Code
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl border border-indigo-200/80 bg-white/90 px-3 py-2 text-left transition",
                        referralCode
                          ? "hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                          : "cursor-not-allowed opacity-80",
                      )}
                      onClick={async () => {
                        if (!referralCode) return;
                        try {
                          await navigator.clipboard.writeText(referralCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 1600);
                        } catch {
                          setCopiedCode(false);
                        }
                      }}
                      disabled={!referralCode}
                      aria-label="Copy invite code"
                    >
                      <Badge
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                      >
                        Invite
                      </Badge>
                      <p className="truncate font-mono text-sm font-semibold text-slate-800">
                        {referralCode || "Generating..."}
                      </p>
                      <span className="ml-auto shrink-0 text-xs font-semibold text-indigo-700">
                        {copiedCode ? "Copied" : "Tap to copy"}
                      </span>
                    </button>

                    <div className="flex w-full flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 w-full border-indigo-200 bg-white/80 text-indigo-700 hover:bg-indigo-50"
                        disabled={!publicProfileUrl}
                        onClick={async () => {
                          if (!publicProfileUrl) return;
                          try {
                            await navigator.clipboard.writeText(
                              publicProfileUrl,
                            );
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 1600);
                          } catch {
                            setCopiedLink(false);
                          }
                        }}
                      >
                        {copiedLink ? "Copied" : "Copy Public Profile Link"}
                      </Button>
                      <Link
                        href={publicProfileUrl || "#"}
                        target="_blank"
                        className="w-full"
                      >
                        <Button
                          size="sm"
                          className="h-10 w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          Open Public Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <section className="grid grid-cols-3 items-stretch gap-2 sm:gap-3">
              {kpis.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.04, duration: 0.25 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="h-full border-slate-200/80 bg-white/95 transition-all hover:shadow-[0_16px_40px_-30px_rgba(79,70,229,0.5)]">
                    <CardContent className="px-3 pb-3 pt-4 sm:p-4">
                      <div className="mb-3 flex items-start justify-end gap-1 sm:justify-between">
                        <p className="hidden text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-500 sm:block sm:text-xs">
                          {item.title}
                        </p>
                        <span
                          className={cn(
                            "grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white sm:h-9 sm:w-9 sm:rounded-xl",
                            item.tone,
                          )}
                        >
                          <item.Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                      </div>
                      <p className="text-[1.9rem] font-bold leading-none text-slate-900 sm:text-2xl">
                        {item.value}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </section>

            <section className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <CoachProgressTrendCard
                  chartData={chartData}
                  isLoading={progressLoading}
                />
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
                    <CardDescription>Recent coaching updates.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activityLoading ? (
                      <p className="text-sm text-slate-500">
                        Loading activity...
                      </p>
                    ) : activityError ? (
                      <p className="text-sm text-rose-600">
                        Failed to load activity.
                      </p>
                    ) : latestActivity.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No recent activity yet.
                      </p>
                    ) : (
                      latestActivity.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                        >
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-600 shadow-sm">
                            <item.Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700">
                              {item.label}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-slate-500">
                                {item.time}
                              </p>
                              {item.isUnread ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                  New
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            <section>
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Card className="border-slate-200/80 bg-white/95">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">
                        Recent clients
                      </CardTitle>
                    </div>
                    <Link href="/coach/clients">
                      <Button variant="outline" size="sm">
                        View all
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {clientsLoading ? (
                      <p className="text-sm text-slate-500">
                        Loading clients...
                      </p>
                    ) : (clients ?? []).length === 0 ? (
                      <p className="text-sm text-slate-500">No clients yet.</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1 text-xs uppercase tracking-wide text-slate-500">
                          <span>Name</span>
                          <span>Chat</span>
                        </div>

                        {(clients ?? []).map((client) => (
                          <div
                            key={client._id}
                            className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-slate-700 transition-colors hover:bg-slate-100/80"
                            tabIndex={0}
                            onClick={() =>
                              router.push(`/coach/clients/${client._id}`)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                router.push(`/coach/clients/${client._id}`);
                              }
                            }}
                          >
                            <p className="min-w-0 truncate font-medium">
                              {client.fullName}
                            </p>

                            <Link
                              href={`/coach/chat?clientId=${client._id}`}
                              className="shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 border-indigo-200 px-2.5 text-indigo-700 hover:bg-indigo-50"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span>Chat</span>
                              </Button>
                            </Link>
                          </div>
                        ))}
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
