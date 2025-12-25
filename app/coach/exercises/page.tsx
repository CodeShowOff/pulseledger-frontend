// app/coach/exercises/page.tsx
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
  Sparkles,
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
  instructions?: string[];
  tips?: string[];
  isActive: boolean;
  isCustom?: boolean;
  createdBy?: { _id: string; name: string };
  createdAt: string;
}

const CATEGORIES = [
  "strength",
  "cardio",
  "flexibility",
  "yoga",
  "functional",
  "plyometric",
  "calisthenics",
  "stretching",
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
  "lower_back",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "hip_flexors",
  "full_body",
];

const EQUIPMENT_LIST = [
  "none",
  "bodyweight",
  "dumbbell",
  "barbell",
  "kettlebell",
  "resistance_band",
  "cable_machine",
  "pull_up_bar",
  "bench",
  "yoga_mat",
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export default function CoachExercisesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "strength",
    muscleGroups: [] as string[],
    equipment: "none" as string,
    difficulty: "beginner",
    instructions: [""],
    tips: [""],
    isActive: true,
  });

  // Fetch exercises
  const { data, isLoading } = useQuery({
    queryKey: ["coachExercises", page, search],
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

  // Separate custom and global exercises
  const customExercises = exercises.filter((e) => e.isCustom);
  const globalExercises = exercises.filter((e) => !e.isCustom);

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
      toast.success("Custom exercise created successfully");
      queryClient.invalidateQueries({ queryKey: ["coachExercises"] });
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
      queryClient.invalidateQueries({ queryKey: ["coachExercises"] });
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
      queryClient.invalidateQueries({ queryKey: ["coachExercises"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete exercise");
    },
  });

  const openCreateModal = () => {
    setEditingExercise(null);
    setFormData({
      name: "",
      description: "",
      category: "strength",
      muscleGroups: [],
      equipment: "none",
      difficulty: "beginner",
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
      instructions: prev.instructions.map((item, i) => (i === index ? value : item)),
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
      tips: prev.tips.map((item, i) => (i === index ? value : item)),
    }));
  };

  const canEditOrDelete = (exercise: Exercise) => {
    return exercise.isCustom;
  };

  return (
    <div>
      <RoleGuard role="coach" />
      
      {/* Header */}
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title coach-page-header__title">
            Exercise Library
          </h1>
          <p className="admin-page-header__subtitle coach-page-header__subtitle">
            Create custom exercises for your clients. You can also use the global exercise library below.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn--primary">
          <Plus size={18} />
          Add Custom Exercise
        </button>
      </section>

      <section
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "1.25rem",
          marginTop: "1.5rem",
        }}
      >
        {/* Search */}
        <div className="admin-search">
          <Search size={18} className="admin-search__icon" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search__input"
          />
        </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
          <p>Loading exercises...</p>
        </div>
      ) : (
        <>
          {/* Custom Exercises Section */}
          {customExercises.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Sparkles size={20} style={{ color: "#8b5cf6" }} />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
                  My Custom Exercises ({customExercises.length})
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                }}
              >
                {customExercises.map((exercise) => (
                  <div
                    key={exercise._id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderLeft: "3px solid #8b5cf6",
                      borderRadius: "8px",
                      padding: "1rem",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                            {exercise.name}
                          </h3>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              padding: "0.15rem 0.4rem",
                              backgroundColor: "#f3e8ff",
                              color: "#8b5cf6",
                              borderRadius: "999px",
                              fontWeight: 600,
                            }}
                          >
                            CUSTOM
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                          {exercise.category} • {exercise.difficulty}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
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
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Edit"
                        >
                          <Edit2 size={16} style={{ color: "#3b82f6" }} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${exercise.name}"?`)) {
                              deleteMutation.mutate(exercise._id);
                            }
                          }}
                          style={{
                            padding: "0.4rem",
                            backgroundColor: "#fef2f2",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global Exercises Section */}
          {globalExercises.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                Global Exercise Library ({globalExercises.length})
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                }}
              >
                {globalExercises.map((exercise) => (
                  <div
                    key={exercise._id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1rem",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                          {exercise.name}
                        </h3>
                        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                          {exercise.category} • {exercise.difficulty}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="admin-pagination__button"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <span className="admin-pagination__info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="admin-pagination__button"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">
                {editingExercise ? "Edit Exercise" : "Create Custom Exercise"}
              </h2>
              <button onClick={closeModal} className="admin-modal__close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div className="auth-form__field">
                <label className="auth-form__label">Exercise Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="auth-form__input"
                  required
                  placeholder="e.g., Barbell Squat"
                />
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="auth-form__input"
                  rows={3}
                  placeholder="Brief description of the exercise"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="auth-form__field">
                  <label className="auth-form__label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    className="auth-form__input"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-form__field">
                  <label className="auth-form__label">Difficulty *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData((p) => ({ ...p, difficulty: e.target.value }))}
                    className="auth-form__input"
                    required
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label">Equipment</label>
                <select
                  value={formData.equipment || "none"}
                  onChange={(e) => setFormData((p) => ({ ...p, equipment: e.target.value }))}
                  className="auth-form__input"
                >
                  {EQUIPMENT_LIST.map((e) => (
                    <option key={e} value={e}>
                      {e.replace(/_/g, " ").charAt(0).toUpperCase() + e.replace(/_/g, " ").slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label">Muscle Groups</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {MUSCLE_GROUPS.map((muscle) => (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => toggleMuscleGroup(muscle)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.85rem",
                        border: "1px solid",
                        borderColor: formData.muscleGroups.includes(muscle) ? "#8b5cf6" : "#d1d5db",
                        backgroundColor: formData.muscleGroups.includes(muscle) ? "#f3e8ff" : "#fff",
                        color: formData.muscleGroups.includes(muscle) ? "#8b5cf6" : "#6b7280",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      {muscle.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label">Instructions</label>
                {formData.instructions.map((instruction, index) => (
                  <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="auth-form__input"
                      placeholder={`Step ${index + 1}`}
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#fef2f2",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <X size={16} style={{ color: "#ef4444" }} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addInstruction}
                  className="admin-button"
                  style={{ marginTop: "0.5rem" }}
                >
                  <Plus size={16} />
                  Add Step
                </button>
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label">Tips (Optional)</label>
                {formData.tips.map((tip, index) => (
                  <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => updateTip(index, e.target.value)}
                      className="auth-form__input"
                      placeholder={`Tip ${index + 1}`}
                    />
                    {formData.tips.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTip(index)}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#fef2f2",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <X size={16} style={{ color: "#ef4444" }} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTip}
                  className="admin-button"
                  style={{ marginTop: "0.5rem" }}
                >
                  <Plus size={16} />
                  Add Tip
                </button>
              </div>

              <div className="admin-modal__footer">
                <button type="button" onClick={closeModal} className="admin-button">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button admin-button--primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingExercise
                    ? "Update Exercise"
                    : "Create Exercise"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
