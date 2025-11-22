"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

type Subscription = {
  _id: string;
  status: string;
  createdAt: string;
  clientId?: { fullName: string; email: string };
  coachId?: { fullName: string; email: string };
  planId?: { title: string };
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <h1 className="admin-page-header__title">Subscriptions</h1>
            <p className="admin-page-header__subtitle">
              Approve or reject subscription requests between clients and coaches.
            </p>
          </div>
          <select
            value={status || ""}
            onChange={(e) => setStatus(e.target.value || undefined)}
            style={{ padding: "0.4rem 0.6rem", borderRadius: "0.375rem", border: "1px solid #e5e7eb", fontSize: "0.85rem" }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </header>

      <section className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Coach</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td colSpan={6} style={{ padding: "0.75rem", textAlign: "center", color: "#dc2626" }}>
                    Failed to load subscriptions
                  </td>
                </tr>
              )}
              {subscriptions.map((s) => (
                <tr key={s._id}>
                  <td>{s.clientId?.fullName ?? "-"}</td>
                  <td>{s.coachId?.fullName ?? "-"}</td>
                  <td>{s.planId?.title ?? "-"}</td>
                  <td className="capitalize">
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
                          onClick={() => updateStatus.mutate({ id: s._id, newStatus: "approved" })}
                          className="btn btn--primary"
                          disabled={updateStatus.isPending}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus.mutate({ id: s._id, newStatus: "rejected" })}
                          className="btn btn--danger"
                          disabled={updateStatus.isPending}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && !error && (
                <tr>
                  <td colSpan={6} style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <div>
            Page {pagination.page} of {pagination.totalPages}
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
      </section>
    </div>
  );
}
