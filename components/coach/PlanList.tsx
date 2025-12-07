// src/components/coach/PlanList.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Edit, Trash2, FileText, Users, Calendar, DollarSign, Target, ChevronLeft, ChevronRight } from "lucide-react";
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

const fetchPlans = async () => {
  const res = await api.get(`/plans?limit=100`);
  return res.data;
};

const PLANS_PER_PAGE = 6;

function statusClass(status?: string) {
  switch (status) {
    case "active":
      return { bg: "#dcfce7", color: "#16a34a" };
    case "paused":
      return { bg: "#fef3c7", color: "#d97706" };
    case "completed":
      return { bg: "#dbeafe", color: "#2563eb" };
    default:
      return { bg: "#f3f4f6", color: "#6b7280" };
  }
}

export default function PlanList() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ["coachPlans"], queryFn: fetchPlans });
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

  if (isLoading) return <p style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>Loading plans...</p>;

  const totalPlans = plans.length;
  const totalPages = Math.ceil(totalPlans / PLANS_PER_PAGE);
  const startIndex = (currentPage - 1) * PLANS_PER_PAGE;
  const paginatedPlans = plans.slice(startIndex, startIndex + PLANS_PER_PAGE);

  return (
    <div>
      {/* Summary */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "1rem",
        fontSize: "0.85rem",
        color: "#6b7280"
      }}>
        <span>Total plans: {totalPlans}</span>
        <span>Showing {startIndex + 1}-{Math.min(startIndex + PLANS_PER_PAGE, totalPlans)} of {totalPlans}</span>
      </div>

      {/* Card-based layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {paginatedPlans.map((p) => {
          const statusStyle = statusClass(p.status);
          
          return (
            <div
              key={p._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "1rem",
                backgroundColor: "#fafafa",
              }}
            >
              {/* Plan Header */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "0.75rem",
                paddingBottom: "0.75rem",
                borderBottom: "1px solid #e5e7eb"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <h3 style={{ 
                      fontSize: "1rem", 
                      fontWeight: 600, 
                      color: "#111827",
                      margin: 0
                    }}>
                      {p.title}
                    </h3>
                    {p.isDefault && (
                      <span style={{
                        fontSize: "0.65rem",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "4px",
                        backgroundColor: "#dbeafe",
                        color: "#2563eb",
                        fontWeight: 500
                      }}>
                        Default
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                    {p.isTemplate ? "📢 Available to All Clients" : "👤 Assigned to Client"}
                  </p>
                </div>
                <span style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "999px",
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                  fontWeight: 500,
                  textTransform: "capitalize"
                }}>
                  {p.status || "draft"}
                </span>
              </div>

              {/* Plan Details */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(2, 1fr)", 
                gap: "0.75rem",
                marginBottom: "0.75rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Users style={{ width: "14px", height: "14px", color: "#6b7280" }} />
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block" }}>Client</span>
                    <span style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>
                      {p.isTemplate ? "All Clients" : (p.clientId?.fullName ?? "—")}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <DollarSign style={{ width: "14px", height: "14px", color: "#6b7280" }} />
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block" }}>Price</span>
                    <span style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>
                      ₹{Number(p.price ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar style={{ width: "14px", height: "14px", color: "#6b7280" }} />
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block" }}>Duration</span>
                    <span style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>
                      {p.durationWeeks ? `${p.durationWeeks} weeks` : "—"}
                    </span>
                  </div>
                </div>
                
                {p.goal && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Target style={{ width: "14px", height: "14px", color: "#6b7280" }} />
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block" }}>Goal</span>
                      <span style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>
                        {p.goal}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ 
                display: "flex", 
                gap: "0.5rem", 
                justifyContent: "flex-end",
                paddingTop: "0.75rem",
                borderTop: "1px solid #e5e7eb"
              }}>
                <Link
                  href={`/coach/plans/${p._id}/edit`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.8rem",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                    color: "#374151",
                    textDecoration: "none",
                    fontWeight: 500
                  }}
                >
                  <Edit style={{ width: "14px", height: "14px" }} />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this plan?")) {
                      deleteMutation.mutate(p._id);
                    }
                  }}
                  disabled={p.isDefault || deleteMutation.isPending}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.8rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: p.isDefault ? "#f3f4f6" : "#fee2e2",
                    color: p.isDefault ? "#9ca3af" : "#dc2626",
                    cursor: p.isDefault ? "not-allowed" : "pointer",
                    fontWeight: 500,
                    opacity: p.isDefault ? 0.6 : 1
                  }}
                >
                  <Trash2 style={{ width: "14px", height: "14px" }} />
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem", 
            color: "#6b7280",
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            border: "1px dashed #e5e7eb"
          }}>
            <FileText style={{ width: "48px", height: "48px", color: "#d1d5db", margin: "0 auto 1rem" }} />
            <p style={{ margin: 0 }}>No plans found. Create your first plan!</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.75rem",
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid #e5e7eb"
        }}>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: currentPage === 1 ? "#f3f4f6" : "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft style={{ width: "18px", height: "18px", color: "#374151" }} />
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                style={{
                  minWidth: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  border: page === currentPage ? "none" : "1px solid #e5e7eb",
                  backgroundColor: page === currentPage ? "#2563eb" : "#fff",
                  color: page === currentPage ? "#fff" : "#374151",
                  fontSize: "0.85rem",
                  fontWeight: page === currentPage ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: currentPage === totalPages ? "#f3f4f6" : "#fff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            <ChevronRight style={{ width: "18px", height: "18px", color: "#374151" }} />
          </button>
        </div>
      )}
    </div>
  );
}
