// app/client/workouts/today/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  SkipForward,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trophy,
  Timer,
  Pause,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import ExerciseAnimation from "@/components/shared/ExerciseAnimation";
import {
  CLIENT_TODAY_WORKOUT_KEY,
  CLIENT_WORKOUT_PLANS_KEY,
  CLIENT_WORKOUT_LOGS_KEY,
} from "@/lib/queries/workouts";

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
  sets?: number;
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
}

export default function ClientTodayWorkoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedTodayPlanId, setSelectedTodayPlanId] = useState<string | null>(null);

  // Workout state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState(false);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(20);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState("");

  // Fetch today's workout
  const { data: todayWorkouts = [], isLoading, error } = useQuery({
    queryKey: CLIENT_TODAY_WORKOUT_KEY,
    queryFn: async () => {
      const res = await api.get("/client/workouts/today");
      const data = res.data.data;
      return Array.isArray(data) ? (data as TodayWorkout[]) : [];
    },
  });

  useEffect(() => {
    if (selectedTodayPlanId) return;
    if (!todayWorkouts || todayWorkouts.length === 0) return;
    const first = todayWorkouts[0];
    setSelectedTodayPlanId((first.workoutPlanId || first.planId) ?? null);
  }, [todayWorkouts, selectedTodayPlanId]);

  const selectedTodayWorkout =
    todayWorkouts.find((w: any) => (w.workoutPlanId || w.planId) === selectedTodayPlanId) ||
    todayWorkouts[0] ||
    null;

  // Reset per-workout state when switching plans
  useEffect(() => {
    setCurrentExerciseIndex(0);
    setCompletedExercises(new Set());
    setIsResting(false);
    setRestTimeLeft(0);
    setShowInstructions(false);
    setWorkoutStartTime(null);
    setIsWorkoutStarted(false);
    setIsExerciseTimerRunning(false);
    setExerciseTimeLeft(20);
    setShowMoodDialog(false);
    setSelectedMood(null);
    setWorkoutNotes("");
  }, [selectedTodayPlanId]);

  // Complete workout mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const duration = workoutStartTime
        ? Math.round((new Date().getTime() - workoutStartTime.getTime()) / 60000)
        : 0;
      
      // Build exercise logs from completed exercises
      const exerciseLogs = selectedTodayWorkout?.exercises?.map((ex, index) => ({
        exerciseId: typeof ex.exerciseId === "string" ? ex.exerciseId : ex.exerciseId?._id,
        exerciseName:
          (typeof ex.exerciseId === "string" ? undefined : ex.exerciseId?.name) ||
          ex.exerciseName,
        completedSets: completedExercises.has(index) ? 1 : 0,
        completed: completedExercises.has(index),
      })) || [];

      // Use the log ID from today's workout if available
      if (selectedTodayWorkout?._id) {
        const res = await api.post(`/client/workouts/${selectedTodayWorkout._id}/complete`, {
          exerciseLogs,
          actualDuration: duration,
          moodAfter: selectedMood,
          clientNotes:
            workoutNotes ||
            `Completed ${completedExercises.size} of ${selectedTodayWorkout?.exercises?.length || 0} exercises`,
        });
        return res.data;
      } else {
        // Fallback: just mark as complete without a log ID
        throw new Error("No workout log found for today");
      }
    },
    onSuccess: () => {
      toast.success("🎉 Workout completed! Great job!");
      queryClient.invalidateQueries({ queryKey: CLIENT_TODAY_WORKOUT_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_PLANS_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_LOGS_KEY });
      router.push("/client/workouts");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to log workout. Please try again.");
    },
  });

  const exercises = selectedTodayWorkout?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const exerciseData = currentExercise?.exerciseId;
  const exerciseName = (typeof exerciseData === 'object' && exerciseData?.name) || currentExercise?.exerciseName || "Exercise";
  const animationUrl = (typeof exerciseData === 'object' && exerciseData?.animationUrl) || currentExercise?.exerciseAnimationUrl;
  const repsDisplay = currentExercise?.repsMin && currentExercise?.repsMax
    ? `${currentExercise.repsMin}-${currentExercise.repsMax}`
    : currentExercise?.reps;

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((t) => {
          if (t <= 1) {
            setIsResting(false);
            toast("Rest complete! Ready for next exercise 💪");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  // Exercise timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExerciseTimerRunning && exerciseTimeLeft > 0) {
      interval = setInterval(() => {
        setExerciseTimeLeft((t) => {
          if (t <= 1) {
            setIsExerciseTimerRunning(false);
            toast.success("⏱️ Time's up! Complete the exercise.");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExerciseTimerRunning, exerciseTimeLeft]);

  // Reset exercise timer when exercise changes
  useEffect(() => {
    const duration = currentExercise?.duration || 20;
    setExerciseTimeLeft(duration);
    setIsExerciseTimerRunning(false);
  }, [currentExerciseIndex, currentExercise?.duration]);

  const startWorkout = () => {
    setIsWorkoutStarted(true);
    setWorkoutStartTime(new Date());
  };

  const startExerciseTimer = () => {
    const duration = currentExercise?.duration || 20;
    setExerciseTimeLeft(duration);
    setIsExerciseTimerRunning(true);
  };

  const stopExerciseTimer = () => {
    setIsExerciseTimerRunning(false);
  };

  const completeExercise = () => {
    setCompletedExercises((prev) => new Set(prev).add(currentExerciseIndex));
    toast.success(`✅ ${exerciseName} completed!`);
    setIsExerciseTimerRunning(false);

    // Start rest period
    setRestTimeLeft(currentExercise?.restSeconds || 20);
    setIsResting(true);

    // Move to next exercise
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const skipExercise = () => {
    setIsExerciseTimerRunning(false);
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setIsResting(false);
    }
  };

  const goToExercise = (index: number) => {
    setCurrentExerciseIndex(index);
    setIsResting(false);
    setIsExerciseTimerRunning(false);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const finishWorkout = () => {
    if (completedExercises.size === 0) {
      toast.error("Complete at least one exercise to log your workout.");
      return;
    }
    setShowMoodDialog(true);
  };

  const submitWorkout = () => {
    if (selectedMood === null) {
      toast.error("Please select how you feel after the workout");
      return;
    }
    completeWorkoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="client-page__sections">
        <div className="client-card" style={{ padding: "3rem", textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #e5e7eb",
              borderTopColor: "#16a34a",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }}
          />
          <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading today&apos;s workout...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedTodayWorkout) {
    return (
      <div className="client-page__sections">
        <header style={{ marginBottom: "1rem" }}>
          <Link
            href="/client/workouts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Back to Workouts
          </Link>
        </header>
        <div className="client-card" style={{ padding: "3rem", textAlign: "center" }}>
          <Dumbbell style={{ width: 48, height: 48, color: "#d1d5db", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No Workout Scheduled Today
          </h2>
          <p style={{ color: "#6b7280" }}>
            Check your workout plan or contact your coach for a schedule.
          </p>
        </div>
      </div>
    );
  }

  const planSelector =
    todayWorkouts.length > 1 ? (
      <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Today&apos;s Workouts
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {todayWorkouts.map((w: any) => {
            const id = (w.workoutPlanId || w.planId) as string | undefined;
            const selected = !!id && id === selectedTodayPlanId;
            return (
              <button
                key={id}
                onClick={() => setSelectedTodayPlanId(id ?? null)}
                style={{
                  textAlign: "left",
                  padding: "0.75rem",
                  borderRadius: "10px",
                  border: selected ? "2px solid var(--brand-primary)" : "1px solid #e5e7eb",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {w.planName || w.workoutPlanName || "Workout Plan"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {w.isRestDay ? "Rest day" : `${(w.exercises?.length || 0)} exercises`}
                  </div>
                </div>
                {w.completed ? (
                  <CheckCircle2 style={{ width: 18, height: 18, color: "var(--brand-primary)" }} />
                ) : (
                  <ChevronRight style={{ width: 18, height: 18, color: "#9ca3af" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  // Rest Day
  if (selectedTodayWorkout.isRestDay) {
    return (
      <div className="client-page__sections">
        <header style={{ marginBottom: "1rem" }}>
          <Link
            href="/client/workouts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Back to Workouts
          </Link>
        </header>

        {planSelector}
        <div
          className="client-card"
          style={{
            padding: "3rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧘‍♀️</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Rest Day
          </h1>
          <p style={{ color: "#92400e", fontSize: "1rem" }}>
            Take it easy today and let your muscles recover. You&apos;ve earned it!
          </p>
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.7)",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Recovery Tips:
            </h3>
            <ul style={{ fontSize: "0.85rem", color: "#78350f", textAlign: "left", paddingLeft: "1.25rem" }}>
              <li>Stay hydrated - drink plenty of water</li>
              <li>Light stretching or yoga can help recovery</li>
              <li>Get adequate sleep (7-9 hours)</li>
              <li>Eat nutritious meals with protein</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Workout not started - show overview
  if (!isWorkoutStarted) {
    return (
      <div className="client-page__sections">
        <header style={{ marginBottom: "1rem" }}>
          <Link
            href="/client/workouts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Back to Workouts
          </Link>
        </header>

        {planSelector}

        <div
          className="client-card"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
            color: "#fff",
            padding: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            {(selectedTodayWorkout.dayName || "Today")}&apos;s Workout
          </h1>
          <p style={{ opacity: 0.9 }}>
            {selectedTodayWorkout.focus || selectedTodayWorkout.planName || selectedTodayWorkout.workoutPlanName}
          </p>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.85rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Dumbbell style={{ width: 16, height: 16 }} />
              {exercises.length} exercises
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Clock style={{ width: 16, height: 16 }} />
              ⏱️ {exercises.reduce((total, ex) => total + (ex.duration || 20), 0)}s total
            </span>
          </div>
        </div>

        {/* Exercise Preview List */}
        <div className="client-card" style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem" }}>
            Today&apos;s Exercises
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {exercises.map((exercise, index) => {
              const exData = exercise.exerciseId;
              const exName = (typeof exData === 'object' && exData?.name) || exercise.exerciseName || "Exercise";
              const exAnimation = (typeof exData === 'object' && exData?.animationUrl) || exercise.exerciseAnimationUrl;
              const reps = exercise.repsMin && exercise.repsMax
                ? `${exercise.repsMin}-${exercise.repsMax}`
                : exercise.reps;

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                  }}
                >
                  <ExerciseAnimation
                    animationUrl={exAnimation}
                    exerciseName={exName}
                    size="small"
                    showControls={false}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                      {index + 1}. {exName}
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {reps && (
                        <span style={{ fontSize: "0.75rem", color: "#2563eb" }}>
                          {reps} reps
                        </span>
                      )}
                      <span style={{ fontSize: "0.75rem", color: "#d97706" }}>
                        {exercise.duration || 20}s
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startWorkout}
          className="client-button"
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <Play style={{ width: 20, height: 20 }} />
          Start Workout
        </button>
      </div>
    );
  }

  // Active Workout View
  return (
    <div className="client-page__sections">
      {/* Progress Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <Link
          href="/client/workouts"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "#6b7280",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Exit
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            ⏱️ {exercises.reduce((total, ex) => total + (ex.duration || 20), 0)}s
          </span>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            {completedExercises.size}/{exercises.length} completed
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: "6px",
          backgroundColor: "#e5e7eb",
          borderRadius: "3px",
          marginBottom: "1.5rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(completedExercises.size / exercises.length) * 100}%`,
            backgroundColor: "#16a34a",
            transition: "width 0.3s",
          }}
        />
      </div>

      {/* Rest Timer Overlay */}
      {isResting && (
        <div
          className="client-card"
          style={{
            padding: "2rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            marginBottom: "1rem",
          }}
        >
          <Clock style={{ width: 32, height: 32, color: "#2563eb", margin: "0 auto 0.5rem" }} />
          <p style={{ fontSize: "0.9rem", color: "#1d4ed8", marginBottom: "0.5rem" }}>Rest Time</p>
          <p style={{ fontSize: "3rem", fontWeight: 700, color: "#1e40af" }}>{restTimeLeft}s</p>
          <button
            onClick={skipRest}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              backgroundColor: "#fff",
              border: "1px solid #2563eb",
              borderRadius: "8px",
              color: "#2563eb",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Skip Rest
          </button>
        </div>
      )}

      {/* Current Exercise */}
      {currentExercise && !isResting && (
        <div className="client-card" style={{ overflow: "hidden", marginBottom: "1rem" }}>
          {/* Animation Display */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "1.5rem",
              backgroundColor: "#111",
            }}
          >
            <ExerciseAnimation
              animationUrl={animationUrl}
              thumbnailUrl={typeof exerciseData === 'object' ? exerciseData?.thumbnailUrl : undefined}
              exerciseName={exerciseName}
              size="large"
              showControls={true}
            />
          </div>

          {/* Exercise Info */}
          <div style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              {exerciseName}
            </h2>

            {/* Reps/Duration */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                padding: "1rem",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                marginBottom: "1rem",
              }}
            >
              {repsDisplay && (
                <div style={{ flex: 1, textAlign: "center" }}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                    REPS
                  </p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111" }}>
                    {repsDisplay}
                  </p>
                </div>
              )}
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                  TIME
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111" }}>
                  {currentExercise?.duration || 20}s
                </p>
              </div>
              {currentExercise?.weight && (
                <div style={{ flex: 1, textAlign: "center" }}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                    WEIGHT
                  </p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111" }}>
                    {currentExercise.weight}
                  </p>
                </div>
              )}
            </div>

            {/* Instructions Toggle */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem",
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              <span style={{ fontWeight: 500, color: "#374151" }}>How to perform</span>
              {showInstructions ? (
                <ChevronUp style={{ width: 18, height: 18, color: "#6b7280" }} />
              ) : (
                <ChevronDown style={{ width: 18, height: 18, color: "#6b7280" }} />
              )}
            </button>

            {showInstructions && typeof exerciseData === 'object' && exerciseData?.instructions && (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              >
                <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {exerciseData.instructions.map((inst, idx) => (
                    <li
                      key={idx}
                      style={{ fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}
                    >
                      {inst}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Exercise Timer Display */}
            {isExerciseTimerRunning && (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#fef3c7",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "0.85rem", color: "#92400e", marginBottom: "0.25rem" }}>
                  Exercise Timer
                </p>
                <p style={{ fontSize: "2rem", fontWeight: 700, color: "#b45309" }}>
                  {exerciseTimeLeft}s
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <button
                onClick={isExerciseTimerRunning ? stopExerciseTimer : startExerciseTimer}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  backgroundColor: isExerciseTimerRunning ? "#fef3c7" : "#dbeafe",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  color: isExerciseTimerRunning ? "#92400e" : "#1e40af",
                  fontWeight: 500,
                }}
              >
                {isExerciseTimerRunning ? (
                  <>
                    <Pause style={{ width: 18, height: 18 }} />
                    Stop
                  </>
                ) : (
                  <>
                    <Timer style={{ width: 18, height: 18 }} />
                    Start Timer
                  </>
                )}
              </button>
              <button
                onClick={skipExercise}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  backgroundColor: "#fee2e2",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  color: "#991b1b",
                  fontWeight: 500,
                }}
              >
                <SkipForward style={{ width: 18, height: 18 }} />
                Skip
              </button>
            </div>

            {/* Complete Exercise Button */}
            <button
              onClick={completeExercise}
              className="client-button"
              style={{
                width: "100%",
                padding: "0.875rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <CheckCircle2 style={{ width: 18, height: 18 }} />
              Complete Exercise
            </button>
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="client-card" style={{ padding: "1rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          All Exercises
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {exercises.map((exercise, index) => {
            const isCompleted = completedExercises.has(index);
            const isCurrent = index === currentExerciseIndex;
            const exData = exercise.exerciseId;
            const exName = (typeof exData === 'object' && exData?.name) || exercise.exerciseName || "Exercise";

            return (
              <button
                key={index}
                onClick={() => goToExercise(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  backgroundColor: isCurrent ? "#dcfce7" : isCompleted ? "#f0fdf4" : "#f9fafb",
                  border: isCurrent ? "2px solid #16a34a" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 style={{ width: 20, height: 20, color: "#16a34a" }} />
                ) : (
                  <Circle style={{ width: 20, height: 20, color: "#d1d5db" }} />
                )}
                <span
                  style={{
                    flex: 1,
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCompleted ? "#16a34a" : "#374151",
                  }}
                >
                  {index + 1}. {exName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Finish Workout Button */}
      {completedExercises.size > 0 && (
        <button
          onClick={finishWorkout}
          disabled={completeWorkoutMutation.isPending}
          style={{
            width: "100%",
            padding: "1rem",
            backgroundColor: completedExercises.size === exercises.length ? "#16a34a" : "#f59e0b",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <Trophy style={{ width: 20, height: 20 }} />
          {completedExercises.size === exercises.length
            ? "Complete Workout"
            : `Finish Early (${completedExercises.size}/${exercises.length})`}
        </button>
      )}

      {/* Mood Selection Dialog */}
      {showMoodDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="client-card" style={{
            maxWidth: "400px",
            width: "100%",
            padding: "1.5rem"
          }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              How do you feel?
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.5rem" }}>
              Rate your post-workout feeling (1=Exhausted, 5=Energized)
            </p>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(5, 1fr)", 
              gap: "0.5rem",
              marginBottom: "1rem"
            }}>
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  style={{
                    aspectRatio: "1",
                    fontSize: "1.5rem",
                    border: selectedMood === mood ? "2px solid #16a34a" : "2px solid #e5e7eb",
                    borderRadius: "12px",
                    background: selectedMood === mood ? "#f0fdf4" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {mood === 1 ? "😫" : mood === 2 ? "😓" : mood === 3 ? "😐" : mood === 4 ? "😊" : "🤩"}
                </button>
              ))}
            </div>

            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="Add notes about your workout (optional)..."
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
                marginBottom: "1rem",
                minHeight: "80px",
                resize: "vertical"
              }}
            />

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setShowMoodDialog(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitWorkout}
                disabled={completeWorkoutMutation.isPending}
                className="client-button"
                style={{
                  flex: 2,
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  fontWeight: 600
                }}
              >
                {completeWorkoutMutation.isPending ? "Submitting..." : "Complete Workout 🎉"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
