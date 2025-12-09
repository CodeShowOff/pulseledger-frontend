// src/components/coach/PlanClientsModal.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { X, User, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";

type Client = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  subscriptionId: string;
  startDate: string;
  endDate: string;
};

type PlanClientsResponse = {
  clients: Client[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  planTitle: string;
};

type PlanClientsModalProps = {
  planId: string;
  planTitle: string;
  onClose: () => void;
};

const fetchPlanClients = async (planId: string, page: number) => {
  const res = await api.get(`/subscriptions/plan/${planId}/clients?page=${page}&limit=10`);
  return res.data.data as PlanClientsResponse;
};

export default function PlanClientsModal({ planId, planTitle, onClose }: PlanClientsModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["planClients", planId, currentPage],
    queryFn: () => fetchPlanClients(planId, currentPage),
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0, color: "#111827" }}>
              Subscribed Clients
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
              {planTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#f3f4f6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
          {isLoading && (
            <p style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>
              Loading clients...
            </p>
          )}

          {error && (
            <p style={{ textAlign: "center", color: "#dc2626", padding: "2rem" }}>
              Error loading clients. Please try again.
            </p>
          )}

          {data && data.clients.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#6b7280",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                border: "1px dashed #e5e7eb",
              }}
            >
              <User style={{ width: "48px", height: "48px", color: "#d1d5db", margin: "0 auto 1rem" }} />
              <p style={{ margin: 0 }}>No clients subscribed to this plan yet.</p>
            </div>
          )}

          {data && data.clients.length > 0 && (
            <>
              {/* Stats */}
              <div
                style={{
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Total clients: {data.pagination.totalItems}</span>
                <span>
                  Showing {(currentPage - 1) * data.pagination.itemsPerPage + 1}-
                  {Math.min(currentPage * data.pagination.itemsPerPage, data.pagination.totalItems)} of{" "}
                  {data.pagination.totalItems}
                </span>
              </div>

              {/* Client List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {data.clients.map((client) => (
                  <div
                    key={client._id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1rem",
                      backgroundColor: "#fafafa",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                      {client.avatarUrl ? (
                        <img
                          src={client.avatarUrl}
                          alt={client.fullName}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <User style={{ width: "20px", height: "20px", color: "#6b7280" }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#111827",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {client.fullName}
                        </p>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "#6b7280",
                            margin: "0.15rem 0 0 0",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {client.email}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.25rem 0 0 0" }}>
                          Started: {new Date(client.startDate).toLocaleDateString()} • Ends:{" "}
                          {new Date(client.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/coach/clients/${client._id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.5rem 0.85rem",
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#fff",
                        color: "#374151",
                        textDecoration: "none",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <ExternalLink style={{ width: "14px", height: "14px" }} />
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginTop: "1.5rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
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
                    {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
                    onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={currentPage === data.pagination.totalPages}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.5rem",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: currentPage === data.pagination.totalPages ? "#f3f4f6" : "#fff",
                      cursor: currentPage === data.pagination.totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === data.pagination.totalPages ? 0.5 : 1,
                    }}
                  >
                    <ChevronRight style={{ width: "18px", height: "18px", color: "#374151" }} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
