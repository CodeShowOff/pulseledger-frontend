"use client";

import React, { useState, useMemo } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import getErrorMessage from "@/lib/getErrorMessage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/store";
import RoleGuard from "@/components/shared/RoleGuard";

const currency = (v: number) => `₹${v.toFixed(2)}`;

export default function ClientCheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const coachId = useCartStore((s) => s.coachId);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const voucherCode = useCartStore((s) => s.selectedVoucherCode);
  const voucherPercent = useCartStore((s) => s.selectedVoucherPercent);
  const userRole = useAuthStore((s) => s.user?.role);

  const [paymentMode, setPaymentMode] = useState<"cash" | "manual_qr">("cash");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const totals = useMemo(() => {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = voucherPercent ? Math.round((total * voucherPercent) / 100) : 0;
    const finalAmount = Math.max(0, total - discount);
    return { total, discount, finalAmount };
  }, [items, voucherPercent]);

  const uploadProofMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/orders/upload-proof", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data as { url: string; publicId: string };
    },
    onSuccess: (data) => {
      setPaymentProofUrl(data.url);
      toast.success("Payment proof uploaded");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to upload payment proof"));
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMode,
        ...(voucherCode ? { voucherCode } : {}),
        ...(paymentMode === "manual_qr" ? { paymentProofUrl } : {}),
      };
      const res = await api.post("/orders", payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Order placed successfully");
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      queryClient.invalidateQueries({ queryKey: ["coachOrders"] });
      router.replace("/client/orders");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to place order"));
    },
  });

  const handleUploadProof = () => {
    if (!paymentProofFile) {
      toast.error("Select an image first");
      return;
    }
    setUploadingProof(true);
    uploadProofMutation.mutate(paymentProofFile, {
      onSettled: () => setUploadingProof(false),
    });
  };

  const canPlaceOrder = () => {
    if (!items.length) return false;
    if (paymentMode === "manual_qr" && !paymentProofUrl) return false;
    return true;
  };

  if (userRole !== "client") {
    return (
      <div className="client-page__sections">
        <p className="client-card__subtitle">Only clients can access checkout.</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="client-page__sections">
        <h1 className="client-page__title">Checkout</h1>
        <p className="client-card__subtitle">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="client-page__sections">
      {/* Enforce client-only access at component level as an extra guard */}
      <RoleGuard role="client" />
        <header className="client-page__header">
          <h1 className="client-page__title">Checkout</h1>
        </header>
        <div className="client-page__sections" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="client-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h2 className="client-card__title" style={{ fontSize: "1rem" }}>Order Summary</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {items.map((i) => (
                <li key={i.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem" }}>
                  <span>{i.name} × {i.quantity}</span>
                  <span>{currency(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "0.5rem", fontSize: ".85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total</span>
                <span>{currency(totals.total)}</span>
              </div>
              {voucherCode && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#047857" }}>
                  <span>Voucher ({voucherPercent}% off)</span>
                  <span>-{currency(totals.discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginTop: ".25rem" }}>
                <span>Final</span>
                <span>{currency(totals.finalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="client-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h2 className="client-card__title" style={{ fontSize: "1rem" }}>Payment Method</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="cash"
                  checked={paymentMode === "cash"}
                  onChange={() => setPaymentMode("cash")}
                />
                <span>Cash on Delivery</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="manual_qr"
                  checked={paymentMode === "manual_qr"}
                  onChange={() => setPaymentMode("manual_qr")}
                />
                <span>Pay Now (Coach UPI QR)</span>
              </label>
            </div>
            {paymentMode === "manual_qr" && (
              <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                <QrDisplay />
                <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                  />
                  <button
                    type="button"
                    className="client-button client-button--outline"
                    disabled={!paymentProofFile || uploadingProof || uploadProofMutation.status === "pending"}
                    onClick={handleUploadProof}
                  >
                    {uploadingProof || uploadProofMutation.status === "pending" ? "Uploading..." : paymentProofUrl ? "Re-upload Screenshot" : "Upload Payment Screenshot"}
                  </button>
                  {paymentProofUrl && (
                    <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
                      <span style={{ fontSize: ".75rem", color: "#047857" }}>Uploaded Proof:</span>
                      <Image
                        src={paymentProofUrl}
                        alt="Payment proof"
                        width={240}
                        height={240}
                        style={{ objectFit: "cover", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className="client-button"
              style={{ flex: 1 }}
              disabled={!canPlaceOrder() || placeOrderMutation.status === "pending"}
              onClick={() => placeOrderMutation.mutate()}
            >
              {placeOrderMutation.status === "pending" ? "Placing order..." : "Place Order"}
            </button>
            <button
              type="button"
              className="client-button client-button--outline"
              style={{ flex: 1 }}
              onClick={() => router.replace("/client/orders")}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
  );
}

function QrDisplay() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  // Fetch assigned coach for client and read payment QR
  React.useEffect(() => {
    const fetchCoach = async () => {
      try {
        const res = await api.get("/users/my-coach");
        const coach = res.data.data;
        setQrUrl(coach?.paymentQrUrl || null);
      } catch {
        setQrUrl(null);
      }
    };
    fetchCoach();
  }, []);

  if (!qrUrl) {
    return (
      <div style={{ fontSize: ".8rem", color: "#6b7280" }}>
        Coach has not uploaded a payment QR yet.
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
      <span style={{ fontSize: ".75rem", color: "#374151" }}>Scan coach UPI QR to pay:</span>
      <Image
        src={qrUrl}
        alt="Coach payment QR"
        width={240}
        height={240}
        style={{ objectFit: "contain", borderRadius: "0.5rem", border: "1px solid #e5e7eb", background: "#fff" }}
      />
    </div>
  );
}
