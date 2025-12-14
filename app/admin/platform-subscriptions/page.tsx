"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import { CheckCircle, XCircle, Clock, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface PlatformSubscription {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  status: "trial" | "active" | "expired" | "suspended";
  trialEndsAt: string;
  subscriptionExpiresAt: string | null;
  lastPaymentDate: string | null;
  totalPaid: number;
  paymentHistory: PaymentHistoryItem[];
  notifications: {
    threeDayWarning: boolean;
    oneDayWarning: boolean;
    expiryNotification: boolean;
  };
}

interface PaymentHistoryItem {
  _id: string;
  amount: number;
  transactionId: string;
  paymentProof: string;
  status: "pending" | "approved" | "rejected";
  paidAt: string;
  approvedAt?: string;
  approvedBy?: {
    fullName: string;
    email: string;
  };
  rejectionReason?: string;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
}

interface PaginatedResponse {
  data: PlatformSubscription[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export default function AdminPlatformSubscriptionsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "expired">("all");
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<{
    subscriptionId: string;
    paymentId: string;
    payment: PaymentHistoryItem;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [extendUserId, setExtendUserId] = useState("");
  const [extendDays, setExtendDays] = useState("30");

  // Fetch all subscriptions
  const { data: allData, isLoading: isLoadingAll } = useQuery<PaginatedResponse>({
    queryKey: ["adminPlatformSubscriptions", "all", page],
    queryFn: async () => {
      const res = await api.get(`/platform-subscription/admin/all?page=${page}&limit=10`);
      return res.data;
    },
    enabled: activeTab === "all",
  });

  // Fetch pending payments
  const { data: pendingData, isLoading: isLoadingPending } = useQuery<PaginatedResponse>({
    queryKey: ["adminPlatformSubscriptions", "pending"],
    queryFn: async () => {
      const res = await api.get("/platform-subscription/admin/pending-payments");
      return res.data;
    },
    enabled: activeTab === "pending",
  });

  // Approve/reject payment mutation
  const approveRejectMutation = useMutation({
    mutationFn: async ({
      subscriptionId,
      paymentId,
      action,
      reason,
    }: {
      subscriptionId: string;
      paymentId: string;
      action: "approve" | "reject";
      reason?: string;
    }) => {
      const res = await api.put(
        `/platform-subscription/admin/payment/${subscriptionId}/${paymentId}`,
        { action, rejectionReason: reason }
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminPlatformSubscriptions"] });
      setSelectedPayment(null);
      setRejectionReason("");
      toast.success(
        variables.action === "approve"
          ? "Payment approved successfully"
          : "Payment rejected successfully"
      );
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const msg = (error as any).response?.data?.message || (error as any).message || "Failed to process payment";
        toast.error(msg);
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to process payment");
      } else {
        toast.error("Failed to process payment");
      }
    },
  });

  // Extend subscription mutation
  const extendMutation = useMutation({
    mutationFn: async ({ userId, days }: { userId: string; days: number }) => {
      const res = await api.put(`/platform-subscription/admin/extend/${userId}`, { days });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPlatformSubscriptions"] });
      setExtendUserId("");
      setExtendDays("30");
      toast.success("Subscription extended successfully");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const msg = (error as any).response?.data?.message || (error as any).message || "Failed to extend subscription";
        toast.error(msg);
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to extend subscription");
      } else {
        toast.error("Failed to extend subscription");
      }
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      trial: { bg: "#dbeafe", text: "#1e40af" },
      active: { bg: "#d1fae5", text: "#065f46" },
      expired: { bg: "#fee2e2", text: "#991b1b" },
      suspended: { bg: "#fef3c7", text: "#92400e" },
    };
    const color = colors[status as keyof typeof colors] || colors.expired;
    return (
      <span
        style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.875rem",
          fontWeight: 500,
          backgroundColor: color.bg,
          color: color.text,
          textTransform: "capitalize",
        }}
      >
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
    };
    const colors = {
      pending: { bg: "#fef3c7", text: "#92400e" },
      approved: { bg: "#d1fae5", text: "#065f46" },
      rejected: { bg: "#fee2e2", text: "#991b1b" },
    };
    const color = colors[status as keyof typeof colors] || colors.pending;
    return (
      <span
        style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.875rem",
          fontWeight: 500,
          backgroundColor: color.bg,
          color: color.text,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          textTransform: "capitalize",
        }}
      >
        {icons[status as keyof typeof icons]}
        {status}
      </span>
    );
  };

  const currentData = activeTab === "pending" ? pendingData : allData;
  const isLoading = activeTab === "pending" ? isLoadingPending : isLoadingAll;

  // Filter expired subscriptions when on expired tab
  const filteredSubscriptions =
    activeTab === "expired"
      ? allData?.data.filter((s) => s.status === "expired") || []
      : currentData?.data || [];

  return (
    <div className="admin-page">
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Platform Subscriptions</h1>
          <p className="admin-page-header__subtitle">Manage coach subscription payments and trials</p>
        </div>
      </section>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { key: "all", label: "All Subscriptions" },
          { key: "pending", label: "Pending Payments" },
          { key: "expired", label: "Expired" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              setPage(1);
            }}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: activeTab === tab.key ? "#2563eb" : "#6b7280",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #2563eb" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* All Subscriptions Tab */}
      {activeTab === "all" && (
        <div className="admin-card">
          <h2 className="admin-card__title">All Coach Subscriptions</h2>
          {isLoading ? (
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading subscriptions...</p>
          ) : filteredSubscriptions.length === 0 ? (
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>No subscriptions found</p>
          ) : (
            <>
              <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Coach</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Expiry Date</th>
                      <th>Total Paid</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((sub) => (
                      <tr key={sub._id}>
                        <td style={{ fontWeight: 600 }}>{sub.userId?.fullName || "[Deleted User]"}</td>
                        <td style={{ fontSize: "0.875rem", color: "#6b7280" }}>{sub.userId?.email || "N/A"}</td>
                        <td>{getStatusBadge(sub.status)}</td>
                        <td>
                          {sub.status === "trial"
                            ? formatDate(sub.trialEndsAt)
                            : sub.subscriptionExpiresAt
                            ? formatDate(sub.subscriptionExpiresAt)
                            : "-"}
                        </td>
                        <td style={{ fontWeight: 600, color: "#10b981" }}>₹{sub.totalPaid}</td>
                        <td>
                          <button
                            className="btn btn--outline"
                            style={{ fontSize: "0.875rem", padding: "0.25rem 0.75rem" }}
                            onClick={() => {
                              setExtendUserId(sub.userId?._id || "");
                            }}
                            disabled={!sub.userId}
                          >
                            Extend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {currentData && currentData.pagination.totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    className="btn btn--outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span style={{ padding: "0.5rem 1rem", color: "#6b7280" }}>
                    Page {currentData.pagination.page} of {currentData.pagination.totalPages}
                  </span>
                  <button
                    className="btn btn--outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= currentData.pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Pending Payments Tab */}
      {activeTab === "pending" && (
        <div>
          {isLoading ? (
            <p style={{ color: "#6b7280" }}>Loading pending payments...</p>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="admin-card">
              <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
                No pending payments
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {filteredSubscriptions.map((sub) =>
                (sub.paymentHistory || [])
                  .filter((p) => p.status === "pending")
                  .map((payment) => (
                    <div key={payment._id} className="admin-card">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: "1.5rem",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: "1.125rem",
                              fontWeight: 600,
                              marginBottom: "0.5rem",
                            }}
                          >
                            {sub.userId?.fullName || "[Deleted User]"}
                          </h3>
                          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
                            {sub.userId?.email || "N/A"}
                          </p>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <DollarSign size={16} color="#6b7280" />
                              <span style={{ fontSize: "0.875rem" }}>
                                Amount: <strong>₹{payment.amount}</strong>
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <Calendar size={16} color="#6b7280" />
                              <span style={{ fontSize: "0.875rem" }}>
                                Paid: {formatDate(payment.paidAt)}
                              </span>
                            </div>
                            {payment.transactionId && (
                              <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                Transaction ID:{" "}
                                <span style={{ fontFamily: "monospace" }}>{payment.transactionId}</span>
                              </div>
                            )}
                            {payment.notes && (
                              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                                Notes: {payment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <a
                            href={payment.paymentProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--outline"
                          >
                            View Proof
                          </a>
                          <button
                            className="btn btn--primary"
                            onClick={() =>
                              setSelectedPayment({
                                subscriptionId: sub._id,
                                paymentId: payment._id,
                                payment,
                              })
                            }
                            style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn--ghost"
                            onClick={() =>
                              setSelectedPayment({
                                subscriptionId: sub._id,
                                paymentId: payment._id,
                                payment,
                              })
                            }
                            style={{ color: "#ef4444" }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Expired Subscriptions Tab */}
      {activeTab === "expired" && (
        <div className="admin-card">
          <h2 className="admin-card__title">Expired Subscriptions</h2>
          {isLoading ? (
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading expired subscriptions...</p>
          ) : filteredSubscriptions.length === 0 ? (
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>No expired subscriptions</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: "1rem" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Coach</th>
                    <th>Email</th>
                    <th>Expired On</th>
                    <th>Total Paid</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub._id}>
                      <td style={{ fontWeight: 600 }}>{sub.userId?.fullName || "[Deleted User]"}</td>
                      <td style={{ fontSize: "0.875rem", color: "#6b7280" }}>{sub.userId?.email || "N/A"}</td>
                      <td>
                        {sub.subscriptionExpiresAt
                          ? formatDate(sub.subscriptionExpiresAt)
                          : formatDate(sub.trialEndsAt)}
                      </td>
                      <td style={{ fontWeight: 600, color: "#10b981" }}>₹{sub.totalPaid}</td>
                      <td>
                        <button
                          className="btn btn--outline"
                          style={{ fontSize: "0.875rem", padding: "0.25rem 0.75rem" }}
                          onClick={() => setExtendUserId(sub.userId?._id || "")}
                          disabled={!sub.userId}
                        >
                          Extend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Approve/Reject Payment Modal */}
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
          onClick={() => !approveRejectMutation.isPending && setSelectedPayment(null)}
        >
          <div
            className="admin-card"
            style={{ maxWidth: "500px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="admin-card__title">Process Payment</h2>
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                Amount: <strong>₹{selectedPayment.payment.amount}</strong>
              </p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
                Transaction ID:{" "}
                <strong style={{ fontFamily: "monospace" }}>
                  {selectedPayment.payment.transactionId}
                </strong>
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <label className="client-form__label">Rejection Reason (if rejecting)</label>
                <textarea
                  className="client-form__control"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn btn--primary"
                  onClick={() =>
                    approveRejectMutation.mutate({
                      subscriptionId: selectedPayment.subscriptionId,
                      paymentId: selectedPayment.paymentId,
                      action: "approve",
                    })
                  }
                  disabled={approveRejectMutation.isPending}
                  style={{ flex: 1, backgroundColor: "#10b981", borderColor: "#10b981" }}
                >
                  {approveRejectMutation.isPending ? "Processing..." : "Approve"}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    if (!rejectionReason) {
                      toast.error("Please enter a rejection reason");
                      return;
                    }
                    approveRejectMutation.mutate({
                      subscriptionId: selectedPayment.subscriptionId,
                      paymentId: selectedPayment.paymentId,
                      action: "reject",
                      reason: rejectionReason,
                    });
                  }}
                  disabled={approveRejectMutation.isPending}
                  style={{ flex: 1, color: "#ef4444" }}
                >
                  {approveRejectMutation.isPending ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extend Subscription Modal */}
      {extendUserId && (
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
          onClick={() => !extendMutation.isPending && setExtendUserId("")}
        >
          <div
            className="admin-card"
            style={{ maxWidth: "400px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="admin-card__title">Extend Subscription</h2>
            <div style={{ marginTop: "1rem" }}>
              <label className="client-form__label">Number of Days</label>
              <input
                type="number"
                className="client-form__control"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                min="1"
                placeholder="Enter number of days"
              />
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
                This will extend the current trial/subscription period by the specified number of days.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  className="btn btn--ghost"
                  onClick={() => setExtendUserId("")}
                  disabled={extendMutation.isPending}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn--primary"
                  onClick={() =>
                    extendMutation.mutate({
                      userId: extendUserId,
                      days: parseInt(extendDays),
                    })
                  }
                  disabled={extendMutation.isPending || !extendDays || parseInt(extendDays) < 1}
                  style={{ flex: 1 }}
                >
                  {extendMutation.isPending ? "Extending..." : "Extend"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
