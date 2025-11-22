// src/components/client/ClientOrdersTable.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Download } from "lucide-react";

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

export default function ClientOrdersTable() {
  const { data, isLoading } = useQuery({ queryKey: ["myOrders"], queryFn: fetchMyOrders });
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<{ id: string; status: OrderStatus } | null>(null);

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
    onError: (err: any) => {
      const message = err?.response?.data?.message ?? "Failed to update order";
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
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to download invoice";
      toast.error(message);
    }
  }, []);

  if (isLoading)
    return <p className="client-card__subtitle">Loading orders...</p>;
  if (!data || data.length === 0)
    return <p className="client-card__subtitle">No orders found</p>;

  const totalOrders = data.length;
  const latestOrder = data[0];

  return (
    <>
      <div className="client-meta-row" style={{ marginBottom: "0.4rem" }}>
        <span>Total orders: {totalOrders}</span>
        {latestOrder && (
          <span>
            Last order: {new Date(latestOrder.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="client-table-wrapper">
        <table className="client-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Invoice</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((order) => {
              const itemNames = order.items?.map((i) => i.name).join(", ") || "-";
              const isUpdating =
                updateStatus.status === "pending" && updating?.id === order._id;
              const updatingStatus = updating?.status;
              const isFinal = ["completed", "cancelled", "rejected"].includes(order.status);
              const canCancel = !isFinal;
              return (
                <tr key={order._id}>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td title={itemNames}>{itemNames}</td>
                  <td>₹{Number(order.totalAmount ?? 0).toFixed(2)}</td>
                  <td>
                    <span className={statusClass(order.status)}>{order.status}</span>
                  </td>
                  <td style={{ fontSize: ".7rem" }}>
                    {order.paymentMode === "cash" && <span>Cash on Delivery</span>}
                    {order.paymentMode === "manual_qr" && (
                      order.paymentProofUrl ? (
                        <a
                          href={order.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "underline", color: "#2563eb" }}
                        >
                          View Proof
                        </a>
                      ) : (
                        <span>QR Paid</span>
                      )
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="client-button"
                      onClick={() => downloadInvoice(order._id)}
                      style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem" }}
                      title="Download Invoice"
                    >
                      <Download className="w-3 h-3" />
                      Invoice
                    </button>
                  </td>
                  <td>
                    {isFinal ? (
                      <span className="client-card__subtitle" style={{ fontSize: "0.7rem" }}>
                        —
                      </span>
                    ) : (
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {canCancel && (
                          <button
                            type="button"
                            className="client-button client-button--danger"
                            onClick={() => handleUpdate(order._id, "cancelled")}
                            disabled={updateStatus.status === "pending"}
                          >
                            {isUpdating && updatingStatus === "cancelled"
                              ? "Updating..."
                              : "Cancel Order"}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
