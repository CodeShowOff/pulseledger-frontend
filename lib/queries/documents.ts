import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const DOCUMENTS_QK = {
  mine: ["documents", "me"] as const,
};

export type UserDocument = {
  _id: string;
  userId: string;
  url: string;
  publicId: string;
  resourceType: "image" | "raw";
  mimeType: string;
  originalName: string;
  name?: string | null;
  bytes: number;
  format?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useMyDocumentsQuery() {
  return useQuery({
    queryKey: DOCUMENTS_QK.mine,
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
