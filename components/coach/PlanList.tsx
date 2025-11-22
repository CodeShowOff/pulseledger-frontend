// src/components/coach/PlanList.tsx
"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CLIENT_PLANS_KEY } from "@/lib/queries/plans";
import Link from "next/link";

type Plan = {
  _id: string;
  title: string;
  description?: string;
  clientId?: { _id: string; fullName?: string } | null;
  isTemplate?: boolean;
  status?: string;
  createdAt?: string;
  price?: number;
  durationWeeks?: number;
  goal?: string;
  isDefault?: boolean;
};

const fetchPlans = async (page = 1) => {
  const res = await api.get(`/plans?page=${page}&limit=20`);
  return res.data;
};

export default function PlanList() {
  const queryClient = useQueryClient();
  const page = 1;
  const { data, isLoading } = useQuery({ queryKey: ["coachPlans", page], queryFn: () => fetchPlans(page) });
  const plans: Plan[] = data?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/plans/${id}`),
    onSuccess: () => {
      toast.success("Plan deleted");
      queryClient.invalidateQueries({ queryKey: ["coachPlans"] });
      queryClient.invalidateQueries({ queryKey: CLIENT_PLANS_KEY });
    },
    onError: () => toast.error("Failed to delete plan"),
  });

  if (isLoading) return <p>Loading plans...</p>;

  return (
    <div className="admin-card">
      <h3 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
        Your Plans
      </h3>

      <div className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                      <span style={{ fontWeight: 500, color: "#111827" }}>{p.title}</span>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {p.isTemplate ? "Available to All Clients" : "Assigned to Client"}
                        {p.isTemplate && p.isDefault ? " • Default" : ""}
                      </span>
                      {p.goal && (
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                          Goal: {p.goal}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {p.isTemplate ? (
                      <span style={{ fontStyle: "italic", color: "#6b7280" }}>All Clients</span>
                    ) : (
                      p.clientId?.fullName ?? "-"
                    )}
                  </td>
                  <td>{`₹${Number(p.price ?? 0).toFixed(2)}`}</td>
                  <td>{p.durationWeeks ? `${Number(p.durationWeeks)} wk` : "-"}</td>
                  <td>{p.status ?? "-"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Link
                        href={`/coach/plans/${p._id}/edit`}
                        className="btn btn--outline"
                        aria-label="Edit plan"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Delete this plan?")) {
                            deleteMutation.mutate(p._id);
                          }
                        }}
                        className="btn btn--danger"
                        disabled={p.isDefault || deleteMutation.isPending}
                        aria-label="Delete plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-page-header__subtitle">
                    No plans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
