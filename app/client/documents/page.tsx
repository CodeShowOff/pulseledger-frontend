"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useMyDocumentsQuery, useUploadMyDocumentMutation } from "@/lib/queries/documents";

export default function ClientDocumentsPage() {
  const { data: docs = [], isLoading, isError } = useMyDocumentsQuery();
  const uploadMutation = useUploadMyDocumentMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");

  const selectedFilePreviewUrl = useMemo(() => {
    if (!selectedFile) return null;
    const isPreviewable =
      selectedFile.type.startsWith("image/") ||
      selectedFile.type === "application/pdf";
    if (!isPreviewable) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (selectedFilePreviewUrl) URL.revokeObjectURL(selectedFilePreviewUrl);
    };
  }, [selectedFilePreviewUrl]);

  const canUpload = useMemo(() => {
    return !!selectedFile && uploadMutation.status !== "pending";
  }, [selectedFile, uploadMutation.status]);

  const getDocKind = (d: { mimeType?: string; resourceType?: string }) => {
    const mimeType = (d.mimeType || "").toLowerCase();
    const resourceType = (d.resourceType || "").toLowerCase();
    const isPdf = mimeType === "application/pdf";
    const isImage = resourceType === "image" || mimeType.startsWith("image/");

    if (isPdf) return "pdf" as const;
    if (isImage) return "image" as const;
    return "other" as const;
  };

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

          {selectedFile && selectedFilePreviewUrl && (
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ minWidth: 220 }}>
                <p className="client-card__subtitle" style={{ margin: 0 }}>
                  Preview:
                </p>
              </div>

              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={selectedFilePreviewUrl}
                  alt={selectedFile.name}
                  style={{
                    width: 220,
                    height: 140,
                    objectFit: "cover",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: 10,
                  }}
                />
              ) : (
                <iframe
                  src={selectedFilePreviewUrl}
                  title={selectedFile.name}
                  style={{
                    width: 220,
                    height: 140,
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: 10,
                  }}
                />
              )}
            </div>
          )}
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

                {(() => {
                  const kind = getDocKind(d);
                  if (kind === "other") return null;

                  const commonStyle: React.CSSProperties = {
                    width: 220,
                    height: 140,
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: 10,
                    overflow: "hidden",
                  };

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div className="client-card__subtitle" style={{ margin: 0 }}>
                        Preview
                      </div>

                      {kind === "image" ? (
                        <img
                          src={d.viewUrl}
                          alt={(d.name || d.originalName) ?? "Document"}
                          loading="lazy"
                          style={{
                            ...commonStyle,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <iframe
                          src={d.viewUrl}
                          title={(d.name || d.originalName) ?? "Document"}
                          loading="lazy"
                          style={commonStyle}
                        />
                      )}
                    </div>
                  );
                })()}

                <a
                  className="client-button"
                  href={d.viewUrl}
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
