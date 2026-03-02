"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, Clock, Upload, X, Copy } from "lucide-react";
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

export default function PlatformSubscriptionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
          <span style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", backgroundColor: "#fef3c7", color: "#92400e" }}>
            Pending
          </span>
        );
      case "approved":
        return (
          <span style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", backgroundColor: "#d1fae5", color: "#065f46" }}>
            Approved
          </span>
        );
      case "rejected":
        return (
          <span style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", backgroundColor: "#fee2e2", color: "#991b1b" }}>
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

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <p>Loading subscription details...</p>
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
  const isNearExpiry = subscription.daysRemaining <= 3 && subscription.daysRemaining > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="admin-page"
    >
      {/* Header with Status */}
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Platform Subscription</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
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

      {/* Expiry Warning */}
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
            <AlertCircle style={{ color: "#dc2626", width: 24, height: 24, flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#991b1b", marginBottom: "0.5rem" }}>
                Subscription Expired
              </h3>
              <p style={{ color: "#7f1d1d", marginBottom: "1rem" }}>
                Your platform access has expired. Please make a payment of ₹{subscription.platformFee} to continue using FitCoach.
              </p>
              <button
                className="btn btn--primary"
                onClick={() => setShowPaymentForm(true)}
                style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}
              >
                Pay Now
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
            <Clock style={{ color: "#d97706", width: 24, height: 24, flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#92400e", marginBottom: "0.5rem" }}>
                Subscription Expiring Soon
              </h3>
              <p style={{ color: "#78350f", marginBottom: "1rem" }}>
                Your subscription will expire in {subscription.daysRemaining} day{subscription.daysRemaining !== 1 ? "s" : ""}. Pay now to avoid service interruption.
              </p>
              <button
                className="btn btn--primary"
                onClick={() => setShowPaymentForm(true)}
                style={{ backgroundColor: "#d97706", borderColor: "#d97706" }}
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {/* Subscription Details */}
        <div className="admin-card">
          <h2 className="admin-card__title">Subscription Details</h2>
          <dl style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <dt style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Status</dt>
              <dd style={{ fontWeight: 600, textTransform: "capitalize", color: getStatusColor(subscription.status) }}>
                {subscription.status}
              </dd>
            </div>
            <div>
              <dt style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Days Remaining</dt>
              <dd style={{ fontSize: "1.5rem", fontWeight: 700, color: subscription.daysRemaining <= 3 ? "#ef4444" : "#10b981" }}>
                {subscription.daysRemaining}
              </dd>
            </div>
            {subscription.status === "trial" && (
              <div>
                <dt style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Trial Ends On</dt>
                <dd style={{ fontWeight: 600 }}>{formatDate(subscription.trialEndsAt)}</dd>
              </div>
            )}
            {subscription.status === "active" && subscription.subscriptionExpiresAt && (
              <div>
                <dt style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Subscription Expires On</dt>
                <dd style={{ fontWeight: 600 }}>{formatDate(subscription.subscriptionExpiresAt)}</dd>
              </div>
            )}
            <div>
              <dt style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Total Paid</dt>
              <dd style={{ fontSize: "1.25rem", fontWeight: 700, color: "#10b981" }}>
                ₹{subscription.totalPaid}
              </dd>
            </div>
          </dl>
        </div>

        {/* Platform Fee */}
        <div className="admin-card" style={{ backgroundColor: "#f0f9ff", borderColor: "#3b82f6" }}>
          <h2 className="admin-card__title" style={{ color: "#1e40af" }}>Platform Fee</h2>
          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "#1e40af", marginBottom: "0.5rem" }}>
              ₹{subscription.platformFee}
            </div>
            <p style={{ fontSize: "0.875rem", color: "#1e40af", marginBottom: "1.5rem" }}>
              Per month (30 days)
            </p>
            {!isExpired && (
              <button
                className="btn btn--primary"
                onClick={() => setShowPaymentForm(true)}
                style={{ width: "100%" }}
              >
                Make Payment
              </button>
            )}
          </div>
        </div>

        {/* Referral Benefit */}
        <div className="admin-card" style={{ backgroundColor: "#f0fdf4", borderColor: "#22c55e" }}>
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
        <div className="admin-card" style={{ backgroundColor: "#f8fafc", borderColor: "#334155" }}>
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
      </div>

      {/* Payment Form */}
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
            style={{ maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="admin-card__title">Submit Payment</h2>
              <button
                onClick={() => !submitPaymentMutation.isPending && setShowPaymentForm(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}
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
              <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Payment Instructions:</p>
              <ol style={{ paddingLeft: "1.25rem", color: "#4b5563" }}>
                <li>Scan the QR code below or use the payment details</li>
                <li>Make payment of ₹{subscription.platformFee}</li>
                <li>Take a screenshot of payment confirmation</li>
                <li>Upload the screenshot and submit</li>
                <li>Wait for admin approval</li>
              </ol>
            </div>

            {/* Admin QR Code */}
            {subscription.paymentQrUrl && (
              <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                <p style={{ fontWeight: 600, marginBottom: "0.75rem", color: "#1e40af" }}>
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
                <label className="client-form__label">Transaction ID (Optional)</label>
                <input
                  type="text"
                  className="client-form__control"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction/reference ID"
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label className="client-form__label">Payment Proof Screenshot *</label>
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

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
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
                  {submitPaymentMutation.isPending ? "Submitting..." : "Submit Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h2 className="admin-card__title">Payment History</h2>
        {paymentHistory.length === 0 ? (
          <p style={{ color: "#6b7280", marginTop: "1rem" }}>No payment history yet</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "1rem" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
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
                    <td>{formatDate(payment.paidAt)}</td>
                    <td style={{ fontWeight: 600 }}>₹{payment.amount}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>{payment.transactionId}</td>
                    <td>{getPaymentStatusBadge(payment.status)}</td>
                    <td>
                      {payment.validFrom && payment.validUntil
                        ? `${formatDate(payment.validFrom)} - ${formatDate(payment.validUntil)}`
                        : "-"}
                    </td>
                    <td>
                      <a
                        href={payment.paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="client-button"
                        style={{ fontSize: "0.875rem", padding: "0.25rem 0.75rem" }}
                      >
                        View Proof
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
