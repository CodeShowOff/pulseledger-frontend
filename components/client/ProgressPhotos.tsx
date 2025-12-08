"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Camera, Trash2, X } from "lucide-react";

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
    onError: (error: any) => {
      setUploading(false);
      alert(error?.response?.data?.message || "Failed to upload photo");
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
    onError: (error: any) => {
      alert(error?.response?.data?.message || "Failed to delete photo");
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
    <div>
      {/* Photos Gallery */}
      <div className="client-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <p className="client-card__section-title">
            My Progress Photos ({photos.length})
          </p>
          <p className="client-card__section-subtitle">
            Your transformation journey in photos
          </p>
        </div>

        {isLoading ? (
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Loading photos...</p>
        ) : photos.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            No photos uploaded yet. Upload your first progress photo above!
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
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
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || "Progress photo"}
                  width={250}
                  height={250}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                  }}
                />
                {photo.caption && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
                      color: "white",
                      padding: "1rem 0.75rem 0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    {photo.caption}
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0, 0, 0, 0.6)",
                    borderRadius: "8px",
                    padding: "0.25rem",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.25rem",
                    }}
                    title="Delete photo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="client-card">
        <div style={{ marginBottom: "1rem" }}>
          <p className="client-card__section-title">Upload Progress Photo</p>
          <p className="client-card__section-subtitle">
            Share your transformation journey with your coach
          </p>
        </div>

        {!previewUrl ? (
          <div>
            <label
              htmlFor="photo-upload"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 500,
                border: "none",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
            >
              <Camera size={20} />
              Choose Photo
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#6b7280" }}>
              Max file size: 5MB. Supported formats: JPG, PNG, WEBP
            </p>
          </div>
        ) : (
          <div>
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "400px",
                marginBottom: "1rem",
              }}
            >
              <Image
                src={previewUrl}
                alt="Preview"
                width={400}
                height={400}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setCaption("");
                }}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                  color: "#374151",
                }}
              >
                Caption (optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a note about this photo..."
                maxLength={200}
                className="client-form__control"
                style={{ width: "100%", maxWidth: "500px" }}
              />
              <p style={{ marginTop: "0.25rem", fontSize: "0.85rem", color: "#6b7280" }}>
                {caption.length}/200 characters
              </p>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="client-button"
              style={{ marginRight: "0.5rem" }}
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setCaption("");
              }}
              className="client-button client-button--outline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

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
                borderRadius: "12px",
                objectFit: "contain",
              }}
            />
            {selectedPhoto.caption && (
              <div
                style={{
                  marginTop: "1rem",
                  color: "white",
                  fontSize: "1rem",
                  textAlign: "center",
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
              {new Date(selectedPhoto.uploadedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
