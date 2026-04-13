"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import getErrorMessage from "@/lib/getErrorMessage";
import { motion } from "@/lib/motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp,
  Upload,
  UserPlus2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useProfileQuery } from "@/lib/queries/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SubscriptionStatus {
  status: "trial" | "active" | "expired" | "suspended";
  isValid: boolean;
  daysRemaining: number;
  trialEndsAt: string;
  subscriptionExpiresAt: string | null;
  lastPaymentDate: string | null;
  totalPaid: number;
  platformFee: number;
  paymentQrUrl: string | null;
  notifications: {
    threeDayWarning: boolean;
    oneDayWarning: boolean;
    expiryNotification: boolean;
  };
}

interface PaymentHistory {
  _id: string;
  amount: number;
  transactionId: string;
  paymentProof: string;
  status: "pending" | "approved" | "rejected";
  paidAt: string;
  approvedAt?: string;
  approvedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  rejectionReason?: string;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
}

interface CoachReferralData {
  referralCode: string;
  stats: {
    totalReferred: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalDaysEarned: number;
  };
  referredCoaches: Array<{
    fullName: string;
    email: string;
    joinedAt: string;
    status: "pending" | "subscribed";
    subscriptionStatus?: string;
  }>;
}

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateString?: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getPaymentBadge(status: PaymentHistory["status"]) {
  if (status === "approved") {
    return (
      <Badge
        variant="success"
        className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge
        variant="danger"
        className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Rejected
      </Badge>
    );
  }

  return (
    <Badge
      variant="warning"
      className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
    >
      <Clock className="h-3.5 w-3.5" />
      Pending
    </Badge>
  );
}

function getReferralBadge(status: "pending" | "subscribed") {
  if (status === "subscribed") {
    return (
      <Badge
        variant="success"
        className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
      >
        Subscribed
      </Badge>
    );
  }

  return (
    <Badge
      variant="warning"
      className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
    >
      Pending
    </Badge>
  );
}

export default function PlatformFeeManagementPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfileQuery();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(
    null
  );

  const { data: subscription, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["platformSubscription"],
    queryFn: async () => {
      const res = await api.get("/platform-subscription/status");
      return res.data.data;
    },
  });

  const {
    data: paymentHistory = [],
    isLoading: historyLoading,
    isFetching: historyFetching,
  } = useQuery<PaymentHistory[]>({
    queryKey: ["platformSubscriptionHistory"],
    queryFn: async () => {
      const res = await api.get("/platform-subscription/history");
      return res.data.data;
    },
  });

  const { data: referrals, isLoading: referralsLoading } = useQuery<CoachReferralData>({
    queryKey: ["coachReferrals"],
    queryFn: async () => {
      const res = await api.get("/coach/referrals");
      return res.data.data as CoachReferralData;
    },
    enabled: subscription?.isValid === true,
  });

  const resetPaymentForm = () => {
    setShowPaymentForm(false);
    setPaymentProof(null);
    setTransactionId("");
    setNotes("");
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  useEffect(() => {
    return () => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  const submitPaymentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/platform-subscription/payment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformSubscription"] });
      queryClient.invalidateQueries({ queryKey: ["platformSubscriptionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["coachReferrals"] });
      resetPaymentForm();
      toast.success("Payment submitted successfully! Awaiting admin approval.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to submit payment"));
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setPaymentProof(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProof) {
      toast.error("Please upload payment proof screenshot");
      return;
    }

    const formData = new FormData();
    formData.append("paymentProof", paymentProof);
    if (transactionId.trim()) formData.append("transactionId", transactionId.trim());
    if (notes.trim()) formData.append("notes", notes.trim());

    submitPaymentMutation.mutate(formData);
  };

  const approvedPayments = useMemo(
    () => paymentHistory.filter((payment) => payment.status === "approved"),
    [paymentHistory]
  );
  const pendingPayments = useMemo(
    () => paymentHistory.filter((payment) => payment.status === "pending"),
    [paymentHistory]
  );
  const rejectedPayments = useMemo(
    () => paymentHistory.filter((payment) => payment.status === "rejected"),
    [paymentHistory]
  );

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <div className="h-[200px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`platform-skeleton-${idx}`}
              className="h-[130px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="pt-4 md:pt-6">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-rose-700">
              Unable to load subscription information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = subscription.status === "expired";
  const isNearExpiry =
    subscription.daysRemaining <= 7 && subscription.daysRemaining > 0;

  const statusMeta =
    subscription.status === "expired"
      ? {
          label: "Expired",
          dot: "bg-rose-300",
          pill: "border-rose-200/50 bg-rose-500/15 text-rose-100",
        }
      : subscription.status === "active"
      ? {
          label: "Active",
          dot: "bg-emerald-300",
          pill: "border-emerald-200/40 bg-emerald-500/15 text-emerald-100",
        }
      : subscription.status === "trial"
      ? {
          label: "Trial",
          dot: "bg-sky-300",
          pill: "border-sky-200/40 bg-sky-500/15 text-sky-100",
        }
      : {
          label: "Suspended",
          dot: "bg-amber-300",
          pill: "border-amber-200/50 bg-amber-500/15 text-amber-100",
        };

  const daysRemainingTone =
    subscription.daysRemaining <= 0
      ? "text-rose-600"
      : subscription.daysRemaining <= 3
      ? "text-rose-600"
      : subscription.daysRemaining <= 7
      ? "text-amber-600"
      : "text-emerald-600";

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
                  Platform fee management
                </h1>
              </div>

              <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:items-end sm:gap-2">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide sm:px-3 sm:py-1.5 sm:text-xs",
                    statusMeta.pill
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", statusMeta.dot)} />
                  {statusMeta.label}
                </div>

                <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                  <div className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    type="button"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap rounded-xl !bg-white px-2 text-[11px] font-semibold leading-none !text-indigo-700 hover:!bg-indigo-50 sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                    onClick={() => setShowPaymentForm(true)}
                  >
                    <CreditCard className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="sm:hidden">Submit payment</span>
                    <span className="hidden sm:inline">
                      {pendingPayments.length > 0 ? "Submit another payment" : "Submit payment"}
                    </span>
                  </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5 sm:grid-cols-2 sm:gap-3 sm:pt-2 lg:grid-cols-4">
              <div className="min-w-0 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 sm:px-4 sm:py-3">
                <p className="text-[9px] uppercase tracking-wide text-blue-100 sm:text-[11px]">
                  <span className="sm:hidden">Days left</span>
                  <span className="hidden sm:inline">Days remaining</span>
                </p>
                <p className="mt-0.5 text-lg font-semibold sm:mt-1 sm:text-xl">
                  {subscription.daysRemaining}
                </p>
              </div>
              <div className="min-w-0 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 sm:px-4 sm:py-3">
                <p className="text-[9px] uppercase tracking-wide text-blue-100 sm:text-[11px]">Platform fee</p>
                <p className="mt-0.5 text-lg font-semibold sm:mt-1 sm:text-xl">{formatCurrency(subscription.platformFee)}</p>
              </div>
              <div className="min-w-0 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 sm:px-4 sm:py-3">
                <p className="text-[9px] uppercase tracking-wide text-blue-100 sm:text-[11px]">Total paid</p>
                <p className="mt-0.5 text-lg font-semibold sm:mt-1 sm:text-xl">{formatCurrency(subscription.totalPaid)}</p>
              </div>
              <div className="min-w-0 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 sm:px-4 sm:py-3">
                <p className="text-[9px] uppercase tracking-wide text-blue-100 sm:text-[11px]">
                  <span className="sm:hidden">Pending</span>
                  <span className="hidden sm:inline">Pending verifications</span>
                </p>
                <p className="mt-0.5 text-lg font-semibold sm:mt-1 sm:text-xl">{pendingPayments.length}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      {(isExpired || isNearExpiry) && (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.04 }}
        >
          <Card
            className={cn(
              "border shadow-none",
              isExpired
                ? "border-rose-400/90 bg-gradient-to-r from-rose-100 via-rose-100 to-red-100"
                : "border-amber-200 bg-amber-50/90"
            )}
          >
            <CardContent className="flex flex-col items-stretch gap-3 px-4 pb-4 pt-4 sm:px-5 sm:py-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 rounded-xl p-2",
                    isExpired ? "bg-rose-200/80" : "bg-white/80"
                  )}
                >
                  {isExpired ? (
                    <AlertCircle className="h-5 w-5 text-rose-700" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isExpired ? "text-rose-900" : "text-slate-900"
                    )}
                  >
                    {isExpired
                      ? "Subscription expired"
                      : `Subscription expires in ${subscription.daysRemaining} day${
                          subscription.daysRemaining !== 1 ? "s" : ""
                        }`}
                  </p>
                  <p
                    className={cn(
                      "text-sm",
                      isExpired ? "text-rose-800" : "text-slate-600"
                    )}
                  >
                    Pay {formatCurrency(subscription.platformFee)} to keep uninterrupted access to your coach tools.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={() => setShowPaymentForm(true)}
                className={cn(
                  "h-10 w-full font-semibold",
                  isExpired
                    ? "!bg-rose-600 !text-white hover:!bg-rose-700"
                    : "!bg-emerald-600 !text-white hover:!bg-emerald-700"
                )}
              >
                {isExpired ? "Renew now" : "Pay now"}
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      )}

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.08 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <TrendingUp className="h-4 w-4" />
              </span>
              Payment snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
              <p className="text-xs text-slate-500">Current balance status</p>
              <p className={cn("mt-1 text-lg font-semibold", daysRemainingTone)}>
                {subscription.daysRemaining} day{subscription.daysRemaining !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-slate-500">
                {subscription.status === "trial"
                  ? `Trial ends on ${formatDate(subscription.trialEndsAt)}`
                  : `Expires on ${formatDate(subscription.subscriptionExpiresAt)}`}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
              <p className="text-xs text-slate-500">Last payment</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {subscription.lastPaymentDate ? formatDate(subscription.lastPaymentDate) : "Not available"}
              </p>
              <p className="text-xs text-slate-500">Monthly fee {formatCurrency(subscription.platformFee)}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
              <p className="text-xs text-emerald-700">Approved</p>
              <p className="mt-1 text-lg font-semibold text-emerald-800">{approvedPayments.length}</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
              <p className="text-xs text-amber-700">Pending / Rejected</p>
              <p className="mt-1 text-lg font-semibold text-amber-800">
                {pendingPayments.length} / {rejectedPayments.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <UserPlus2 className="h-4 w-4" />
              </span>
              Referral benefit
            </CardTitle>
            <CardDescription>
              Earn +10 days when a referred coach completes their first approved subscription payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile?.coachCode ? (
              <>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    Referral code
                  </Badge>
                  <span className="font-mono text-sm font-semibold text-slate-800">
                    {profile.coachCode}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(profile.coachCode ?? "");
                        toast.success("Referral code copied");
                      } catch {
                        toast.error("Unable to copy right now");
                      }
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>

                <a
                  href={`/public/${profile.coachCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button type="button" variant="outline">
                    Open public profile
                  </Button>
                </a>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Your referral code will appear here once available.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.12 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <UserPlus2 className="h-4 w-4" />
              </span>
              Referral tracking
            </CardTitle>
            <CardDescription>Monitor your invited coaches and rewards performance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!subscription.isValid ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                Referral stats are available once your subscription is active.
              </div>
            ) : referralsLoading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                Loading referral stats...
              </div>
            ) : !referrals ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
                Unable to load referral stats right now.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-3">
                    <p className="text-xs text-indigo-700">Total referred</p>
                    <p className="mt-1 text-lg font-semibold text-indigo-800">
                      {referrals.stats.totalReferred}
                    </p>
                  </div>
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-3">
                    <p className="text-xs text-cyan-700">Successful</p>
                    <p className="mt-1 text-lg font-semibold text-cyan-800">
                      {referrals.stats.successfulReferrals}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                    <p className="text-xs text-amber-700">Pending</p>
                    <p className="mt-1 text-lg font-semibold text-amber-800">
                      {referrals.stats.pendingReferrals}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                    <p className="text-xs text-emerald-700">Days earned</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-800">
                      +{referrals.stats.totalDaysEarned}
                    </p>
                  </div>
                </div>

                {referrals.referredCoaches.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                    No referrals yet — share your code to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Joined</th>
                          <th>Status</th>
                          <th>Subscription</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.referredCoaches.map((coach) => (
                          <tr key={`${coach.email}-${coach.joinedAt}`}>
                            <td style={{ fontWeight: 600 }}>{coach.fullName}</td>
                            <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                              {coach.email}
                            </td>
                            <td>{formatDate(coach.joinedAt)}</td>
                            <td>{getReferralBadge(coach.status)}</td>
                            <td style={{ textTransform: "capitalize" }}>
                              {coach.subscriptionStatus || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.16 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FileText className="h-4 w-4" />
                  </span>
                  Payment history
                </CardTitle>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["platformSubscriptionHistory"] })}
                disabled={historyFetching}
              >
                <RefreshCw className={cn("h-4 w-4", historyFetching ? "animate-spin" : "")} />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {historyLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`payment-skeleton-${i}`}
                    className="h-12 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70"
                  />
                ))}
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <FileText className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No payment history yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Your payment records will appear here after your first submission.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="admin-table min-w-[780px]">
                  <thead>
                    <tr>
                      <th>Submitted</th>
                      <th>Amount</th>
                      <th>Transaction ID</th>
                      <th>Status</th>
                      <th>Valid till</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment._id}>
                        <td className="align-top">
                          <div className="flex flex-col gap-0.5">
                            <span className="whitespace-nowrap font-semibold text-slate-900">
                              {formatDate(payment.paidAt)}
                            </span>
                            <span className="whitespace-nowrap text-xs text-slate-500">
                              {new Date(payment.paidAt)
                                .toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                                .toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: "#0f172a" }}>
                          {formatCurrency(payment.amount)}
                        </td>
                        <td>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.82rem",
                              backgroundColor: "#f1f5f9",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.4rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {payment.transactionId || "-"}
                          </span>
                        </td>
                        <td>{getPaymentBadge(payment.status)}</td>
                        <td className="align-top">
                          {payment.validUntil ? (
                            <span className="whitespace-nowrap font-semibold text-slate-900">
                              {formatDate(payment.validUntil)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {showPaymentForm ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => {
            if (!submitPaymentMutation.isPending) resetPaymentForm();
          }}
        >
          <Card
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-slate-200/90 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Submit payment</CardTitle>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!submitPaymentMutation.isPending) resetPaymentForm();
                  }}
                  className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close payment modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              {subscription.paymentQrUrl ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-center">
                  <p className="mb-2 text-sm font-medium text-slate-700">Scan QR code to pay</p>
                  <a
                    href={subscription.paymentQrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={subscription.paymentQrUrl}
                      alt="Payment QR code"
                      width={320}
                      height={320}
                      sizes="(max-width: 640px) 100vw, 320px"
                      loading="lazy"
                      unoptimized
                      className="mx-auto w-full max-w-[320px] rounded-lg border border-slate-200 bg-white p-2"
                    />
                  </a>
                </div>
              ) : null}

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Transaction ID (optional)
                  </label>
                  <Input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction/reference ID"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment proof screenshot
                  </label>
                  <input
                    id="paymentProof"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="paymentProof"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    <Upload className="h-4 w-4" />
                    {paymentProof ? "Change screenshot" : "Upload screenshot"}
                  </label>

                  {paymentProof ? (
                    <p className="mt-1.5 text-xs text-slate-500">Selected: {paymentProof.name}</p>
                  ) : null}

                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Payment proof preview"
                      width={1200}
                      height={800}
                      sizes="(max-width: 768px) 100vw, 720px"
                      loading="lazy"
                      unoptimized
                      className="mt-2 max-h-[220px] w-full rounded-lg border border-slate-200 object-contain"
                    />
                  ) : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes"
                    className="min-h-[92px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetPaymentForm}
                    disabled={submitPaymentMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitPaymentMutation.isPending || !paymentProof}
                  >
                    {submitPaymentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit payment"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {selectedPayment ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <Card
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border-slate-200/90 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Payment details</CardTitle>
                  <CardDescription>
                    Submitted on {formatDateTime(selectedPayment.paidAt)}
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close details modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <div className="mt-1">{getPaymentBadge(selectedPayment.status)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                <p className="text-xs text-slate-500">Transaction ID</p>
                <p className="mt-1 font-mono text-sm text-slate-800">
                  {selectedPayment.transactionId || "-"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                  <p className="text-xs text-slate-500">Submitted on</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDateTime(selectedPayment.paidAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                  <p className="text-xs text-slate-500">Processed on</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDateTime(selectedPayment.approvedAt)}
                  </p>
                  {selectedPayment.approvedBy ? (
                    <p className="mt-1 text-xs text-slate-500">
                      by {selectedPayment.approvedBy.fullName}
                    </p>
                  ) : null}
                </div>
              </div>

              {selectedPayment.validUntil ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                  <p className="text-xs text-emerald-700">Valid till</p>
                  <p className="mt-1 text-sm font-medium text-emerald-800">
                    {formatDate(selectedPayment.validUntil)}
                  </p>
                </div>
              ) : null}

              {selectedPayment.notes ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                  <p className="text-xs text-slate-500">Notes</p>
                  <p className="mt-1 text-sm text-slate-700">{selectedPayment.notes}</p>
                </div>
              ) : null}

              {selectedPayment.rejectionReason ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3">
                  <p className="text-xs font-semibold text-rose-700">Rejection reason</p>
                  <p className="mt-1 text-sm text-rose-800">
                    {selectedPayment.rejectionReason}
                  </p>
                </div>
              ) : null}

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                <p className="mb-2 text-xs text-slate-500">Payment proof</p>
                {selectedPayment.paymentProof ? (
                  <a
                    href={selectedPayment.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Image
                      src={selectedPayment.paymentProof}
                      alt="Payment proof"
                      width={1200}
                      height={800}
                      sizes="(max-width: 1024px) 100vw, 900px"
                      loading="lazy"
                      unoptimized
                      className="w-full rounded-lg border border-slate-200"
                    />
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">No payment proof available</p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
