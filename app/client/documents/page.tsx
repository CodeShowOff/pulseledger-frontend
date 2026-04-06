"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "@/lib/motion";
import {
  AlertCircle,
  ExternalLink,
  FileImage,
  FileText,
  FileUp,
  Files,
  Loader2,
  ShieldCheck,
  Trash2,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type UserDocument,
  useDeleteMyDocumentMutation,
  useMyDocumentsQuery,
  useUploadMyDocumentMutation,
} from "@/lib/queries/documents";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const acceptedFileHint = "PDF, JPG, PNG, WEBP up to 10MB";

type DocumentKind = "pdf" | "image" | "other";

const documentKindMeta: Record<
  DocumentKind,
  { label: string; variant: "success" | "warning" | "secondary"; Icon: LucideIcon }
> = {
  image: {
    label: "Image",
    variant: "success",
    Icon: FileImage,
  },
  pdf: {
    label: "PDF",
    variant: "warning",
    Icon: FileText,
  },
  other: {
    label: "File",
    variant: "secondary",
    Icon: Files,
  },
};

function getDocKind(d: { mimeType?: string; resourceType?: string }): DocumentKind {
  const mimeType = (d.mimeType || "").toLowerCase();
  const resourceType = (d.resourceType || "").toLowerCase();

  if (mimeType === "application/pdf") return "pdf";
  if (resourceType === "image" || mimeType.startsWith("image/")) return "image";
  return "other";
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;

  const mb = kb / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

function getDisplayName(doc: UserDocument) {
  const customName = doc.name?.trim();
  return customName || doc.originalName || "Document";
}

export default function ClientDocumentsPage() {
  const { data: docs = [], isLoading, isError, refetch } = useMyDocumentsQuery();
  const uploadMutation = useUploadMyDocumentMutation();
  const deleteMutation = useDeleteMyDocumentMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const selectedFileKind = useMemo(() => {
    if (!selectedFile) return null;
    return getDocKind({ mimeType: selectedFile.type });
  }, [selectedFile]);

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
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error?.response?.data?.message || "Failed to upload document");
      },
    });
  };

  const handleDeleteDocument = (doc: UserDocument) => {
    const displayName = getDisplayName(doc);
    const shouldDelete = window.confirm(`Delete "${displayName}"? This action cannot be undone.`);
    if (!shouldDelete) return;

    setDeletingDocumentId(doc._id);

    deleteMutation.mutate(doc._id, {
      onSuccess: () => {
        toast.success("Document deleted");
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error?.response?.data?.message || "Failed to delete document");
      },
      onSettled: () => {
        setDeletingDocumentId((currentId) => (currentId === doc._id ? null : currentId));
      },
    });
  };

  return (
    <div className="client-page__sections space-y-4 md:space-y-5">
      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28 }}>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-5 sm:p-6">
            <Badge className="w-fit border-white/25 bg-white/15 text-white">Secure vault</Badge>
            <CardTitle className="text-2xl font-bold tracking-tight text-white md:text-3xl">Health documents</CardTitle>
            <CardDescription className="max-w-2xl text-sm !text-white/90 md:text-base">
              Upload prescriptions, lab reports, and other medical files so everything is organized and easy to access.
            </CardDescription>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Visible only to you (coach cannot view)
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.04 }}
      >
        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileUp className="h-4 w-4" />
              </span>
              Upload a new document
            </CardTitle>
            <CardDescription>Supported formats: {acceptedFileHint}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <label
                htmlFor="document-name"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Document name (optional)
              </label>
              <Input
                id="document-name"
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder={selectedFile?.name || "e.g. Doctor bill - Dec 2025"}
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/35 p-3 sm:p-4">
              <input
                ref={fileInputRef}
                id="document-upload"
                type="file"
                className="sr-only"
                accept="application/pdf,image/jpeg,image/png,image/webp,image/jpg"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-4 w-4" />
                  Choose file
                </Button>

                <span className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                  {selectedFile ? (
                    <>
                      {selectedFileKind === "image" ? <FileImage className="h-4 w-4 shrink-0" /> : null}
                      {selectedFileKind === "pdf" ? <FileText className="h-4 w-4 shrink-0" /> : null}
                      {selectedFileKind === "other" || !selectedFileKind ? <Files className="h-4 w-4 shrink-0" /> : null}
                      <span className="truncate">{selectedFile.name}</span>
                    </>
                  ) : (
                    "No file selected"
                  )}
                </span>

                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={!canUpload}
                  className="sm:ml-auto"
                >
                  {uploadMutation.status === "pending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                  {uploadMutation.status === "pending" ? "Uploading..." : "Upload"}
                </Button>
              </div>

              <p className="text-xs text-slate-500">Tip: add a clear file name so it is easier to find later.</p>
            </div>

            {selectedFile ? (
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected file</p>
                  <p className="break-all text-sm font-medium text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown format"}
                  </p>
                </div>

                {selectedFilePreviewUrl ? (
                  selectedFileKind === "image" ? (
                    <img
                      src={selectedFilePreviewUrl}
                      alt={selectedFile.name}
                      className="h-[140px] w-full rounded-xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <iframe
                      src={selectedFilePreviewUrl}
                      title={selectedFile.name}
                      className="h-[140px] w-full rounded-xl border border-slate-200 bg-white"
                    />
                  )
                ) : (
                  <div className="grid h-[140px] place-items-center rounded-xl border border-slate-200 bg-white text-slate-500">
                    <div className="flex flex-col items-center gap-1 text-xs font-medium">
                      <FileText className="h-5 w-5" />
                      Preview not available
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.08 }}
      >
        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Files className="h-4 w-4" />
                  </span>
                  Your uploaded documents
                </CardTitle>
                <CardDescription>Open any file in a new tab.</CardDescription>
              </div>

              <Badge variant={docs.length > 0 ? "success" : "secondary"}>
                {docs.length} file{docs.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {isLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                Loading documents...
              </div>
            ) : isError ? (
              <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  Failed to load documents.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="border-rose-200 text-rose-700 hover:bg-rose-100"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : docs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                No documents uploaded yet. Add your first file above to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {docs.map((doc, index) => {
                  const kind = getDocKind(doc);
                  const meta = documentKindMeta[kind];
                  const displayName = getDisplayName(doc);
                  const isDeleting = deleteMutation.status === "pending" && deletingDocumentId === doc._id;

                  return (
                    <motion.article
                      key={doc._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: 0.03 * index }}
                    >
                      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-start sm:p-4">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                            <Badge variant={meta.variant}>
                              <meta.Icon className="mr-1 h-3.5 w-3.5" />
                              {meta.label}
                            </Badge>
                          </div>

                          {doc.name && doc.name !== doc.originalName ? (
                            <p className="break-all text-xs text-slate-500">Original: {doc.originalName}</p>
                          ) : null}

                          <p className="text-xs text-slate-500">
                            Uploaded {new Date(doc.createdAt).toLocaleString()} • {formatFileSize(doc.bytes || 0)}
                          </p>
                        </div>

                        {kind === "image" ? (
                          <img
                            src={doc.viewUrl}
                            alt={displayName}
                            loading="lazy"
                            className="h-[140px] w-full rounded-xl border border-slate-200 object-cover"
                          />
                        ) : kind === "pdf" ? (
                          <iframe
                            src={doc.viewUrl}
                            title={displayName}
                            loading="lazy"
                            className="h-[140px] w-full rounded-xl border border-slate-200 bg-white"
                          />
                        ) : (
                          <div className="grid h-[140px] place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                            <div className="flex flex-col items-center gap-1 text-xs font-medium">
                              <Files className="h-5 w-5" />
                              Preview not available
                            </div>
                          </div>
                        )}

                        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col sm:items-stretch sm:justify-start">
                          <Button
                            type="button"
                            className="w-full sm:w-auto"
                            onClick={() => window.open(doc.viewUrl, "_blank", "noopener,noreferrer")}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            disabled={isDeleting}
                            className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 sm:w-auto"
                            onClick={() => {
                              handleDeleteDocument(doc);
                            }}
                          >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
