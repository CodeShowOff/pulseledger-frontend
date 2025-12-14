"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "@/lib/axios";
import {
  MessageSquare,
  Star,
  X,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Mail,
  TrendingUp,
} from "lucide-react";

interface Feedback {
  _id: string;
  name: string;
  email: string;
  userRole: "client" | "coach" | "visitor" | "other";
  feedbackType: "general" | "feature-request" | "improvement" | "complaint" | "praise" | "other";
  category: "platform" | "coaches" | "subscriptions" | "products" | "progress-tracking" | "ui-ux" | "performance" | "other";
  rating: number;
  subject: string;
  message: string;
  status: "new" | "reviewed" | "acknowledged" | "implemented" | "archived";
  priority: "low" | "medium" | "high";
  adminResponse?: string;
  adminNotes?: string;
  isPublic: boolean;
  implementedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function FeedbackSubmissionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch feedback with filters
  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedback", page, searchTerm, statusFilter, typeFilter, ratingFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { feedbackType: typeFilter }),
        ...(ratingFilter && { rating: ratingFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      });
      const response = await axios.get(`/admin/feedback-submissions?${params}`);
      return response.data;
    },
  });

  // Update feedback status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      priority,
      adminResponse,
      adminNotes,
      isPublic,
    }: {
      id: string;
      status: string;
      priority?: string;
      adminResponse?: string;
      adminNotes?: string;
      isPublic?: boolean;
    }) => {
      const response = await axios.patch(`/feedback/${id}/status`, {
        status,
        priority,
        adminResponse,
        adminNotes,
        isPublic,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Feedback updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      setShowDetailModal(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update feedback");
    },
  });

  // Delete feedback mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/feedback/${id}`);
    },
    onSuccess: () => {
      toast.success("Feedback deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      setShowDetailModal(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to delete feedback");
    },
  });

  const handleViewDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (status: string, priority?: string) => {
    if (!selectedFeedback) return;
    updateStatusMutation.mutate({
      id: selectedFeedback._id,
      status,
      priority: priority || selectedFeedback.priority,
    });
  };

  const handleSaveNotes = () => {
    if (!selectedFeedback) return;
    const adminResponse = (document.getElementById("adminResponse") as HTMLTextAreaElement)?.value || "";
    const adminNotes = (document.getElementById("adminNotes") as HTMLTextAreaElement)?.value || "";
    const isPublic = (document.getElementById("isPublic") as HTMLInputElement)?.checked || false;

    updateStatusMutation.mutate({
      id: selectedFeedback._id,
      status: selectedFeedback.status,
      priority: selectedFeedback.priority,
      adminResponse,
      adminNotes,
      isPublic,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classes = {
      new: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      acknowledged: "bg-purple-100 text-purple-800",
      implemented: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return classes[status as keyof typeof classes] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadgeClass = (priority: string) => {
    const classes = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-red-100 text-red-700",
    };
    return classes[priority as keyof typeof classes] || "bg-gray-100 text-gray-700";
  };

  const getRatingStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
        fill={i < rating ? "currentColor" : "none"}
      />
    ));
  };

  return (
    <div>
      <header className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <MessageSquare style={{ width: "2rem", height: "2rem", color: "#2563eb" }} />
          <h1 className="admin-page-header__title">Feedback Submissions</h1>
        </div>
        <p className="admin-page-header__subtitle">
          Manage and respond to user feedback, suggestions, and feature requests
        </p>
        
        {/* Filters */}
        <div style={{ marginTop: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by subject, name, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="admin-search-input"
            style={{ flex: "1 1 280px", padding: "0.5rem 0.75rem" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="admin-search-input"
            style={{ flex: "0 0 150px", padding: "0.5rem 0.75rem" }}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="implemented">Implemented</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="admin-search-input"
            style={{ flex: "0 0 150px", padding: "0.5rem 0.75rem" }}
          >
            <option value="">All Types</option>
            <option value="general">General</option>
            <option value="feature-request">Feature Request</option>
            <option value="improvement">Improvement</option>
            <option value="complaint">Complaint</option>
            <option value="praise">Praise</option>
            <option value="other">Other</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="admin-search-input"
            style={{ flex: "0 0 130px", padding: "0.5rem 0.75rem" }}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="admin-search-input"
            style={{ flex: "0 0 140px", padding: "0.5rem 0.75rem" }}
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </header>

      {/* Feedback Table */}
      <section>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ 
              display: "inline-block", 
              width: "3rem", 
              height: "3rem",
              border: "3px solid #e5e7eb",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "#fff", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
            <MessageSquare style={{ width: "4rem", height: "4rem", color: "#d1d5db", margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>No Feedback Found</h3>
            <p style={{ color: "#6b7280" }}>
              {searchTerm || statusFilter || typeFilter || ratingFilter || priorityFilter
                ? "Try adjusting your filters"
                : "No feedback submissions yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Submitted By</th>
                      <th>Type</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((feedback: Feedback) => (
                      <tr key={feedback._id}>
                        <td>
                          <div style={{ fontWeight: 500, color: "#111827", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {feedback.subject}
                          </div>
                          <div style={{ fontSize: "0.875rem", color: "#6b7280", textTransform: "capitalize" }}>{feedback.category.replace("-", " ")}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: "#111827" }}>{feedback.name}</div>
                          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{feedback.email}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "capitalize" }}>{feedback.userRole}</div>
                        </td>
                        <td>
                          <span className="badge badge--primary" style={{ textTransform: "capitalize" }}>
                            {feedback.feedbackType.replace("-", " ")}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            {getRatingStars(feedback.rating)}
                          </div>
                        </td>
                        <td>
                          <span className={
                            feedback.status === "new" ? "badge badge--warning" :
                            feedback.status === "reviewed" ? "badge badge--info" :
                            feedback.status === "acknowledged" ? "badge badge--primary" :
                            feedback.status === "implemented" ? "badge badge--success" :
                            "badge"
                          } style={{ textTransform: "capitalize" }}>
                            {feedback.status}
                          </span>
                        </td>
                        <td>
                          <span className={
                            feedback.priority === "high" ? "badge badge--danger" :
                            feedback.priority === "medium" ? "badge badge--info" :
                            "badge"
                          } style={{ textTransform: "capitalize" }}>
                            {feedback.priority}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => handleViewDetails(feedback)}
                              className="btn btn--primary"
                              style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
                              title="View Details"
                            >
                              <Eye style={{ width: "1rem", height: "1rem", display: "inline", marginRight: "0.25rem" }} />
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(feedback._id)}
                              className="btn btn--danger"
                              style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
                              title="Delete"
                            >
                              <Trash2 style={{ width: "1rem", height: "1rem", display: "inline", marginRight: "0.25rem" }} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Showing {data.data.length} of {data.pagination.total} results
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="admin-button admin-button--secondary"
                    style={{ padding: "0.5rem 1rem", opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
                  >
                    <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
                    Previous
                  </button>
                  <span style={{ padding: "0.5rem 1rem", color: "#374151" }}>
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.pagination.totalPages}
                    className="admin-button admin-button--secondary"
                    style={{ padding: "0.5rem 1rem", opacity: page >= data.pagination.totalPages ? 0.5 : 1, cursor: page >= data.pagination.totalPages ? "not-allowed" : "pointer" }}
                  >
                    Next
                    <ChevronRight style={{ width: "1rem", height: "1rem" }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            maxWidth: "48rem",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            {/* Modal Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "1.5rem",
              borderBottom: "1px solid #e5e7eb"
            }}>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: "0.5rem"
                }}>
                  {selectedFeedback!.subject}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <User style={{ width: "1rem", height: "1rem" }} />
                    {selectedFeedback!.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Mail style={{ width: "1rem", height: "1rem" }} />
                    {selectedFeedback!.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Calendar style={{ width: "1rem", height: "1rem" }} />
                    {new Date(selectedFeedback!.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  color: "#9ca3af",
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  padding: "0.25rem"
                }}
              >
                <X style={{ width: "1.5rem", height: "1.5rem" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              {/* Metadata */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", display: "block", marginBottom: "0.25rem" }}>
                    User Role
                  </label>
                  <p style={{ color: "#111827", textTransform: "capitalize" }}>{selectedFeedback!.userRole}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", display: "block", marginBottom: "0.25rem" }}>
                    Feedback Type
                  </label>
                  <p style={{ color: "#111827", textTransform: "capitalize" }}>
                    {selectedFeedback!.feedbackType.replace("-", " ")}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", display: "block", marginBottom: "0.25rem" }}>
                    Category
                  </label>
                  <p style={{ color: "#111827", textTransform: "capitalize" }}>
                    {selectedFeedback!.category.replace("-", " ")}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", display: "block", marginBottom: "0.25rem" }}>
                    Rating
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    {getRatingStars(selectedFeedback!.rating)}
                    <span style={{ marginLeft: "0.5rem", color: "#6b7280" }}>({selectedFeedback!.rating}/5)</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", display: "block", marginBottom: "0.5rem" }}>
                  Feedback Message
                </label>
                <div style={{
                  backgroundColor: "#f9fafb",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb"
                }}>
                  <p style={{ color: "#111827", whiteSpace: "pre-wrap" }}>{selectedFeedback!.message}</p>
                </div>
              </div>

              {/* Status and Priority */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", display: "block", marginBottom: "0.5rem" }}>
                    Status
                  </label>
                  <select
                    value={selectedFeedback!.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="admin-search-input"
                    style={{ width: "100%" }}
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="implemented">Implemented</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", display: "block", marginBottom: "0.5rem" }}>
                    Priority
                  </label>
                  <select
                    value={selectedFeedback!.priority}
                    onChange={(e) => handleUpdateStatus(selectedFeedback!.status, e.target.value)}
                    className="admin-search-input"
                    style={{ width: "100%" }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Admin Response */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="adminResponse" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", display: "block", marginBottom: "0.5rem" }}>
                  Admin Response (will be sent to user if public)
                </label>
                <textarea
                  id="adminResponse"
                  defaultValue={selectedFeedback!.adminResponse || ""}
                  rows={3}
                  maxLength={1000}
                  className="admin-search-input"
                  style={{ width: "100%", resize: "vertical" }}
                  placeholder="Response to the user..."
                />
              </div>

              {/* Admin Notes */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="adminNotes" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", display: "block", marginBottom: "0.5rem" }}>
                  Internal Admin Notes
                </label>
                <textarea
                  id="adminNotes"
                  defaultValue={selectedFeedback!.adminNotes || ""}
                  rows={3}
                  maxLength={1000}
                  className="admin-search-input"
                  style={{ width: "100%", resize: "vertical" }}
                  placeholder="Internal notes (not visible to user)..."
                />
              </div>

              {/* Public Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <input
                  type="checkbox"
                  id="isPublic"
                  defaultChecked={selectedFeedback!.isPublic}
                  style={{ width: "1rem", height: "1rem" }}
                />
                <label htmlFor="isPublic" style={{ fontSize: "0.875rem", color: "#374151" }}>
                  Make this feedback public (for testimonials/showcase)
                </label>
              </div>

              {/* Implementation Date */}
              {selectedFeedback!.implementedAt && (
                <div style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "0.5rem",
                  padding: "1rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#166534" }}>
                    <TrendingUp style={{ width: "1.25rem", height: "1.25rem" }} />
                    <span style={{ fontWeight: 500 }}>
                      Implemented on {new Date(selectedFeedback!.implementedAt!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.5rem",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb"
            }}>
              <button
                onClick={() => handleDelete(selectedFeedback!._id)}
                className="btn btn--danger"
                style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
              >
                <Trash2 style={{ width: "1rem", height: "1rem", display: "inline", marginRight: "0.5rem" }} />
                Delete Feedback
              </button>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    padding: "0.5rem 1.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "0.875rem"
                  }}
                >
                  Close
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={updateStatusMutation.isPending}
                  className="btn btn--primary"
                  style={{ fontSize: "0.875rem", padding: "0.5rem 1.5rem" }}
                >
                  {updateStatusMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
