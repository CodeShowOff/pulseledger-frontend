"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Bug, Eye, Trash2, AlertTriangle } from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";

type BugReport = {
  _id: string;
  name: string;
  email: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  browserInfo: string;
  deviceInfo: string;
  pageUrl: string;
  status: "open" | "in-progress" | "resolved" | "closed" | "wont-fix";
  priority: "low" | "medium" | "high" | "urgent";
  adminNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  data: BugReport[];
  pagination: { total: number; page: number; totalPages: number };
};

const fetchBugReports = async (
  page = 1,
  search = "",
  status = "",
  severity = "",
  priority = ""
): Promise<ApiResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", "20");
  if (search.trim()) params.append("search", search.trim());
  if (status) params.append("status", status);
  if (severity) params.append("severity", severity);
  if (priority) params.append("priority", priority);
  
  const res = await api.get(`/admin/bug-reports?${params.toString()}`);
  return res.data;
};

export default function AdminBugReportsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState<BugReport["status"]>("open");
  const [newPriority, setNewPriority] = useState<BugReport["priority"]>("medium");
  const [adminNotes, setAdminNotes] = useState("");
  
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, severityFilter, priorityFilter]);

  const {
    data = { data: [], pagination: { total: 0, page: 1, totalPages: 1 } },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bugReports", page, debouncedSearch, statusFilter, severityFilter, priorityFilter],
    queryFn: () => fetchBugReports(page, debouncedSearch, statusFilter, severityFilter, priorityFilter),
  });

  const reports: BugReport[] = data.data ?? [];
  const pagination = data.pagination;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, priority, notes }: { id: string; status: string; priority: string; notes?: string }) => {
      return api.patch(`/bug-reports/${id}/status`, { status, priority, adminNotes: notes });
    },
    onSuccess: () => {
      toast.success("Bug report updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bugReports"] });
      setShowModal(false);
      setSelectedReport(null);
    },
    onError: () => {
      toast.error("Failed to update bug report");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/bug-reports/${id}`);
    },
    onSuccess: () => {
      toast.success("Bug report deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    },
    onError: () => {
      toast.error("Failed to delete bug report");
    },
  });

  const handleViewDetails = (report: BugReport) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setNewPriority(report.priority);
    setAdminNotes(report.adminNotes || "");
    setShowModal(true);
  };

  const handleUpdateStatus = () => {
    if (selectedReport) {
      updateStatusMutation.mutate({
        id: selectedReport._id,
        status: newStatus,
        priority: newPriority,
        notes: adminNotes,
      });
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the bug report "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const classes = {
      low: "badge badge--success",
      medium: "badge badge--warning",
      high: "badge badge--danger",
      critical: "badge" + " " + "bg-red-600 text-white",
    };
    return classes[severity as keyof typeof classes] || "badge";
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      open: "badge badge--warning",
      "in-progress": "badge badge--info",
      resolved: "badge badge--success",
      closed: "badge",
      "wont-fix": "badge",
    };
    return classes[status as keyof typeof classes] || "badge";
  };

  const getPriorityBadge = (priority: string) => {
    const classes = {
      low: "badge",
      medium: "badge badge--info",
      high: "badge badge--warning",
      urgent: "badge badge--danger",
    };
    return classes[priority as keyof typeof classes] || "badge";
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
        <h1 className="admin-page-header__title">Bug Reports</h1>
        <p className="admin-page-header__subtitle">
          View and manage all bug reports submitted by users.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, email..."
            className="admin-search-input"
            style={{ flex: "1 1 250px", padding: "0.5rem 0.75rem" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-search-input"
            style={{ flex: "0 0 140px", padding: "0.5rem 0.75rem" }}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="wont-fix">Won't Fix</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="admin-search-input"
            style={{ flex: "0 0 140px", padding: "0.5rem 0.75rem" }}
          >
            <option value="">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="admin-search-input"
            style={{ flex: "0 0 140px", padding: "0.5rem 0.75rem" }}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </header>

      <section>
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Reporter</th>
                  <th>Severity</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reported</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {error && (
                  <tr>
                    <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center", color: "#dc2626" }}>
                      Failed to load bug reports
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                      Loading bug reports...
                    </td>
                  </tr>
                )}
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td style={{ maxWidth: "300px" }}>
                      <div style={{ fontWeight: 500 }}>{report.title}</div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{report.category}</div>
                    </td>
                    <td>
                      <div>{report.name}</div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{report.email}</div>
                    </td>
                    <td>
                      <span className={getSeverityBadge(report.severity)}>
                        {report.severity}
                      </span>
                    </td>
                    <td>
                      <span className={getPriorityBadge(report.priority)}>
                        {report.priority}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadge(report.status)}>
                        {report.status}
                      </span>
                    </td>
                    <td style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      {formatDate(report.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="btn btn--primary"
                          style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
                        >
                          <Eye className="h-4 w-4" style={{ display: "inline", marginRight: "0.25rem" }} />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(report._id, report.title)}
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
                {!isLoading && reports.length === 0 && !error && (
                  <tr>
                    <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                      <Bug className="h-12 w-12" style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                      <p>No bug reports found</p>
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
      {showModal && selectedReport && (
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
            overflow: "auto",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "1.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
              Bug Report Details
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.875rem" }}>Severity:</label>
                <span className={getSeverityBadge(selectedReport.severity)}>{selectedReport.severity}</span>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.875rem" }}>Category:</label>
                <p>{selectedReport.category}</p>
              </div>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Title:</label>
              <p style={{ fontSize: "1.125rem" }}>{selectedReport.title}</p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Reporter:</label>
              <p>{selectedReport.name} ({selectedReport.email})</p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Description:</label>
              <p style={{ whiteSpace: "pre-wrap", backgroundColor: "#f3f4f6", padding: "0.75rem", borderRadius: "0.375rem" }}>
                {selectedReport.description}
              </p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Steps to Reproduce:</label>
              <p style={{ whiteSpace: "pre-wrap", backgroundColor: "#f3f4f6", padding: "0.75rem", borderRadius: "0.375rem" }}>
                {selectedReport.stepsToReproduce}
              </p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.875rem" }}>Browser:</label>
                <p style={{ fontSize: "0.875rem" }}>{selectedReport.browserInfo || "Not specified"}</p>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.875rem" }}>Device:</label>
                <p style={{ fontSize: "0.875rem" }}>{selectedReport.deviceInfo || "Not specified"}</p>
              </div>
            </div>
            
            {selectedReport.pageUrl && (
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.875rem" }}>Page URL:</label>
                <p style={{ fontSize: "0.875rem", wordBreak: "break-all" }}>{selectedReport.pageUrl}</p>
              </div>
            )}
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Reported:</label>
              <p style={{ fontSize: "0.875rem" }}>{formatDate(selectedReport.createdAt)}</p>
            </div>
            
            <hr style={{ margin: "1.5rem 0" }} />
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="admin-search-input"
                style={{ width: "100%", padding: "0.5rem 0.75rem" }}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="wont-fix">Won't Fix</option>
              </select>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>Priority:</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="admin-search-input"
                style={{ width: "100%", padding: "0.5rem 0.75rem" }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>Admin Notes:</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="admin-search-input"
                rows={3}
                placeholder="Add internal notes about this bug report..."
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
