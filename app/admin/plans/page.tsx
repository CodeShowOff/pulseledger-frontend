"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Trash2, ChevronDown, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  durationWeeks?: number;
  status: string;
  coachId?: { _id: string; fullName: string; email: string };
  createdAt: string;
};

type CoachGroup = {
  coachId: string;
  coachName: string;
  coachEmail: string;
  plans: Plan[];
};

type ApiResponse = { data: Plan[]; pagination: { total: number; page: number; totalPages: number } };

const fetchPlans = async (page = 1, limit = 20): Promise<ApiResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  const res = await api.get(`/admin/plans?${params.toString()}`);
  return res.data;
};

const deletePlan = async (planId: string): Promise<void> => {
  await api.delete(`/admin/plans/${planId}`);
};

export default function AdminPlansPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCoaches, setExpandedCoaches] = useState<Set<string>>(new Set());
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data = { data: [], pagination: { total: 0, page: 1, totalPages: 1 } }, isLoading, error } = useQuery({
    queryKey: ["adminPlans", page],
    queryFn: () => fetchPlans(page),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      toast.success("Plan deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminPlans"] });
    },
    onError: () => {
      toast.error("Failed to delete plan");
    },
  });

  const plans: Plan[] = data.data ?? [];
  const pagination = data.pagination ?? { total: 0, page: 1, totalPages: 1 };

  // Group plans by coach and filter by search query
  const coachGroups = useMemo(() => {
    const groups: Map<string, CoachGroup> = new Map();
    
    plans.forEach((plan) => {
      const coachId = plan.coachId?._id || "unknown";
      const coachName = plan.coachId?.fullName || "Unknown Coach";
      const coachEmail = plan.coachId?.email || "";
      
      if (!groups.has(coachId)) {
        groups.set(coachId, {
          coachId,
          coachName,
          coachEmail,
          plans: [],
        });
      }
      groups.get(coachId)!.plans.push(plan);
    });

    // Sort groups by coach name and filter by search
    let result = Array.from(groups.values()).sort((a, b) => 
      a.coachName.localeCompare(b.coachName)
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.coachName.toLowerCase().includes(query) ||
          g.coachEmail.toLowerCase().includes(query)
      );
    }

    return result;
  }, [plans, searchQuery]);

  const toggleCoach = (coachId: string) => {
    setExpandedCoaches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(coachId)) {
        newSet.delete(coachId);
      } else {
        newSet.add(coachId);
      }
      return newSet;
    });
  };

  const handleDeletePlan = async (planId: string, planTitle: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${planTitle}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingPlanId(planId);
    try {
      await deleteMutation.mutateAsync(planId);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const expandAll = () => {
    setExpandedCoaches(new Set(coachGroups.map((g) => g.coachId)));
  };

  const collapseAll = () => {
    setExpandedCoaches(new Set());
  };

  return (
    <div>
      <header className="admin-page-header">
        <h1 className="admin-page-header__title">Plans</h1>
        <p className="admin-page-header__subtitle">
          Review and manage all plans created by coaches, organized by coach.
        </p>
      </header>

      {/* Search and Controls */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-color-muted)' }} />
            <input
              type="text"
              placeholder="Search by coach name or email..."
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
            Loading plans...
          </div>
        )}

        {error && !isLoading && (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-color-danger)' }}>
            Failed to load plans
          </div>
        )}

        {!isLoading && !error && coachGroups.length === 0 && (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-color-muted)' }}>
            {searchQuery ? "No coaches found matching your search" : "No plans found"}
          </div>
        )}

        {!isLoading && !error && coachGroups.map((group, index) => (
          <div 
            key={group.coachId} 
            className="admin-table-wrapper"
            style={{ marginTop: index === 0 ? 0 : '1rem' }}
          >
            {/* Coach Header */}
            <div
              onClick={() => toggleCoach(group.coachId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                backgroundColor: expandedCoaches.has(group.coachId) ? '#f9fafb' : 'transparent',
                borderBottom: expandedCoaches.has(group.coachId) ? '1px solid var(--admin-color-border-subtle)' : 'none',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = expandedCoaches.has(group.coachId) ? '#f9fafb' : 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {expandedCoaches.has(group.coachId) ? (
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--admin-color-muted)', flexShrink: 0 }} />
                ) : (
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--admin-color-muted)', flexShrink: 0 }} />
                )}
                <div>
                  <h3 style={{ fontSize: 'var(--admin-font-size-base)', fontWeight: 600, margin: 0 }}>{group.coachName}</h3>
                  <p style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-color-muted)', margin: '0.25rem 0 0 0' }}>{group.coachEmail}</p>
                </div>
              </div>
              <span className="badge badge--neutral">
                {group.plans.length} {group.plans.length === 1 ? "plan" : "plans"}
              </span>
            </div>

            {/* Plans Table */}
            {expandedCoaches.has(group.coachId) && (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.plans.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 500 }}>{p.title}</td>
                        <td>{p.price != null ? `₹${p.price.toFixed(2)}` : "-"}</td>
                        <td>{p.durationWeeks ?? "-"} weeks</td>
                        <td>
                          <span
                            className={
                              p.status === "active"
                                ? "badge badge--success"
                                : p.status === "paused"
                                ? "badge badge--neutral"
                                : "badge badge--danger"
                            }
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(p._id, p.title);
                            }}
                            disabled={deletingPlanId === p._id}
                            className="btn btn--danger"
                            style={{ padding: '0.35rem 0.65rem', fontSize: 'var(--admin-font-size-xs)' }}
                            title="Delete Plan"
                          >
                            <Trash2 style={{ width: '14px', height: '14px', marginRight: '0.35rem' }} />
                            {deletingPlanId === p._id ? "..." : "Delete"}
                          </button>
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
                Page {pagination.page} of {pagination.totalPages} • {pagination.total} total plans
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
