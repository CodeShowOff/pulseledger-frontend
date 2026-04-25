// src/components/coach/PlanClientsModal.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { X, User } from "lucide-react";
import Link from "next/link";
import PlanFormPortal from "@/components/coach/PlanFormPortal";
import CompactPagination from "@/components/shared/CompactPagination";

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
    <PlanFormPortal>
      <div
        style={{
          position: "fixed",
          inset: 0,
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
                  <Link
                    key={client._id}
                    href={`/coach/clients/${client._id}`}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1rem",
                      backgroundColor: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      textDecoration: "none",
                      color: "#111827",
                    }}
                  >
                    {client.avatarUrl ? (
                      <Image
                        src={client.avatarUrl}
                        alt={client.fullName}
                        width={40}
                        height={40}
                        sizes="40px"
                        loading="lazy"
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
                    <p
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {client.fullName}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <CompactPagination
                    currentPage={currentPage}
                    totalPages={data.pagination.totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </PlanFormPortal>
  );
}
