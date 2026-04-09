// app/coach/exercises/page.tsx
"use client";

import React, { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { motion } from "@/lib/motion";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Edit2,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ExerciseAnimation from "@/components/shared/ExerciseAnimation";
import { cn } from "@/lib/utils";

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
  animationUrl?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  isCustom?: boolean;
  createdBy?: { _id: string; name: string };
  createdAt: string;
}

interface ExercisesResponse {
  data: Exercise[];
  pagination?: {
    page: number;
    totalPages: number;
    total?: number;
  };
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

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const selectFieldClassName =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70";

const textAreaFieldClassName =
  "min-h-[95px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70";

function formatEnumLabel(value?: string) {
  if (!value) return "Not set";
  const parsed = value.replace(/_/g, " ");
  return parsed.charAt(0).toUpperCase() + parsed.slice(1);
}

function getDifficultyVariant(
  difficulty?: string
): "secondary" | "success" | "warning" | "danger" {
  if (difficulty === "beginner") return "success";
  if (difficulty === "intermediate") return "warning";
  if (difficulty === "advanced") return "danger";
  return "secondary";
}

function formatDateLabel(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

export default function CoachExercisesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

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
  const { data, isLoading, isFetching } = useQuery<ExercisesResponse>({
    queryKey: ["coachExercises", page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "20");
      if (search) params.append("search", search);
      const res = await api.get(`/exercises?${params.toString()}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const exercises: Exercise[] = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1 };

  const {
    data: selectedExerciseDetails,
    isLoading: isSelectedExerciseLoading,
    isFetching: isSelectedExerciseFetching,
    isError: isSelectedExerciseError,
  } = useQuery<Exercise>({
    queryKey: ["coachExerciseDetails", selectedExerciseId],
    queryFn: async () => {
      if (!selectedExerciseId) {
        throw new Error("Exercise id is required to load details");
      }
      const res = await api.get(`/exercises/${selectedExerciseId}`);
      return res.data?.data as Exercise;
    },
    enabled: !!selectedExerciseId,
  });

  const selectedExerciseDetail = selectedExerciseDetails ?? selectedExercise;

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

  const openDetailsModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSelectedExerciseId(exercise._id);
  };

  const closeDetailsModal = () => {
    setSelectedExercise(null);
    setSelectedExerciseId(null);
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

  const isFormPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <RoleGuard role="coach" />

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-5 md:gap-4 md:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="space-y-1.5">
                <Badge className="w-fit border-white/25 bg-white/15 text-[11px] text-white sm:text-xs">
                  Exercise Library
                </Badge>
                <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                  Build your custom exercise bank
                </CardTitle>
                <CardDescription className="max-w-2xl text-xs !text-white/90 sm:text-sm md:text-base">
                  Create reusable movement entries for faster workout programming
                  and smarter client coaching.
                </CardDescription>
              </div>

              <div className="flex w-full sm:w-auto md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openCreateModal}
                  className="h-8 border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Add Custom Exercise
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Search className="h-4 w-4" />
              </span>
              Find exercises
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, category, or muscle group"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex md:items-end">
                {isFetching ? (
                  <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating results...
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Showing {exercises.length} exercise
                    {exercises.length === 1 ? "" : "s"} on this page
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="h-4 w-4" />
              </span>
              Exercise catalog
            </CardTitle>
            <CardDescription>
              Manage your custom entries and browse the global exercise library.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`exercise-skeleton-${idx}`}
                    className="h-[190px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
                  />
                ))}
              </div>
            ) : exercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <Dumbbell className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No exercises found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search query or add a custom exercise.
                </p>
              </div>
            ) : (
              <>
                {customExercises.length > 0 ? (
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        My custom exercises
                      </h3>
                      <Badge className="px-2 py-0.5 text-[10px] normal-case tracking-normal">
                        {customExercises.length}
                      </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {customExercises.map((exercise) => (
                        <article key={exercise._id} className="h-full">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => openDetailsModal(exercise)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openDetailsModal(exercise);
                              }
                            }}
                            aria-label={`View details for ${exercise.name}`}
                            className="flex h-full cursor-pointer flex-col rounded-2xl border border-violet-200 bg-violet-50/40 p-4 transition-all hover:border-violet-300 hover:shadow-[0_14px_30px_-24px_rgba(124,58,237,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-slate-900">
                                  {exercise.name}
                                </h4>
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatEnumLabel(exercise.category)} •{" "}
                                  {formatEnumLabel(exercise.difficulty)} •{" "}
                                  {formatEnumLabel(
                                    Array.isArray(exercise.equipment)
                                      ? exercise.equipment[0]
                                      : exercise.equipment
                                  )}
                                </p>
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5">
                                <Badge className="px-2 py-0.5 text-[10px] tracking-normal">
                                  Custom
                                </Badge>
                                <Badge
                                  variant={exercise.isActive ? "success" : "danger"}
                                  className="px-2 py-0.5 text-[10px] tracking-normal"
                                >
                                  {exercise.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>

                            {exercise.description ? (
                              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">
                                {exercise.description}
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-slate-400">
                                No description provided.
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {exercise.muscleGroups.slice(0, 4).map((muscle) => (
                                <Badge
                                  key={`${exercise._id}-${muscle}`}
                                  variant="secondary"
                                  className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                                >
                                  {formatEnumLabel(muscle)}
                                </Badge>
                              ))}
                              {exercise.muscleGroups.length > 4 ? (
                                <Badge
                                  variant="secondary"
                                  className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                                >
                                  +{exercise.muscleGroups.length - 4}
                                </Badge>
                              ) : null}
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <Badge
                                variant={getDifficultyVariant(exercise.difficulty)}
                                className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                              >
                                {formatEnumLabel(exercise.difficulty)}
                              </Badge>

                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(exercise);
                                  }}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      window.confirm(
                                        `Delete "${exercise.name}"? This action cannot be undone.`
                                      )
                                    ) {
                                      deleteMutation.mutate(exercise._id);
                                    }
                                  }}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </Button>
                              </div>
                            </div>

                            <p className="mt-2 text-[11px] font-medium text-violet-700/80">
                              Tap to view details
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}

                {globalExercises.length > 0 ? (
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Global exercise library
                      </h3>
                      <Badge
                        variant="secondary"
                        className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                      >
                        {globalExercises.length}
                      </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {globalExercises.map((exercise) => (
                        <article key={exercise._id} className="h-full">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => openDetailsModal(exercise)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openDetailsModal(exercise);
                              }
                            }}
                            aria-label={`View details for ${exercise.name}`}
                            className="flex h-full cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-slate-900">
                                  {exercise.name}
                                </h4>
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatEnumLabel(exercise.category)} •{" "}
                                  {formatEnumLabel(exercise.difficulty)}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                              >
                                Global
                              </Badge>
                            </div>

                            {exercise.description ? (
                              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">
                                {exercise.description}
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-slate-400">
                                No description provided.
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {exercise.muscleGroups.slice(0, 4).map((muscle) => (
                                <Badge
                                  key={`${exercise._id}-${muscle}`}
                                  variant="secondary"
                                  className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                                >
                                  {formatEnumLabel(muscle)}
                                </Badge>
                              ))}
                              {exercise.muscleGroups.length > 4 ? (
                                <Badge
                                  variant="secondary"
                                  className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                                >
                                  +{exercise.muscleGroups.length - 4}
                                </Badge>
                              ) : null}
                            </div>

                            <p className="mt-2 text-[11px] font-medium text-indigo-700/80">
                              Tap to view details
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}

                {pagination.totalPages > 1 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                    <p className="text-sm text-slate-600">
                      Page {pagination.page} of {pagination.totalPages}
                      {Number.isFinite(pagination.total)
                        ? ` • ${pagination.total} total`
                        : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(pagination.totalPages, p + 1))
                        }
                        disabled={page === pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {selectedExerciseId ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/55 p-4"
          onClick={closeDetailsModal}
        >
          <Card
            className="w-full max-w-2xl border-slate-200/90 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">
                    {selectedExerciseDetail?.name || "Exercise details"}
                  </CardTitle>
                  <CardDescription>
                    Complete exercise information for coaching and plan writing.
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close exercise details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="max-h-[calc(100vh-9rem)] space-y-4 overflow-y-auto pt-5">
              {!selectedExerciseDetail && isSelectedExerciseLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading exercise details...
                </div>
              ) : selectedExerciseDetail ? (
                <>
                  <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">Exercise animation</h4>
                      {isSelectedExerciseFetching ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Fetching...
                        </span>
                      ) : null}
                    </div>

                    <ExerciseAnimation
                      animationUrl={selectedExerciseDetail.animationUrl}
                      thumbnailUrl={selectedExerciseDetail.thumbnailUrl}
                      exerciseName={selectedExerciseDetail.name}
                      size="large"
                      autoPlay
                      showControls
                    />

                    {isSelectedExerciseError ? (
                      <p className="mt-2 text-xs text-amber-700">
                        Could not refresh latest media from server. Showing available details.
                      </p>
                    ) : null}
                  </section>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={selectedExerciseDetail.isCustom ? "default" : "secondary"}
                      className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                    >
                      {selectedExerciseDetail.isCustom ? "Custom" : "Global"}
                    </Badge>
                    <Badge
                      variant={selectedExerciseDetail.isActive ? "success" : "danger"}
                      className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                    >
                      {selectedExerciseDetail.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                    >
                      {formatEnumLabel(selectedExerciseDetail.category)}
                    </Badge>
                    <Badge
                      variant={getDifficultyVariant(selectedExerciseDetail.difficulty)}
                      className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                    >
                      {formatEnumLabel(selectedExerciseDetail.difficulty)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                    >
                      Equipment: {formatEnumLabel(Array.isArray(selectedExerciseDetail.equipment)
                        ? selectedExerciseDetail.equipment[0]
                        : selectedExerciseDetail.equipment)}
                    </Badge>
                  </div>

                  <section>
                    <h4 className="text-sm font-semibold text-slate-900">Description</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {selectedExerciseDetail.description?.trim() || "No description added."}
                    </p>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold text-slate-900">Muscle groups</h4>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(selectedExerciseDetail.muscleGroups?.length
                        ? selectedExerciseDetail.muscleGroups
                        : ["Not set"]
                      ).map((muscle) => (
                        <Badge
                          key={`${selectedExerciseDetail._id}-detail-${muscle}`}
                          variant="secondary"
                          className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                        >
                          {formatEnumLabel(muscle)}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold text-slate-900">Instructions</h4>
                    {selectedExerciseDetail.instructions?.length ? (
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-600">
                        {selectedExerciseDetail.instructions.map((step, index) => (
                          <li key={`${selectedExerciseDetail._id}-instruction-${index}`}>
                            {step}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        No instructions added yet.
                      </p>
                    )}
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold text-slate-900">Tips</h4>
                    {selectedExerciseDetail.tips?.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
                        {selectedExerciseDetail.tips.map((tip, index) => (
                          <li key={`${selectedExerciseDetail._id}-tip-${index}`}>{tip}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        No tips added yet.
                      </p>
                    )}
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-500">
                    <p>
                      Created by: {selectedExerciseDetail.createdBy?.name || "System"}
                    </p>
                    <p className="mt-1">
                      Added on: {formatDateLabel(selectedExerciseDetail.createdAt)}
                    </p>
                  </section>
                </>
              ) : (
                <p className="py-4 text-sm text-slate-500">Unable to load this exercise right now.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/55 p-4"
          onClick={closeModal}
        >
          <Card
            className="w-full max-w-3xl border-slate-200/90 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">
                    {editingExercise
                      ? "Edit exercise"
                      : "Create custom exercise"}
                  </CardTitle>
                  <CardDescription>
                    Add clear movement data to simplify plan creation.
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close exercise modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="max-h-[calc(100vh-9rem)] overflow-y-auto pt-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClassName}>Exercise name *</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    placeholder="e.g., Barbell Squat"
                  />
                </div>

                <div>
                  <label className={labelClassName}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className={textAreaFieldClassName}
                    placeholder="Brief description of the exercise"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClassName}>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className={selectFieldClassName}
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {formatEnumLabel(cat)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClassName}>Difficulty *</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          difficulty: e.target.value,
                        }))
                      }
                      className={selectFieldClassName}
                      required
                    >
                      {DIFFICULTIES.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {formatEnumLabel(difficulty)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClassName}>Equipment</label>
                  <select
                    value={formData.equipment || "none"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        equipment: e.target.value,
                      }))
                    }
                    className={selectFieldClassName}
                  >
                    {EQUIPMENT_LIST.map((equipment) => (
                      <option key={equipment} value={equipment}>
                        {formatEnumLabel(equipment)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClassName}>Muscle groups</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {MUSCLE_GROUPS.map((muscle) => {
                      const selected = formData.muscleGroups.includes(muscle);

                      return (
                        <button
                          key={muscle}
                          type="button"
                          onClick={() => toggleMuscleGroup(muscle)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                            selected
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                          )}
                        >
                          {formatEnumLabel(muscle)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={labelClassName}>Instructions</label>
                  <div className="space-y-2">
                    {formData.instructions.map((instruction, index) => (
                      <div
                        key={`instruction-${index}`}
                        className="flex items-start gap-2"
                      >
                        <Input
                          type="text"
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder={`Step ${index + 1}`}
                        />
                        {formData.instructions.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeInstruction(index)}
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                            aria-label={`Remove instruction ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInstruction}
                    className="mt-2 w-full sm:w-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Step
                  </Button>
                </div>

                <div>
                  <label className={labelClassName}>Tips (optional)</label>
                  <div className="space-y-2">
                    {formData.tips.map((tip, index) => (
                      <div key={`tip-${index}`} className="flex items-start gap-2">
                        <Input
                          type="text"
                          value={tip}
                          onChange={(e) => updateTip(index, e.target.value)}
                          placeholder={`Tip ${index + 1}`}
                        />
                        {formData.tips.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeTip(index)}
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                            aria-label={`Remove tip ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTip}
                    className="mt-2 w-full sm:w-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Tip
                  </Button>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isFormPending}>
                    {isFormPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingExercise ? (
                      "Update Exercise"
                    ) : (
                      "Create Exercise"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
        </div>
  );
}
