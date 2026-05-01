"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  ListChecks,
  Play,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import ExerciseAnimation from "@/components/shared/ExerciseAnimation";
import {
  ClientTodayWorkout,
  useClientTodayWorkout,
  useClientWorkoutPlans,
  useClientWorkoutStats,
} from "@/lib/queries/workouts";
import { cn } from "@/lib/utils";

type PageView = "today" | "plans";

const TAB_OPTIONS: Array<{ key: PageView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "today", label: "Today", icon: Sparkles },
  { key: "plans", label: "Plans", icon: ListChecks },
];

const PREVIEW_ROW_THEMES = [
  "border-violet-200 bg-violet-50/90",
  "border-cyan-200 bg-cyan-50/90",
  "border-emerald-200 bg-emerald-50/90",
  "border-amber-200 bg-amber-50/90",
];

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0m";
  return `${Math.ceil(seconds / 60)}m`;
};

const formatFocusText = (value?: string) => {
  if (!value) return "Full Body";
  return value.replace(/_/g, " ");
};

const getExerciseName = (exercise: any) => {
  const data = typeof exercise?.exerciseId === "string" ? undefined : exercise?.exerciseId;
  return data?.name || exercise?.exerciseName || exercise?.name || "Exercise";
};

const getExerciseReps = (exercise: any) => {
  if (exercise?.repsMin && exercise?.repsMax) {
    return `${exercise.repsMin}-${exercise.repsMax}`;
  }

  if (exercise?.reps) {
    return `${exercise.reps}`;
  }

  return "-";
};

export default function ClientWorkoutsPage() {
  const [view, setView] = useState<PageView>("today");
  const [selectedTodayPlanId, setSelectedTodayPlanId] = useState<string | null>(null);

  const { data: todayWorkouts = [], isLoading: todayLoading, isError: todayError } = useClientTodayWorkout();
  const { data: plans = [], isLoading: plansLoading } = useClientWorkoutPlans();
  const { data: stats } = useClientWorkoutStats(30);

  useEffect(() => {
    if (selectedTodayPlanId) return;
    if (!todayWorkouts.length) return;

    const preferredWorkout =
      todayWorkouts.find((workout) => !workout.isRestDay && (workout.exercises?.length || 0) > 0) ||
      todayWorkouts[0];

    setSelectedTodayPlanId((preferredWorkout.workoutPlanId || preferredWorkout.planId) ?? null);
  }, [selectedTodayPlanId, todayWorkouts]);

  const selectedTodayWorkout =
    (todayWorkouts.find((workout) => (workout.workoutPlanId || workout.planId) === selectedTodayPlanId) ||
      todayWorkouts[0] ||
      null) as ClientTodayWorkout | null;

  const exercises = selectedTodayWorkout?.exercises || [];

  const heroExercise = exercises[0];
  const heroExerciseData = heroExercise?.exerciseId;
  const heroExerciseObj = typeof heroExerciseData === "string" ? undefined : heroExerciseData;

  const heroExerciseName =
    heroExerciseObj?.name || heroExercise?.exerciseName || heroExercise?.name || "Exercise preview";

  const totalSeconds = useMemo(
    () => exercises.reduce((total, exercise) => total + (exercise.duration || 20), 0),
    [exercises]
  );

  const streakValue = stats?.todayCompleted
    ? stats?.streak || 0
    : stats?.yesterdayCompleted
      ? stats?.streak || 0
      : 0;

  const renderPlansSection = () => {
    if (plansLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div
              key={`plan-loading-${item}`}
              className="h-[88px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      );
    }

    if (!plans.length) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
          <Dumbbell className="mx-auto h-7 w-7 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-800">No workout plans yet</p>
          <p className="mt-1 text-xs text-slate-500">Your coach will assign one soon.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {plans.map((plan: any, index: number) => {
          const intensity = Math.max(25, Math.min(95, ((plan.daysPerWeek || 1) / 7) * 100));

          return (
            <Link
              key={plan._id}
              href={`/client/workouts/plan/${plan._id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{plan.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {(plan.goal || plan.category || "fitness").replace(/_/g, " ")} · {plan.difficulty || "all levels"}
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-indigo-600">
                    {plan.daysPerWeek || 0} days/week · {plan.durationWeeks || 0} weeks
                  </p>
                </div>

                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              </div>

              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full",
                    index % 3 === 0
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                      : index % 3 === 1
                        ? "bg-gradient-to-r from-cyan-500 to-emerald-500"
                        : "bg-gradient-to-r from-amber-500 to-orange-500"
                  )}
                  style={{ width: `${intensity}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  const renderTodaySpotlight = () => {
    if (todayLoading) {
      return (
        <div className="space-y-3 px-4 pb-4">
          <div className="h-[230px] animate-pulse rounded-[22px] border border-white/70 bg-white/80" />
          <div className="h-10 animate-pulse rounded-xl border border-white/70 bg-white/80" />
        </div>
      );
    }

    if (todayError) {
      return (
        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-center">
            <p className="text-sm font-semibold text-rose-800">Couldn&apos;t load today&apos;s workout</p>
            <p className="mt-1 text-xs text-rose-700">Please refresh or try again in a moment.</p>
          </div>
        </div>
      );
    }

    if (!selectedTodayWorkout) {
      return (
        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-6 text-center">
            <Dumbbell className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-800">No workout assigned today</p>
            <p className="mt-1 text-xs text-slate-500">Your coach hasn&apos;t assigned one yet.</p>
            <Link
              href="/client/workouts/history"
              className="mt-3 inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
            >
              View history
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      );
    }

    if (selectedTodayWorkout.isRestDay) {
      return (
        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-6 text-center">
            <p className="text-3xl">🧘</p>
            <p className="mt-2 text-sm font-semibold text-amber-900">Recovery day</p>
            <p className="mt-1 text-xs text-amber-700">
              Light stretching, hydration, and sleep are your workout today.
            </p>
            <Link
              href="/client/workouts/history"
              className="mt-3 inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-amber-300 bg-white/90 px-3 text-xs font-semibold text-amber-800"
            >
              Open history
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="px-4 pb-4">
          <div className="rounded-[24px] border border-white/80 bg-white/80 p-3">
            <ExerciseAnimation
              animationUrl={heroExerciseObj?.animationUrl}
              thumbnailUrl={heroExerciseObj?.thumbnailUrl}
              exerciseName={heroExerciseName}
              size="large"
              showControls={false}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
            <div className="rounded-xl border border-white/80 bg-white/80 px-3 py-2">
              Exercise <span className="text-indigo-600">{exercises.length}</span>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-right">
              Total <span className="text-indigo-600">{formatDuration(totalSeconds)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-t-[28px] border-t border-white/70 bg-white px-4 pb-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{formatFocusText(selectedTodayWorkout.focus)}</p>
              <p className="mt-0.5 text-xs text-slate-500">{selectedTodayWorkout.planName || "Today plan"}</p>
            </div>

            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                selectedTodayWorkout.completed || selectedTodayWorkout.status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-indigo-100 text-indigo-700"
              )}
            >
              {selectedTodayWorkout.completed || selectedTodayWorkout.status === "completed" ? "Completed" : "Ready"}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {exercises.slice(0, 4).map((exercise, index) => (
              <div
                key={`${getExerciseName(exercise)}-${index}`}
                className={cn("rounded-2xl border px-3 py-2", PREVIEW_ROW_THEMES[index % PREVIEW_ROW_THEMES.length])}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {index + 1}. {getExerciseName(exercise)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {getExerciseReps(exercise)} reps · {exercise.duration || 20}s
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </div>
              </div>
            ))}

            {exercises.length > 4 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-600">
                +{exercises.length - 4} more exercises in today&apos;s queue
              </div>
            ) : null}
          </div>

          <div className="mt-3">
            <Link
              href="/client/workouts/today"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Play className="h-4 w-4" />
              {selectedTodayWorkout.completed || selectedTodayWorkout.status === "completed"
                ? "Redo workout"
                : "Start workout"}
            </Link>
          </div>
        </div>
      </>
    );
  };

  const renderTodayView = () => {
    return (
      <>
        {todayWorkouts.length > 1 ? (
          <section className="-mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex min-w-max gap-2">
              {todayWorkouts.map((workout, index) => {
                const id = workout.workoutPlanId || workout.planId;
                const selected = id === selectedTodayPlanId;

                return (
                  <button
                    key={id ?? `${workout.planName ?? "plan"}-${index}`}
                    onClick={() => setSelectedTodayPlanId(id ?? null)}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-left transition-all",
                      selected
                        ? "border-indigo-500 bg-indigo-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
                    )}
                  >
                    <p className="text-xs font-semibold text-slate-900">
                      {workout.planName || workout.workoutPlanName || `Plan ${index + 1}`}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {workout.isRestDay ? "Rest day" : `${workout.exercises?.length || 0} exercises`}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-[30px] border border-violet-200 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
              Workout summary
            </span>
            <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
              Today&apos;s focus
            </span>
          </div>

          {renderTodaySpotlight()}
        </section>
      </>
    );
  };

  const renderPlansView = () => {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Plan library</p>
            <p className="text-xs text-slate-500">Open any plan to view schedule and drills.</p>
          </div>

          <Link
            href="/client/workouts/today"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"
          >
            Today
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {renderPlansSection()}
      </section>
    );
  };

  return (
    <div className="client-page__sections space-y-4 pb-6 md:space-y-5">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="client-page__title pl-1 !text-[1.15rem] !font-bold leading-tight sm:!text-[1.2rem]">
              Workout Studio
            </h1>
          </div>

          <Link
            href="/client/workouts/history"
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Calendar className="h-3.5 w-3.5" />
            History
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70">
            <div className="border-b border-r border-slate-100 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                <Trophy className="h-3.5 w-3.5 text-emerald-600" />
                Completed sessions
              </div>
              <p className="mt-1 text-base font-semibold text-slate-900">{stats?.completed || 0}</p>
            </div>

            <div className="border-b border-slate-100 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-orange-700">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                Current streak
              </div>
              <p className="mt-1 text-base font-semibold text-slate-900">{streakValue}</p>
            </div>

            <div className="border-r border-slate-100 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-700">
                <Target className="h-3.5 w-3.5 text-cyan-600" />
                Completion rate
              </div>
              <p className="mt-1 text-base font-semibold text-slate-900">{stats?.completionRate || 0}%</p>
            </div>

            <div className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-violet-700">
                <Clock3 className="h-3.5 w-3.5 text-violet-600" />
                Minutes trained
              </div>
              <p className="mt-1 text-base font-semibold text-slate-900">{stats?.totalDuration || 0}</p>
            </div>
          </div>
        </section>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-1.5">
          {TAB_OPTIONS.map((tab) => {
            const Icon = tab.icon;
            const selected = view === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setView(tab.key)}
                className={cn(
                  "flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition",
                  selected ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {view === "today" ? renderTodayView() : null}
      {view === "plans" ? renderPlansView() : null}
    </div>
  );
}
