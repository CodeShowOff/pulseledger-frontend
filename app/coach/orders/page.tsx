"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Download } from "lucide-react";

type CoachOrderStatus =
  | "pending"
  | "approved"
  | "fulfilled"
  | "completed"
  | "cancelled"
  | "rejected";

interface CoachOrder {
  _id: string;
  items: { name: string }[];
  totalAmount: number;
  status: CoachOrderStatus;
  paymentMode?: string;
  paymentProofUrl?: string | null;
  clientId?: { fullName?: string };
}

function statusColor(status: CoachOrderStatus) {
  switch (status) {
    case "pending":
      return "#ca8a04";
    case "approved":
      return "#2563eb";
    case "fulfilled":
      return "#16a34a";
    case "completed":
      return "#047857";
    case "cancelled":
      return "#6b7280";
    case "rejected":
      return "#dc2626";
    default:
      return "#4b5563";
  }
}

export default function CoachOrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["coachOrders"],
    queryFn: async () => {
      const res = await api.get("/orders/coach");
      return res.data.data;
    },
  });
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [updatingAction, setUpdatingAction] = useState<CoachOrderStatus | null>(null);

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: CoachOrderStatus }) => {
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
      queryClient.invalidateQueries({ queryKey: ["coachOrders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message ?? "Failed to update order";
      toast.error(message);
    },
    onSettled: () => {
      setUpdatingId(null);
      setUpdatingAction(null);
    },
  });

  const handleUpdate = (orderId: string, status: CoachOrderStatus) => {
    setUpdatingId(orderId);
    setUpdatingAction(status);
    updateStatus.mutate({ orderId, status });
  };

  const downloadInvoice = async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });
      
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
  };

  if (isLoading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-600">Failed to load orders.</p>;

  return (
    <div>
      <section className="admin-page-header">
        <h1 className="admin-page-header__title coach-page-header__title">Orders</h1>
        <p className="admin-page-header__subtitle coach-page-header__subtitle">
          Manage orders placed by your clients for your products.
        </p>
      </section>

      {data?.length ? (
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Invoice</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((o: CoachOrder) => {
                  const names = (o.items || []).map((i: any) => i.name).join(", ") || "-";
                  const status: CoachOrderStatus = o.status;
                  const isUpdating = updateStatus.status === "pending" && updatingId === o._id;
                  const isFinal = ["completed", "cancelled", "rejected"].includes(status);
                  const canComplete = !isFinal;
                  const canCancel = !isFinal;
                  return (
                    <tr key={o._id}>
                      <td>{o.clientId?.fullName || "-"}</td>
                      <td
                        title={names}
                        style={{
                          maxWidth: "360px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {names}
                      </td>
                      <td>₹{Number(o.totalAmount ?? 0).toFixed(2)}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            backgroundColor: "#f3f4f6",
                            color: statusColor(status),
                          }}
                        >
                          {status}
                        </span>
                      </td>
                      <td style={{ fontSize: ".7rem" }}>
                        {o.paymentMode === "cash" && <span>Cash on Delivery</span>}
                        {o.paymentMode === "manual_qr" && (
                          o.paymentProofUrl ? (
                            <a
                              href={o.paymentProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: "underline", color: "#2563eb" }}
                            >
                              Proof
                            </a>
                          ) : (
                            <span>QR Paid</span>
                          )
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--outline"
                          onClick={() => downloadInvoice(o._id)}
                          style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem" }}
                          title="Download Invoice"
                        >
                          <Download className="w-3 h-3" />
                          Invoice
                        </button>
                      </td>
                      <td>
                        {isFinal ? (
                          <span
                            className="admin-page-header__subtitle"
                            style={{ fontSize: "0.75rem" }}
                          >
                            —
                          </span>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.5rem",
                            }}
                          >
                            {canComplete && (
                              <button
                                type="button"
                                className="btn btn--primary"
                                onClick={() => handleUpdate(o._id, "completed")}
                                disabled={updateStatus.status === "pending"}
                              >
                                {isUpdating && updatingAction === "completed"
                                  ? "Updating..."
                                  : "Mark Completed"}
                              </button>
                            )}
                            {canCancel && (
                              <button
                                type="button"
                                className="btn btn--danger"
                                onClick={() => handleUpdate(o._id, "cancelled")}
                                disabled={updateStatus.status === "pending"}
                              >
                                {isUpdating && updatingAction === "cancelled"
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
        </div>
      ) : (
        <p className="admin-page-header__subtitle">No orders found.</p>
      )}
    </div>
  );
}
