"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

type Subscription = {
  _id: string;
  status: string;
  createdAt: string;
  clientId?: { _id: string; fullName: string; email: string };
  coachId?: { fullName: string; email: string };
  planId?: { title: string };
};

type ClientGroup = {
  clientId: string;
  clientName: string;
  clientEmail: string;
  subscriptions: Subscription[];
};

type ApiResponse = {
  data: Subscription[];
  pagination: { total: number; page: number; totalPages: number };
};

const fetchSubscriptions = async (
  status?: string,
  page = 1
): Promise<ApiResponse> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("page", page.toString());
  const res = await api.get(`/admin/subscriptions?${params.toString()}`);
  return res.data;
};

export default function AdminSubscriptionsPage() {
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const {
    data = { data: [], pagination: { total: 0, page: 1, totalPages: 1 } },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminSubscriptions", status, page],
    queryFn: () => fetchSubscriptions(status, page),
  });
  const subscriptions: Subscription[] = data.data ?? [];
  const pagination = data.pagination ?? { total: 0, page: 1, totalPages: 1 };

  // Group subscriptions by client and filter by search query
  const clientGroups = useMemo(() => {
    const groups: Map<string, ClientGroup> = new Map();
    
    subscriptions.forEach((subscription) => {
      const clientId = subscription.clientId?._id || "unknown";
      const clientName = subscription.clientId?.fullName || "Unknown Client";
      const clientEmail = subscription.clientId?.email || "";
      
      if (!groups.has(clientId)) {
        groups.set(clientId, {
          clientId,
          clientName,
          clientEmail,
          subscriptions: [],
        });
      }
      groups.get(clientId)!.subscriptions.push(subscription);
    });

    // Sort groups by client name and filter by search
    let result = Array.from(groups.values()).sort((a, b) => 
      a.clientName.localeCompare(b.clientName)
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.clientName.toLowerCase().includes(query) ||
          g.clientEmail.toLowerCase().includes(query)
      );
    }

    return result;
  }, [subscriptions, searchQuery]);

  const toggleClient = (clientId: string) => {
    setExpandedClients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedClients(new Set(clientGroups.map((g) => g.clientId)));
  };

  const collapseAll = () => {
    setExpandedClients(new Set());
  };

  const updateStatus = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) =>
      api.patch(`/admin/subscriptions/${id}/status`, { status: newStatus }),
    onSuccess: () => {
      toast.success("Subscription updated");
      queryClient.invalidateQueries({ queryKey: ["adminSubscriptions"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  return (
    <div>
      <header className="admin-page-header">
        <h1 className="admin-page-header__title">Subscriptions</h1>
        <p className="admin-page-header__subtitle">
          Approve or reject subscription requests, organized by client.
        </p>
      </header>

      {/* Search, Filter and Controls */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-color-muted)' }} />
            <input
              type="text"
              placeholder="Search by client name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                border: '1px solid var(--admin-color-border)',
                borderRadius: 'var(--admin-radius-md)',
                backgroundColor: 'var(--admin-color-surface)',
                fontSize: 'var(--admin-font-size-sm)',
              }}
            />
          </div>
          <select
            value={status || ""}
            onChange={(e) => setStatus(e.target.value || undefined)}
            style={{ 
              padding: "0.5rem 0.75rem", 
              borderRadius: "var(--admin-radius-md)", 
              border: "1px solid var(--admin-color-border)", 
              fontSize: "var(--admin-font-size-sm)",
              backgroundColor: 'var(--admin-color-surface)',
              minWidth: '140px',
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={expandAll} className="btn btn--outline">
              Expand All
            </button>
            <button onClick={collapseAll} className="btn btn--outline">
              Collapse All
            </button>
          </div>
        </div>
      </div>

      <section>
        {isLoading && (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-color-muted)' }}>
            Loading subscriptions...
          </div>
        )}

        {error && !isLoading && (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-color-danger)' }}>
            Failed to load subscriptions
          </div>
        )}

        {!isLoading && !error && clientGroups.length === 0 && (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-color-muted)' }}>
            {searchQuery ? "No clients found matching your search" : "No subscriptions found"}
          </div>
        )}

        {!isLoading && !error && clientGroups.map((group, index) => (
          <div 
            key={group.clientId} 
            className="admin-table-wrapper"
            style={{ marginTop: index === 0 ? 0 : '1rem' }}
          >
            {/* Client Header */}
            <div
              onClick={() => toggleClient(group.clientId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                backgroundColor: expandedClients.has(group.clientId) ? '#f9fafb' : 'transparent',
                borderBottom: expandedClients.has(group.clientId) ? '1px solid var(--admin-color-border-subtle)' : 'none',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = expandedClients.has(group.clientId) ? '#f9fafb' : 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {expandedClients.has(group.clientId) ? (
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--admin-color-muted)', flexShrink: 0 }} />
                ) : (
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--admin-color-muted)', flexShrink: 0 }} />
                )}
                <div>
                  <h3 style={{ fontSize: 'var(--admin-font-size-base)', fontWeight: 600, margin: 0 }}>{group.clientName}</h3>
                  <p style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-color-muted)', margin: '0.25rem 0 0 0' }}>{group.clientEmail}</p>
                </div>
              </div>
              <span className="badge badge--neutral">
                {group.subscriptions.length} {group.subscriptions.length === 1 ? "subscription" : "subscriptions"}
              </span>
            </div>

            {/* Subscriptions Table */}
            {expandedClients.has(group.clientId) && (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Coach</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ width: '180px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.subscriptions.map((s) => (
                      <tr key={s._id}>
                        <td style={{ fontWeight: 500 }}>{s.coachId?.fullName ?? "-"}</td>
                        <td>{s.planId?.title ?? "-"}</td>
                        <td>
                          <span
                            className={
                              s.status === "approved"
                                ? "badge badge--success"
                                : s.status === "pending"
                                ? "badge badge--neutral"
                                : "badge badge--danger"
                            }
                          >
                            {s.status}
                          </span>
                        </td>
                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td>
                          {s.status === "pending" && (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus.mutate({ id: s._id, newStatus: "approved" });
                                }}
                                className="btn btn--primary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: 'var(--admin-font-size-xs)' }}
                                disabled={updateStatus.isPending}
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus.mutate({ id: s._id, newStatus: "rejected" });
                                }}
                                className="btn btn--danger"
                                style={{ padding: '0.35rem 0.65rem', fontSize: 'var(--admin-font-size-xs)' }}
                                disabled={updateStatus.isPending}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {/* Pagination */}
        {!isLoading && !error && pagination.totalPages > 0 && (
          <div className="admin-table-wrapper" style={{ marginTop: '1rem' }}>
            <div className="admin-pagination">
              <div>
                Page {pagination.page} of {pagination.totalPages} • {pagination.total} total subscriptions
              </div>
              <div className="admin-pagination__actions">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn--outline"
                >
                  Previous
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
        )}
      </section>
    </div>
  );
}
