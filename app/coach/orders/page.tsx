"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import axios from "axios";
import { Download, Package, User, CreditCard, CheckCircle, XCircle, ExternalLink, ChevronDown, ChevronUp, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import CompactPagination from "@/components/shared/CompactPagination";

type CoachOrderStatus =
  | "pending"
  | "approved"
  | "fulfilled"
  | "completed"
  | "cancelled"
  | "rejected";

interface ClientAddress {
  phoneNumber?: string | null;
  line1?: string | null;
  line2?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

interface CoachOrder {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: CoachOrderStatus;
  paymentMode?: string;
  paymentProofUrl?: string | null;
  clientId?: { 
    _id: string; 
    fullName?: string; 
    email?: string;
    phone?: string | null;
    whatsappNumber?: string | null;
    address?: ClientAddress;
  };
}

const ORDERS_PER_PAGE = 5;

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

function statusBgColor(status: CoachOrderStatus) {
  switch (status) {
    case "pending":
      return "#fef3c7";
    case "approved":
      return "#dbeafe";
    case "fulfilled":
      return "#dcfce7";
    case "completed":
      return "#d1fae5";
    case "cancelled":
      return "#f3f4f6";
    case "rejected":
      return "#fee2e2";
    default:
      return "#f3f4f6";
  }
}



export default function CoachOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };
  
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
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const msg = (err as any).response?.data?.message || (err as any).message || "Failed to update order";
        toast.error(msg);
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to update order");
      } else {
        toast.error("Failed to update order");
      }
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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = (err as any).response?.data?.message || (err as any).message || "Failed to download invoice";
        toast.error(msg);
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to download invoice");
      } else {
        toast.error("Failed to download invoice");
      }
    }
  };

  if (isLoading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-600">Failed to load orders.</p>;

  const orders: CoachOrder[] = data || [];
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div>
      <section className="admin-page-header">
        <h1 className="admin-page-header__title coach-page-header__title">Orders</h1>
      </section>

      {orders.length ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {paginatedOrders.map((o) => {
              const status: CoachOrderStatus = o.status;
              const isUpdating = updateStatus.status === "pending" && updatingId === o._id;
              const isFinal = ["completed", "cancelled", "rejected"].includes(status);
              const canComplete = !isFinal;
              const canCancel = !isFinal;
              const isExpanded = expandedOrders.has(o._id);
              const address = o.clientId?.address;
              const hasAddress = address && (address.line1 || address.city || address.state);

              return (
                <div
                  key={o._id}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--admin-color-border, #e5e7eb)",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    boxShadow: "var(--admin-shadow-soft, 0 1px 3px rgba(0,0,0,0.1))",
                  }}
                >
                  {/* Header: Client & Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <User size={16} style={{ color: "#6b7280" }} />
                      {o.clientId?._id ? (
                        <Link
                          href={`/coach/clients/${o.clientId._id}`}
                          style={{ 
                            fontWeight: 600, 
                            fontSize: "0.95rem",
                            color: "#2563eb",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          {o.clientId?.fullName || "Unknown Client"}
                          <ExternalLink size={12} style={{ opacity: 0.7 }} />
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                          {o.clientId?.fullName || "Unknown Client"}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                        backgroundColor: statusBgColor(status),
                        color: statusColor(status),
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Address Dropdown Button */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(o._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      marginBottom: "0.75rem",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    <MapPin size={14} style={{ color: "#6b7280" }} />
                    <span style={{ flex: 1, textAlign: "left" }}>
                      {hasAddress ? "View Delivery Address" : "No Address Available"}
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Expanded Address Section */}
                  {isExpanded && (
                    <div style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      marginBottom: "0.75rem",
                      fontSize: "0.85rem",
                    }}>
                      {hasAddress ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {/* Address Lines */}
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                            <MapPin size={14} style={{ color: "#6b7280", marginTop: "2px", flexShrink: 0 }} />
                            <div style={{ color: "#374151" }}>
                              {address?.line1 && <div>{address.line1}</div>}
                              {address?.line2 && <div>{address.line2}</div>}
                              {address?.neighborhood && <div>{address.neighborhood}</div>}
                              <div>
                                {[address?.city, address?.state, address?.postalCode]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                              {address?.country && <div>{address.country}</div>}
                            </div>
                          </div>

                          {/* Contact Info */}
                          {(address?.phoneNumber || o.clientId?.phone || o.clientId?.whatsappNumber) && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed #e5e7eb" }}>
                              <Phone size={14} style={{ color: "#6b7280" }} />
                              <span style={{ color: "#374151" }}>
                                {address?.phoneNumber || o.clientId?.phone || o.clientId?.whatsappNumber}
                              </span>
                            </div>
                          )}

                          {/* Email */}
                          {o.clientId?.email && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", fontSize: "0.8rem" }}>
                              <span>Email: {o.clientId.email}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: "#9ca3af", textAlign: "center", padding: "0.5rem" }}>
                          No delivery address on file. 
                          {o.clientId?._id && (
                            <Link 
                              href={`/coach/clients/${o.clientId._id}`}
                              style={{ color: "#2563eb", marginLeft: "0.25rem" }}
                            >
                              View client profile
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: "0.5rem",
                      marginBottom: "0.5rem"
                    }}>
                      <Package size={16} style={{ color: "#6b7280", flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>Items Ordered</span>
                    </div>
                    <div style={{ paddingLeft: "1.5rem" }}>
                      {(o.items || []).map((item, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.5rem 0",
                            borderBottom: idx < o.items.length - 1 ? "1px dashed #e5e7eb" : "none"
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
                              Qty: {item.quantity} × ₹{Number(item.price ?? 0).toFixed(2)}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                            ₹{(item.quantity * (item.price ?? 0)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {(!o.items || o.items.length === 0) && (
                        <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>No items</span>
                      )}
                    </div>
                  </div>

                  {/* Amount & Payment */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <CreditCard size={16} style={{ color: "#6b7280" }} />
                      <span style={{ fontWeight: 600, color: "#059669" }}>₹{Number(o.totalAmount ?? 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6b7280" }}>
                      {o.paymentMode === "cash" && <span>Cash on Delivery</span>}
                      {o.paymentMode === "manual_qr" && (
                        o.paymentProofUrl ? (
                          <a
                            href={o.paymentProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "underline", color: "#2563eb" }}
                          >
                            View Payment Proof
                          </a>
                        ) : (
                          <span>QR Payment</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid #f3f4f6" }}>
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={() => downloadInvoice(o._id)}
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                    >
                      <Download size={14} />
                      Invoice
                    </button>
                    
                    {!isFinal && (
                      <>
                        {canComplete && (
                          <button
                            type="button"
                            className="btn btn--primary"
                            onClick={() => handleUpdate(o._id, "completed")}
                            disabled={updateStatus.status === "pending"}
                            style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                          >
                            <CheckCircle size={14} />
                            {isUpdating && updatingAction === "completed" ? "..." : "Complete"}
                          </button>
                        )}
                        {canCancel && (
                          <button
                            type="button"
                            className="btn btn--danger"
                            onClick={() => handleUpdate(o._id, "cancelled")}
                            disabled={updateStatus.status === "pending"}
                            style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                          >
                            <XCircle size={14} />
                            {isUpdating && updatingAction === "cancelled" ? "..." : "Cancel"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ marginTop: "1.5rem" }}>
              <CompactPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  marginTop: "0.5rem",
                  textAlign: "center",
                }}
              >
                Page {currentPage} of {totalPages}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="admin-page-header__subtitle">No orders found.</p>
      )}
    </div>
  );
}
