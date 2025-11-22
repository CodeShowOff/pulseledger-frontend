"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ClipboardList } from "lucide-react";

type Plan = {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  durationWeeks?: number;
  status: string;
  isTemplate?: boolean;
  coachId?: { fullName: string; email: string };
  createdAt: string;
};

type ApiResponse = { data: Plan[]; pagination: { total: number; page: number; totalPages: number } };

const fetchPlans = async (page = 1): Promise<ApiResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  const res = await api.get(`/admin/plans?${params.toString()}`);
  return res.data;
};

export default function AdminPlansPage() {
  const [page, setPage] = useState(1);

  const { data = { data: [], pagination: { total: 0, page: 1, totalPages: 1 } }, isLoading, error } = useQuery({
    queryKey: ["adminPlans", page],
    queryFn: () => fetchPlans(page),
  });

  const plans: Plan[] = data.data ?? [];
  const pagination = data.pagination ?? { total: 0, page: 1, totalPages: 1 };

  return (
    <div>
      <header className="admin-page-header">
        <h1 className="admin-page-header__title">Plans</h1>
        <p className="admin-page-header__subtitle">
          Review and monitor all plans created by coaches.
        </p>
      </header>

      <section className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Coach</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Type</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                    Loading plans...
                  </td>
                </tr>
              )}
              {error && !isLoading && (
                <tr>
                  <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center", color: "#dc2626" }}>
                    Failed to load plans
                  </td>
                </tr>
              )}
              {!isLoading && !error &&
                plans.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.coachId?.fullName ?? "-"}</td>
                    <td>{p.price != null ? `₹${p.price.toFixed(2)}` : "-"}</td>
                    <td>{p.durationWeeks ?? "-"} weeks</td>
                    <td className="capitalize">
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
                    <td>
                      <span className="badge badge--neutral">
                        {p.isTemplate ? "Template" : "Custom"}
                      </span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              {!isLoading && !error && plans.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                    No plans found
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
