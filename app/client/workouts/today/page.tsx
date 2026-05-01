"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Pause,
  Play,
  SkipForward,
  TimerReset,
  Trophy,
  X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import ExerciseAnimation from "@/components/shared/ExerciseAnimation";
import {
  CLIENT_TODAY_WORKOUT_KEY,
  CLIENT_WORKOUT_LOGS_KEY,
  CLIENT_WORKOUT_PLANS_KEY,
  useMarkWorkoutMissed,
  useClientTodayWorkout,
} from "@/lib/queries/workouts";
import { cn } from "@/lib/utils";

const EXERCISE_ROW_THEMES = [
  "border-violet-200 bg-violet-50/80",
  "border-cyan-200 bg-cyan-50/80",
  "border-amber-200 bg-amber-50/80",
  "border-emerald-200 bg-emerald-50/80",
];

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Exercise {
  _id?: string;
  exerciseId?:
    | string
    | {
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

interface TodayWorkout {
  _id?: string;
  planId?: string;
  planName?: string;
  workoutPlanId?: string;
  workoutPlanName?: string;
  dayOfWeek?: number;
  dayName?: string;
  focus?: string;
  isRestDay?: boolean;
  exercises?: Exercise[];
  completed?: boolean;
  status?: "rest_day" | "scheduled" | "in_progress" | "completed" | "missed" | "partial";
  log?: {
    _id?: string;
    status?: "rest_day" | "scheduled" | "in_progress" | "completed" | "missed" | "partial";
  };
}

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0m";
  return `${Math.ceil(seconds / 60)}m`;
};

const getExerciseName = (exercise?: Exercise) => {
  if (!exercise) return "Exercise";
  const data = typeof exercise.exerciseId === "string" ? undefined : exercise.exerciseId;
  return data?.name || exercise.exerciseName || "Exercise";
};

const getRepsDisplay = (exercise?: Exercise) => {
  if (!exercise) return "-";

  if (exercise.repsMin && exercise.repsMax) {
    return `${exercise.repsMin}-${exercise.repsMax}`;
  }

  if (exercise.reps) {
    return `${exercise.reps}`;
  }

  return "-";
};

interface CountdownTickerProps {
  startSeconds: number;
  isRunning: boolean;
  resetToken: number;
  onComplete?: () => void;
  className?: string;
}

const CountdownTicker = React.memo(function CountdownTicker({
  startSeconds,
  isRunning,
  resetToken,
  onComplete,
  className = "",
}: CountdownTickerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, startSeconds));
  const onCompleteRef = React.useRef<(() => void) | undefined>(onComplete);
  const hasCompletedRef = React.useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setSecondsLeft(Math.max(0, startSeconds));
    hasCompletedRef.current = false;
  }, [startSeconds, resetToken]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (!isRunning || secondsLeft !== 0 || hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    onCompleteRef.current?.();
  }, [isRunning, secondsLeft]);

  return <p className={className}>{secondsLeft}s</p>;
});

CountdownTicker.displayName = "CountdownTicker";

export default function ClientTodayWorkoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedTodayPlanId, setSelectedTodayPlanId] = useState<string | null>(null);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [skippedExercises, setSkippedExercises] = useState<Set<number>>(new Set());
  const [isResting, setIsResting] = useState(false);
  const [restDurationSeconds, setRestDurationSeconds] = useState(0);
  const [restTimerResetToken, setRestTimerResetToken] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState(false);
  const [exerciseTimerDurationSeconds, setExerciseTimerDurationSeconds] = useState(20);
  const [exerciseTimerResetToken, setExerciseTimerResetToken] = useState(0);

  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const markWorkoutMissedMutation = useMarkWorkoutMissed();

  const { data: todayWorkouts = [], isLoading, error } = useClientTodayWorkout();

  useEffect(() => {
    if (selectedTodayPlanId) return;
    if (!todayWorkouts.length) return;

    const preferredWorkout =
      todayWorkouts.find((workout) => !workout.isRestDay && (workout.exercises?.length || 0) > 0) ||
      todayWorkouts[0];

    setSelectedTodayPlanId((preferredWorkout.workoutPlanId || preferredWorkout.planId) ?? null);
  }, [todayWorkouts, selectedTodayPlanId]);

  const selectedTodayWorkout =
    (todayWorkouts.find((workout) => (workout.workoutPlanId || workout.planId) === selectedTodayPlanId) as
      | TodayWorkout
      | undefined) ||
    (todayWorkouts[0] as TodayWorkout) ||
    null;

  useEffect(() => {
    setIsWorkoutStarted(false);
    setCurrentExerciseIndex(0);
    setCompletedExercises(new Set());
    setSkippedExercises(new Set());
    setIsResting(false);
    setRestDurationSeconds(0);
    setRestTimerResetToken((previous) => previous + 1);
    setShowInstructions(false);
    setWorkoutStartTime(null);
    setIsExerciseTimerRunning(false);
    setExerciseTimerDurationSeconds(20);
    setExerciseTimerResetToken((previous) => previous + 1);
    setShowMoodDialog(false);
    setSelectedPreviewIndex(0);
  }, [selectedTodayPlanId]);

  const exercises = selectedTodayWorkout?.exercises || [];
  const activeExercise = exercises[currentExerciseIndex];
  const previewExercise = exercises[selectedPreviewIndex] || exercises[0];
  const dayNameLabel = selectedTodayWorkout?.dayName
    ?? (typeof selectedTodayWorkout?.dayOfWeek === "number"
      ? DAY_LABELS[selectedTodayWorkout.dayOfWeek]
      : "Today");

  const activeExerciseData = activeExercise?.exerciseId;
  const activeExerciseObj = typeof activeExerciseData === "string" ? undefined : activeExerciseData;

  const previewExerciseData = previewExercise?.exerciseId;
  const previewExerciseObj = typeof previewExerciseData === "string" ? undefined : previewExerciseData;

  const activeExerciseName = getExerciseName(activeExercise);
  const previewExerciseName = getExerciseName(previewExercise);

  const totalSeconds = useMemo(
    () => exercises.reduce((total, exercise) => total + (exercise.duration || 20), 0),
    [exercises]
  );

  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const workoutLogId = selectedTodayWorkout?.log?._id || selectedTodayWorkout?._id;

      if (!workoutLogId) {
        throw new Error("No workout log found for today");
      }

      const duration = workoutStartTime
        ? Math.round((new Date().getTime() - workoutStartTime.getTime()) / 60000)
        : 0;

      const exerciseLogs =
        selectedTodayWorkout?.exercises?.map((exercise, index) => {
          const isCompleted = completedExercises.has(index);
          const isSkipped = skippedExercises.has(index) && !isCompleted;

          return {
            exerciseId:
              typeof exercise.exerciseId === "string" ? exercise.exerciseId : exercise.exerciseId?._id,
            exerciseName:
              (typeof exercise.exerciseId === "string" ? undefined : exercise.exerciseId?.name) ||
              exercise.exerciseName,
            completed: isCompleted,
            skipped: isSkipped,
            skipReason: isSkipped ? "Skipped by client" : undefined,
          };
        }) || [];

      const response = await api.post(`/client/workouts/${workoutLogId}/complete`, {
        exerciseLogs,
        actualDuration: duration,
      });

      return response.data;
    },
    onSuccess: () => {
      toast.success("Workout completed! Great job.");
      queryClient.invalidateQueries({ queryKey: CLIENT_TODAY_WORKOUT_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_PLANS_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_LOGS_KEY });
      router.push("/client/workouts");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to log workout. Please try again.");
    },
  });

  useEffect(() => {
    const duration = activeExercise?.duration || 20;
    setExerciseTimerDurationSeconds(duration);
    setExerciseTimerResetToken((previous) => previous + 1);
    setIsExerciseTimerRunning(false);
  }, [activeExercise?.duration, currentExerciseIndex]);

  useEffect(() => {
    if (!exercises.length) {
      setSelectedPreviewIndex(0);
      return;
    }

    setSelectedPreviewIndex((previous) => {
      if (previous > exercises.length - 1) {
        return exercises.length - 1;
      }

      return previous;
    });
  }, [exercises]);

  const startWorkout = () => {
    if (!exercises.length) {
      toast.error("No exercises found for this session.");
      return;
    }

    setCurrentExerciseIndex(selectedPreviewIndex || 0);
    setIsWorkoutStarted(true);
    setWorkoutStartTime(new Date());
  };

  const exitWorkout = () => {
    if (completedExercises.size > 0 || skippedExercises.size > 0) {
      const confirmed = window.confirm("You have unfinished progress. Exit and reset this session?");
      if (!confirmed) return;
    }

    setIsWorkoutStarted(false);
    setCurrentExerciseIndex(0);
    setCompletedExercises(new Set());
    setSkippedExercises(new Set());
    setWorkoutStartTime(null);
    setIsResting(false);
    setRestDurationSeconds(0);
    setRestTimerResetToken((previous) => previous + 1);
    setIsExerciseTimerRunning(false);
    setExerciseTimerDurationSeconds(0);
    setExerciseTimerResetToken((previous) => previous + 1);
    setShowInstructions(false);
  };

  const completeExercise = () => {
    if (!activeExercise) return;

    const updatedCompleted = new Set(completedExercises);
    updatedCompleted.add(currentExerciseIndex);
    setCompletedExercises(updatedCompleted);

    if (skippedExercises.has(currentExerciseIndex)) {
      const updatedSkipped = new Set(skippedExercises);
      updatedSkipped.delete(currentExerciseIndex);
      setSkippedExercises(updatedSkipped);
    }

    toast.success(`${activeExerciseName} completed`);

    const nextIndex = exercises.findIndex(
      (_, index) => index > currentExerciseIndex && !updatedCompleted.has(index)
    );

    if (nextIndex !== -1) {
      setCurrentExerciseIndex(nextIndex);
      setRestDurationSeconds(activeExercise.restSeconds || 20);
      setRestTimerResetToken((previous) => previous + 1);
      setIsResting(true);
    } else if (updatedCompleted.size === exercises.length) {
      setShowMoodDialog(true);
    }

    setIsExerciseTimerRunning(false);
    setExerciseTimerDurationSeconds(0);
    setExerciseTimerResetToken((previous) => previous + 1);
  };

  const skipExercise = () => {
    if (completedExercises.has(currentExerciseIndex)) {
      const updatedCompleted = new Set(completedExercises);
      updatedCompleted.delete(currentExerciseIndex);
      setCompletedExercises(updatedCompleted);
    }

    const updatedSkipped = new Set(skippedExercises);
    updatedSkipped.add(currentExerciseIndex);
    setSkippedExercises(updatedSkipped);

    toast("Exercise skipped");

    const nextIndex = exercises.findIndex(
      (_, index) =>
        index > currentExerciseIndex &&
        !completedExercises.has(index) &&
        !updatedSkipped.has(index)
    );

    if (nextIndex !== -1) {
      setCurrentExerciseIndex(nextIndex);
    }

    setIsResting(false);
    setRestDurationSeconds(0);
    setRestTimerResetToken((previous) => previous + 1);
    setIsExerciseTimerRunning(false);
    setExerciseTimerDurationSeconds(0);
    setExerciseTimerResetToken((previous) => previous + 1);
  };

  const goToExercise = (index: number) => {
    setCurrentExerciseIndex(index);
    setIsResting(false);
    setRestDurationSeconds(0);
    setRestTimerResetToken((previous) => previous + 1);
    setIsExerciseTimerRunning(false);
    setShowInstructions(false);

    if (completedExercises.has(index) || skippedExercises.has(index)) {
      const nextCompleted = new Set(completedExercises);
      nextCompleted.delete(index);
      setCompletedExercises(nextCompleted);

      const nextSkipped = new Set(skippedExercises);
      nextSkipped.delete(index);
      setSkippedExercises(nextSkipped);
    }
  };

  const toggleTimer = () => {
    if (isExerciseTimerRunning) {
      setIsExerciseTimerRunning(false);
      return;
    }

    setExerciseTimerDurationSeconds(activeExercise?.duration || 20);
    setExerciseTimerResetToken((previous) => previous + 1);
    setIsExerciseTimerRunning(true);
  };

  const goToPreviewExercise = (step: -1 | 1) => {
    if (!exercises.length) return;

    setSelectedPreviewIndex((previous) => {
      const next = previous + step;
      if (next < 0) return exercises.length - 1;
      if (next > exercises.length - 1) return 0;
      return next;
    });
  };

  const moveExercise = (step: -1 | 1) => {
    if (!exercises.length) return;

    const next = currentExerciseIndex + step;
    if (next < 0 || next > exercises.length - 1) return;

    setCurrentExerciseIndex(next);
    setIsResting(false);
    setRestDurationSeconds(0);
    setRestTimerResetToken((previous) => previous + 1);
    setIsExerciseTimerRunning(false);
    setShowInstructions(false);
  };

  const finishWorkout = () => {
    if (!exercises.length) {
      toast.error("No exercises found for this session.");
      return;
    }

    if (completedExercises.size < exercises.length) {
      toast.error("Complete all exercises to submit your workout.");
      return;
    }

    if (selectedTodayWorkout?.status === "rest_day" && !selectedTodayWorkout?.isRestDay) {
      toast.error("Today's schedule just changed. Refresh once and try again.");
      return;
    }

    setShowMoodDialog(true);
  };

  const markTodayWorkoutAsMissed = () => {
    if (!selectedTodayWorkout) return;

    const workoutLogId = selectedTodayWorkout?.log?._id || selectedTodayWorkout?._id;

    if (!workoutLogId) {
      toast.error("No workout log found for today.");
      return;
    }

    if (selectedTodayWorkout.isRestDay || selectedTodayWorkout.status === "rest_day") {
      toast.error("Rest days cannot be marked as missed.");
      return;
    }

    if (selectedTodayWorkout.status === "completed" || selectedTodayWorkout.completed) {
      toast.error("This workout is already completed.");
      return;
    }

    if (selectedTodayWorkout.status === "partial") {
      toast.error("This workout already has logged progress.");
      return;
    }

    if (selectedTodayWorkout.status === "missed") {
      toast("This workout is already marked as missed.");
      return;
    }

    if (isWorkoutStarted && completedExercises.size > 0) {
      toast.error("You already logged exercise progress. Use finish workout to save as partial.");
      return;
    }

    const confirmed = window.confirm("Mark today's workout as missed?");
    if (!confirmed) return;

    const reasonInput = window.prompt("Optional reason for missing today (you can leave this blank):", "");
    const reason = typeof reasonInput === "string" && reasonInput.trim() ? reasonInput.trim() : undefined;

    markWorkoutMissedMutation.mutate(
      { id: workoutLogId, data: reason ? { reason } : undefined },
      {
        onSuccess: () => {
          toast.success("Workout marked as missed.");
          queryClient.invalidateQueries({ queryKey: CLIENT_TODAY_WORKOUT_KEY });
          queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_PLANS_KEY });
          queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_LOGS_KEY });
          setIsWorkoutStarted(false);
          setCompletedExercises(new Set());
          setSkippedExercises(new Set());
          setShowMoodDialog(false);
          router.push("/client/workouts");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to mark workout as missed.");
        },
      }
    );
  };

  const submitWorkout = () => {
    completeWorkoutMutation.mutate();
  };

  const planSelector =
    todayWorkouts.length > 1 ? (
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max gap-2">
          {todayWorkouts.map((workout: any, index: number) => {
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
      </div>
    ) : null;

  if (isLoading) {
    return (
      <div className="client-page__sections space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading today&apos;s workout...
        </div>
      </div>
    );
  }

  if (error || !selectedTodayWorkout) {
    return (
      <div className="client-page__sections space-y-4">
        <Link
          href="/client/workouts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workouts
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Clock3 className="mx-auto h-9 w-9 text-slate-300" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">No workout scheduled today</h2>
          <p className="mt-1 text-sm text-slate-500">Please check your plan or contact your coach.</p>
        </div>
      </div>
    );
  }

  if (selectedTodayWorkout.isRestDay) {
    return (
      <div className="client-page__sections space-y-4">
        <Link
          href="/client/workouts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workouts
        </Link>

        {planSelector}

        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center shadow-sm">
          <p className="text-3xl">🧘</p>
          <h2 className="mt-2 text-lg font-semibold text-amber-900">Rest day</h2>
          <p className="mt-1 text-sm text-amber-700">
            Let your body recover today. You&apos;ll come back stronger tomorrow.
          </p>

          <ul className="mt-4 space-y-1 rounded-2xl border border-amber-200 bg-white/70 p-3 text-left text-xs text-amber-800">
            <li>• Drink enough water</li>
            <li>• Do light mobility or stretching</li>
            <li>• Sleep at least 7-8 hours</li>
            <li>• Keep protein intake on point</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="client-page__sections space-y-4 pb-24">
      {!isWorkoutStarted ? (
        <>
          <Link
            href="/client/workouts"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to workouts
          </Link>

          {planSelector}

          <section className="overflow-hidden rounded-[30px] border border-violet-200 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-white shadow-sm">
            <div className="flex items-center justify-between p-3">
              <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                Exercises
              </span>
              <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {dayNameLabel}
              </span>
            </div>

            <div className="px-3 pb-3">
              <div className="grid grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPreviewExercise(-1)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/80 bg-white/80 text-slate-500 transition hover:bg-white"
                  aria-label="Previous exercise preview"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>

                <div className="rounded-[26px] border border-white/80 bg-white/75 p-3">
                  <ExerciseAnimation
                    animationUrl={previewExerciseObj?.animationUrl || previewExercise?.exerciseAnimationUrl}
                    thumbnailUrl={previewExerciseObj?.thumbnailUrl}
                    exerciseName={previewExerciseName}
                    size="large"
                    showControls={false}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => goToPreviewExercise(1)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/80 bg-white/80 text-slate-500 transition hover:bg-white"
                  aria-label="Next exercise preview"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-700">
                <div className="rounded-xl border border-white/80 bg-white/75 px-2 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Moves</p>
                  <p className="mt-0.5 text-sm text-indigo-700">{exercises.length}</p>
                </div>
                <div className="rounded-xl border border-white/80 bg-white/75 px-2 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Duration</p>
                  <p className="mt-0.5 text-sm text-indigo-700">{formatDuration(totalSeconds)}</p>
                </div>
                <div className="rounded-xl border border-white/80 bg-white/75 px-2 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Focus</p>
                  <p className="mt-0.5 truncate text-sm text-indigo-700">{selectedTodayWorkout.focus || "Mixed"}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={startWorkout}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-sm font-semibold !text-white transition hover:bg-slate-800"
            >
              <Play className="h-4 w-4" />
              Start session
            </button>

            <button
              onClick={markTodayWorkoutAsMissed}
              disabled={markWorkoutMissedMutation.isPending}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition",
                markWorkoutMissedMutation.isPending
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              )}
            >
              <X className="h-4 w-4" />
              {markWorkoutMissedMutation.isPending ? "Skipping..." : "Skip today"}
            </button>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedTodayWorkout.focus || selectedTodayWorkout.planName || "Today&apos;s workout"}
                </p>
              </div>

              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                  selectedTodayWorkout.completed || selectedTodayWorkout.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-indigo-100 text-indigo-700"
                )}
              >
                {selectedTodayWorkout.completed || selectedTodayWorkout.status === "completed"
                  ? "Completed"
                  : "Ready"}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {exercises.map((exercise, index) => {
                const data = typeof exercise.exerciseId === "string" ? undefined : exercise.exerciseId;
                const name = data?.name || exercise.exerciseName || "Exercise";
                const reps = getRepsDisplay(exercise);
                const selected = selectedPreviewIndex === index;

                return (
                  <button
                    type="button"
                    key={`${name}-${index}`}
                    onClick={() => setSelectedPreviewIndex(index)}
                    className={cn(
                      "w-full rounded-2xl border px-3 py-2 text-left transition",
                      EXERCISE_ROW_THEMES[index % EXERCISE_ROW_THEMES.length],
                      selected && "ring-2 ring-indigo-300"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {index + 1}. {name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {reps} reps · {exercise.duration || 20}s
                          {exercise.weight ? ` · ${exercise.weight}` : ""}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={exitWorkout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit
            </button>

            {completedExercises.size === exercises.length && exercises.length > 0 && !showMoodDialog ? (
              <button
                onClick={finishWorkout}
                disabled={completeWorkoutMutation.isPending}
                className={cn(
                  "inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold text-white transition",
                  completeWorkoutMutation.isPending
                    ? "cursor-not-allowed bg-slate-400"
                    : "bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110"
                )}
              >
                <Trophy className="h-3.5 w-3.5" />
                {completeWorkoutMutation.isPending ? "Saving..." : "Submit workout"}
              </button>
            ) : null}
          </div>

          {isResting ? (
            <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center shadow-sm">
              <Clock3 className="mx-auto h-7 w-7 text-blue-500" />
              <p className="mt-2 text-sm font-medium text-blue-700">Recovery break</p>
              <CountdownTicker
                startSeconds={restDurationSeconds}
                isRunning={isResting}
                resetToken={restTimerResetToken}
                onComplete={() => {
                  setIsResting(false);
                  toast("Rest complete! Let's go.");
                }}
                className="mt-1 text-4xl font-bold tracking-tight text-blue-900"
              />
              <button
                onClick={() => {
                  setIsResting(false);
                  setRestDurationSeconds(0);
                  setRestTimerResetToken((previous) => previous + 1);
                }}
                className="mt-4 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
              >
                Skip rest
              </button>
            </section>
          ) : null}

          {activeExercise && !isResting ? (
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-3">
                <ExerciseAnimation
                  animationUrl={activeExerciseObj?.animationUrl || activeExercise.exerciseAnimationUrl}
                  thumbnailUrl={activeExerciseObj?.thumbnailUrl}
                  exerciseName={activeExerciseName}
                  size="large"
                  showControls={true}
                />
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                      Exercise {currentExerciseIndex + 1} / {exercises.length}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">{activeExerciseName}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveExercise(-1)}
                      disabled={currentExerciseIndex === 0}
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-full border transition",
                        currentExerciseIndex === 0
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveExercise(1)}
                      disabled={currentExerciseIndex === exercises.length - 1}
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-full border transition",
                        currentExerciseIndex === exercises.length - 1
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">Timer</p>
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50">
                    <CountdownTicker
                      startSeconds={exerciseTimerDurationSeconds}
                      isRunning={isExerciseTimerRunning}
                      resetToken={exerciseTimerResetToken}
                      onComplete={() => {
                        setIsExerciseTimerRunning(false);
                        toast.success("Timer done. Finish this move!");
                      }}
                      className="text-3xl font-bold tracking-tight text-indigo-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={toggleTimer}
                    className={cn(
                      "flex h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition",
                      isExerciseTimerRunning
                        ? "border border-amber-300 bg-amber-100 text-amber-900"
                        : "border border-indigo-200 bg-indigo-50 text-indigo-700"
                    )}
                  >
                    {isExerciseTimerRunning ? <Pause className="h-4 w-4" /> : <TimerReset className="h-4 w-4" />}
                    {isExerciseTimerRunning ? "Pause" : "Start"}
                  </button>

                  <button
                    onClick={skipExercise}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip
                  </button>

                  <button
                    onClick={completeExercise}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Done
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Reps</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">{getRepsDisplay(activeExercise)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Duration</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">{activeExercise.duration || 20}s</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Weight</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">{activeExercise.weight || "Body"}</p>
                  </div>
                </div>

                {activeExerciseObj?.instructions?.length ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70">
                    <button
                      onClick={() => setShowInstructions((previous) => !previous)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left"
                    >
                      <span className="text-sm font-medium text-slate-700">How to perform</span>
                      <ChevronRight
                        className={cn("h-4 w-4 text-slate-400 transition-transform", showInstructions && "rotate-90")}
                      />
                    </button>

                    {showInstructions ? (
                      <ol className="space-y-1 border-t border-slate-200 px-3 py-3 text-xs text-slate-600">
                        {activeExerciseObj.instructions.map((instruction, index) => (
                          <li key={`${instruction}-${index}`} className="list-decimal list-inside leading-relaxed">
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </div>
                ) : null}

              </div>
            </section>
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Exercise queue</h4>
              <p className="text-xs text-slate-500">Tap to revisit</p>
            </div>

            <div className="space-y-2">
              {exercises.map((exercise, index) => {
                const isCompleted = completedExercises.has(index);
                const isSkipped = skippedExercises.has(index);
                const isCurrent = index === currentExerciseIndex;
                const name = getExerciseName(exercise);

                return (
                  <button
                    key={`${name}-${index}`}
                    onClick={() => goToExercise(index)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition",
                      isCurrent
                        ? "border-indigo-300 bg-indigo-50"
                        : isCompleted
                          ? "border-emerald-200 bg-emerald-50"
                          : isSkipped
                            ? "border-amber-200 bg-amber-50"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : isSkipped ? (
                      <SkipForward className="h-4 w-4 shrink-0 text-amber-500" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                      {index + 1}. {name}
                      {isSkipped ? " (skipped)" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

        </>
      )}

      {showMoodDialog ? (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-3">
          <div className="w-full max-w-md max-h-[86vh] overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl sm:max-h-[90vh] sm:rounded-3xl sm:pb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Finish workout?</h3>
              <p className="mt-1 text-xs text-slate-500">
                This will submit your workout progress for today.
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowMoodDialog(false)}
                className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={submitWorkout}
                disabled={completeWorkoutMutation.isPending}
                className={cn(
                  "h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white transition",
                  completeWorkoutMutation.isPending && "cursor-not-allowed opacity-70"
                )}
              >
                {completeWorkoutMutation.isPending ? "Submitting..." : "Submit workout"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
