// components/coach/WorkoutPlanForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Dumbbell,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  useCreateCoachWorkoutPlan,
  useUpdateCoachWorkoutPlan,
  useExercises,
  type CoachWorkoutPlan,
  type Exercise,
} from "@/lib/queries/workouts";

// Schema
const exerciseSchema = z.object({
  exerciseId: z.string().optional(),
  exerciseName: z.string().min(1, "Exercise name required"),
  sets: z.coerce.number().min(1).optional(),
  reps: z.string().optional(),
  weight: z.string().optional(),
  duration: z.string().optional(),
  restSeconds: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  order: z.number(),
});

const sessionSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  dayName: z.string(),
  sessionName: z.string().optional(),
  isRestDay: z.boolean(),
  exercises: z.array(exerciseSchema).optional(),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  durationWeeks: z.coerce.number().min(1).max(52).optional(),
  subscriptionPlanIds: z.array(z.string()).optional(),
  weeklySchedule: z.array(sessionSchema),
  isDraft: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const CATEGORIES = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "yoga", label: "Yoga" },
  { value: "hiit", label: "HIIT" },
  { value: "flexibility", label: "Flexibility" },
  { value: "endurance", label: "Endurance" },
  { value: "general_fitness", label: "General Fitness" },
  { value: "custom", label: "Custom" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

type Props = {
  plan?: CoachWorkoutPlan;
  onSuccess?: () => void;
};

export default function WorkoutPlanForm({ plan, onSuccess }: Props) {
  const router = useRouter();
  const [expandedDays, setExpandedDays] = useState<number[]>([1]); // Monday expanded by default
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [showExercisePicker, setShowExercisePicker] = useState<{
    dayIndex: number;
  } | null>(null);

  const createMutation = useCreateCoachWorkoutPlan();
  const updateMutation = useUpdateCoachWorkoutPlan();

  // Fetch coach's subscription plans
  const { data: coachPlansData } = useQuery({
    queryKey: ["coachPlans"],
    queryFn: async () => {
      const res = await api.get("/plans?limit=100");
      return res.data.data;
    },
  });
  const subscriptionPlans = coachPlansData ?? [];

  // Fetch exercises for picker
  const { data: exercisesData } = useExercises({
    limit: 50,
    search: exerciseSearch || undefined,
  });
  const exercises: Exercise[] = exercisesData?.data ?? [];

  const defaultSchedule = DAYS.map((day) => ({
    dayOfWeek: day.value,
    dayName: day.label,
    sessionName: "",
    isRestDay: day.value === 0 || day.value === 6, // Weekend rest by default
    exercises: [] as { exerciseId?: string; exerciseName: string; sets?: number; reps?: string; weight?: string; duration?: string; restSeconds?: number; notes?: string; order: number }[],
  }));

  // Transform backend data (weeklySchedule[].workouts[].exercises) to form format (weeklySchedule[].exercises)
  const transformPlanToFormSchedule = () => {
    if (!plan?.weeklySchedule) return defaultSchedule;
    return plan.weeklySchedule.map((day) => ({
      dayOfWeek: day.dayOfWeek ?? (day.dayNumber ? day.dayNumber - 1 : 0),
      dayName:
        day.dayName ||
        DAYS.find((d) => d.value === (day.dayOfWeek ?? (day.dayNumber ? day.dayNumber - 1 : 0)))
          ?.label ||
        "",
      sessionName: day.focusArea || day.workouts?.[0]?.name || "",
      isRestDay: day.isRestDay,
      exercises: day.workouts?.flatMap(w => w.exercises || []).map((ex, idx) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName || "",
        sets: ex.sets,
        reps: ex.reps?.toString() || "",
        weight: ex.weight || "",
        duration: ex.duration?.toString() || "",
        restSeconds: ex.restSeconds,
        notes: ex.notes || "",
        order: idx + 1,
      })) || [],
    }));
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      category: plan?.category || "",
      difficulty: plan?.difficulty || "intermediate",
      durationWeeks: plan?.durationWeeks || 4,
      subscriptionPlanIds: plan?.subscriptionPlanIds?.map((p) => p._id) || [],
      weeklySchedule: transformPlanToFormSchedule(),
      isDraft: plan?.isDraft ?? false,
    },
  });

  const { fields: scheduleFields, update: updateSchedule } = useFieldArray({
    control,
    name: "weeklySchedule",
  });

  const watchSchedule = watch("weeklySchedule");

  const toggleDay = (dayIndex: number) => {
    setExpandedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const toggleRestDay = (dayIndex: number) => {
    const currentDay = watchSchedule[dayIndex];
    updateSchedule(dayIndex, {
      ...currentDay,
      isRestDay: !currentDay.isRestDay,
      exercises: !currentDay.isRestDay ? [] : currentDay.exercises,
    });
  };

  const addExercise = (dayIndex: number, exercise: Exercise) => {
    const currentDay = watchSchedule[dayIndex];
    const newExercise = {
      exerciseId: exercise._id,
      exerciseName: exercise.name,
      sets: 3,
      reps: "10",
      weight: "",
      duration: "",
      restSeconds: 60,
      notes: "",
      order: (currentDay.exercises?.length || 0) + 1,
    };
    updateSchedule(dayIndex, {
      ...currentDay,
      exercises: [...(currentDay.exercises || []), newExercise],
    });
    setShowExercisePicker(null);
    setExerciseSearch("");
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const currentDay = watchSchedule[dayIndex];
    const newExercises = [...(currentDay.exercises || [])];
    newExercises.splice(exerciseIndex, 1);
    // Reorder
    newExercises.forEach((ex, idx) => (ex.order = idx + 1));
    updateSchedule(dayIndex, {
      ...currentDay,
      exercises: newExercises,
    });
  };

  const updateExercise = (
    dayIndex: number,
    exerciseIndex: number,
    field: string,
    value: any
  ) => {
    const currentDay = watchSchedule[dayIndex];
    const newExercises = [...(currentDay.exercises || [])];
    newExercises[exerciseIndex] = {
      ...newExercises[exerciseIndex],
      [field]: value,
    };
    updateSchedule(dayIndex, {
      ...currentDay,
      exercises: newExercises,
    });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Transform weeklySchedule to match backend structure
      // Backend expects: weeklySchedule[].workouts[].exercises
      // Frontend form uses: weeklySchedule[].exercises (simpler for UI)
      const transformedData = {
        ...data,
        weeklySchedule: data.weeklySchedule.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          dayName: day.dayName,
          isRestDay: day.isRestDay,
          focusArea: day.sessionName || undefined,
          workouts: day.isRestDay ? [] : [{
            name: day.sessionName || "Workout",
            exercises: (day.exercises || []).map((ex, idx) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              order: idx + 1,
              sets: ex.sets,
              reps: ex.reps ? parseInt(ex.reps) || undefined : undefined,
              duration: ex.duration ? parseInt(ex.duration) || undefined : undefined,
              restSeconds: ex.restSeconds,
              weight: ex.weight || undefined,
              notes: ex.notes || undefined,
            })),
          }],
        })),
      };

      if (plan) {
        await updateMutation.mutateAsync({
          id: plan._id,
          data: transformedData as any,
        });
        toast.success("Workout plan updated");
      } else {
        await createMutation.mutateAsync(transformedData as any);
        toast.success("Workout plan created");
      }
      onSuccess?.();
      router.push("/coach/workout-plans");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save workout plan");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="coach-plan-form">
      {/* Basic Info Section */}
      <div className="coach-plan-form__section coach-plan-form__section--main">
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
          Basic Information
        </h2>

        <div className="coach-plan-form__row">
          <div className="auth-form__field" style={{ flex: 2 }}>
            <label className="auth-form__label">Plan Name *</label>
            <input
              {...register("name")}
              className="auth-form__input"
              placeholder="e.g., 12-Week Strength Program"
            />
            {errors.name && (
              <p className="auth-form__error">{errors.name.message}</p>
            )}
          </div>

          <div className="auth-form__field" style={{ flex: 1 }}>
            <label className="auth-form__label">Difficulty</label>
            <select {...register("difficulty")} className="auth-form__input">
              <option value="">Select...</option>
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="coach-plan-form__row">
          <div className="auth-form__field" style={{ flex: 1 }}>
            <label className="auth-form__label">Category</label>
            <select {...register("category")} className="auth-form__input">
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-form__field" style={{ flex: 1 }}>
            <label className="auth-form__label">Duration (weeks)</label>
            <input
              type="number"
              {...register("durationWeeks")}
              className="auth-form__input"
              min={1}
              max={52}
            />
          </div>
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label">Description</label>
          <textarea
            {...register("description")}
            className="auth-form__input"
            rows={3}
            placeholder="Describe what this workout plan is about..."
          />
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label">Link to Subscription Plans</label>
          <Controller
            name="subscriptionPlanIds"
            control={control}
            render={({ field }) => (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {subscriptionPlans.map((sp: any) => (
                  <label
                    key={sp._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: field.value?.includes(sp._id)
                        ? "#eff6ff"
                        : "#fff",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={field.value?.includes(sp._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...(field.value || []), sp._id]);
                        } else {
                          field.onChange(
                            field.value?.filter((id: string) => id !== sp._id)
                          );
                        }
                      }}
                    />
                    {sp.title}
                  </label>
                ))}
                {subscriptionPlans.length === 0 && (
                  <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                    No subscription plans available
                  </p>
                )}
              </div>
            )}
          />
          <p className="coach-plan-form__hint">
            Clients subscribed to these plans will automatically get this
            workout plan
          </p>
        </div>
      </div>

      {/* Weekly Schedule Section */}
      <div className="coach-plan-form__section">
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
          Weekly Schedule
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {scheduleFields.map((dayField, dayIndex) => {
            const day = watchSchedule[dayIndex];
            const isExpanded = expandedDays.includes(dayIndex);

            return (
              <div
                key={dayField.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: day.isRestDay ? "#f9fafb" : "#fff",
                }}
              >
                {/* Day Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    borderBottom: isExpanded ? "1px solid #e5e7eb" : "none",
                  }}
                  onClick={() => toggleDay(dayIndex)}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {day.dayName}
                    </span>
                    {day.isRestDay ? (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "999px",
                          backgroundColor: "#f3f4f6",
                          color: "#6b7280",
                        }}
                      >
                        Rest Day
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "999px",
                          backgroundColor: "#dbeafe",
                          color: "#2563eb",
                        }}
                      >
                        {day.exercises?.length || 0} exercises
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp style={{ width: 18, height: 18, color: "#6b7280" }} />
                  ) : (
                    <ChevronDown style={{ width: 18, height: 18, color: "#6b7280" }} />
                  )}
                </div>

                {/* Day Content */}
                {isExpanded && (
                  <div style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.85rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={day.isRestDay}
                          onChange={() => toggleRestDay(dayIndex)}
                        />
                        Rest Day
                      </label>

                      {!day.isRestDay && (
                        <input
                          type="text"
                          placeholder="Session name (e.g., Upper Body)"
                          value={day.sessionName || ""}
                          onChange={(e) =>
                            updateSchedule(dayIndex, {
                              ...day,
                              sessionName: e.target.value,
                            })
                          }
                          style={{
                            flex: 1,
                            padding: "0.4rem 0.75rem",
                            fontSize: "0.85rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                          }}
                        />
                      )}
                    </div>

                    {!day.isRestDay && (
                      <>
                        {/* Exercises List */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            marginBottom: "1rem",
                          }}
                        >
                          {day.exercises?.map((ex, exIndex) => (
                            <div
                              key={exIndex}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                                gap: "0.5rem",
                                alignItems: "center",
                                padding: "0.5rem",
                                backgroundColor: "#f9fafb",
                                borderRadius: "6px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <GripVertical
                                  style={{
                                    width: 14,
                                    height: 14,
                                    color: "#9ca3af",
                                    cursor: "grab",
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: "0.85rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  {ex.exerciseName}
                                </span>
                              </div>
                              <input
                                type="number"
                                placeholder="Sets"
                                value={ex.sets || ""}
                                onChange={(e) =>
                                  updateExercise(
                                    dayIndex,
                                    exIndex,
                                    "sets",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                style={{
                                  padding: "0.35rem",
                                  fontSize: "0.8rem",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "4px",
                                  width: "100%",
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Reps"
                                value={ex.reps || ""}
                                onChange={(e) =>
                                  updateExercise(
                                    dayIndex,
                                    exIndex,
                                    "reps",
                                    e.target.value
                                  )
                                }
                                style={{
                                  padding: "0.35rem",
                                  fontSize: "0.8rem",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "4px",
                                  width: "100%",
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Weight"
                                value={ex.weight || ""}
                                onChange={(e) =>
                                  updateExercise(
                                    dayIndex,
                                    exIndex,
                                    "weight",
                                    e.target.value
                                  )
                                }
                                style={{
                                  padding: "0.35rem",
                                  fontSize: "0.8rem",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "4px",
                                  width: "100%",
                                }}
                              />
                              <input
                                type="number"
                                placeholder="Rest (s)"
                                value={ex.restSeconds || ""}
                                onChange={(e) =>
                                  updateExercise(
                                    dayIndex,
                                    exIndex,
                                    "restSeconds",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                style={{
                                  padding: "0.35rem",
                                  fontSize: "0.8rem",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "4px",
                                  width: "100%",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeExercise(dayIndex, exIndex)}
                                style={{
                                  padding: "0.35rem",
                                  backgroundColor: "#fee2e2",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2
                                  style={{ width: 14, height: 14, color: "#dc2626" }}
                                />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Exercise Button / Picker */}
                        {showExercisePicker?.dayIndex === dayIndex ? (
                          <div
                            style={{
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              padding: "0.75rem",
                              backgroundColor: "#fff",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "0.75rem",
                              }}
                            >
                              <Search
                                style={{ width: 16, height: 16, color: "#9ca3af" }}
                              />
                              <input
                                type="text"
                                placeholder="Search exercises..."
                                value={exerciseSearch}
                                onChange={(e) => setExerciseSearch(e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: "0.4rem",
                                  fontSize: "0.85rem",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "6px",
                                }}
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setShowExercisePicker(null);
                                  setExerciseSearch("");
                                }}
                                style={{
                                  padding: "0.4rem 0.75rem",
                                  fontSize: "0.8rem",
                                  backgroundColor: "#f3f4f6",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                            <div
                              style={{
                                maxHeight: "200px",
                                overflowY: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.25rem",
                              }}
                            >
                              {exercises.map((ex) => (
                                <button
                                  key={ex._id}
                                  type="button"
                                  onClick={() => addExercise(dayIndex, ex)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.5rem 0.75rem",
                                    fontSize: "0.85rem",
                                    backgroundColor: "#f9fafb",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                  }}
                                >
                                  <Dumbbell
                                    style={{
                                      width: 14,
                                      height: 14,
                                      color: "#2563eb",
                                    }}
                                  />
                                  <span>{ex.name}</span>
                                  {ex.isCustom && (
                                    <span
                                      style={{
                                        fontSize: "0.6rem",
                                        padding: "0.1rem 0.35rem",
                                        backgroundColor: "#f3e8ff",
                                        color: "#8b5cf6",
                                        borderRadius: "999px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      CUSTOM
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      color: "#9ca3af",
                                      marginLeft: "auto",
                                    }}
                                  >
                                    {ex.category}
                                  </span>
                                </button>
                              ))}
                              {exercises.length === 0 && (
                                <p
                                  style={{
                                    padding: "1rem",
                                    textAlign: "center",
                                    color: "#6b7280",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  No exercises found. Admin needs to add exercises
                                  to the library.
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowExercisePicker({ dayIndex })}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.5rem 1rem",
                              fontSize: "0.85rem",
                              backgroundColor: "#eff6ff",
                              border: "1px solid #dbeafe",
                              borderRadius: "6px",
                              color: "#2563eb",
                              cursor: "pointer",
                            }}
                          >
                            <Plus style={{ width: 16, height: 16 }} />
                            Add Exercise
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="coach-plan-form__actions">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn--outline"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            setValue("isDraft", true);
            handleSubmit(onSubmit)();
          }}
          className="btn btn--outline"
          disabled={isSubmitting}
        >
          Save as Draft
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
        </button>
      </div>
    </form>
  );
}
