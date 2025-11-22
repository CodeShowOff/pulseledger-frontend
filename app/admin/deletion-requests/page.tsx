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
    <div className="admin-shell">
      <div className="admin-header">
        <h1 className="admin-header__title">
          <Trash2 className="w-6 h-6" />
          Account Deletion Requests
        </h1>
        <p className="admin-header__subtitle">
          Review and process user account deletion requests
        </p>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            className={`btn ${statusFilter === "pending" ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setStatusFilter("pending")}
          >
            <Clock className="btn__icon" />
            Pending
          </button>
          <button
            className={`btn ${statusFilter === "approved" ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setStatusFilter("approved")}
          >
            <CheckCircle className="btn__icon" />
            Approved
          </button>
          <button
            className={`btn ${statusFilter === "rejected" ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setStatusFilter("rejected")}
          >
            <XCircle className="btn__icon" />
            Rejected
          </button>
          <button
            className={`btn ${statusFilter === "" ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setStatusFilter("")}
          >
            All
          </button>
        </div>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="admin-card">
          <p className="admin-card__subtitle">No deletion requests found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {requests.map((request) => (
            <div key={request._id} className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <h3 className="admin-card__title" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    {request.userId.fullName}
                  </h3>
                  <div style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                    Email: {request.userId.email}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                    Role: <span style={{ textTransform: "capitalize" }}>{request.userId.role}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                    Requested: {new Date(request.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`admin-badge ${
                    request.status === "pending"
                      ? "admin-badge--warning"
                      : request.status === "approved"
                      ? "admin-badge--success"
                      : "admin-badge--danger"
                  }`}
                >
                  {request.status}
                </span>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Reason for Deletion:
                </div>
                <div style={{ fontSize: "0.9rem", color: "#4b5563", padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "6px", whiteSpace: "pre-wrap" }}>
                  {request.reason || "No reason provided"}
                </div>
              </div>

              {request.status !== "pending" && request.processedBy && (
                <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem" }}>
                  <div>Processed by: {request.processedBy.fullName}</div>
                  {request.processedAt && (
                    <div>Processed at: {new Date(request.processedAt).toLocaleString()}</div>
                  )}
                  {request.adminNotes && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <strong>Admin Notes:</strong> {request.adminNotes}
                    </div>
                  )}
                </div>
              )}

              {request.status === "pending" && (
                <div>
                  {processingId === request._id && (
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
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

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {processingId !== request._id ? (
                      <button
                        type="button"
                        className="btn btn--outline"
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
                          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {processMutation.status === "pending" ? "Processing..." : "Approve & Delete Account"}
                        </button>
                        <button
                          type="button"
                          className="btn btn--secondary"
                          onClick={() => handleProcess(request._id, "rejected")}
                          disabled={processMutation.status === "pending"}
                          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
