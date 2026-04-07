"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { CalendarDays, Camera, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

interface ClientProgressPhotosProps {
  clientId: string;
  clientName: string;
}

function formatPhotoDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClientProgressPhotos({
  clientId,
  clientName,
}: ClientProgressPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

  const { data: photosData, isLoading } = useQuery({
    queryKey: ["clientProgressPhotos", clientId],
    queryFn: async () => {
      const res = await api.get(`/progress-photos/client/${clientId}?limit=50`);
      return res.data;
    },
    enabled: Boolean(clientId),
  });

  const photos = photosData?.data || [];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <Badge variant="secondary" className="w-fit normal-case tracking-normal">
                Progress journal
              </Badge>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Camera className="h-4 w-4" />
                </span>
                Progress photos ({photos.length})
              </CardTitle>
              <CardDescription>
                {clientName}&apos;s transformation timeline in one visual gallery.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading photos...</p>
          ) : photos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No progress photos uploaded yet</p>
              <p className="mt-1 text-xs text-slate-500">
                The client hasn&apos;t shared transformation photos yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo: ProgressPhoto) => (
                <button
                  key={photo._id}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.55)]"
                >
                  <div className="relative h-[230px] w-full bg-slate-100">
                    <Image
                      src={photo.url}
                      alt={photo.caption || "Progress photo"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-2 p-3">
                    {photo.caption ? (
                      <p className="text-sm font-medium leading-5 text-slate-700">{photo.caption}</p>
                    ) : (
                      <p className="text-sm text-slate-400">No caption</p>
                    )}

                    <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatPhotoDate(photo.uploadedAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPhoto ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Selected progress photo"
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPhoto(null)}
                className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || "Progress photo"}
                width={1200}
                height={900}
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="max-h-[78vh] w-full object-contain"
                priority
              />
            </div>

            <div className="mt-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/90">
              {selectedPhoto.caption ? <p>{selectedPhoto.caption}</p> : null}
              <p className="mt-1 text-xs text-white/70">
                Uploaded on {formatPhotoDate(selectedPhoto.uploadedAt)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
