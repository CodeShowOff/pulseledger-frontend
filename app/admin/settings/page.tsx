"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import api from "@/lib/axios";
import { Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch current payment QR
  const { data: qrData, isLoading } = useQuery({
    queryKey: ["adminPaymentQr"],
    queryFn: async () => {
      const res = await api.get("/admin/payment-qr");
      return res.data.data;
    },
  });

  // Upload QR mutation
  const uploadQrMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("paymentQr", file);
      const res = await api.post("/admin/upload-payment-qr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPaymentQr"] });
      setQrFile(null);
      setPreviewUrl(null);
      toast.success("Payment QR code uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload QR code");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setQrFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (!qrFile) {
      toast.error("Please select a QR code image");
      return;
    }
    uploadQrMutation.mutate(qrFile);
  };

  return (
    <div className="admin-page">
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Admin Settings</h1>
          <p className="admin-page-header__subtitle">
            Manage platform configuration and payment details
          </p>
        </div>
      </section>

      <div className="admin-card">
        <h2 className="admin-card__title">Platform Subscription Payment QR Code</h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          Upload a QR code that coaches will use to pay the ₹199 monthly platform subscription fee.
          This QR code will be displayed on the coach payment page.
        </p>

        {/* Current QR Code */}
        {isLoading ? (
          <p style={{ color: "#6b7280" }}>Loading current QR code...</p>
        ) : qrData?.paymentQrUrl ? (
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Current QR Code:</p>
            <Image
              src={qrData.paymentQrUrl}
              alt="Current Payment QR"
              width={300}
              height={300}
              style={{
                maxWidth: "300px",
                width: "100%",
                borderRadius: "0.5rem",
                border: "2px solid #e5e7eb",
                padding: "0.5rem",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              padding: "2rem",
              backgroundColor: "#f9fafb",
              borderRadius: "0.5rem",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
            <p style={{ color: "#6b7280" }}>No QR code uploaded yet</p>
          </div>
        )}

        {/* Upload New QR Code */}
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
            Upload New QR Code:
          </p>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="qrCodeInput"
          />
          
          <label
            htmlFor="qrCodeInput"
            className="btn btn--outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
          >
            <Upload size={20} />
            {qrFile ? "Change QR Code" : "Select QR Code"}
          </label>

          {previewUrl && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                Preview:
              </p>
              <Image
                src={previewUrl}
                alt="Preview"
                width={300}
                height={300}
                style={{
                  maxWidth: "300px",
                  width: "100%",
                  borderRadius: "0.5rem",
                  border: "2px solid #3b82f6",
                  padding: "0.5rem",
                }}
              />
            </div>
          )}

          {qrFile && (
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={handleUpload}
                className="btn btn--primary"
                disabled={uploadQrMutation.isPending}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {uploadQrMutation.isPending ? (
                  "Uploading..."
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Upload QR Code
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: "#fef3c7",
            borderRadius: "0.5rem",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
            <strong>Note:</strong> This QR code should be a UPI payment QR or bank account QR code
            that coaches can scan to pay the monthly subscription fee. Make sure the QR code is
            clear and works before uploading.
          </p>
        </div>
      </div>
    </div>
  );
}
