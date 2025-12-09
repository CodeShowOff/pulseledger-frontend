"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { X } from "lucide-react";

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

export default function ClientProgressPhotos({ clientId, clientName }: ClientProgressPhotosProps) {
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
    <div className="admin-card" style={{ marginTop: "1.5rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h2 className="admin-card__title" style={{ marginBottom: "0.5rem" }}>
          Progress Photos ({photos.length})
        </h2>
        <p className="admin-page-header__subtitle">
          {clientName}&apos;s transformation journey in photos
        </p>
      </div>

      {isLoading ? (
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Loading photos...</p>
      ) : photos.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            border: "2px dashed #e5e7eb",
          }}
        >
          <p style={{ color: "#6b7280", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            No progress photos uploaded yet
          </p>
          <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
            Client hasn&apos;t shared any transformation photos
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {photos.map((photo: ProgressPhoto) => (
            <div
              key={photo._id}
              style={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                backgroundColor: "#f9fafb",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <Image
                src={photo.url}
                alt={photo.caption || "Progress photo"}
                width={280}
                height={280}
                style={{
                  width: "100%",
                  height: "280px",
                  objectFit: "cover",
                }}
                loading="lazy"
              />
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "white",
                }}
              >
                {photo.caption && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#374151",
                      marginBottom: "0.5rem",
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {photo.caption}
                  </p>
                )}
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                  }}
                >
                  {new Date(photo.uploadedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "2rem",
              }}
            >
              <X size={32} />
            </button>
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || "Progress photo"}
              width={800}
              height={800}
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                width: "auto",
                height: "auto",
                borderRadius: "12px",
                objectFit: "contain",
              }}
              priority
            />
            {selectedPhoto.caption && (
              <div
                style={{
                  marginTop: "1rem",
                  color: "white",
                  fontSize: "1rem",
                  textAlign: "center",
                  padding: "0 1rem",
                }}
              >
                {selectedPhoto.caption}
              </div>
            )}
            <div
              style={{
                marginTop: "0.5rem",
                color: "#d1d5db",
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              Uploaded on {new Date(selectedPhoto.uploadedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
