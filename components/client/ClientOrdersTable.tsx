// src/components/client/ClientOrdersTable.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import axios from "axios";
import { Download, Package, Calendar, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";

type OrderItem = { productId: string; name: string; quantity: number; price: number };
type OrderStatus =
  | "pending"
  | "approved"
  | "fulfilled"
  | "completed"
  | "cancelled"
  | "rejected";
type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paymentMode?: string;
  paymentProofUrl?: string | null;
};

const fetchMyOrders = async (): Promise<Order[]> => {
  const res = await api.get("/orders/my");
  return res.data.data ?? [];
};

function statusClass(s: OrderStatus) {
  switch (s) {
    case "pending":
      return "client-pill client-pill--warning";
    case "approved":
      return "client-pill client-pill--info";
    case "fulfilled":
      return "client-pill client-pill--success";
    case "completed":
      return "client-pill client-pill--success";
    case "cancelled":
      return "client-pill client-pill--muted";
    case "rejected":
      return "client-pill client-pill--danger";
    default:
      return "client-pill client-pill--muted";
  }
}

function getStatusColor(s: OrderStatus) {
  switch (s) {
    case "pending":
      return "#f59e0b";
    case "approved":
      return "#3b82f6";
    case "fulfilled":
    case "completed":
      return "#22c55e";
    case "cancelled":
    case "rejected":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

const ORDERS_PER_PAGE = 5;

export default function ClientOrdersTable() {
  const { data, isLoading } = useQuery({ queryKey: ["myOrders"], queryFn: fetchMyOrders });
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<{ id: string; status: OrderStatus } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      await api.patch(`/orders/${orderId}/status`, { status });
    },
    onSuccess: (_, variables) => {
      const message =
        variables.status === "completed"
          ? "Order marked as completed"
          : variables.status === "cancelled"
          ? "Order cancelled"
          : "Order updated";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      queryClient.invalidateQueries({ queryKey: ["coachOrders"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error?.response?.data?.message ?? "Failed to update order";
      toast.error(message);
    },
    onSettled: () => setUpdating(null),
  });

  const handleUpdate = useCallback(
    (orderId: string, status: OrderStatus) => {
      setUpdating({ id: orderId, status });
      updateStatus.mutate({ orderId, status });
    },
    [updateStatus]
  );

  const downloadInvoice = useCallback(async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Invoice downloaded successfully");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message ?? "Failed to download invoice";
        toast.error(message);
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to download invoice");
      } else {
        toast.error("Failed to download invoice");
      }
    }
  }, []);

  if (isLoading)
    return <p className="client-card__subtitle">Loading orders...</p>;
  if (!data || data.length === 0)
    return <p className="client-card__subtitle">No orders found</p>;

  const totalOrders = data.length;
  const latestOrder = data[0];
  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const paginatedOrders = data.slice(startIndex, endIndex);

  return (
    <>
      <div className="client-meta-row" style={{ marginBottom: "1rem" }}>
        <span>Total orders: {totalOrders}</span>
        {latestOrder && (
          <span>
            Last order: {new Date(latestOrder.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
      
      {/* Card-based layout for orders */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {paginatedOrders.map((order) => {
          const isUpdating = updateStatus.status === "pending" && updating?.id === order._id;
          const updatingStatus = updating?.status;
          const isFinal = ["completed", "cancelled", "rejected"].includes(order.status);
          const canCancel = !isFinal;
          
          return (
            <div
              key={order._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "1rem",
                backgroundColor: "#fafafa",
              }}
            >
              {/* Order Header */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "0.75rem",
                paddingBottom: "0.75rem",
                borderBottom: "1px solid #e5e7eb"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar style={{ width: "14px", height: "14px", color: "#6b7280" }} />
                  <span style={{ fontSize: "0.85rem", color: "#374151" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <span 
                  className={statusClass(order.status)}
                  style={{ textTransform: "capitalize" }}
                >
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "0.5rem",
                  marginBottom: "0.5rem"
                }}>
                  <Package style={{ width: "16px", height: "16px", color: "#6b7280", flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>Items Ordered</span>
                </div>
                <div style={{ paddingLeft: "1.5rem" }}>
                  {order.items?.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0",
                        borderBottom: idx < order.items.length - 1 ? "1px dashed #e5e7eb" : "none"
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ 
                          fontSize: "0.9rem", 
                          fontWeight: 500, 
                          color: "#111827",
                          display: "block"
                        }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total & Payment */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
                marginBottom: "0.75rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CreditCard style={{ width: "14px", height: "14px", color: "#6b7280" }} />
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {order.paymentMode === "cash" ? "Cash on Delivery" : 
                     order.paymentMode === "manual_qr" ? (
                       order.paymentProofUrl ? (
                         <a
                           href={order.paymentProofUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           style={{ textDecoration: "underline", color: "#2563eb" }}
                         >
                           QR Paid - View Proof
                         </a>
                       ) : "QR Payment"
                     ) : "—"}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.7rem", color: "#6b7280", display: "block" }}>Total</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
                    ₹{Number(order.totalAmount ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ 
                display: "flex", 
                gap: "0.5rem", 
                flexWrap: "wrap",
                justifyContent: "flex-end"
              }}>
                <button
                  type="button"
                  className="client-button"
                  onClick={() => downloadInvoice(order._id)}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.35rem", 
                    fontSize: "0.8rem",
                    padding: "0.4rem 0.75rem"
                  }}
                  title="Download Invoice"
                >
                  <Download style={{ width: "14px", height: "14px" }} />
                  Invoice
                </button>
                
                {canCancel && (
                  <button
                    type="button"
                    className="client-button client-button--danger"
                    onClick={() => handleUpdate(order._id, "cancelled")}
                    disabled={updateStatus.status === "pending"}
                    style={{ 
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.75rem"
                    }}
                  >
                    {isUpdating && updatingStatus === "cancelled"
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
    </>
  );
}
