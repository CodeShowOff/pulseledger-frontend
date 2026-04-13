"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import Image from "next/image";
import { motion } from "@/lib/motion";
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  QrCode,
  User2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCoachPendingPlanRequests, COACH_PENDING_PLAN_REQUESTS_KEY } from "@/lib/queries/planRequests";

type CoachSubscription = {
  _id: string;
  status: string;
  planId?: { _id: string; title: string } | null;
  planTitle?: string;
  clientId?: { _id: string; fullName?: string; email?: string } | null;
  createdAt?: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function formatDateTime(value?: string) {
  if (!value) return "-";

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return "-";

  return timestamp.toLocaleString();
}

function getPaymentMethodLabel(mode?: "cash" | "manual_qr" | null) {
  if (mode === "cash") return "Cash on Delivery";
  if (mode === "manual_qr") return "QR Payment";
  return "Not specified";
}

export default function CoachPlanRequestsPage() {
  const { data: requests = [], isLoading, error } = useCoachPendingPlanRequests();
  const queryClient = useQueryClient();

  const { data: subsResponse } = useQuery<{ success: boolean; data: CoachSubscription[] }>({
    queryKey: ["coachSubscriptions"],
    queryFn: async () => {
      const res = await api.get("/subscriptions/coach");
      return res.data;
    },
  });

  const activeSubsByClient = useMemo(() => {
    const map = new Map<string, CoachSubscription>();
    (subsResponse?.data ?? []).forEach((sub) => {
      const clientId = sub.clientId?._id;
      if (!clientId) return;
      if (sub.status === "approved") {
        const existing = map.get(clientId);
        // keep the latest approved
        const existingCreated = existing?.createdAt ? new Date(existing.createdAt).getTime() : 0;
        const currentCreated = sub.createdAt ? new Date(sub.createdAt).getTime() : 0;
        if (!existing || currentCreated > existingCreated) {
          map.set(clientId, sub);
        }
      }
    });
    return map;
  }, [subsResponse]);

  const stats = useMemo(() => {
    let cashCount = 0;
    let qrCount = 0;

    requests.forEach((request) => {
      if (request.paymentMode === "cash") cashCount += 1;
      if (request.paymentMode === "manual_qr") qrCount += 1;
    });

    return {
      total: requests.length,
      cash: cashCount,
      qr: qrCount,
    };
  }, [requests]);

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/plan-requests/${id}/approve`);
    },
    onSuccess: () => {
      toast.success("Request approved");
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachSubscriptions"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to approve");
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/plan-requests/${id}/decline`);
    },
    onSuccess: () => {
      toast.success("Request declined");
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachSubscriptions"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to decline");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-5 pt-4 md:pt-6">
        <div className="h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="grid gap-3 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`plan-request-skeleton-${idx}`}
              className="h-[260px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
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
              Failed to load pending plan requests.
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
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl">
                  Pending plan requests
                </h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  Review incoming requests, verify payment context, and approve or decline with clarity.
                </CardDescription>
              </div>

              <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <Badge
                  variant="warning"
                  className="w-fit border-rose-300/50 bg-rose-500 text-white"
                  aria-label={`${stats.total} pending plan request${stats.total === 1 ? "" : "s"}`}
                >
                  {stats.total > 99 ? "99+" : stats.total} Pending
                </Badge>
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
                <ClipboardList className="h-4 w-4" />
              </span>
              Requests queue
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No pending requests</p>
                <p className="mt-1 text-xs text-slate-500">New plan requests will appear here when clients submit them.</p>
              </div>
            ) : (
              <div className="grid gap-3 xl:grid-cols-2">
                {requests.map((req, index) => {
                  const active = activeSubsByClient.get(req.clientId?._id || "");
                  const isQrPayment = req.paymentMode === "manual_qr";

                  return (
                    <motion.article
                      key={req._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: index * 0.02 }}
                    >
                      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/20">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
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
                            <p className="mt-1 text-xs text-slate-500">
                              Requested on {formatDateTime(req.createdAt)}
                            </p>
                          </div>

                          <Badge
                            variant={isQrPayment ? "default" : req.paymentMode === "cash" ? "secondary" : "warning"}
                            className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                          >
                            {isQrPayment ? <QrCode className="h-3.5 w-3.5" /> : null}
                            {getPaymentMethodLabel(req.paymentMode)}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
                            <User2 className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate">
                              {req.clientId?.fullName ?? "Unknown client"}
                            </span>
                          </div>

                          {active ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                              <p className="font-semibold">Active Subscription</p>
                              <p className="mt-0.5">
                                {active.planId?.title || active.planTitle || "(title removed)"}
                              </p>
                            </div>
                          ) : null}

                          {req.notes ? (
                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                              <p className="mb-0.5 font-semibold text-slate-700">Client notes</p>
                              <p className="whitespace-pre-line">{req.notes}</p>
                            </div>
                          ) : null}

                          {isQrPayment && req.paymentProofUrl ? (
                            <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                              <a
                                href={req.paymentProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex text-xs font-semibold text-indigo-700 underline underline-offset-4 transition-colors hover:text-indigo-800"
                                aria-label="Open payment proof in a new tab"
                              >
                                View full payment proof
                              </a>

                              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                <Image
                                  src={req.paymentProofUrl}
                                  alt={`Payment proof from ${req.clientId?.fullName ?? "client"}`}
                                  width={960}
                                  height={640}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 640px"
                                  className="h-auto max-h-[220px] w-full object-contain"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            onClick={() => approveMutation.mutate(req._id)}
                            className={cn(
                              "sm:min-w-[128px]",
                              "bg-emerald-600 text-white hover:bg-emerald-700"
                            )}
                          >
                            {approveMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            onClick={() => declineMutation.mutate(req._id)}
                            className="sm:min-w-[128px]"
                          >
                            {declineMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Declining...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                Decline
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
