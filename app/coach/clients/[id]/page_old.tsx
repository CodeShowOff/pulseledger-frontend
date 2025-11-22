"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { useCoachClientPlanRequests, COACH_CLIENT_PLAN_REQUESTS_KEY, COACH_PENDING_PLAN_REQUESTS_KEY } from "@/lib/queries/planRequests";
import Link from "next/link";
import { useState } from "react";

export default function ClientDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [ordersPage, setOrdersPage] = useState(1);
  const [progressPage, setProgressPage] = useState(1);

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ["coachClient", id],
    queryFn: async () => {
      const res = await api.get(`/coach/clients/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });

  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["clientOrders", id, ordersPage],
    queryFn: async () => {
      const res = await api.get(`/orders?clientId=${id}&page=${ordersPage}&limit=5`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  const { data: progressData, isLoading: loadingProgress } = useQuery({
    queryKey: ["clientProgress", id, progressPage],
    queryFn: async () => {
      const res = await api.get(`/progress?clientId=${id}&page=${progressPage}&limit=5`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  const { data: planRequests = [], isLoading: loadingRequests } = useCoachClientPlanRequests(id || "");
  const queryClient = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await api.patch(`/plan-requests/${requestId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_CLIENT_PLAN_REQUESTS_KEY(id!) });
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["coachClients"] });
    },
  });
  const declineMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await api.patch(`/plan-requests/${requestId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_CLIENT_PLAN_REQUESTS_KEY(id!) });
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachClients"] });
    },
  });

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString();
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: "#fef9c3", text: "#92400e" },
      approved: { bg: "#dbeafe", text: "#1e40af" },
      fulfilled: { bg: "#d1fae5", text: "#047857" },
      completed: { bg: "#d1fae5", text: "#047857" },
      cancelled: { bg: "#fee2e2", text: "#b91c1c" },
      rejected: { bg: "#fee2e2", text: "#b91c1c" },
    };
    return colors[status] || { bg: "#f3f4f6", text: "#374151" };
  };

  if (loadingClient) return <p>Loading client details...</p>;
  if (!client)
    return (
      <p className="admin-page-header__subtitle">Client not found or you don’t have access.</p>
    );

  return (
    <div>
      <section className="admin-page-header">
        <div className="admin-page-header__actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="admin-page-header__title coach-page-header__title">
              Client Details
            </h1>
            <p className="admin-page-header__subtitle coach-page-header__subtitle">
              Profile, current plan, and recent requests for this client.
            </p>
          </div>
          <Link href="/coach/clients" className="btn btn--outline">
            ← Back to Clients
          </Link>
        </div>
      </section>

      <div className="admin-card-grid" style={{ alignItems: "flex-start" }}>
        <div className="admin-card">
          <h2 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
            Basic Information
          </h2>
          <p className="admin-page-header__subtitle" style={{ marginBottom: "0.25rem" }}>
            {client.fullName}
          </p>
          <p className="admin-page-header__subtitle">{client.email}</p>
          <p className="admin-page-header__subtitle">Phone: {client.phone || "-"}</p>
          {client.whatsappNumber && (
            <div
              style={{
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <button
                type="button"
                className="btn btn--outline"
                style={{ fontSize: "0.8rem", paddingInline: "0.6rem", paddingBlock: "0.25rem" }}
                onClick={() => {
                  const phone = String(client.whatsappNumber).replace(/\D/g, "");
                  if (!phone) return;
                  const url = `https://wa.me/${phone}`;
                  window.open(url, "_blank");
                }}
              >
                WhatsApp
              </button>
              <span
                className="admin-page-header__subtitle"
                style={{ fontSize: "0.8rem" }}
              >
                {client.whatsappNumber}
              </span>
            </div>
          )}
          <div style={{ marginTop: "0.75rem" }}>
            <p className="admin-page-header__subtitle">
              Weight: {client.weight || "-"} kg | Height: {client.height || "-"} cm
            </p>
            <p className="admin-page-header__subtitle">
              BMI: {client.bmi ? client.bmi.toFixed(1) : "-"}
            </p>
            {/* Progress Summary removed */}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
            Plan Overview
          </h2>

          {client.planSummary?.current ? (
            <div
              className="admin-card"
              style={{
                backgroundColor: "#eff6ff",
                borderColor: "#bfdbfe",
                borderWidth: 1,
              }}
            >
              <p
                className="admin-card__label"
                style={{ textTransform: "uppercase", color: "#2563eb", fontSize: "0.75rem" }}
              >
                Current Plan
              </p>
              <h4 className="admin-card__title" style={{ marginTop: "0.25rem" }}>
                {client.planSummary.current.planTitle || "Plan"}
              </h4>
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "0.35rem",
                  fontSize: "0.85rem",
                }}
              >
                <span>Type: {client.planSummary.current.type === "subscription" ? "Subscription" : "Default"}</span>
                {client.planSummary.current.durationWeeks && (
                  <span>Duration: {client.planSummary.current.durationWeeks} weeks</span>
                )}
                {typeof client.planSummary.current.price === "number" && (
                  <span>Price: ₹{client.planSummary.current.price.toFixed(2)}</span>
                )}
                {client.planSummary.current.type === "subscription" && (
                  <span>Ends: {formatDate(client.planSummary.current.endDate)}</span>
                )}
              </div>
            </div>
          ) : client.planSummary?.defaultPlan ? (
            <div
              className="admin-card"
              style={{
                backgroundColor: "#f9fafb",
                borderColor: "#e5e7eb",
                borderWidth: 1,
              }}
            >
              <p
                className="admin-card__label"
                style={{ textTransform: "uppercase", fontSize: "0.75rem", color: "#6b7280" }}
              >
                Default Template
              </p>
              <h4 className="admin-card__title" style={{ marginTop: "0.25rem" }}>
                {client.planSummary.defaultPlan.title || "Plan"}
              </h4>
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "0.35rem",
                  fontSize: "0.85rem",
                }}
              >
                {client.planSummary.defaultPlan.durationWeeks && (
                  <span>Duration: {client.planSummary.defaultPlan.durationWeeks} weeks</span>
                )}
                {typeof client.planSummary.defaultPlan.price === "number" && (
                  <span>Price: ₹{client.planSummary.defaultPlan.price.toFixed(2)}</span>
                )}
              </div>
            </div>
          ) : (
            <p className="admin-page-header__subtitle">No plan assigned yet.</p>
          )}

          <div style={{ marginTop: "1.25rem" }}>
            <h3 className="admin-card__title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              Plan Requests
            </h3>
            {loadingRequests ? (
              <p className="admin-page-header__subtitle">Loading requests...</p>
            ) : planRequests.length ? (
              <div className="admin-card-grid" style={{ rowGap: "0.75rem" }}>
                {planRequests.map((req) => (
                  <div key={req._id} className="admin-card">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                      <div>
                        <p className="admin-card__label">
                          {req.planId?.title ?? "Plan removed"}
                        </p>
                        <p className="admin-page-header__subtitle" style={{ fontSize: "0.8rem" }}>
                          Requested {formatDate(req.createdAt)}
                        </p>
                        {req.notes && (
                          <p
                            className="admin-page-header__subtitle"
                            style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}
                          >
                            Notes: {req.notes}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          alignSelf: "flex-start",
                          borderRadius: "999px",
                          padding: "0.15rem 0.6rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          backgroundColor:
                            req.status === "pending"
                              ? "#fef9c3"
                              : req.status === "approved"
                              ? "#d1fae5"
                              : "#fee2e2",
                          color:
                            req.status === "pending"
                              ? "#92400e"
                              : req.status === "approved"
                              ? "#047857"
                              : "#b91c1c",
                        }}
                      >
                        {req.status}
                      </span>
                    </div>
                    {req.status === "pending" && (
                      <div
                        style={{
                          marginTop: "0.75rem",
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          disabled={approveMutation.isPending || declineMutation.isPending}
                          onClick={() => approveMutation.mutate(req._id)}
                          className="btn btn--primary"
                        >
                          {approveMutation.isPending ? "Approving..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={approveMutation.isPending || declineMutation.isPending}
                          onClick={() => declineMutation.mutate(req._id)}
                          className="btn btn--danger"
                        >
                          {declineMutation.isPending ? "Declining..." : "Decline"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-page-header__subtitle">No requests yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
