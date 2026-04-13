"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import getErrorMessage from "@/lib/getErrorMessage";
import { Camera, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProgressPhoto {
  _id: string;
  url: string;
  publicId: string;
  caption?: string;
  uploadedAt: string;
}

export default function ProgressPhotos() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

  const { data: photosData, isLoading } = useQuery({
    queryKey: ["progressPhotos"],
    queryFn: async () => {
      const res = await api.get("/progress-photos/my?limit=50");
      return res.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/progress-photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressPhotos"] });
      setSelectedFile(null);
      setCaption("");
      setPreviewUrl(null);
      setUploading(false);
    },
    onError: (error: unknown) => {
      setUploading(false);
      alert(getErrorMessage(error, "Failed to upload photo"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await api.delete(`/progress-photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressPhotos"] });
      setSelectedPhoto(null);
    },
    onError: (error: unknown) => {
      alert(getErrorMessage(error, "Failed to delete photo"));
    },
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = useCallback(
    async () => {
      if (!selectedFile) return;

      setUploading(true);
      const formData = new FormData();
      formData.append("photo", selectedFile);
      if (caption) formData.append("caption", caption);

      uploadMutation.mutate(formData);
    },
    [selectedFile, caption, uploadMutation]
  );

  const handleDelete = useCallback(
    (photo: ProgressPhoto) => {
      if (confirm("Are you sure you want to delete this photo?")) {
        deleteMutation.mutate(photo._id);
      }
    },
    [deleteMutation]
  );

  const photos = photosData?.data || [];

  return (
    <div className="space-y-5">
      <Card className="border-slate-200/80 bg-white/95">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <ImagePlus className="h-4 w-4" />
                </span>
                Progress photo journal
              </CardTitle>
            </div>
            <Badge variant="secondary" className="normal-case tracking-normal">
              {photos.length} photo{photos.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`photo-skeleton-${idx}`}
                  className="h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
                />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">No photos uploaded yet</p>
              <p className="mt-1 text-xs text-slate-500">Upload your first photo.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {photos.map((photo: ProgressPhoto) => (
                <article
                  key={photo._id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.55)]"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="block w-full text-left"
                    aria-label={`Open photo uploaded on ${new Date(photo.uploadedAt).toLocaleDateString()}`}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption || "Progress photo"}
                      width={420}
                      height={420}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
                      className="h-[220px] w-full object-cover"
                      loading="lazy"
                    />
                  </button>

                  {photo.caption ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent px-3 pb-3 pt-8 text-xs font-medium text-white">
                      {photo.caption}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo);
                    }}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/55 text-white transition-colors hover:bg-rose-600"
                    title="Delete photo"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-white/95 md:max-w-[460px]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <Camera className="h-4 w-4" />
            </span>
            Upload progress photo
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {!previewUrl ? (
            <div className="max-w-[360px]">
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="sr-only"
              />
              <label
                htmlFor="photo-upload"
                className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3 py-3.5 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
                  <Camera className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-slate-700">Choose photo</p>
              </label>
              <p className="mt-1 text-[11px] text-slate-500">JPG, PNG, WEBP up to 5MB</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative w-full max-w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={360}
                  height={360}
                  sizes="(max-width: 640px) 100vw, 360px"
                  className="h-auto w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setCaption("");
                  }}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  aria-label="Remove selected photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-w-[360px]">
                <label htmlFor="photo-caption" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Caption (optional)
                </label>
                <input
                  id="photo-caption"
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a note about this photo..."
                  maxLength={200}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                />
                <p className="mt-1 text-xs text-slate-500">{caption.length}/200 characters</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload photo"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setCaption("");
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPhoto ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-0 top-0 z-10 inline-flex h-10 w-10 -translate-y-12 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60"
              aria-label="Close photo preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || "Progress photo"}
                width={1200}
                height={1200}
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="max-h-[80vh] w-full object-contain"
                priority
              />
            </div>

            <div className="mt-3 space-y-1 text-center">
              {selectedPhoto.caption ? (
                <p className="text-sm font-medium text-white">{selectedPhoto.caption}</p>
              ) : null}
              <p className="text-xs text-slate-300">
                {new Date(selectedPhoto.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
