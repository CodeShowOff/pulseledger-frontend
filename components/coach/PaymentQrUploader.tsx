"use client";

import React, { useRef, useState } from "react";
import api from "@/lib/axios";
import { useProfileQuery, PROFILE_QUERY_KEY } from "@/lib/queries/profile";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import Image from "next/image";

export default function PaymentQrUploader() {
  const { data } = useProfileQuery();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!data || data.role !== "coach") {
    return null; // Only coaches see this
  }

  const currentUrl = data.paymentQrUrl || null;

  const handleFile = async (file: File) => {
    setError(null);
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { // 4MB guard
      setError("File too large (max 4MB)");
      return;
    }
    const form = new FormData();
    form.append("image", file);
    try {
      setUploading(true);
      const res = await api.post("/users/upload-payment-qr", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res.data?.data?.paymentQrUrl as string | undefined;
      if (newUrl) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, (prev: any) => prev ? { ...prev, paymentQrUrl: newUrl } : prev);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="profile-card" style={{ marginTop: "1rem" }}>
      <h2 className="profile-header__title" style={{ fontSize: "1rem", marginBottom: 8 }}>
        Coach Payment QR
      </h2>
      <p className="profile-header__subtitle" style={{ marginBottom: 12 }}>
        Upload or replace your UPI payment QR. Clients will see it at checkout when paying via QR.
      </p>
      <label className="btn btn--outline" style={{ cursor: uploading ? "default" : "pointer", marginBottom: currentUrl ? 16 : 8 }}>
        <Upload className="btn__icon" /> {uploading ? "Uploading..." : currentUrl ? "Replace QR" : "Upload QR"}
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          disabled={uploading}
          ref={inputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {error && <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: -8, marginBottom: 8 }}>{error}</p>}
      {currentUrl ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Image
            src={currentUrl}
            alt="Payment QR"
            width={220}
            height={220}
            style={{ objectFit: "contain", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>Currently active QR code (visible to clients during checkout)</span>
        </div>
      ) : (
        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>No QR uploaded yet.</span>
      )}
    </div>
  );
}
