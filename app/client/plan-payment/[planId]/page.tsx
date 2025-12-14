"use client";

import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import api from "@/lib/axios";
import { CLIENT_PLAN_REQUESTS_KEY } from "@/lib/queries/planRequests";
import { CLIENT_SUBSCRIPTIONS_KEY, CURRENT_PLAN_KEY } from "@/lib/queries/subscriptions";

type PaymentMode = "cash" | "manual_qr";

type Plan = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  durationWeeks: number;
  goal?: string;
  coachId?: {
    _id: string;
    fullName: string;
    paymentQrUrl?: string;
  };
};

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
        style={{ objectFit: "contain", borderRadius: "0.5rem", border: "1px solid #e5e7eb", background: "#fff", filter: "brightness(1.2)" }}
      />
    </div>
  );
}

export default function PlanPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const planId = params?.planId as string;

  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [notes, setNotes] = useState("");

  // Fetch plan details
  const { data: planData, isLoading: loadingPlan } = useQuery<{ success: boolean; data: Plan }>({
    queryKey: ["plan", planId],
    queryFn: async () => {
      const res = await api.get(`/plans/view/${planId}`);
      return res.data;
    },
    enabled: !!planId,
  });

  const plan = planData?.data;

  // Upload payment proof
  const uploadProofMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/orders/upload-proof", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data as { url: string; publicId: string };
    },
    onSuccess: (data) => {
      setPaymentProofUrl(data.url);
      toast.success("Payment proof uploaded");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to upload proof");
    },
  });

  // Submit plan request with payment info
  const submitRequestMutation = useMutation({
    mutationFn: async (data: { planId: string; paymentMode: string; paymentProofUrl?: string; notes?: string }) => {
      const res = await api.post("/plan-requests", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Plan request submitted successfully!");
      queryClient.invalidateQueries({ queryKey: CLIENT_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_SUBSCRIPTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: CURRENT_PLAN_KEY });
      router.push("/client/subscriptions");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to submit plan request");
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

  const canSubmitRequest = useMemo(() => {
    if (paymentMode === "manual_qr") {
      return !!paymentProofUrl;
    }
    return true; // COD doesn't require proof
  }, [paymentMode, paymentProofUrl]);

  const handleSubmit = async () => {
    if (!canSubmitRequest) {
      toast.error("Please upload payment proof for QR payment");
      return;
    }

    submitRequestMutation.mutate({
      planId,
      paymentMode,
      paymentProofUrl: paymentProofUrl || undefined,
      notes: notes || undefined,
    });
  };

  if (loadingPlan) {
    return (
      <div className="client-page__sections">
        <div className="client-card">
          <p className="client-card__subtitle">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="client-page__sections">
        <div className="client-card">
          <p className="client-card__subtitle" style={{ color: "#dc2626" }}>
            Plan not found
          </p>
        </div>
      </div>
    );
  }

  const price = typeof plan.price === "number" ? plan.price : Number(plan.price ?? 0);

  return (
    <div className="client-page__sections">
        <header className="client-page__header">
          <h1 className="client-page__title">Complete Payment</h1>
        </header>

        <section className="client-page__sections">
          <h2 className="client-section-title">Plan Summary</h2>
          <div className="client-card">
            <h3 className="client-card__title">{plan.title}</h3>
            {plan.goal && (
              <p className="client-card__subtitle" style={{ textTransform: "uppercase", fontSize: "0.75rem", color: "#1d4ed8" }}>
                Goal: {plan.goal}
              </p>
            )}
            {plan.description && (
              <p className="client-card__subtitle" style={{ marginTop: "0.5rem" }}>{plan.description}</p>
            )}
            <div className="client-meta-row" style={{ marginTop: "0.75rem" }}>
              <span>Duration: {plan.durationWeeks} weeks</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>Amount: Rs {price.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="client-page__sections">
          <h2 className="client-section-title">Payment Method</h2>
          <div className="client-card">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="cash"
                  checked={paymentMode === "cash"}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  style={{ cursor: "pointer" }}
                />
                <span className="client-card__subtitle" style={{ fontWeight: 500 }}>
                  Cash on Delivery
                </span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="manual_qr"
                  checked={paymentMode === "manual_qr"}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  style={{ cursor: "pointer" }}
                />
                <span className="client-card__subtitle" style={{ fontWeight: 500 }}>
                  Pay via QR Code
                </span>
              </label>
            </div>

            {paymentMode === "manual_qr" && (
              <div style={{ marginTop: "1rem" }}>
                <p className="client-card__subtitle" style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
                  Scan this QR code to pay:
                </p>
                <QrDisplay />

                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
                  <label htmlFor="proof-upload" className="client-card__subtitle" style={{ fontWeight: 500, display: "block" }}>
                    Upload Payment Proof <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    id="proof-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  />
                  <button
                    type="button"
                    className="client-button client-button--outline"
                    disabled={!paymentProofFile || uploadingProof || uploadProofMutation.status === "pending"}
                    onClick={handleUploadProof}
                    style={{ width: "100%" }}
                  >
                    {uploadingProof || uploadProofMutation.status === "pending" 
                      ? "Uploading..." 
                      : paymentProofUrl 
                      ? "Re-upload Screenshot" 
                      : "Upload Payment Screenshot"}
                  </button>
                  {paymentProofUrl && (
                    <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
                      <span style={{ fontSize: ".75rem", color: "#047857" }}>Uploaded Proof:</span>
                      <Image
                        src={paymentProofUrl}
                        alt="Payment proof"
                        width={240}
                        height={240}
                        style={{ objectFit: "cover", borderRadius: "0.5rem", border: "1px solid #e5e7eb", filter: "brightness(1.2)" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="client-page__sections">
          <h2 className="client-section-title">Additional Notes (Optional)</h2>
          <div className="client-card">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for your coach..."
              maxLength={500}
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
            />
            <p className="client-card__subtitle" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
              {notes.length}/500 characters
            </p>
          </div>
        </section>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="client-button"
            style={{ flex: 1, backgroundColor: "#ffffff", color: "#4b5563" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmitRequest || uploadProofMutation.isPending || submitRequestMutation.isPending}
            className="client-button"
            style={{ flex: 1 }}
          >
            {uploadProofMutation.isPending
              ? "Uploading..."
              : submitRequestMutation.isPending
              ? "Submitting..."
              : "Submit Request"}
          </button>
        </div>
    </div>
  );
}
