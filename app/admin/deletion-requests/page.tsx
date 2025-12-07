"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Trash2, CheckCircle, XCircle, Clock } from "lucide-react";

type DeletionRequest = {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  reason: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  processedBy?: {
    fullName: string;
    email: string;
  };
  processedAt?: string;
  createdAt: string;
};

const fetchDeletionRequests = async (status?: string): Promise<DeletionRequest[]> => {
  const params = status ? `?status=${status}` : "";
  const res = await api.get(`/admin/deletion-requests${params}`);
  return res.data.data || [];
};

export default function DeletionRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["deletionRequests", statusFilter],
    queryFn: () => fetchDeletionRequests(statusFilter),
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      await api.patch(`/admin/deletion-requests/${id}`, { status, adminNotes: notes });
    },
    onSuccess: (_, variables) => {
      const message = variables.status === "approved"
        ? "Account deletion request approved and user deleted"
        : "Account deletion request rejected";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["deletionRequests"] });
      setProcessingId(null);
      setAdminNotes("");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to process request";
      toast.error(message);
    },
  });

  const handleProcess = (id: string, status: "approved" | "rejected") => {
    if (status === "approved") {
      const confirmed = window.confirm(
        "Are you sure you want to APPROVE this deletion request? This will permanently delete the user account and all associated data. This action CANNOT be undone!"
      );
      if (!confirmed) return;
    }
    processMutation.mutate({ id, status, notes: adminNotes });
  };

  if (isLoading) {
    return (
      <div className="admin-shell">
        <div className="admin-header">
          <h1 className="admin-header__title">
            <Trash2 className="w-6 h-6" />
            Account Deletion Requests
          </h1>
        </div>
        <p className="admin-card__subtitle">Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__inner">
        {/* Header Section */}
        <header className="admin-page-header" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <Trash2 className="w-6 h-6" style={{ color: "#3b82f6" }} />
            <h1 className="admin-page-header__title" style={{ margin: 0 }}>Account Deletion Requests</h1>
          </div>
          <p className="admin-page-header__subtitle" style={{ margin: 0 }}>
            Review and process user account deletion requests
          </p>
        </header>

        {/* Filter Tabs - Horizontal */}
        <section className="admin-card" style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151" }}>Filter:</span>
            <button
              className={`btn ${statusFilter === "pending" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setStatusFilter("pending")}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Clock className="w-4 h-4" />
              Pending
            </button>
            <button
              className={`btn ${statusFilter === "approved" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setStatusFilter("approved")}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <CheckCircle className="w-4 h-4" />
              Approved
            </button>
            <button
              className={`btn ${statusFilter === "rejected" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setStatusFilter("rejected")}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <XCircle className="w-4 h-4" />
              Rejected
            </button>
            <button
              className={`btn ${statusFilter === "" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setStatusFilter("")}
            >
              All
            </button>
          </div>
        </section>

        {/* Requests List */}
        <section>
          {!requests || requests.length === 0 ? (
            <div className="admin-card" style={{ padding: "2rem", textAlign: "center" }}>
              <p className="admin-card__subtitle" style={{ margin: 0 }}>No deletion requests found</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {requests.map((request) => (
                <article key={request._id} className="admin-card" style={{ padding: "1.25rem" }}>
                  {/* Top Row: User Info + Status Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h3 className="admin-card__title" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                        {request.userId.fullName}
                      </h3>
                      <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "0 0 0.25rem 0" }}>
                        <strong>Email:</strong> {request.userId.email}
                      </p>
                      <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "0 0 0.25rem 0" }}>
                        <strong>Role:</strong> <span style={{ textTransform: "capitalize" }}>{request.userId.role}</span>
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: 0 }}>
                        <strong>Requested:</strong> {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`admin-badge ${
                        request.status === "pending"
                          ? "admin-badge--warning"
                          : request.status === "approved"
                          ? "admin-badge--success"
                          : "admin-badge--danger"
                      }`}
                      style={{ flexShrink: 0, textTransform: "capitalize" }}
                    >
                      {request.status}
                    </span>
                  </div>

                  {/* Reason Section */}
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>
                      Reason for Deletion:
                    </p>
                    <div style={{ fontSize: "0.9rem", color: "#4b5563", padding: "0.75rem 1rem", backgroundColor: "#f9fafb", borderRadius: "8px", whiteSpace: "pre-wrap", border: "1px solid #e5e7eb" }}>
                      {request.reason || "No reason provided"}
                    </div>
                  </div>

                  {/* Processed Info (for non-pending) */}
                  {request.status !== "pending" && request.processedBy && (
                    <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem", padding: "0.75rem 1rem", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
                      <p style={{ margin: "0 0 0.25rem 0" }}><strong>Processed by:</strong> {request.processedBy.fullName}</p>
                      {request.processedAt && (
                        <p style={{ margin: "0 0 0.25rem 0" }}><strong>Processed at:</strong> {new Date(request.processedAt).toLocaleString()}</p>
                      )}
                      {request.adminNotes && (
                        <p style={{ margin: "0.5rem 0 0 0" }}><strong>Admin Notes:</strong> {request.adminNotes}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons (for pending) */}
                  {request.status === "pending" && (
                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                      {processingId === request._id && (
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>
                            Admin Notes (optional):
                          </label>
                          <textarea
                            className="client-form__control"
                            rows={3}
                            maxLength={1000}
                            placeholder="Add notes about this decision..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            style={{ resize: "vertical", fontFamily: "inherit", width: "100%" }}
                          />
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        {processingId !== request._id ? (
                          <button
                            type="button"
                            className="btn btn--primary"
                            onClick={() => setProcessingId(request._id)}
                          >
                            Review & Process
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn--danger"
                              onClick={() => handleProcess(request._id, "approved")}
                              disabled={processMutation.status === "pending"}
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                            >
                              <CheckCircle className="w-4 h-4" />
                              {processMutation.status === "pending" ? "Processing..." : "Approve & Delete"}
                            </button>
                            <button
                              type="button"
                              className="btn btn--outline"
                              onClick={() => handleProcess(request._id, "rejected")}
                              disabled={processMutation.status === "pending"}
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                            <button
                              type="button"
                              className="btn btn--secondary"
                              onClick={() => {
                                setProcessingId(null);
                                setAdminNotes("");
                              }}
                              disabled={processMutation.status === "pending"}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
