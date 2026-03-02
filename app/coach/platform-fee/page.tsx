"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  X,
  Calendar,
  TrendingUp,
  IndianRupee,
  FileText,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { useProfileQuery } from "@/lib/queries/profile";

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

export default function PlatformFeeManagementPage() {
  const queryClient = useQueryClient();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);
  const { data: profile } = useProfileQuery();

  // Fetch subscription status
  const { data: subscription, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["platformSubscription"],
    queryFn: async () => {
      const res = await api.get("/platform-subscription/status");
      return res.data.data;
    },
  });

  // Fetch payment history
  const { data: paymentHistory = [] } = useQuery<PaymentHistory[]>({
    queryKey: ["platformSubscriptionHistory"],
    queryFn: async () => {
      const res = await api.get("/platform-subscription/history");
      return res.data.data;
    },
  });

  // Fetch coach referral stats
  const { data: referrals } = useQuery<CoachReferralData>({
    queryKey: ["coachReferrals"],
    queryFn: async () => {
      const res = await api.get("/coach/referrals");
      return res.data.data as CoachReferralData;
    },
    // When subscription is expired/invalid, backend blocks this endpoint.
    enabled: subscription?.isValid === true,
  });

  // Submit payment mutation
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
      setShowPaymentForm(false);
      setPaymentProof(null);
      setTransactionId("");
      setNotes("");
      setPreviewUrl(null);
      alert("Payment submitted successfully! Awaiting admin approval.");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const msg = (error as any).response?.data?.message || (error as any).message;
        alert(msg || "Failed to submit payment");
      } else if (error instanceof Error) {
        alert(error.message || "Failed to submit payment");
      } else {
        alert(String(error) || "Failed to submit payment");
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setPaymentProof(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProof) {
      alert("Please upload payment proof screenshot");
      return;
    }

    const formData = new FormData();
    formData.append("paymentProof", paymentProof);
    if (transactionId) formData.append("transactionId", transactionId);
    if (notes) formData.append("notes", notes);

    submitPaymentMutation.mutate(formData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "trial":
        return "#3b82f6";
      case "active":
        return "#10b981";
      case "expired":
        return "#ef4444";
      case "suspended":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              backgroundColor: "#fef3c7",
              color: "#92400e",
              fontWeight: 600,
            }}
          >
            <Clock size={14} />
            Pending
          </span>
        );
      case "approved":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              backgroundColor: "#d1fae5",
              color: "#065f46",
              fontWeight: 600,
            }}
          >
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              fontWeight: 600,
            }}
          >
            <AlertCircle size={14} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getReferralStatusBadge = (status: "pending" | "subscribed") => {
    if (status === "pending") {
      return (
        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", backgroundColor: "#fef3c7", color: "#92400e" }}>
          Pending
        </span>
      );
    }
    return (
      <span style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", backgroundColor: "#d1fae5", color: "#065f46" }}>
        Subscribed
      </span>
    );
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 0) return "#ef4444";
    if (days <= 3) return "#ef4444";
    if (days <= 7) return "#f59e0b";
    return "#10b981";
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <p>Loading platform fee details...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <p style={{ color: "#ef4444" }}>Unable to load subscription information</p>
        </div>
      </div>
    );
  }

  const isExpired = subscription.status === "expired";
  const isNearExpiry = subscription.daysRemaining <= 7 && subscription.daysRemaining > 0;

  // Calculate statistics from payment history
  const approvedPayments = paymentHistory.filter((p) => p.status === "approved");
  const pendingPayments = paymentHistory.filter((p) => p.status === "pending");
  const rejectedPayments = paymentHistory.filter((p) => p.status === "rejected");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-page"
    >
      {/* Header */}
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">💳 Platform Fee Management</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "9999px",
              backgroundColor: `${getStatusColor(subscription.status)}20`,
              border: `2px solid ${getStatusColor(subscription.status)}`,
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: getStatusColor(subscription.status),
              }}
            />
            <span
              style={{
                textTransform: "capitalize",
                fontWeight: 600,
                color: getStatusColor(subscription.status),
              }}
            >
              {subscription.status}
            </span>
          </div>
        </div>
      </section>

      {/* Alert Banners */}
      {isExpired && (
        <div
          className="admin-card"
          style={{
            backgroundColor: "#fee2e2",
            border: "2px solid #ef4444",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <AlertCircle
              style={{ color: "#dc2626", width: 28, height: 28, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#991b1b",
                  marginBottom: "0.5rem",
                }}
              >
                ⚠️ Subscription Expired
              </h3>
              <p style={{ color: "#7f1d1d", marginBottom: "1rem" }}>
                Your platform access has expired. Please make a payment of ₹
                {subscription.platformFee} to continue using FitCoach and access all
                features.
              </p>
              <button
                className="btn btn--primary"
                onClick={() => setShowPaymentForm(true)}
                style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}
              >
                Pay Now ₹{subscription.platformFee}
              </button>
            </div>
          </div>
        </div>
      )}

      {isNearExpiry && !isExpired && (
        <div
          className="admin-card"
          style={{
            backgroundColor: "#fef3c7",
            border: "2px solid #f59e0b",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <AlertTriangle
              style={{ color: "#d97706", width: 28, height: 28, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#92400e",
                  marginBottom: "0.5rem",
                }}
              >
                ⏰ Subscription Expiring Soon
              </h3>
              <p style={{ color: "#78350f", marginBottom: "1rem" }}>
                Your subscription will expire in {subscription.daysRemaining} day
                {subscription.daysRemaining !== 1 ? "s" : ""}. Pay now to avoid service
                interruption and continue enjoying uninterrupted access.
              </p>
              <button
                className="btn btn--primary"
                onClick={() => setShowPaymentForm(true)}
                style={{ backgroundColor: "#d97706", borderColor: "#d97706" }}
              >
                Renew Now ₹{subscription.platformFee}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div
        className="admin-card-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          marginBottom: "1.5rem",
        }}
      >
        {/* Days Remaining */}
        <div className="admin-card" style={{ borderLeft: `4px solid ${getDaysRemainingColor(subscription.daysRemaining)}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <Calendar style={{ color: getDaysRemainingColor(subscription.daysRemaining), width: 24, height: 24 }} />
            <p className="admin-card__label">Days Remaining</p>
          </div>
          <p
            className="admin-card__value"
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: getDaysRemainingColor(subscription.daysRemaining),
            }}
          >
            {subscription.daysRemaining}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
            {subscription.status === "trial"
              ? `Trial ends on ${formatDate(subscription.trialEndsAt)}`
              : subscription.subscriptionExpiresAt
              ? `Expires on ${formatDate(subscription.subscriptionExpiresAt)}`
              : "No active subscription"}
          </p>
        </div>

        {/* Platform Fee */}
        <div className="admin-card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <IndianRupee style={{ color: "#3b82f6", width: 24, height: 24 }} />
            <p className="admin-card__label">Platform Fee</p>
          </div>
          <p
            className="admin-card__value"
            style={{ fontSize: "2.5rem", fontWeight: 700, color: "#3b82f6" }}
          >
            ₹{subscription.platformFee}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
            Per month (30 days)
          </p>
        </div>

        {/* Total Paid */}
        <div className="admin-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <TrendingUp style={{ color: "#10b981", width: 24, height: 24 }} />
            <p className="admin-card__label">Total Paid</p>
          </div>
          <p
            className="admin-card__value"
            style={{ fontSize: "2.5rem", fontWeight: 700, color: "#10b981" }}
          >
            ₹{subscription.totalPaid}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
            {approvedPayments.length} successful payments
          </p>
        </div>

        {/* Payment Status Summary */}
        <div className="admin-card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <FileText style={{ color: "#8b5cf6", width: 24, height: 24 }} />
            <p className="admin-card__label">Payment Summary</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Approved:</span>
              <span style={{ fontSize: "1rem", fontWeight: 600, color: "#10b981" }}>
                {approvedPayments.length}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Pending:</span>
              <span style={{ fontSize: "1rem", fontWeight: 600, color: "#f59e0b" }}>
                {pendingPayments.length}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Rejected:</span>
              <span style={{ fontSize: "1rem", fontWeight: 600, color: "#ef4444" }}>
                {rejectedPayments.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Card */}
      <div className="admin-card" style={{ marginBottom: "1.5rem", backgroundColor: "#f0f9ff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1e40af", marginBottom: "0.5rem" }}>
              Ready to Renew Your Subscription?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#1e3a8a" }}>
              Make a payment now to extend your platform access by 30 days
            </p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => setShowPaymentForm(true)}
            style={{ whiteSpace: "nowrap" }}
          >
            Make Payment
          </button>
        </div>
      </div>

      {/* Referral Benefit Callout */}
      <div className="admin-card" style={{ marginBottom: "1.5rem", backgroundColor: "#f0fdf4", borderColor: "#22c55e" }}>
        <h2 className="admin-card__title" style={{ color: "#166534" }}>Referral Benefit</h2>
        <div style={{ marginTop: "0.75rem", color: "#166534" }}>
          <p style={{ marginBottom: "0.75rem" }}>
            Invite other coaches to join FitCoach. When a referred coach completes their first platform subscription payment and it’s approved, you’ll receive <strong>+10 days</strong> added to your current subscription or trial.
          </p>
          {profile?.coachCode ? (
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>Your referral code:</span>
                <span style={{ fontWeight: 700, color: "#065f46" }}>{profile.coachCode}</span>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(profile.coachCode!);
                    } catch {
                      // Clipboard API not available
                    }
                  }}
                  title="Copy referral code"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <a
                  className="btn btn--secondary"
                  href={`/public/${profile.coachCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share Public Profile
                </a>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: "0.875rem", color: "#374151" }}>Your referral code will appear here once available.</p>
          )}
        </div>
      </div>

      {/* Referral Tracking */}
      <div className="admin-card" style={{ marginBottom: "1.5rem", backgroundColor: "#f8fafc", borderColor: "#334155" }}>
        <h2 className="admin-card__title" style={{ color: "#0f172a" }}>Referral Stats</h2>
        {!subscription.isValid ? (
          <p style={{ color: "#6b7280", marginTop: "0.75rem" }}>
            Referral stats are available once your subscription is active.
          </p>
        ) : !referrals ? (
          <p style={{ color: "#6b7280", marginTop: "0.75rem" }}>Loading referral stats...</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginTop: "0.75rem" }}>
              <div style={{ backgroundColor: "#eef2ff", padding: "0.75rem", borderRadius: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>Total Referred</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#4338ca" }}>{referrals.stats.totalReferred}</div>
              </div>
              <div style={{ backgroundColor: "#ecfeff", padding: "0.75rem", borderRadius: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>Successful</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0e7490" }}>{referrals.stats.successfulReferrals}</div>
              </div>
              <div style={{ backgroundColor: "#fff7ed", padding: "0.75rem", borderRadius: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>Pending</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#c2410c" }}>{referrals.stats.pendingReferrals}</div>
              </div>
              <div style={{ backgroundColor: "#f0fdf4", padding: "0.75rem", borderRadius: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>Days Earned</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>+{referrals.stats.totalDaysEarned}</div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>Referred Coaches</h3>
              {referrals.referredCoaches.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No referrals yet — share your code to get started!</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
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
                      {referrals.referredCoaches.map((c) => (
                        <tr key={`${c.email}-${c.joinedAt}`}>
                          <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                          <td style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>{c.email}</td>
                          <td>{formatDate(c.joinedAt)}</td>
                          <td>{getReferralStatusBadge(c.status)}</td>
                          <td style={{ textTransform: "capitalize" }}>{c.subscriptionStatus || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment History Section */}
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="admin-card__title">Payment History</h2>
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {paymentHistory.length} total payment{paymentHistory.length !== 1 ? "s" : ""}
          </span>
        </div>

        {paymentHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <FileText size={48} style={{ color: "#d1d5db", margin: "0 auto 1rem" }} />
            <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "0.5rem" }}>
              No payment history yet
            </p>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
              Your payment records will appear here once you make your first payment
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date Submitted</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Valid Period</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 500 }}>{formatDate(payment.paidAt)}</span>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {new Date(payment.paidAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: "1rem" }}>
                        ₹{payment.amount}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.875rem",
                          backgroundColor: "#f3f4f6",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                        }}
                      >
                        {payment.transactionId}
                      </span>
                    </td>
                    <td>{getPaymentStatusBadge(payment.status)}</td>
                    <td>
                      {payment.validFrom && payment.validUntil ? (
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "0.875rem" }}>
                          <span>{formatDate(payment.validFrom)}</span>
                          <span style={{ color: "#6b7280" }}>to</span>
                          <span>{formatDate(payment.validUntil)}</span>
                        </div>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn--outline"
                          style={{ fontSize: "0.875rem", padding: "0.25rem 0.75rem" }}
                          onClick={() => setSelectedPayment(payment)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => !submitPaymentMutation.isPending && setShowPaymentForm(false)}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 className="admin-card__title">Submit Payment</h2>
              <button
                onClick={() =>
                  !submitPaymentMutation.isPending && setShowPaymentForm(false)
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: "#f0f9ff",
                padding: "1rem",
                borderRadius: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                Payment Instructions:
              </p>
              <ol style={{ paddingLeft: "1.25rem", color: "#4b5563" }}>
                <li>Scan the QR code below or use the payment details</li>
                <li>Make payment of ₹{subscription.platformFee}</li>
                <li>Take a screenshot of payment confirmation</li>
                <li>Upload the screenshot and submit</li>
                <li>Wait for admin approval (usually within 24 hours)</li>
              </ol>
            </div>

            {/* Admin QR Code */}
            {subscription.paymentQrUrl && (
              <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                <p
                  style={{
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "#1e40af",
                  }}
                >
                  Scan QR Code to Pay
                </p>
                <Image
                  src={subscription.paymentQrUrl}
                  alt="Payment QR Code"
                  width={300}
                  height={300}
                  style={{
                    maxWidth: "300px",
                    width: "100%",
                    borderRadius: "0.5rem",
                    border: "2px solid #3b82f6",
                    padding: "0.5rem",
                    backgroundColor: "#fff",
                  }}
                />
              </div>
            )}

            <form onSubmit={handleSubmitPayment}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="client-form__label">
                  Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  className="client-form__control"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction/reference ID"
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label className="client-form__label">
                  Payment Proof Screenshot *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="paymentProof"
                  required
                />
                <label
                  htmlFor="paymentProof"
                  className="client-button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Upload size={20} />
                  {paymentProof ? "Change Screenshot" : "Upload Screenshot"}
                </label>
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={300}
                    height={200}
                    style={{
                      marginTop: "0.5rem",
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "0.5rem",
                    }}
                  />
                )}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="client-form__label">Notes (Optional)</label>
                <textarea
                  className="client-form__control"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowPaymentForm(false)}
                  disabled={submitPaymentMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submitPaymentMutation.isPending || !paymentProof}
                >
                  {submitPaymentMutation.isPending
                    ? "Submitting..."
                    : "Submit Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 className="admin-card__title">Payment Details</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                  Status
                </p>
                {getPaymentStatusBadge(selectedPayment.status)}
              </div>

              <div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                  Amount
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                  ₹{selectedPayment.amount}
                </p>
              </div>

              <div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                  Transaction ID
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    backgroundColor: "#f3f4f6",
                    padding: "0.5rem",
                    borderRadius: "0.25rem",
                  }}
                >
                  {selectedPayment.transactionId}
                </p>
              </div>

              <div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                  Submitted On
                </p>
                <p style={{ fontWeight: 500 }}>{formatDateTime(selectedPayment.paidAt)}</p>
              </div>

              {selectedPayment.approvedAt && (
                <div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {selectedPayment.status === "approved" ? "Approved" : "Rejected"} On
                  </p>
                  <p style={{ fontWeight: 500 }}>
                    {formatDateTime(selectedPayment.approvedAt)}
                  </p>
                  {selectedPayment.approvedBy && (
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      by {selectedPayment.approvedBy.fullName}
                    </p>
                  )}
                </div>
              )}

              {selectedPayment.validFrom && selectedPayment.validUntil && (
                <div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Validity Period
                  </p>
                  <p style={{ fontWeight: 500 }}>
                    {formatDate(selectedPayment.validFrom)} to{" "}
                    {formatDate(selectedPayment.validUntil)}
                  </p>
                </div>
              )}

              {selectedPayment.notes && (
                <div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Notes
                  </p>
                  <p
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {selectedPayment.notes}
                  </p>
                </div>
              )}

              {selectedPayment.rejectionReason && (
                <div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#ef4444",
                      marginBottom: "0.25rem",
                      fontWeight: 600,
                    }}
                  >
                    Rejection Reason
                  </p>
                  <p
                    style={{
                      backgroundColor: "#fee2e2",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      color: "#991b1b",
                    }}
                  >
                    {selectedPayment.rejectionReason}
                  </p>
                </div>
              )}

              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Payment Proof
                </p>
                {selectedPayment.paymentProof ? (
                  <a
                    href={selectedPayment.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block" }}
                  >
                    <Image
                      src={selectedPayment.paymentProof}
                      alt="Payment Proof"
                      width={600}
                      height={400}
                      style={{
                        maxWidth: "100%",
                        borderRadius: "0.5rem",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </a>
                ) : (
                  <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                    No payment proof available
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                className="btn btn--outline"
                onClick={() => setSelectedPayment(null)}
                style={{ width: "100%" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
