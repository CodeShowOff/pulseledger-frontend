// app/admin/exercises/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";

interface Exercise {
  _id: string;
  name: string;
  description?: string;
  category: string;
  muscleGroups: string[];
  equipment?: string | string[];
  difficulty?: string;
  videoUrl?: string;
  imageUrl?: string;
  animationUrl?: string;
  thumbnailUrl?: string;
  instructions?: string[];
  tips?: string[];
  isActive: boolean;
  createdAt: string;
}

const CATEGORIES = [
  "strength",
  "cardio",
  "flexibility",
  "balance",
  "plyometrics",
  "bodyweight",
  "compound",
  "isolation",
];

const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "core",
  "abs",
  "obliques",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "hip_flexors",
  "full_body",
];

const EQUIPMENT_LIST = [
  "none",
  "barbell",
  "dumbbell",
  "kettlebell",
  "cable",
  "machine",
  "resistance_band",
  "pull_up_bar",
  "bench",
  "exercise_ball",
  "foam_roller",
  "bodyweight",
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export default function AdminExercisesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "strength",
    muscleGroups: [] as string[],
    equipment: "none" as string,
    difficulty: "beginner",
    videoUrl: "",
    imageUrl: "",    animationUrl: "",
    thumbnailUrl: "",    instructions: [""],
    tips: [""],
    isActive: true,
  });

  // Fetch exercises
  const { data, isLoading } = useQuery({
    queryKey: ["adminExercises", page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "20");
      if (search) params.append("search", search);
      const res = await api.get(`/exercises?${params.toString()}`);
      return res.data;
    },
  });

  const exercises: Exercise[] = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1 };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const cleanedData = {
        ...data,
        instructions: data.instructions.filter((i) => i.trim()),
        tips: data.tips.filter((t) => t.trim()),
      };
      const res = await api.post("/exercises", cleanedData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Exercise created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminExercises"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create exercise");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const cleanedData = {
        ...data,
        instructions: data.instructions.filter((i) => i.trim()),
        tips: data.tips.filter((t) => t.trim()),
      };
      const res = await api.patch(`/exercises/${id}`, cleanedData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Exercise updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminExercises"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update exercise");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/exercises/${id}`);
    },
    onSuccess: () => {
      toast.success("Exercise deleted");
      queryClient.invalidateQueries({ queryKey: ["adminExercises"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete exercise");
    },
  });

  // Upload animation handler
  const handleAnimationUpload = async (file: File) => {
    if (!editingExercise) {
      toast.error("Please save the exercise first before uploading an animation");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be under 10MB");
      return;
    }

    const allowedTypes = [
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only GIF, JPEG, PNG, WebP, MP4, or WebM files are allowed");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("animation", file);

      const res = await api.post(
        `/exercises/${editingExercise._id}/animation`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("Animation uploaded successfully!");
        setFormData((prev) => ({
          ...prev,
          animationUrl: res.data.data.animationUrl,
          thumbnailUrl: res.data.data.thumbnailUrl,
        }));
        queryClient.invalidateQueries({ queryKey: ["adminExercises"] });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload animation");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete animation handler
  const handleAnimationDelete = async () => {
    if (!editingExercise || !formData.animationUrl) return;

    try {
      await api.delete(`/exercises/${editingExercise._id}/animation`);
      toast.success("Animation deleted");
      setFormData((prev) => ({
        ...prev,
        animationUrl: "",
        thumbnailUrl: "",
      }));
      queryClient.invalidateQueries({ queryKey: ["adminExercises"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete animation");
    }
  };

  const openCreateModal = () => {
    setEditingExercise(null);
    setFormData({
      name: "",
      description: "",
      category: "strength",
      muscleGroups: [],
      equipment: "none",
      difficulty: "beginner",
      videoUrl: "",
      imageUrl: "",
      animationUrl: "",
      thumbnailUrl: "",
      instructions: [""],
      tips: [""],
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description || "",
      category: exercise.category,
      muscleGroups: exercise.muscleGroups || [],
      equipment: Array.isArray(exercise.equipment) 
        ? (exercise.equipment[0] || "none")
        : (exercise.equipment || "none"),
      difficulty: exercise.difficulty || "beginner",
      videoUrl: exercise.videoUrl || "",
      imageUrl: exercise.imageUrl || "",
      animationUrl: exercise.animationUrl || "",
      thumbnailUrl: exercise.thumbnailUrl || "",
      instructions: exercise.instructions?.length ? exercise.instructions : [""],
      tips: exercise.tips?.length ? exercise.tips : [""],
      isActive: exercise.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExercise(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExercise) {
      updateMutation.mutate({ id: editingExercise._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleMuscleGroup = (muscle: string) => {
    setFormData((prev) => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscle)
        ? prev.muscleGroups.filter((m) => m !== muscle)
        : [...prev.muscleGroups, muscle],
    }));
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst
      ),
    }));
  };

  const addTip = () => {
    setFormData((prev) => ({
      ...prev,
      tips: [...prev.tips, ""],
    }));
  };

  const removeTip = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index),
    }));
  };

  const updateTip = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tips: prev.tips.map((tip, i) => (i === index ? value : tip)),
    }));
  };

  return (
    <div>
      <RoleGuard role="admin" />

      <header className="admin-page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1 className="admin-page-header__title">Exercise Library</h1>
            <p className="admin-page-header__subtitle">
              Manage the global exercise database for coaches to build workout
              plans.
            </p>
          </div>
          <button onClick={openCreateModal} className="btn btn--primary">
            <Plus style={{ width: 18, height: 18, marginRight: "0.5rem" }} />
            Add Exercise
          </button>
        </div>
      </header>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            maxWidth: "400px",
          }}
        >
          <Search style={{ width: 18, height: 18, color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Exercise List */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      ) : exercises.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
        >
          <Dumbbell
            style={{
              width: 48,
              height: 48,
              color: "#d1d5db",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#6b7280" }}>
            No exercises found. Add your first exercise to get started.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {exercises.map((exercise) => (
              <div
                key={exercise._id}
                className="admin-card"
                style={{ padding: "1rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                        {exercise.name}
                      </h3>
                      {!exercise.isActive && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.15rem 0.4rem",
                            backgroundColor: "#fef3c7",
                            color: "#d97706",
                            borderRadius: "999px",
                          }}
                        >
                          Inactive
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {exercise.category} • {exercise.difficulty}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.25rem",
                      }}
                    >
                      {exercise.muscleGroups.slice(0, 3).map((mg) => (
                        <span
                          key={mg}
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.15rem 0.4rem",
                            backgroundColor: "#f0fdf4",
                            color: "#16a34a",
                            borderRadius: "4px",
                          }}
                        >
                          {mg.replace(/_/g, " ")}
                        </span>
                      ))}
                      {exercise.muscleGroups.length > 3 && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.15rem 0.4rem",
                            backgroundColor: "#f3f4f6",
                            color: "#6b7280",
                            borderRadius: "4px",
                          }}
                        >
                          +{exercise.muscleGroups.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button
                      onClick={() => openEditModal(exercise)}
                      style={{
                        padding: "0.4rem",
                        backgroundColor: "#eff6ff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <Edit2 style={{ width: 14, height: 14, color: "#2563eb" }} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete "${exercise.name}"?`
                          )
                        ) {
                          deleteMutation.mutate(exercise._id);
                        }
                      }}
                      style={{
                        padding: "0.4rem",
                        backgroundColor: "#fee2e2",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 style={{ width: 14, height: 14, color: "#dc2626" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "0.5rem",
                  backgroundColor: page === 1 ? "#f3f4f6" : "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft style={{ width: 18, height: 18 }} />
              </button>
              <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                style={{
                  padding: "0.5rem",
                  backgroundColor:
                    page === pagination.totalPages ? "#f3f4f6" : "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  cursor:
                    page === pagination.totalPages ? "not-allowed" : "pointer",
                }}
              >
                <ChevronRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
                {editingExercise ? "Edit Exercise" : "Add Exercise"}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  padding: "0.25rem",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="auth-form__field">
                  <label className="auth-form__label">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    className="auth-form__input"
                    required
                  />
                </div>

                <div className="auth-form__field">
                  <label className="auth-form__label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
                    className="auth-form__input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-form__field">
                  <label className="auth-form__label">Equipment</label>
                  <select
                    value={formData.equipment || "none"}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, equipment: e.target.value }))
                    }
                    className="auth-form__input"
                  >
                    {EQUIPMENT_LIST.map((e) => (
                      <option key={e} value={e}>
                        {e.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-form__field">
                  <label className="auth-form__label">Difficulty</label>
                  <select
                    value={formData.difficulty || "beginner"}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, difficulty: e.target.value }))
                    }
                    className="auth-form__input"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="auth-form__field" style={{ marginTop: "1rem" }}>
                <label className="auth-form__label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="auth-form__input"
                  rows={3}
                />
              </div>

              <div className="auth-form__field" style={{ marginTop: "1rem" }}>
                <label className="auth-form__label">Muscle Groups</label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {MUSCLE_GROUPS.map((mg) => (
                    <button
                      key={mg}
                      type="button"
                      onClick={() => toggleMuscleGroup(mg)}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.8rem",
                        backgroundColor: formData.muscleGroups.includes(mg)
                          ? "#dcfce7"
                          : "#f3f4f6",
                        border: formData.muscleGroups.includes(mg)
                          ? "1px solid #16a34a"
                          : "1px solid #e5e7eb",
                        borderRadius: "6px",
                        color: formData.muscleGroups.includes(mg)
                          ? "#16a34a"
                          : "#6b7280",
                        cursor: "pointer",
                      }}
                    >
                      {mg.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <div className="auth-form__field">
                  <label className="auth-form__label">Video URL</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, videoUrl: e.target.value }))
                    }
                    className="auth-form__input"
                    placeholder="https://..."
                  />
                </div>

                <div className="auth-form__field">
                  <label className="auth-form__label">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, imageUrl: e.target.value }))
                    }
                    className="auth-form__input"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Animation Demo Section */}
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "#f0fdf4",
                  borderRadius: "8px",
                  border: "1px solid #dcfce7",
                }}
              >
                <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "#16a34a" }}>
                  🎬 Exercise Animation Demo
                </h4>
                <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "1rem" }}>
                  Upload an animated GIF or video to show clients how to perform this exercise correctly.
                  Recommended: Use looping GIFs (under 5MB) or short MP4 videos. Max file size: 10MB.
                </p>

                {/* Upload Section - Only show when editing */}
                {editingExercise && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "2px dashed #dcfce7",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 1.5rem",
                          backgroundColor: isUploading ? "#e5e7eb" : "#16a34a",
                          color: "#fff",
                          borderRadius: "8px",
                          cursor: isUploading ? "not-allowed" : "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          transition: "all 0.2s",
                        }}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload style={{ width: 18, height: 18 }} />
                            Upload Animation
                          </>
                        )}
                        <input
                          type="file"
                          accept=".gif,.mp4,.webm,.mov,.jpg,.jpeg,.png,.webp"
                          style={{ display: "none" }}
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAnimationUpload(file);
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        Supported: GIF, MP4, WebM, JPEG, PNG, WebP (max 10MB)
                      </span>
                    </div>
                  </div>
                )}

                {!editingExercise && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      backgroundColor: "#fef3c7",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      color: "#92400e",
                    }}
                  >
                    💡 Save the exercise first, then edit it to upload an animation file.
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="auth-form__field">
                    <label className="auth-form__label">Animation URL (GIF/Video)</label>
                    <input
                      type="url"
                      value={formData.animationUrl}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, animationUrl: e.target.value }))
                      }
                      className="auth-form__input"
                      placeholder="https://example.com/exercise.gif"
                    />
                  </div>

                  <div className="auth-form__field">
                    <label className="auth-form__label">Thumbnail URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, thumbnailUrl: e.target.value }))
                      }
                      className="auth-form__input"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>
                </div>

                {/* Animation Preview */}
                {formData.animationUrl && (
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                        Preview:
                      </label>
                      {editingExercise && (
                        <button
                          type="button"
                          onClick={handleAnimationDelete}
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.75rem",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "4px",
                            color: "#dc2626",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <Trash2 style={{ width: 12, height: 12 }} />
                          Delete Animation
                        </button>
                      )}
                    </div>
                    <div
                      style={{
                        width: "140px",
                        height: "140px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        backgroundColor: "#000",
                        border: "2px solid #16a34a",
                      }}
                    >
                      {formData.animationUrl.toLowerCase().includes(".mp4") ||
                      formData.animationUrl.toLowerCase().includes(".webm") ? (
                        <video
                          src={formData.animationUrl}
                          loop
                          muted
                          autoPlay
                          playsInline
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <img
                          src={formData.animationUrl}
                          alt="Animation preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="auth-form__field" style={{ marginTop: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label className="auth-form__label">Instructions</label>
                  <button
                    type="button"
                    onClick={addInstruction}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #dcfce7",
                      borderRadius: "4px",
                      color: "#16a34a",
                      cursor: "pointer",
                    }}
                  >
                    + Add Step
                  </button>
                </div>
                {formData.instructions.map((inst, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        flexShrink: 0,
                        marginTop: "0.5rem",
                      }}
                    >
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={inst}
                      onChange={(e) => updateInstruction(i, e.target.value)}
                      className="auth-form__input"
                      placeholder={`Step ${i + 1}`}
                      style={{ flex: 1 }}
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(i)}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#fee2e2",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <X style={{ width: 14, height: 14, color: "#dc2626" }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="auth-form__field" style={{ marginTop: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label className="auth-form__label">Tips</label>
                  <button
                    type="button"
                    onClick={addTip}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#fef3c7",
                      border: "1px solid #fde68a",
                      borderRadius: "4px",
                      color: "#d97706",
                      cursor: "pointer",
                    }}
                  >
                    + Add Tip
                  </button>
                </div>
                {formData.tips.map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => updateTip(i, e.target.value)}
                      className="auth-form__input"
                      placeholder={`Tip ${i + 1}`}
                      style={{ flex: 1 }}
                    />
                    {formData.tips.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTip(i)}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#fee2e2",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <X style={{ width: 14, height: 14, color: "#dc2626" }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Toggle */}
              <div style={{ marginTop: "1rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, isActive: e.target.checked }))
                    }
                  />
                  <span style={{ fontSize: "0.9rem" }}>Active</span>
                </label>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn--outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingExercise
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
