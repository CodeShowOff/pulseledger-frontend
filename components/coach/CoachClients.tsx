// src/components/coach/CoachClients.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useCoachPendingPlanRequests, COACH_PENDING_PLAN_REQUESTS_KEY } from "@/lib/queries/planRequests";
import Link from "next/link";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { User, Mail, Activity, FileText, Clock, MessageCircle, ChevronLeft, ChevronRight, Check, X } from "lucide-react";

type Client = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  whatsappNumber?: string | null;
  latestProgress?: { weight?: number; bmi?: number; date?: string } | null;
  planSummary?: {
    current?: {
      planTitle?: string | null;
      type?: "subscription" | "default" | null;
      status?: string | null;
      endDate?: string | null;
      durationWeeks?: number | null;
      price?: number | null;
      isDefault?: boolean;
    } | null;
    pending?: Array<{
      subscriptionId: string;
      planTitle: string | null;
      requestedAt: string | null;
    }>;
    defaultPlan?: {
      title?: string;
      durationWeeks?: number;
      price?: number;
      isDefault?: boolean;
    } | null;
  };
};

const CLIENTS_PER_PAGE = 5;

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};

const fetchClients = async (page = 1, search = "") => {
  const params = new URLSearchParams({ page: String(page), limit: "100" });
  if (search.trim()) {
    params.set("search", search.trim());
  }
  const res = await api.get(`/coach/clients?${params.toString()}`);
  return res.data;
};

export default function CoachClients() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["coachClients", 1, debouncedSearch],
    queryFn: () => fetchClients(1, debouncedSearch),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
  const { data: pendingRequests = [] } = useCoachPendingPlanRequests();
  const queryClient = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/plan-requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachClients"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["coachSubscriptions"] });
    },
  });
  const declineMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/plan-requests/${id}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachClients"], exact: false });
    },
  });

  const clients: Client[] = data?.data ?? [];
  const totalPages = Math.ceil(clients.length / CLIENTS_PER_PAGE);
  const paginatedClients = clients.slice(
    (currentPage - 1) * CLIENTS_PER_PAGE,
    currentPage * CLIENTS_PER_PAGE
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Show initial loading state only on first load
  if (isLoading && !data) {
    return <p>Loading clients...</p>;
  }

  if (error) {
    return <p>Error loading clients</p>;
  }

  return (
    <div className="admin-card">
      <div className="admin-page-header" style={{ padding: 0, marginBottom: "0.75rem" }}>
        <h3 className="admin-page-header__title" style={{ fontSize: "1.05rem" }}>
          Assigned Clients
        </h3>
        <p className="admin-page-header__subtitle" style={{ fontSize: "0.85rem" }}>
          Overview of all clients linked to your coaching account.
        </p>
      </div>

      <div style={{ marginBottom: "0.75rem", maxWidth: 320, position: "relative" }}>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by name, email, or phone"
          className="admin-search-input"
          style={{ width: "100%", padding: "0.5rem 0.75rem" }}
        />
        {isFetching && (
          <span style={{ 
            position: "absolute", 
            right: "0.75rem", 
            top: "50%", 
            transform: "translateY(-50%)",
            fontSize: "0.75rem",
            color: "var(--admin-color-text-secondary, #6b7280)"
          }}>
            Loading...
          </span>
        )}
      </div>

      {/* Card-based layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", opacity: isFetching ? 0.6 : 1, transition: "opacity 0.2s" }}>
        {paginatedClients.map((c) => {
          const clientPending = pendingRequests.filter((r: any) => r.clientId?._id === c._id);

          return (
            <div
              key={c._id}
              style={{
                background: "#fff",
                border: "1px solid var(--admin-color-border, #e5e7eb)",
                borderRadius: "0.75rem",
                padding: "1rem",
                boxShadow: "var(--admin-shadow-soft, 0 1px 3px rgba(0,0,0,0.1))",
              }}
            >
              {/* Main Row: Name, Email, BMI, Plan, View Profile - Responsive */}
              <div 
                style={{ 
                  display: "flex", 
                  flexWrap: "wrap",
                  alignItems: "center", 
                  gap: "1rem",
                  marginBottom: clientPending.length > 0 ? "0.75rem" : "0"
                }}
              >
                {/* Name & Email */}
                <div style={{ flex: "1 1 200px", minWidth: "180px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                    <User size={16} style={{ color: "#6b7280" }} />
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{c.fullName}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Mail size={12} style={{ color: "#9ca3af" }} />
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{c.email}</span>
                  </div>
                </div>

                {/* BMI */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: "80px" }}>
                  <Activity size={14} style={{ color: "#6b7280" }} />
                  <span style={{ fontSize: "0.85rem" }}>
                    <strong>BMI:</strong> {c.latestProgress?.bmi ?? "-"}
                  </span>
                </div>
                
                {/* Plan Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: "1 1 180px", minWidth: "150px" }}>
                  <FileText size={14} style={{ color: "#6b7280", flexShrink: 0 }} />
                  <div>
                    {c.planSummary?.current ? (
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                          {c.planSummary.current.planTitle || "Plan"}
                          {c.planSummary.current.type === "default" ? " (Default)" : ""}
                        </span>
                        {c.planSummary.current.type === "subscription" && formatDate(c.planSummary.current.endDate) && (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock size={12} style={{ color: "#9ca3af" }} />
                            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              Ends {formatDate(c.planSummary.current.endDate)}
                            </span>
                          </span>
                        )}
                      </div>
                    ) : c.planSummary?.defaultPlan ? (
                      <span style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                        {c.planSummary.defaultPlan.title || "Default plan"}
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>No plan</span>
                    )}
                  </div>
                </div>

                {/* View Profile Button - in same row on desktop */}
                <Link
                  href={`/coach/clients/${c._id}`}
                  className="btn btn--outline"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", padding: "0.35rem 0.65rem", flexShrink: 0 }}
                >
                  <User size={14} />
                  View Profile
                </Link>
              </div>

              {/* Pending Requests */}
              {clientPending.length > 0 && (
                <div style={{ 
                  background: "#fef3c7", 
                  borderRadius: "0.5rem", 
                  padding: "0.75rem", 
                }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e", marginBottom: "0.5rem", display: "block" }}>
                    {clientPending.length} Pending Request{clientPending.length > 1 ? "s" : ""}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {clientPending.map((req: any) => (
                      <div key={req._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "#78350f" }}>{req.planId?.title || "Plan Request"}</span>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button
                            type="button"
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            onClick={() => approveMutation.mutate(req._id)}
                            className="btn btn--primary"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            onClick={() => declineMutation.mutate(req._id)}
                            className="btn btn--danger"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                          >
                            <X size={12} />
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!clients.length && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
            No clients match the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn--outline"
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`btn ${currentPage === page ? "btn--primary" : "btn--outline"}`}
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem", minWidth: "2.5rem" }}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn--outline"
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
          >
            Next
            <ChevronRight size={16} />
          </button>

          <span style={{ fontSize: "0.85rem", color: "#6b7280", marginLeft: "0.5rem" }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
