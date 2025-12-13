"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import DetailedProgressCharts from "@/components/client/DetailedProgressCharts";

interface ProgressPhoto {
  _id: string;
  url: string;
  publicId: string;
  caption?: string;
  uploadedAt: string;
}

export default function AdminClientDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [ordersPage, setOrdersPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

  const { data: client, isLoading: loadingClient, error: clientError } = useQuery({
    queryKey: ["adminClient", id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}`);
      const userData = res.data.data;
      // Ensure we're only viewing client data
      if (userData?.role !== "client") {
        throw new Error("Invalid user type");
      }
      return userData;
    },
    enabled: Boolean(id),
    retry: false,
  });

  const { data: allOrdersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["adminAllOrders"],
    queryFn: async () => {
      const res = await api.get(`/admin/orders?limit=500`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  // Filter orders for this specific client
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

  const { data: photosData, isLoading: loadingPhotos } = useQuery({
    queryKey: ["clientProgressPhotos", id],
    queryFn: async () => {
      const res = await api.get(`/progress-photos/client/${id}?limit=50`);
      return res.data;
    },
    enabled: Boolean(id),
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
          {clientError instanceof Error && clientError.message === "Invalid user type" 
            ? "Invalid user type. This page is for clients only."
            : "Access denied or client not found."}
        </p>
        <Link href="/admin/users" className="btn btn--outline" style={{ marginTop: "1rem" }}>
          ← Back to Users
        </Link>
      </div>
    );
  }
  if (!client)
    return (
      <div className="admin-card">
        <p className="admin-page-header__subtitle">Client not found.</p>
        <Link href="/admin/users" className="btn btn--outline" style={{ marginTop: "1rem" }}>
          ← Back to Users
        </Link>
      </div>
    );

  return (
    <div>
      <section className="admin-page-header">
        <div className="admin-page-header__actions" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 className="admin-page-header__title">
              Client Profile
            </h1>
            <p className="admin-page-header__subtitle">
              Complete profile and activity history for {client.fullName}
            </p>
          </div>
          <Link href="/admin/users" className="btn btn--outline">
            ← Back to Users
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
              <p className="admin-page-header__subtitle">WhatsApp: {client.whatsappNumber}</p>
            )}
            <p className="admin-page-header__subtitle" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
              Member since: {formatDate(client.createdAt)}
            </p>
            <p className="admin-page-header__subtitle" style={{ fontSize: "0.85rem" }}>
              Status: <span className={client.isActive ? "badge badge--success" : "badge badge--danger"}>{client.isActive ? "Active" : "Inactive"}</span>
            </p>
          </div>
        </div>
      </div>

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

        {/* Assigned Coach */}
        <div className="admin-card">
          <h2 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
            Assigned Coach
          </h2>
          {client.coachId ? (
            <div>
              <p className="admin-card__label">
                {typeof client.coachId === 'object' ? client.coachId.fullName : "Coach assigned"}
              </p>
              {typeof client.coachId === 'object' && client.coachId.email && (
                <p className="admin-page-header__subtitle">{client.coachId.email}</p>
              )}
            </div>
          ) : (
            <p className="admin-page-header__subtitle">No coach assigned</p>
          )}
        </div>
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
            {ordersPagination.totalPages > 1 && (
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

      {/* Progress Charts */}
      {client.coachId && (
        <div style={{ marginTop: "1.5rem" }}>
          <DetailedProgressCharts clientId={id} viewerRole="admin" />
        </div>
      )}

      {/* Progress Photos */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h3 className="admin-card__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Progress Photos ({photosData?.data?.length || 0})
        </h3>
        
        {loadingPhotos ? (
          <p className="admin-page-header__subtitle">Loading photos...</p>
        ) : photosData?.data?.length === 0 ? (
          <p className="admin-page-header__subtitle">No progress photos uploaded yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {photosData?.data?.map((photo: ProgressPhoto) => (
              <div
                key={photo._id}
                style={{
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || "Progress photo"}
                  width={250}
                  height={250}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                  }}
                />
                {photo.caption && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
                      color: "white",
                      padding: "1rem 0.75rem 0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    {photo.caption}
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0, 0, 0, 0.6)",
                    borderRadius: "8px",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.75rem",
                    color: "white",
                  }}
                >
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "2rem",
              }}
            >
              <X size={32} />
            </button>
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || "Progress photo"}
              width={800}
              height={800}
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "12px",
                objectFit: "contain",
              }}
            />
            {selectedPhoto.caption && (
              <div
                style={{
                  marginTop: "1rem",
                  color: "white",
                  fontSize: "1rem",
                  textAlign: "center",
                }}
              >
                {selectedPhoto.caption}
              </div>
            )}
            <div
              style={{
                marginTop: "0.5rem",
                color: "#d1d5db",
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              {new Date(selectedPhoto.uploadedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
