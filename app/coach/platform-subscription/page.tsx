"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Clock, Upload, X } from "lucide-react";

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

export default function PlatformSubscriptionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to submit payment");
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
          <p className="admin-page-header__subtitle">
            Manage your PulseLedger platform subscription
          </p>
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
                Your platform access has expired. Please make a payment of ₹{subscription.platformFee} to continue using PulseLedger.
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
