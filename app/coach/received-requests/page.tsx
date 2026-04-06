"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { motion } from "@/lib/motion";
import { UserPlus, Mail, Phone, Calendar, MessageSquare, Weight } from "lucide-react";

interface ContactRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  height?: number | null;
  weight?: number | null;
  age: number;
  gender: "male" | "female" | "other";
  message: string;
  status: "pending" | "contacted" | "converted" | "rejected";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContactRequestsResponse {
  success: boolean;
  data: ContactRequest[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

const fetchContactRequests = async (status?: string): Promise<ContactRequestsResponse> => {
  const params = status ? `?status=${status}` : "";
  const res = await api.get(`/contact-requests/coach/requests${params}`);
  return res.data;
};

const statusColors = {
  pending: { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" },
  contacted: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  converted: { bg: "#d1fae5", text: "#065f46", border: "#10b981" },
  rejected: { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" },
};

export default function ReceivedRequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<string>("");
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["contactRequests", selectedStatus],
    queryFn: () => fetchContactRequests(selectedStatus),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const res = await api.put(`/contact-requests/coach/requests/${id}`, { status, notes });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactRequests"] });
      setEditingId(null);
    },
  });

  const handleUpdateStatus = (id: string, status: string, notes?: string) => {
    updateMutation.mutate({ id, status, notes });
  };

  const startEditing = (request: ContactRequest) => {
    setEditingId(request._id);
    setEditStatus(request.status);
    setEditNotes(request.notes || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditStatus("");
    setEditNotes("");
  };

  const saveEditing = (id: string) => {
    handleUpdateStatus(id, editStatus, editNotes);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      className="profile-shell"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="profile-inner">
        <header className="profile-header">
          <div>
            <h1 className="profile-header__title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UserPlus className="w-6 h-6" />
              Received Contact Requests
            </h1>
          </div>
          <div className="profile-header__badge">
            <span />
            {data?.pagination.total || 0} Total Requests
          </div>
        </header>

        {/* Status Filter */}
        <div className="profile-card" style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              className={`btn ${!selectedStatus ? "btn--primary" : "btn--outline"}`}
              onClick={() => setSelectedStatus("")}
              style={{ fontSize: "0.9rem" }}
            >
              All
            </button>
            <button
              className={`btn ${selectedStatus === "pending" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setSelectedStatus("pending")}
              style={{ fontSize: "0.9rem" }}
            >
              Pending
            </button>
            <button
              className={`btn ${selectedStatus === "contacted" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setSelectedStatus("contacted")}
              style={{ fontSize: "0.9rem" }}
            >
              Contacted
            </button>
            <button
              className={`btn ${selectedStatus === "converted" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setSelectedStatus("converted")}
              style={{ fontSize: "0.9rem" }}
            >
              Converted
            </button>
            <button
              className={`btn ${selectedStatus === "rejected" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setSelectedStatus("rejected")}
              style={{ fontSize: "0.9rem" }}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="profile-card">
            <p className="profile-header__subtitle">Loading contact requests...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="profile-card" style={{ backgroundColor: "#fee2e2", borderColor: "#ef4444" }}>
            <p style={{ color: "#991b1b" }}>Failed to load contact requests. Please try again.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.data.length === 0 && (
          <div className="profile-card" style={{ textAlign: "center", padding: "2rem" }}>
            <UserPlus style={{ width: 48, height: 48, margin: "0 auto 1rem", opacity: 0.5 }} />
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No Contact Requests</h3>
            <p className="profile-header__subtitle">
              {selectedStatus
                ? `No ${selectedStatus} requests found.`
                : "You haven't received any contact requests yet."}
            </p>
          </div>
        )}

        {/* Contact Requests List */}
        {!isLoading && !error && data && data.data.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {data.data.map((request) => (
              <div key={request._id} className="profile-card" style={{ position: "relative" }}>
                {/* Status Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    backgroundColor: statusColors[request.status].bg,
                    color: statusColors[request.status].text,
                    border: `1px solid ${statusColors[request.status].border}`,
                  }}
                >
                  {request.status}
                </div>

                {/* Header */}
                <div style={{ marginBottom: "1rem", paddingRight: "100px" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                    {request.firstName} {request.lastName}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#6b7280" }}>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                </div>

                {/* Contact Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span style={{ fontSize: "0.9rem" }}>{request.phone}</span>
                  </div>
                  
                  {request.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span style={{ fontSize: "0.9rem" }}>{request.email}</span>
                    </div>
                  )}

                  <div style={{ fontSize: "0.9rem" }}>
                    <strong>Age:</strong> {request.age} | <strong>Gender:</strong> {request.gender}
                  </div>

                  {(request.height || request.weight) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Weight className="w-4 h-4 text-gray-500" />
                      <span style={{ fontSize: "0.9rem" }}>
                        {request.height && `${request.height}cm`}
                        {request.height && request.weight && " | "}
                        {request.weight && `${request.weight}kg`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <strong style={{ fontSize: "0.9rem" }}>Message:</strong>
                  </div>
                  <p style={{ 
                    fontSize: "0.9rem", 
                    lineHeight: "1.6", 
                    whiteSpace: "pre-wrap",
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb"
                  }}>
                    {request.message}
                  </p>
                </div>

                {/* Notes Section */}
                {editingId === request._id ? (
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
                      Status:
                    </label>
                    <select
                      className="client-form__control"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ marginBottom: "0.75rem" }}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
                      Notes:
                    </label>
                    <textarea
                      className="client-form__control"
                      rows={3}
                      maxLength={500}
                      placeholder="Add your notes here..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>
                ) : (
                  request.notes && (
                    <div style={{ marginBottom: "1rem" }}>
                      <strong style={{ fontSize: "0.9rem", display: "block", marginBottom: "0.25rem" }}>Your Notes:</strong>
                      <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: "#6b7280" }}>{request.notes}</p>
                    </div>
                  )
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {editingId === request._id ? (
                    <>
                      <button
                        className="btn btn--primary"
                        onClick={() => saveEditing(request._id)}
                        disabled={updateMutation.isPending}
                        style={{ fontSize: "0.85rem" }}
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={cancelEditing}
                        disabled={updateMutation.isPending}
                        style={{ fontSize: "0.85rem" }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn--outline"
                        onClick={() => startEditing(request)}
                        style={{ fontSize: "0.85rem" }}
                      >
                        Update Status
                      </button>
                      {request.status === "pending" && (
                        <button
                          className="btn btn--primary"
                          onClick={() => handleUpdateStatus(request._id, "contacted")}
                          disabled={updateMutation.isPending}
                          style={{ fontSize: "0.85rem", backgroundColor: "#3b82f6", borderColor: "#3b82f6" }}
                        >
                          Mark as Contacted
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
