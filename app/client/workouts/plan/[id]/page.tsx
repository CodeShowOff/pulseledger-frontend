"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Flame,
  Info,
  Play,
  Target,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import ExerciseAnimation from "@/components/shared/ExerciseAnimation";
import { getISTDayOfWeek } from "@/lib/ist";
import { cn } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Exercise {
  _id?: string;
  exerciseId?: {
    _id: string;
    name: string;
    animationUrl?: string;
    thumbnailUrl?: string;
    instructions?: string[];
    tips?: string[];
    muscleGroups?: string[];
    equipment?: string[];
    difficulty?: string;
  };
  exerciseName?: string;
  exerciseAnimationUrl?: string;
  reps?: number;
  repsMin?: number;
  repsMax?: number;
  duration?: number;
  restSeconds?: number;
  weight?: string;
  notes?: string;
  order: number;
}

interface WorkoutSession {
  _id?: string;
  name?: string;
  description?: string;
  estimatedDuration?: number;
  exercises?: Exercise[];
}

interface WorkoutDay {
  _id?: string;
  dayOfWeek?: number;
  dayNumber?: number;
  dayName?: string;
  isRestDay: boolean;
  restDayNotes?: string;
  focusArea?: string;
  workouts?: WorkoutSession[];
}

interface WorkoutPlan {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  weeklySchedule?: WorkoutDay[];
  equipmentRequired?: string[];
  isActive: boolean;
}

const getRepsLabel = (exercise: Exercise) => {
  if (exercise.repsMin && exercise.repsMax) {
    return `${exercise.repsMin}-${exercise.repsMax}`;
  }

  if (exercise.reps) {
    return `${exercise.reps}`;
  }

  return null;
};

export default function ClientWorkoutPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params?.id as string;

  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);

  const { data: plan, isLoading, error } = useQuery({
    queryKey: ["clientWorkoutPlan", planId],
    queryFn: async () => {
      const response = await api.get(`/client/workouts/plans/${planId}`);
      return response.data.data as WorkoutPlan;
    },
    enabled: !!planId,
  });

  const todayDayIndex = getISTDayOfWeek(new Date());
  const todayDayNumber = todayDayIndex === 0 ? 7 : todayDayIndex;

  const schedule = useMemo(() => plan?.weeklySchedule || [], [plan?.weeklySchedule]);

  const toggleDay = (index: number) => {
    setExpandedDays((previous) =>
      previous.includes(index) ? previous.filter((dayIndex) => dayIndex !== index) : [...previous, index]
    );
  };

  const toggleExercise = (exerciseKey: string) => {
    setExpandedExercises((previous) =>
      previous.includes(exerciseKey)
        ? previous.filter((existingKey) => existingKey !== exerciseKey)
        : [...previous, exerciseKey]
    );
  };

  if (isLoading) {
    return (
      <div className="client-page__sections space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading workout plan...
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="client-page__sections space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Dumbbell className="mx-auto h-9 w-9 text-slate-300" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Workout plan not found</h2>
          <p className="mt-1 text-sm text-slate-500">
            This plan may be inactive or no longer assigned to your account.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-page__sections space-y-4 pb-6">
      <Link
        href="/client/workouts"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workouts
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-slate-200 p-2.5 text-slate-700">
            <Dumbbell className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">{plan.name}</h1>
            {plan.description ? <p className="mt-1 text-sm text-slate-600">{plan.description}</p> : null}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
          {plan.category ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-center">
              <Target className="mr-1 inline h-3 w-3" />
              {plan.category.replace(/_/g, " ")}
            </span>
          ) : null}
          {plan.difficulty ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-center">
              <Flame className="mr-1 inline h-3 w-3" />
              {plan.difficulty}
            </span>
          ) : null}
          {plan.durationWeeks ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-center">
              <Calendar className="mr-1 inline h-3 w-3" />
              {plan.durationWeeks} weeks
            </span>
          ) : null}
          {plan.daysPerWeek ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-center">
              <Info className="mr-1 inline h-3 w-3" />
              {plan.daysPerWeek} days/week
            </span>
          ) : null}
        </div>

        {plan.equipmentRequired?.length ? (
          <div className="mt-4 -mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex min-w-max gap-2">
              {plan.equipmentRequired.map((equipment) => (
                <span
                  key={equipment}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700"
                >
                  {equipment.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Weekly schedule</h2>

        {schedule.length ? (
          <div className="space-y-2">
            {schedule.map((day, dayIndex) => {
              const isExpanded = expandedDays.includes(dayIndex);
              const scheduleDayIndex =
                typeof day.dayOfWeek === "number"
                  ? day.dayOfWeek
                  : typeof day.dayNumber === "number"
                    ? day.dayNumber % 7
                    : 0;
              const isToday =
                (typeof day.dayOfWeek === "number" && day.dayOfWeek === todayDayIndex) ||
                (typeof day.dayNumber === "number" && day.dayNumber === todayDayNumber);

              const allExercises = day.workouts?.flatMap((workout) => workout.exercises || []) || [];

              return (
                <article
                  key={`${day.dayName ?? day.dayNumber ?? dayIndex}-${dayIndex}`}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white shadow-sm",
                    isToday ? "border-emerald-300" : "border-slate-200"
                  )}
                >
                  <button
                    onClick={() => toggleDay(dayIndex)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-3 text-left",
                      isToday ? "bg-emerald-50/70" : "bg-white"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {day.dayName || DAYS[scheduleDayIndex]}
                        </p>
                        {isToday ? (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Today
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {day.isRestDay ? "Rest day" : day.focusArea || `${allExercises.length} exercises`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!day.isRestDay ? (
                        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          {allExercises.length}
                        </span>
                      ) : null}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded ? (
                    <div className="border-t border-slate-200 px-3 py-3">
                      {day.isRestDay ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                          <p className="text-3xl">🧘</p>
                          <p className="mt-2 text-sm font-semibold text-amber-900">Recovery focus</p>
                          <p className="mt-1 text-xs text-amber-700">
                            {day.restDayNotes ||
                              "Take this day to recover, hydrate, and stay lightly active."}
                          </p>
                        </div>
                      ) : allExercises.length ? (
                        <div className="space-y-2.5">
                          {allExercises.map((exercise, exerciseIndex) => {
                            const exerciseKey = `${dayIndex}-${exerciseIndex}`;
                            const isExerciseExpanded = expandedExercises.includes(exerciseKey);

                            const data = exercise.exerciseId;
                            const name = data?.name || exercise.exerciseName || "Exercise";
                            const animationUrl = data?.animationUrl || exercise.exerciseAnimationUrl;
                            const thumbnailUrl = data?.thumbnailUrl;

                            const repsDisplay = getRepsLabel(exercise);

                            return (
                              <div
                                key={`${name}-${exerciseIndex}`}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70"
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleExercise(exerciseKey)}
                                  className="w-full px-3 py-3 text-left"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                                      {(exercise.order || exerciseIndex + 1).toString()}. {name}
                                    </p>
                                    {isExerciseExpanded ? (
                                      <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                    ) : (
                                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                    )}
                                  </div>

                                  <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-2">
                                    <ExerciseAnimation
                                      animationUrl={animationUrl}
                                      thumbnailUrl={thumbnailUrl}
                                      exerciseName={name}
                                      size="large"
                                      showControls={false}
                                    />
                                  </div>

                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {repsDisplay ? (
                                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                        {repsDisplay} reps
                                      </span>
                                    ) : null}
                                    {exercise.duration ? (
                                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                        {exercise.duration}s
                                      </span>
                                    ) : null}
                                    {exercise.restSeconds ? (
                                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                        {exercise.restSeconds}s rest
                                      </span>
                                    ) : null}
                                  </div>
                                </button>

                                {isExerciseExpanded ? (
                                  <div className="space-y-2 border-t border-slate-200 bg-white px-3 py-3">
                                    {exercise.notes ? (
                                      <p className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                                        <span className="font-semibold">Coach note:</span> {exercise.notes}
                                      </p>
                                    ) : null}

                                    {exercise.weight ? (
                                      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                                        <span className="font-semibold">Suggested weight:</span> {exercise.weight}
                                      </p>
                                    ) : null}

                                    {data?.instructions?.length ? (
                                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                        <p className="text-xs font-semibold text-slate-800">How to perform</p>
                                        <ol className="mt-1 space-y-1 text-xs text-slate-600">
                                          {data.instructions.map((instruction, instructionIndex) => (
                                            <li
                                              key={`${instruction}-${instructionIndex}`}
                                              className="list-decimal list-inside leading-relaxed"
                                            >
                                              {instruction}
                                            </li>
                                          ))}
                                        </ol>
                                      </div>
                                    ) : null}

                                    {data?.tips?.length ? (
                                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                                        <p className="text-xs font-semibold text-emerald-800">Tips</p>
                                        <ul className="mt-1 space-y-1 text-xs text-emerald-700">
                                          {data.tips.map((tip, tipIndex) => (
                                            <li key={`${tip}-${tipIndex}`} className="list-disc list-inside">
                                              {tip}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}

                          {isToday ? (
                            <Link
                              href="/client/workouts/today"
                              className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white transition hover:brightness-110"
                            >
                              <Play className="h-4 w-4" />
                              Start today&apos;s workout
                            </Link>
                          ) : null}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                          No exercises scheduled for this day.
                        </div>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            This plan has no weekly schedule yet.
          </div>
        )}
      </section>
    </div>
  );
}
