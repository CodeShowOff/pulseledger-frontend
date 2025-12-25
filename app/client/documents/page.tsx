"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMyDocumentsQuery, useUploadMyDocumentMutation } from "@/lib/queries/documents";

export default function ClientDocumentsPage() {
  const { data: docs = [], isLoading, isError } = useMyDocumentsQuery();
  const uploadMutation = useUploadMyDocumentMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");

  const canUpload = useMemo(() => {
    return !!selectedFile && uploadMutation.status !== "pending";
  }, [selectedFile, uploadMutation.status]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    uploadMutation.mutate({ file: selectedFile, name: documentName }, {
      onSuccess: () => {
        toast.success("Document uploaded");
        setSelectedFile(null);
        setDocumentName("");
        const input = document.getElementById("document-upload") as HTMLInputElement | null;
        if (input) input.value = "";
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error?.response?.data?.message || "Failed to upload document");
      },
    });
  };

  return (
    <div className="client-page__sections">
      <header className="client-page__header">
        <h1 className="client-page__title">Health Documents</h1>
      </header>

      <div className="client-card client-card--highlight">
        <p className="client-card__subtitle" style={{ marginBottom: "0.75rem" }}>
          Upload and store your health documents (doctor bills, reports, etc.). Supported: PDF, JPG, PNG, WEBP (max 10MB).
        </p>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <label className="client-card__subtitle" style={{ fontWeight: 500, display: "block" }}>
              Document name (optional)
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder={selectedFile?.name || "e.g. Doctor bill - Dec 2025"}
              className="auth-form__input"
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Hide the default file input UI */}
            <input
              id="document-upload"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,image/jpg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
            />

            <label
              htmlFor="document-upload"
              className="client-button client-button--outline"
              style={{ cursor: "pointer" }}
            >
              Choose file
            </label>

            <span className="client-card__subtitle" style={{ margin: 0 }}>
              {selectedFile ? selectedFile.name : "No file selected"}
            </span>

            <button
              type="button"
              className="client-button"
              disabled={!canUpload}
              onClick={handleUpload}
            >
              {uploadMutation.status === "pending" ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>

      <div className="client-card">
        <div className="client-card__header">
          <p className="client-card__title" style={{ margin: 0 }}>Your Uploaded Documents</p>
          <p className="client-card__subtitle">
            Click “Open” to view in a new tab.
          </p>
        </div>

        {isLoading ? (
          <p className="client-card__subtitle">Loading documents...</p>
        ) : isError ? (
          <p className="client-card__subtitle">Failed to load documents.</p>
        ) : docs.length === 0 ? (
          <p className="client-card__subtitle">No documents uploaded yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {docs.map((d) => (
              <div
                key={d._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  paddingTop: "0.75rem",
                }}
              >
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontWeight: 600 }}>{(d.name || d.originalName) ?? "Document"}</div>
                  <div className="client-card__subtitle" style={{ marginTop: "0.25rem" }}>
                    Uploaded: {new Date(d.createdAt).toLocaleString()} • {Math.round((d.bytes || 0) / 1024)} KB
                  </div>
                </div>

                <a
                  className="client-button"
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textAlign: "center" }}
                >
                  Open
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
