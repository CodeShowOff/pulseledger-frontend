// src/components/coach/CoachClients.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useCoachPendingPlanRequests, COACH_PENDING_PLAN_REQUESTS_KEY } from "@/lib/queries/planRequests";
import Link from "next/link";
import Image from "next/image";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

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

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};

const fetchClients = async (page = 1, search = "") => {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (search.trim()) {
    params.set("search", search.trim());
  }
  const res = await api.get(`/coach/clients?${params.toString()}`);
  return res.data;
};

export default function CoachClients() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 1200);

  const { data, isLoading, error } = useQuery({
    queryKey: ["coachClients", page, debouncedSearch],
    queryFn: () => fetchClients(page, debouncedSearch),
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

  useEffect(() => {
    const totalPages = data?.pagination?.totalPages ?? 0;
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [data?.pagination?.totalPages, page]);

  if (isLoading) return <p>Loading clients...</p>;
  if (error) return <p>Error loading clients</p>;

  const clients: Client[] = data?.data ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, totalPages: 1 };

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

      <div style={{ marginBottom: "0.75rem", maxWidth: 320 }}>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email, or phone"
          className="admin-search-input"
          style={{ width: "100%", padding: "0.5rem 0.75rem" }}
        />
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Latest BMI</th>
                <th>Current Plan</th>
                <th>Pending Requests</th>
                <th>Contact</th>
                <th>Profile</th>
                <th>Approve / Decline</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const clientPending = pendingRequests.filter((r: any) => r.clientId?._id === c._id);
                const handleApprove = (id: string) => approveMutation.mutate(id);
                const handleDecline = (id: string) => declineMutation.mutate(id);
                
                return (
                  <tr key={c._id}>
                    <td>{c.fullName}</td>
                    <td>{c.email}</td>
                    <td>{c.latestProgress?.bmi ?? "-"}</td>
                    <td>
                      {c.planSummary?.current ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                          <span style={{ fontWeight: 500 }}>
                            {c.planSummary.current.planTitle || "Plan"}
                            {c.planSummary.current.type === "default" ? " (Default)" : ""}
                          </span>
                          {c.planSummary.current.type === "subscription" && formatDate(c.planSummary.current.endDate) && (
                            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              Ends {formatDate(c.planSummary.current.endDate)}
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
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                        {clientPending.length ? `${clientPending.length} awaiting approval` : "None"}
                      </span>
                    </td>
                    <td>
                      {c.whatsappNumber ? (
                        <button
                          type="button"
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.2rem" }}
                          onClick={() => {
                            const phone = String(c.whatsappNumber).replace(/\D/g, "");
                            if (!phone) return;
                            const url = `https://wa.me/${phone}`;
                            window.open(url, "_blank");
                          }}
                        >
                          <Image src="/whatsapp.png" alt="WhatsApp" width={28} height={28} style={{ flexShrink: 0 }} />
                        </button>
                      ) : c.phone ? (
                        <span style={{ fontSize: "0.85rem" }}>{c.phone}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/coach/clients/${c._id}`}
                        className="btn btn--outline"
                      >
                        View
                      </Link>
                    </td>
                    <td>
                      {clientPending.map((req: any) => (
                        <div
                          key={req._id}
                          style={{ display: "flex", gap: "0.25rem", marginBottom: "0.25rem" }}
                        >
                          <button
                            type="button"
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            onClick={() => approveMutation.mutate(req._id)}
                            className="btn btn--primary"
                            style={{ paddingInline: "0.4rem", paddingBlock: "0.25rem", fontSize: "0.7rem" }}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            onClick={() => declineMutation.mutate(req._id)}
                            className="btn btn--danger"
                            style={{ paddingInline: "0.4rem", paddingBlock: "0.25rem", fontSize: "0.7rem" }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })}
              {!clients.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "0.75rem", color: "#6b7280" }}>
                    No clients match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-pagination" style={{ marginTop: "1rem" }}>
        <p className="admin-page-header__subtitle">
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="admin-pagination__controls">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn btn--outline"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            className="btn btn--outline"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
