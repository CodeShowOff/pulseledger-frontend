// components/coach/WorkoutPlanForm.tsx
"use client";

import React, { useState } from "react";
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
  Check,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
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
type ExerciseFormValue = NonNullable<FormValues["weeklySchedule"][number]["exercises"]>[number];

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

type SubscriptionPlan = {
  _id: string;
  title: string;
};

function normalizeSubscriptionPlans(payload: unknown): SubscriptionPlan[] {
  if (Array.isArray(payload)) return payload as SubscriptionPlan[];

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    const direct = obj["data"];
    if (Array.isArray(direct)) return direct as SubscriptionPlan[];

    if (direct && typeof direct === "object") {
      const nested = direct as Record<string, unknown>;
      if (Array.isArray(nested["data"])) return nested["data"] as SubscriptionPlan[];
      if (Array.isArray(nested["plans"])) return nested["plans"] as SubscriptionPlan[];
    }

    if (Array.isArray(obj["plans"])) return obj["plans"] as SubscriptionPlan[];
  }

  return [];
}

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
      return res.data;
    },
  });
  const subscriptionPlans = normalizeSubscriptionPlans(coachPlansData);

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
    exercises: [] as { exerciseId?: string; exerciseName: string; reps?: string; weight?: string; duration?: string; restSeconds?: number; notes?: string; order: number }[],
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
      exercises: day.workouts?.flatMap(w => w.exercises || []).map((ex, idx) => {
        // Handle exerciseId being either a string or an object with _id
        const exerciseId = typeof ex.exerciseId === "string" ? ex.exerciseId : ex.exerciseId?._id;
        const exerciseName = typeof ex.exerciseId === 'object' && ex.exerciseId?.name
          ? ex.exerciseId.name
          : ex.exerciseName || "";
        
        return {
          exerciseId,
          exerciseName,
          reps: ex.reps?.toString() || "",
          weight: ex.weight || "",
          duration: ex.duration?.toString() || "",
          restSeconds: ex.restSeconds,
          notes: ex.notes || "",
          order: idx + 1,
        };
      }) || [],
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
    field: keyof ExerciseFormValue,
    value: ExerciseFormValue[keyof ExerciseFormValue]
  ) => {
    setValue(
      `weeklySchedule.${dayIndex}.exercises.${exerciseIndex}.${field}` as any,
      value as any,
      {
        shouldDirty: true,
        shouldTouch: true,
      }
    );
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

  const labelClass = "mb-1.5 block text-[0.82rem] font-semibold tracking-wide text-slate-700";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";
  const compactInputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <section className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Basic Information</h2>
            <p className="mt-1 text-sm text-slate-500">
              Define plan identity and subscription linkage before building sessions.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
            Step 1
          </span>
        </div>

        <div>
          <label className={labelClass}>Plan Name *</label>
          <input
            {...register("name")}
            className={inputClass}
            placeholder="e.g., 12-Week Strength Program"
          />
          {errors.name && (
            <p className="mt-1 text-xs font-medium text-rose-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Category</label>
            <select {...register("category")} className={inputClass}>
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Difficulty</label>
            <select {...register("difficulty")} className={inputClass}>
              <option value="">Select...</option>
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Duration (weeks)</label>
            <input
              type="number"
              {...register("durationWeeks")}
              className={inputClass}
              min={1}
              max={52}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            {...register("description")}
            className={`${inputClass} min-h-[120px] resize-y`}
            rows={3}
            placeholder="Describe what this workout plan is about..."
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4">
          <label className={labelClass}>Link to Subscription Plans</label>
          <Controller
            name="subscriptionPlanIds"
            control={control}
            render={({ field }) => (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {subscriptionPlans.map((sp: any) => {
                  const selected = field.value?.includes(sp._id);
                  return (
                    <label
                      key={sp._id}
                      className={`inline-flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-all ${
                        selected
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
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
                      <span
                        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? "border-indigo-500 bg-indigo-500 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="min-w-0 truncate font-medium">{sp.title}</span>
                    </label>
                  );
                })}
                {subscriptionPlans.length === 0 && (
                  <p className="text-sm text-slate-500">No subscription plans available</p>
                )}
              </div>
            )}
          />
          <p className="mt-1 text-xs text-slate-500">
            Clients subscribed to these plans will automatically get this workout plan
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Weekly Schedule</h2>
            <p className="mt-1 text-sm text-slate-500">Expand each day to assign exercises and session details.</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
            Step 2
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {scheduleFields.map((dayField, dayIndex) => {
            const day = watchSchedule[dayIndex];
            const isExpanded = expandedDays.includes(dayIndex);

            return (
              <div
                key={dayField.id}
                className={`${day.isRestDay ? "bg-slate-50" : "bg-white"} ${
                  dayIndex < scheduleFields.length - 1 ? "border-b border-slate-200" : ""
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50/70"
                  onClick={() => toggleDay(dayIndex)}
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-slate-800">{day.dayName}</span>
                    {day.isRestDay ? (
                      <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        Rest Day
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        {day.exercises?.length || 0} exercises
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t border-slate-200 px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex min-w-[96px] items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
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
                            setValue(
                              `weeklySchedule.${dayIndex}.sessionName` as any,
                              e.target.value,
                              {
                                shouldDirty: true,
                                shouldTouch: true,
                              }
                            )
                          }
                          className={`${inputClass} min-w-0 flex-1`}
                        />
                      )}
                    </div>

                    {!day.isRestDay && (
                      <>
                        <div className="space-y-2">
                          {(day.exercises?.length ?? 0) === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-sm text-slate-500">
                              No exercises added yet. Click <span className="font-semibold text-slate-700">Add Exercise</span> to start building this day.
                            </div>
                          ) : (
                            day.exercises?.map((ex, exIndex) => (
                              <div
                                key={exIndex}
                                className="grid grid-cols-1 gap-2 rounded-md bg-slate-50 p-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))_auto]"
                              >
                                <div className="flex min-w-0 items-center gap-2 sm:col-span-2 lg:col-span-1">
                                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                  <span className="truncate text-sm font-medium text-slate-800">
                                    {ex.exerciseName}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`exercise-reps-${dayIndex}-${exIndex}`}
                                    className="block text-[11px] font-medium uppercase tracking-wide text-slate-500"
                                  >
                                    Reps
                                  </label>
                                  <input
                                    id={`exercise-reps-${dayIndex}-${exIndex}`}
                                    type="text"
                                    placeholder="10"
                                    value={ex.reps || ""}
                                    onChange={(e) =>
                                      updateExercise(dayIndex, exIndex, "reps", e.target.value)
                                    }
                                    className={compactInputClass}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`exercise-duration-${dayIndex}-${exIndex}`}
                                    className="block text-[11px] font-medium uppercase tracking-wide text-slate-500"
                                  >
                                    Duration (s)
                                  </label>
                                  <input
                                    id={`exercise-duration-${dayIndex}-${exIndex}`}
                                    type="number"
                                    placeholder="60"
                                    value={ex.duration || ""}
                                    onChange={(e) =>
                                      updateExercise(dayIndex, exIndex, "duration", e.target.value)
                                    }
                                    className={compactInputClass}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`exercise-weight-${dayIndex}-${exIndex}`}
                                    className="block text-[11px] font-medium uppercase tracking-wide text-slate-500"
                                  >
                                    Weight
                                  </label>
                                  <input
                                    id={`exercise-weight-${dayIndex}-${exIndex}`}
                                    type="text"
                                    placeholder="e.g., 20kg"
                                    value={ex.weight || ""}
                                    onChange={(e) =>
                                      updateExercise(dayIndex, exIndex, "weight", e.target.value)
                                    }
                                    className={compactInputClass}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`exercise-rest-${dayIndex}-${exIndex}`}
                                    className="block text-[11px] font-medium uppercase tracking-wide text-slate-500"
                                  >
                                    Rest (s)
                                  </label>
                                  <input
                                    id={`exercise-rest-${dayIndex}-${exIndex}`}
                                    type="number"
                                    placeholder="20"
                                    value={ex.restSeconds || ""}
                                    onChange={(e) =>
                                      updateExercise(
                                        dayIndex,
                                        exIndex,
                                        "restSeconds",
                                        e.target.value === ""
                                          ? undefined
                                          : parseInt(e.target.value, 10) || 0
                                      )
                                    }
                                    className={compactInputClass}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeExercise(dayIndex, exIndex)}
                                  className="inline-flex items-center justify-center rounded-md bg-rose-100 p-2 text-rose-600 transition hover:bg-rose-200 sm:col-span-2 sm:justify-self-end lg:col-span-1"
                                  aria-label={`Remove ${ex.exerciseName}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {showExercisePicker?.dayIndex === dayIndex ? (
                          <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white px-2">
                                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Search exercises..."
                                  value={exerciseSearch}
                                  onChange={(e) => setExerciseSearch(e.target.value)}
                                  className="w-full border-0 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                                  autoFocus
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowExercisePicker(null);
                                  setExerciseSearch("");
                                }}
                                className="w-full rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 sm:w-auto"
                              >
                                Cancel
                              </button>
                            </div>
                            <div className="flex max-h-[200px] flex-col gap-1 overflow-y-auto">
                              {exercises.map((ex) => (
                                <button
                                  key={ex._id}
                                  type="button"
                                  onClick={() => addExercise(dayIndex, ex)}
                                  className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                                >
                                  <Dumbbell className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                                  <span className="min-w-0 flex-1 truncate">{ex.name}</span>
                                  {ex.isCustom && (
                                    <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                                      CUSTOM
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-400">{ex.category}</span>
                                </button>
                              ))}
                              {exercises.length === 0 && (
                                <p className="px-2 py-4 text-center text-sm text-slate-500">
                                  No exercises found. Admin needs to add exercises to the
                                  library.
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowExercisePicker({ dayIndex })}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 sm:w-auto"
                          >
                            <Plus className="h-4 w-4" />
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
      </section>

      <div className="mt-1 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onClick={() => router.back()}
          variant="outline"
          size="lg"
          className="h-11 w-full rounded-2xl border-slate-300 px-5 text-sm font-semibold text-slate-700 sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            setValue("isDraft", true);
            handleSubmit(onSubmit)();
          }}
          variant="outline"
          size="lg"
          className="h-11 w-full rounded-2xl border-slate-300 px-5 text-sm font-semibold text-slate-700 sm:w-auto"
          disabled={isSubmitting}
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-2xl px-6 text-sm font-semibold sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </form>
  );
}
