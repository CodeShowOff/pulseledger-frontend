"use client";

import React, { useMemo, useState } from "react";
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from "@/lib/queries/notifications";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { motion } from "framer-motion";
import {
  Bell,
  BellDot,
  CheckCheck,
  ClipboardList,
  Clock3,
  FileText,
  LucideIcon,
  Megaphone,
  Settings2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function renderMessageWithLinks(text: string) {
  if (!text) return null;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  text.replace(urlPattern, (match, _group, offset) => {
    if (offset > lastIndex) {
      nodes.push(text.slice(lastIndex, offset));
    }

    const href = match.startsWith("http") ? match : `https://${match}`;
    nodes.push(
      <a
        key={`link-${offset}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-indigo-600 underline underline-offset-2 transition-colors hover:text-indigo-700"
      >
        {match}
      </a>
    );

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length ? nodes : [text];
}

type NotificationTone = {
  label: string;
  Icon: LucideIcon;
  iconTone: string;
  typeTone: string;
};

function getNotificationTone(type: string): NotificationTone {
  switch (type) {
    case "order":
      return {
        label: "Order",
        Icon: ClipboardList,
        iconTone: "bg-amber-50 text-amber-600",
        typeTone: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "plan":
      return {
        label: "Plan",
        Icon: FileText,
        iconTone: "bg-emerald-50 text-emerald-600",
        typeTone: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "system":
      return {
        label: "System",
        Icon: Settings2,
        iconTone: "bg-violet-50 text-violet-600",
        typeTone: "border-violet-200 bg-violet-50 text-violet-700",
      };
    default:
      return {
        label: "Info",
        Icon: Sparkles,
        iconTone: "bg-sky-50 text-sky-600",
        typeTone: "border-sky-200 bg-sky-50 text-sky-700",
      };
  }
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const { data, isLoading, isError } = useNotifications(page);
  const markAll = useMarkAllAsRead();
  const markOne = useMarkAsRead();
  const role = useAuthStore((s) => s.user?.role);

  const list = useMemo(() => {
    if (!data) return [];
    if (tab === "unread") return data.data.filter((n) => !n.readAt);
    return data.data;
  }, [data, tab]);

  return (
    <div className="space-y-5 px-3 pt-4 sm:px-4 md:pt-6 lg:px-6">
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
                <Badge className="w-fit border-white/25 bg-white/15 text-white">Inbox</Badge>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Notifications
                </h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block md:text-base">
                  Stay up to date with orders, plans, and system updates from your coaching workspace.
                </CardDescription>
              </div>

              {data?.unread ? (
                <Badge className="border-rose-200/40 bg-rose-500/20 text-rose-50">
                  <BellDot className="h-3.5 w-3.5" />
                  {data.unread} unread
                </Badge>
              ) : null}
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
                <Bell className="h-4 w-4" />
              </span>
              Filters and actions
            </CardTitle>
            <CardDescription>Switch views and quickly manage your inbox.</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Notification filters and actions">
              <Button
                type="button"
                size="sm"
                variant={tab === "all" ? "default" : "outline"}
                aria-pressed={tab === "all"}
                onClick={() => setTab("all")}
                className={cn(
                  tab === "all"
                    ? "border border-indigo-600"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                )}
              >
                All
              </Button>

              <Button
                type="button"
                size="sm"
                variant={tab === "unread" ? "default" : "outline"}
                aria-pressed={tab === "unread"}
                onClick={() => setTab("unread")}
                className={cn(
                  tab === "unread"
                    ? "border border-indigo-600"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                )}
              >
                Unread
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="sm:ml-auto"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {markAll.isPending ? "Marking..." : "Mark all as read"}
              </Button>

              {(role === "admin" || role === "coach") && (
                <Link
                  href={role === "admin" ? "/admin/notifications" : "/coach/notifications"}
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                >
                  <Megaphone className="h-3.5 w-3.5" />
                  Send notification
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {isLoading ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.1 }}
          className="space-y-3"
          aria-live="polite"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`notifications-skeleton-${i}`}
              className="h-[126px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
            />
          ))}
        </motion.section>
      ) : null}

      {isError ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.12 }}
        >
          <Card className="border-rose-200 bg-rose-50">
            <CardContent className="py-6">
              <p className="text-sm font-medium text-rose-700">
                Failed to load notifications.
              </p>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      {data && list.length === 0 ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.14 }}
        >
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500 shadow-sm">
                  <Bell className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No {tab === "unread" ? "unread " : ""}notifications
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  You&apos;re all caught up. We&apos;ll let you know when something changes.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      {data && list.length > 0 ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.16 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                Notification feed
              </CardTitle>
              <CardDescription>
                {list.length} item{list.length !== 1 ? "s" : ""} in this view.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {list.map((n, index) => {
                const tone = getNotificationTone(n.type);

                return (
                  <motion.article
                    key={n._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <div
                      className={cn(
                        "rounded-2xl border p-4 transition-colors",
                        !n.readAt
                          ? "border-amber-300 bg-amber-100/90 hover:border-amber-400 hover:bg-amber-200/80"
                          : "border-slate-200 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/25"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl", tone.iconTone)}>
                          <tone.Icon className="h-4 w-4" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                              {n.title || n.type.toUpperCase()}
                            </p>

                            <Badge className={cn("normal-case tracking-normal", tone.typeTone)}>
                              {tone.label}
                            </Badge>

                            {!n.readAt ? (
                              <Badge variant="success" className="normal-case tracking-normal">
                                New
                              </Badge>
                            ) : null}
                          </div>

                          <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {renderMessageWithLinks(n.message)}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {!n.readAt ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => markOne.mutate(n._id)}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Mark as read
                              </Button>
                            ) : null}

                            {n.meta?.orderId ? (
                              <Link
                                href={`/coach/orders?id=${n.meta.orderId}`}
                                className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                              >
                                View order
                              </Link>
                            ) : null}

                            {n.meta?.requestId ? (
                              <Link
                                href={`/coach/plan-requests?id=${n.meta.requestId}`}
                                className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                              >
                                View request
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      {data?.pagination ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.2 }}
        >
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>

              <p className="text-sm text-slate-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setPage((p) => (data.pagination.page < data.pagination.totalPages ? p + 1 : p))
                }
                disabled={data.pagination.page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}
    </div>
  );
}
