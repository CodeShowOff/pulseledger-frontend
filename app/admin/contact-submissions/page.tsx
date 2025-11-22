"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Mail, Check, Eye, Trash2 } from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";

type ContactSubmission = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read" | "responded";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  data: ContactSubmission[];
  pagination: { total: number; page: number; totalPages: number };
};

const fetchContactSubmissions = async (
  page = 1,
  search = "",
  status = ""
): Promise<ApiResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", "20");
  if (search.trim()) {
    params.append("search", search.trim());
  }
  if (status) {
    params.append("status", status);
  }
  const res = await api.get(`/admin/contact-submissions?${params.toString()}`);
  return res.data;
};

export default function AdminContactSubmissionsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState<"unread" | "read" | "responded">("read");
  const [adminNotes, setAdminNotes] = useState("");
  
  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1); // Reset to first page on filter change
  }, [statusFilter]);

  const {
    data = { data: [], pagination: { total: 0, page: 1, totalPages: 1 } },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contactSubmissions", page, debouncedSearch, statusFilter],
    queryFn: () => fetchContactSubmissions(page, debouncedSearch, statusFilter),
  });

  const submissions: ContactSubmission[] = data.data ?? [];
  const pagination = data.pagination;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      return api.patch(`/contact-us/${id}/status`, { status, adminNotes: notes });
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["contactSubmissions"] });
      setShowModal(false);
      setSelectedSubmission(null);
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/contact-us/${id}`);
    },
    onSuccess: () => {
      toast.success("Submission deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["contactSubmissions"] });
    },
    onError: () => {
      toast.error("Failed to delete submission");
    },
  });

  const handleViewDetails = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setNewStatus(submission.status);
    setAdminNotes(submission.adminNotes || "");
    setShowModal(true);
    
    // Mark as read if it's unread
    if (submission.status === "unread") {
      updateStatusMutation.mutate({ id: submission._id, status: "read" });
    }
  };

  const handleUpdateStatus = () => {
    if (selectedSubmission) {
      updateStatusMutation.mutate({
        id: selectedSubmission._id,
        status: newStatus,
        notes: adminNotes,
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the submission from ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "unread":
        return "badge badge--warning";
      case "read":
        return "badge badge--info";
      case "responded":
        return "badge badge--success";
      default:
        return "badge";
    }
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
    <div>
      <RoleGuard role="admin" />
      <header className="admin-page-header">
        <h1 className="admin-page-header__title">Contact Us Submissions</h1>
        <p className="admin-page-header__subtitle">
          View and manage all contact form submissions from users.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", maxWidth: "100%" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="admin-search-input"
            style={{ flex: "1 1 300px", padding: "0.5rem 0.75rem" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-search-input"
            style={{ flex: "0 0 150px", padding: "0.5rem 0.75rem" }}
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
          </select>
        </div>
      </header>

      <section>
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message Preview</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {error && (
                  <tr>
                    <td colSpan={6} style={{ padding: "0.75rem", textAlign: "center", color: "#dc2626" }}>
                      Failed to load submissions
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={6} style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                      Loading submissions...
                    </td>
                  </tr>
                )}
                {submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td style={{ fontWeight: submission.status === "unread" ? 600 : 400 }}>
                      {submission.name}
                    </td>
                    <td style={{ color: "#6b7280" }}>{submission.email}</td>
                    <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {submission.message.substring(0, 100)}...
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(submission.status)}>
                        {submission.status}
                      </span>
                    </td>
                    <td style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      {formatDate(submission.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleViewDetails(submission)}
                          className="btn btn--primary"
                          style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
                        >
                          <Eye className="h-4 w-4" style={{ display: "inline", marginRight: "0.25rem" }} />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(submission._id, submission.name)}
                          className="btn btn--danger"
                          style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" style={{ display: "inline", marginRight: "0.25rem" }} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && submissions.length === 0 && !error && (
                  <tr>
                    <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                      <Mail className="h-12 w-12" style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                      <p>No contact submissions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <div>
              Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
            </div>
            <div className="admin-pagination__actions">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn--outline"
              >
                Prev
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="btn btn--outline"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal for viewing details */}
      {showModal && selectedSubmission && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "1.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
              Contact Submission Details
            </h2>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Name:</label>
              <p>{selectedSubmission.name}</p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Email:</label>
              <p>{selectedSubmission.email}</p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Message:</label>
              <p style={{ whiteSpace: "pre-wrap", backgroundColor: "#f3f4f6", padding: "0.75rem", borderRadius: "0.375rem" }}>
                {selectedSubmission.message}
              </p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Submitted:</label>
              <p>{formatDate(selectedSubmission.createdAt)}</p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="admin-search-input"
                style={{ width: "100%", padding: "0.5rem 0.75rem" }}
              >
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
              </select>
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>Admin Notes:</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="admin-search-input"
                rows={3}
                placeholder="Add internal notes about this submission..."
                style={{ width: "100%", padding: "0.5rem 0.75rem" }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn--outline"
                style={{ padding: "0.5rem 1rem" }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="btn btn--primary"
                style={{ padding: "0.5rem 1rem" }}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
