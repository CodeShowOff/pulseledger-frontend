"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { useCoachClientPlanRequests, COACH_CLIENT_PLAN_REQUESTS_KEY, COACH_PENDING_PLAN_REQUESTS_KEY } from "@/lib/queries/planRequests";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import ClientProgressPhotos from "@/components/coach/ClientProgressPhotos";
import DetailedProgressCharts from "@/components/client/DetailedProgressCharts";

export default function ClientDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [ordersPage, setOrdersPage] = useState(1);

  const { data: client, isLoading: loadingClient, error: clientError } = useQuery({
    queryKey: ["coachClient", id],
    queryFn: async () => {
      const res = await api.get(`/coach/clients/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
    retry: false,
  });

  const { data: allOrdersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["coachOrders"],
    queryFn: async () => {
      const res = await api.get(`/orders/coach?limit=100`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  // Filter orders for this specific client and paginate
  const clientOrders = allOrdersData?.data?.filter((order: any) => 
    order.clientId?._id === id || order.clientId === id
  ) || [];
  const ordersPerPage = 5;
  const ordersStart = (ordersPage - 1) * ordersPerPage;
  const orders = clientOrders.slice(ordersStart, ordersStart + ordersPerPage);
  const ordersPagination = {
    page: ordersPage,
    totalPages: Math.ceil(clientOrders.length / ordersPerPage),
    total: clientOrders.length
  };

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
  if (clientError) {
    return (
      <div className="admin-card">
        <p className="admin-page-header__subtitle" style={{ color: "#dc2626" }}>
          Access denied. This client is not assigned to you or does not exist.
        </p>
        <Link href="/coach/clients" className="btn btn--outline" style={{ marginTop: "1rem" }}>
          ← Back to Clients
        </Link>
      </div>
    );
  }
  if (!client)
    return (
      <div className="admin-card">
        <p className="admin-page-header__subtitle">Client not found or you don't have access.</p>
        <Link href="/coach/clients" className="btn btn--outline" style={{ marginTop: "1rem" }}>
          ← Back to Clients
        </Link>
      </div>
    );

  return (
    <div>
      <section className="admin-page-header">
        <div className="admin-page-header__actions" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 className="admin-page-header__title coach-page-header__title">
              Client Details
            </h1>
            <p className="admin-page-header__subtitle coach-page-header__subtitle">
              Complete profile and activity history for {client.fullName}
            </p>
          </div>
          <Link href="/coach/clients" className="btn btn--outline">
            ← Back to Clients
          </Link>
        </div>
      </section>

      {/* Profile Photo & Basic Info */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          {client.avatarUrl ? (
            <Image
              src={client.avatarUrl}
              alt={client.fullName}
              width={120}
              height={120}
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #e5e7eb",
                filter: "brightness(1.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: "600",
                color: "#6b7280",
              }}
            >
              {client.fullName?.charAt(0)?.toUpperCase() || "C"}
            </div>
          )}
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h2 className="admin-card__title" style={{ marginBottom: "0.5rem" }}>
              {client.fullName}
            </h2>
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
                <span
                  className="admin-page-header__subtitle"
                  style={{ fontSize: "0.8rem" }}
                >
                  {client.whatsappNumber}
                </span>
                <button
                  type="button"
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.2rem" }}
                  onClick={() => {
                    const phone = String(client.whatsappNumber).replace(/\D/g, "");
                    if (!phone) return;
                    const url = `https://wa.me/${phone}`;
                    window.open(url, "_blank");
                  }}
                >
                  <Image src="/whatsapp.png" alt="WhatsApp" width={32} height={32} style={{ flexShrink: 0 }} />
                </button>
              </div>
            )}
            <p className="admin-page-header__subtitle" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
              Member since: {formatDate(client.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Photos Section */}
      <ClientProgressPhotos clientId={id} clientName={client.fullName} />

      <div className="admin-card-grid" style={{ alignItems: "flex-start", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {/* Health Information */}
        <div className="admin-card">
          <h2 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
            Health Information
          </h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <div>
              <p className="admin-card__label">Weight</p>
              <p className="admin-page-header__subtitle">{client.weight ? `${client.weight} kg` : "-"}</p>
            </div>
            <div>
              <p className="admin-card__label">Height</p>
              <p className="admin-page-header__subtitle">{client.height ? `${client.height} cm` : "-"}</p>
            </div>
            <div>
              <p className="admin-card__label">BMI</p>
              <p className="admin-page-header__subtitle">{client.bmi ? client.bmi.toFixed(1) : "-"}</p>
            </div>
            {client.latestProgress && (
              <div style={{ marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid #e5e7eb" }}>
                <p className="admin-card__label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  Last Updated: {formatDate(client.latestProgress.date)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="admin-card">
          <h2 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
            Address
          </h2>
          {client.address && (client.address.line1 || client.address.city || client.address.state) ? (
            <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.9rem" }}>
              {client.address.phoneNumber && <p>{client.address.phoneNumber}</p>}
              {client.address.line1 && <p>{client.address.line1}</p>}
              {client.address.line2 && <p>{client.address.line2}</p>}
              {client.address.neighborhood && <p>{client.address.neighborhood}</p>}
              <p>
                {[client.address.city, client.address.state, client.address.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {client.address.country && <p>{client.address.country}</p>}
            </div>
          ) : (
            <p className="admin-page-header__subtitle">No address provided</p>
          )}
        </div>

        {/* Plan Overview */}
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
        </div>
      </div>

      {/* Plan Requests */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h3 className="admin-card__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Plan Requests
        </h3>
        {loadingRequests ? (
          <p className="admin-page-header__subtitle">Loading requests...</p>
        ) : planRequests.length ? (
          <div className="admin-card-grid" style={{ rowGap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
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
                      ...getStatusColor(req.status),
                      backgroundColor: getStatusColor(req.status).bg,
                      color: getStatusColor(req.status).text,
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

      {/* Orders History */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h3 className="admin-card__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Orders History
        </h3>
        {loadingOrders ? (
          <p className="admin-page-header__subtitle">Loading orders...</p>
        ) : orders.length ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%", minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                        #{order._id.slice(-6)}
                      </td>
                      <td>
                        {order.items?.length || 0} item(s)
                        {order.items && order.items.length > 0 && (
                          <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx}>
                                {item.name} x{item.quantity}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>₹{order.finalAmount?.toFixed(2) || "0.00"}</td>
                      <td style={{ textTransform: "capitalize" }}>{order.paymentMode || "-"}</td>
                      <td>
                        <span
                          style={{
                            borderRadius: "999px",
                            padding: "0.15rem 0.6rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            ...getStatusColor(order.status),
                            backgroundColor: getStatusColor(order.status).bg,
                            color: getStatusColor(order.status).text,
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ordersPagination && ordersPagination.totalPages > 1 && (
              <div className="admin-pagination" style={{ marginTop: "1rem" }}>
                <p className="admin-page-header__subtitle">
                  Page {ordersPagination.page} of {ordersPagination.totalPages}
                </p>
                <div className="admin-pagination__controls">
                  <button
                    type="button"
                    disabled={ordersPagination.page <= 1}
                    onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                    className="btn btn--outline"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={ordersPagination.page >= ordersPagination.totalPages}
                    onClick={() => setOrdersPage((p) => p + 1)}
                    className="btn btn--outline"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="admin-page-header__subtitle">No orders yet.</p>
        )}
      </div>

      {/* Progress History - Charts */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h3 className="admin-card__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Progress Tracking
        </h3>
        <DetailedProgressCharts clientId={id} />
      </div>
    </div>
  );
}
