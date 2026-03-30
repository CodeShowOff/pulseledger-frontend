import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const DOCUMENTS_QK = {
  mine: ["documents", "me"] as const,
};

export type UserDocument = {
  _id: string;
  userId: string;
  publicId: string;
  resourceType: "image" | "raw";
  mimeType: string;
  originalName: string;
  name?: string | null;
  bytes: number;
  format?: string | null;
  createdAt: string;
  updatedAt: string;
  viewUrl: string;
};

type UseMyDocumentsQueryOptions = {
  enabled?: boolean;
};

export function useMyDocumentsQuery(options: UseMyDocumentsQueryOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: DOCUMENTS_QK.mine,
    enabled,
    queryFn: async () => {
      const res = await api.get("/documents");
      return (res.data?.data || []) as UserDocument[];
    },
  });
}

export function useUploadMyDocumentMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { file: File; name?: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      if (payload.name && payload.name.trim()) {
        formData.append("name", payload.name.trim());
      }
      const res = await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data as UserDocument;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_QK.mine });
    },
  });
}

export function useDeleteMyDocumentMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      await api.delete(`/documents/${documentId}`);
      return documentId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_QK.mine });
    },
  });
}
