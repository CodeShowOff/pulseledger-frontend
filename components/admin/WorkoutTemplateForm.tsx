"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useCreateWorkoutTemplate,
  useUpdateWorkoutTemplate,
  useExercises,
  type WorkoutTemplate,
  type WorkoutTemplateDay,
  type WorkoutTemplateExercise,
  type Exercise,
} from "@/lib/queries/workouts";

const DAYS = [
  { dayNumber: 1, dayName: "Monday" },
  { dayNumber: 2, dayName: "Tuesday" },
  { dayNumber: 3, dayName: "Wednesday" },
  { dayNumber: 4, dayName: "Thursday" },
  { dayNumber: 5, dayName: "Friday" },
  { dayNumber: 6, dayName: "Saturday" },
  { dayNumber: 7, dayName: "Sunday" },
];

const CATEGORIES = [
  "strength",
  "cardio",
  "weight_loss",
  "muscle_gain",
  "yoga",
  "hiit",
  "flexibility",
  "endurance",
  "general_fitness",
  "sports_specific",
  "rehabilitation",
] as const;

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const templateExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  order: z.number().min(1),
  sets: z.coerce.number().min(1).max(20).optional(),
  reps: z.coerce.number().min(1).max(100).optional(),
  duration: z.coerce.number().min(1).max(3600).optional(),
  restSeconds: z.coerce.number().min(0).max(600).optional(),
  notes: z.string().max(300).optional(),
});

const templateDaySchema = z.object({
  dayNumber: z.coerce.number().min(1).max(7),
  dayName: z.string().optional(),
  isRestDay: z.boolean(),
  focusArea: z.string().max(100).optional(),
  estimatedDuration: z.coerce.number().min(0).max(300).optional(),
  exercises: z.array(templateExerciseSchema).optional(),
});

const formSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(2000).optional(),
  category: z.enum(CATEGORIES),
  difficulty: z.enum(DIFFICULTIES).optional(),
  durationWeeks: z.coerce.number().min(1).max(52).optional(),
  daysPerWeek: z.coerce.number().min(1).max(7).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  targetAudience: z.string().max(200).optional(),
  equipmentRequired: z.string().optional(),
  tags: z.string().optional(),
  weeklySchedule: z.array(templateDaySchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function defaultSchedule(): WorkoutTemplateDay[] {
  return DAYS.map((d) => ({
    dayNumber: d.dayNumber,
    dayName: d.dayName,
    isRestDay: d.dayNumber === 6 || d.dayNumber === 7,
    focusArea: "",
    estimatedDuration: undefined,
    exercises: [],
  }));
}

function exerciseIdToString(exerciseId: WorkoutTemplateExercise["exerciseId"]): string {
  return typeof exerciseId === "string" ? exerciseId : exerciseId._id;
}

type Props = {
  template?: WorkoutTemplate;
};

export default function WorkoutTemplateForm({ template }: Props) {
  const router = useRouter();
  const createMutation = useCreateWorkoutTemplate();
  const updateMutation = useUpdateWorkoutTemplate();

  const [exerciseSearch, setExerciseSearch] = useState("");
  const [dayPickerOpen, setDayPickerOpen] = useState<number | null>(null);

  const { data: exercisesData, isLoading: exercisesLoading } = useExercises({
    limit: 50,
    search: exerciseSearch || undefined,
  });

  const exercises: Exercise[] = exercisesData?.data ?? [];

  const initialSchedule: WorkoutTemplateDay[] = useMemo(() => {
    if (!template?.weeklySchedule || template.weeklySchedule.length === 0) return defaultSchedule();

    // Ensure all 7 days exist in form
    const byDay = new Map<number, WorkoutTemplateDay>();
    for (const d of template.weeklySchedule) byDay.set(d.dayNumber, d);

    return DAYS.map((day) => {
      const existing = byDay.get(day.dayNumber);
      return {
        dayNumber: day.dayNumber,
        dayName: existing?.dayName || day.dayName,
        isRestDay: existing?.isRestDay ?? (day.dayNumber === 6 || day.dayNumber === 7),
        focusArea: existing?.focusArea || "",
        estimatedDuration: existing?.estimatedDuration,
        exercises:
          existing?.exercises?.map((ex, idx) => ({
            exerciseId: exerciseIdToString(ex.exerciseId),
            order: ex.order ?? idx + 1,
            sets: ex.sets,
            reps: ex.reps,
            duration: ex.duration,
            restSeconds: ex.restSeconds,
            notes: ex.notes,
          })) ?? [],
      };
    });
  }, [template]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      category: (template?.category as FormValues["category"]) || "strength",
      difficulty: (template?.difficulty as FormValues["difficulty"]) || "intermediate",
      durationWeeks: template?.durationWeeks ?? 4,
      daysPerWeek: template?.daysPerWeek ?? 5,
      isActive: template?.isActive ?? true,
      isFeatured: template?.isFeatured ?? false,
      targetAudience: template?.targetAudience || "",
      equipmentRequired: (template?.equipmentRequired || []).join(", "),
      tags: (template?.tags || []).join(", "),
      weeklySchedule: initialSchedule as any,
    },
  });

  const weeklySchedule = watch("weeklySchedule") || [];

  const addExerciseToDay = (dayIndex: number, ex: Exercise) => {
    const day = weeklySchedule[dayIndex];
    const current = day?.exercises || [];
    const nextOrder = current.length + 1;

    const next = [
      ...current,
      {
        exerciseId: ex._id,
        order: nextOrder,
        sets: 3,
        reps: 10,
        duration: undefined,
        restSeconds: 60,
        notes: "",
      },
    ];

    setValue(`weeklySchedule.${dayIndex}.exercises` as any, next as any, { shouldDirty: true });
    setDayPickerOpen(null);
    setExerciseSearch("");
  };

  const removeExerciseFromDay = (dayIndex: number, exIndex: number) => {
    const day = weeklySchedule[dayIndex];
    const current = [...(day?.exercises || [])];
    current.splice(exIndex, 1);
    current.forEach((e, i) => (e.order = i + 1));
    setValue(`weeklySchedule.${dayIndex}.exercises` as any, current as any, { shouldDirty: true });
  };

  const onSubmit = async (values: FormValues) => {
    const payload: Partial<WorkoutTemplate> = {
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      difficulty: values.difficulty,
      durationWeeks: values.durationWeeks,
      daysPerWeek: values.daysPerWeek,
      isActive: values.isActive,
      isFeatured: values.isFeatured,
      targetAudience: values.targetAudience || undefined,
      equipmentRequired: values.equipmentRequired
        ? values.equipmentRequired
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      tags: values.tags
        ? values.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      weeklySchedule:
        values.weeklySchedule?.map((day) => ({
          dayNumber: day.dayNumber,
          dayName: day.dayName,
          isRestDay: day.isRestDay,
          focusArea: day.focusArea || undefined,
          estimatedDuration: day.estimatedDuration,
          exercises:
            day.isRestDay
              ? []
              : (day.exercises || []).map((ex, idx) => ({
                  exerciseId: ex.exerciseId,
                  order: ex.order ?? idx + 1,
                  sets: ex.sets,
                  reps: ex.reps,
                  duration: ex.duration,
                  restSeconds: ex.restSeconds,
                  notes: ex.notes || undefined,
                })),
        })) || [],
    };

    try {
      if (template?._id) {
        await updateMutation.mutateAsync({ id: template._id, data: payload });
        toast.success("Workout template updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Workout template created");
      }
      router.push("/admin/workout-templates");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save template");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-card" style={{ padding: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Name
          </label>
          <input
            {...register("name")}
            className="admin-input"
            placeholder="e.g. Beginner Strength 4-Week"
          />
          {errors.name && (
            <p style={{ color: "var(--admin-color-danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Category
          </label>
          <select {...register("category")} className="admin-input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Difficulty
          </label>
          <select {...register("difficulty")} className="admin-input">
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
              Duration (weeks)
            </label>
            <input {...register("durationWeeks")} type="number" className="admin-input" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
              Days / week
            </label>
            <input {...register("daysPerWeek")} type="number" className="admin-input" />
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Description
          </label>
          <textarea
            {...register("description")}
            className="admin-input"
            rows={3}
            placeholder="Short overview of the template"
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Target Audience (optional)
          </label>
          <input {...register("targetAudience")} className="admin-input" placeholder="e.g. Beginners, fat loss" />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Equipment Required (comma-separated)
          </label>
          <input {...register("equipmentRequired")} className="admin-input" placeholder="e.g. Dumbbells, Yoga mat" />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Tags (comma-separated)
          </label>
          <input {...register("tags")} className="admin-input" placeholder="e.g. full body, home" />
        </div>

        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          <label style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" {...register("isActive")} />
            Active
          </label>
          <label style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" {...register("isFeatured")} />
            Featured
          </label>
        </div>
      </div>

      <hr style={{ margin: "1.25rem 0", borderColor: "var(--admin-color-border)" }} />

      <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem" }}>
        Weekly Schedule
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {weeklySchedule.map((day, dayIndex) => (
          <div key={day.dayNumber} style={{ border: "1px solid var(--admin-color-border)", borderRadius: 10, padding: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{day.dayName || `Day ${day.dayNumber}`}</div>
                <div style={{ color: "var(--admin-color-muted)", fontSize: "0.85rem" }}>
                  Day {day.dayNumber}
                </div>
              </div>

              <label style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!day.isRestDay}
                  onChange={(e) => {
                    setValue(`weeklySchedule.${dayIndex}.isRestDay` as any, e.target.checked as any, { shouldDirty: true });
                    if (e.target.checked) {
                      setValue(`weeklySchedule.${dayIndex}.exercises` as any, [] as any, { shouldDirty: true });
                    }
                  }}
                />
                Rest day
              </label>
            </div>

            {!day.isRestDay && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "0.75rem", marginTop: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Focus</label>
                    <input
                      className="admin-input"
                      value={day.focusArea || ""}
                      onChange={(e) => setValue(`weeklySchedule.${dayIndex}.focusArea` as any, e.target.value as any, { shouldDirty: true })}
                      placeholder="e.g. Upper Body"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>Est. minutes</label>
                    <input
                      className="admin-input"
                      type="number"
                      value={day.estimatedDuration ?? ""}
                      onChange={(e) => setValue(`weeklySchedule.${dayIndex}.estimatedDuration` as any, e.target.value as any, { shouldDirty: true })}
                      placeholder="45"
                    />
                  </div>
                </div>

                <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Exercises</div>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => setDayPickerOpen((prev) => (prev === dayIndex ? null : dayIndex))}
                  >
                    Add exercise
                  </button>
                </div>

                {dayPickerOpen === dayIndex && (
                  <div style={{ marginTop: "0.75rem", border: "1px solid var(--admin-color-border)", borderRadius: 10, padding: "0.75rem" }}>
                    <input
                      className="admin-input"
                      placeholder="Search exercises..."
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                    />
                    <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 220, overflow: "auto" }}>
                      {exercisesLoading ? (
                        <div style={{ color: "var(--admin-color-muted)" }}>Loading exercises...</div>
                      ) : exercises.length === 0 ? (
                        <div style={{ color: "var(--admin-color-muted)" }}>No exercises found</div>
                      ) : (
                        exercises.map((ex) => (
                          <button
                            key={ex._id}
                            type="button"
                            className="btn btn--outline"
                            style={{ justifyContent: "flex-start" }}
                            onClick={() => addExerciseToDay(dayIndex, ex)}
                          >
                            {ex.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {(day.exercises || []).length === 0 ? (
                    <div style={{ color: "var(--admin-color-muted)", fontSize: "0.85rem" }}>No exercises added.</div>
                  ) : (
                    (day.exercises || []).map((ex, exIndex) => (
                      <div
                        key={`${ex.exerciseId}-${ex.order}`}
                        style={{
                          border: "1px solid var(--admin-color-border)",
                          borderRadius: 10,
                          padding: "0.75rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
                          <div style={{ fontWeight: 600 }}>#{ex.order} · {ex.exerciseId}</div>
                          <button
                            type="button"
                            className="btn btn--outline"
                            onClick={() => removeExerciseFromDay(dayIndex, exIndex)}
                          >
                            Remove
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginTop: "0.75rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Sets</label>
                            <input
                              className="admin-input"
                              type="number"
                              value={ex.sets ?? ""}
                              onChange={(e) => setValue(`weeklySchedule.${dayIndex}.exercises.${exIndex}.sets` as any, e.target.value as any, { shouldDirty: true })}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Reps</label>
                            <input
                              className="admin-input"
                              type="number"
                              value={ex.reps ?? ""}
                              onChange={(e) => setValue(`weeklySchedule.${dayIndex}.exercises.${exIndex}.reps` as any, e.target.value as any, { shouldDirty: true })}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Duration (sec)</label>
                            <input
                              className="admin-input"
                              type="number"
                              value={ex.duration ?? ""}
                              onChange={(e) => setValue(`weeklySchedule.${dayIndex}.exercises.${exIndex}.duration` as any, e.target.value as any, { shouldDirty: true })}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Rest (sec)</label>
                            <input
                              className="admin-input"
                              type="number"
                              value={ex.restSeconds ?? ""}
                              onChange={(e) => setValue(`weeklySchedule.${dayIndex}.exercises.${exIndex}.restSeconds` as any, e.target.value as any, { shouldDirty: true })}
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: "0.5rem" }}>
                          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Notes</label>
                          <input
                            className="admin-input"
                            value={ex.notes || ""}
                            onChange={(e) => setValue(`weeklySchedule.${dayIndex}.exercises.${exIndex}.notes` as any, e.target.value as any, { shouldDirty: true })}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
        <button type="button" className="btn btn--outline" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {template?._id ? "Save Changes" : "Create Template"}
        </button>
      </div>
    </form>
  );
}
