// app/client/workouts/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dumbbell,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  Target,
  Flame,
  Trophy,
  Play,
  ArrowLeft,
  SkipForward,
  Circle,
  ChevronDown,
  ChevronUp,
  Timer,
  Pause,
} from "lucide-react";
import {
  useClientWorkoutPlans,
  useClientTodayWorkout,
  useClientWorkoutStats,
  CLIENT_WORKOUT_PLANS_KEY,
  CLIENT_WORKOUT_LOGS_KEY,
  CLIENT_TODAY_WORKOUT_KEY,
} from "@/lib/queries/workouts";
import api from "@/lib/axios";
import ExerciseAnimation from "@/components/shared/ExerciseAnimation";
import { toast } from "sonner";
import { formatISTDate, getISTDayOfWeek } from "@/lib/ist";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Exercise {
  exerciseId?:
    | string
    | {
        _id: string;
        name: string;
        category?: string;
        muscleGroups?: string[];
        animationUrl?: string;
        thumbnailUrl?: string;
        instructions?: string[];
      };
  exerciseName?: string;
  name?: string;
  sets?: number;
  reps?: number;
  repsMin?: number;
  repsMax?: number;
  duration?: number;
  restSeconds?: number;
  weight?: string;
  notes?: string;
}

export default function ClientWorkoutsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"today" | "plans" | "history">("today");
  const [selectedTodayPlanId, setSelectedTodayPlanId] = useState<string | null>(null);
  
  // Workout execution state
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState(false);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);

  // Fetch assigned workout plans
  const { data: plans = [], isLoading: plansLoading } = useClientWorkoutPlans();

  // Fetch today's workout
  const { data: todayWorkouts = [], isLoading: todayLoading } = useClientTodayWorkout();

  // Fetch workout stats
  const { data: stats } = useClientWorkoutStats();

  const today = new Date();
  const dayOfWeek = getISTDayOfWeek(today);
  const todayDateString = formatISTDate(today);

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

  // Get exercises from today's workout
  const exercises: Exercise[] = selectedTodayWorkout?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];

  // Get exercise details
  const exerciseData = currentExercise?.exerciseId;
  const exerciseObj = typeof exerciseData === "string" ? undefined : exerciseData;
  const exerciseName =
    exerciseObj?.name || currentExercise?.exerciseName || currentExercise?.name || "Exercise";
  const animationUrl = exerciseObj?.animationUrl;
  const repsDisplay = currentExercise?.reps || 
    (currentExercise?.repsMin && currentExercise?.repsMax 
      ? `${currentExercise.repsMin}-${currentExercise.repsMax}` 
      : null);

  // Complete workout mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const duration = workoutStartTime
        ? Math.round((new Date().getTime() - workoutStartTime.getTime()) / 60000)
        : 0;
      
      // Build exercise logs from completed exercises
      const exerciseLogs = exercises.map((ex, index) => ({
        exerciseId: typeof ex.exerciseId === "string" ? ex.exerciseId : ex.exerciseId?._id,
        exerciseName:
          (typeof ex.exerciseId === "string" ? undefined : ex.exerciseId?.name) ||
          ex.exerciseName ||
          ex.name,
        completedSets: completedExercises.has(index) ? (ex.sets || 1) : 0,
        completed: completedExercises.has(index),
      }));

      // Use the log ID from today's workout
      if (selectedTodayWorkout?._id) {
        const res = await api.post(`/client/workouts/${selectedTodayWorkout._id}/complete`, {
          exerciseLogs,
          actualDuration: duration,
          clientNotes: `Completed ${completedExercises.size} of ${exercises.length} exercises`,
        });
        return res.data;
      } else {
        throw new Error("No workout log found for today");
      }
    },
    onSuccess: () => {
      toast.success("🎉 Workout completed! Great job!");
      queryClient.invalidateQueries({ queryKey: CLIENT_TODAY_WORKOUT_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_PLANS_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_LOGS_KEY });
      setIsWorkoutStarted(false);
      setCurrentExerciseIndex(0);
      setCompletedExercises(new Set());
      setWorkoutStartTime(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to complete workout. Please try again.");
    },
  });

  // Rest timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      timer = setTimeout(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            toast("Rest complete! Ready for next exercise 💪");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isResting && restTimeLeft === 0) {
      setIsResting(false);
    }
    return () => clearTimeout(timer);
  }, [isResting, restTimeLeft]);

  // Exercise timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExerciseTimerRunning && exerciseTimeLeft > 0) {
      timer = setTimeout(() => {
        setExerciseTimeLeft((prev) => {
          if (prev <= 1) {
            setIsExerciseTimerRunning(false);
            toast.success("⏱️ Time's up! Complete the exercise.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isExerciseTimerRunning && exerciseTimeLeft === 0) {
      setIsExerciseTimerRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isExerciseTimerRunning, exerciseTimeLeft]);

  // Reset exercise timer when exercise changes
  useEffect(() => {
    const duration = currentExercise?.duration || 20;
    setExerciseTimeLeft(duration);
    setIsExerciseTimerRunning(false);
  }, [currentExerciseIndex, currentExercise?.duration]);

  // Start workout
  const startWorkout = () => {
    setIsWorkoutStarted(true);
    setCurrentExerciseIndex(0);
    setCompletedExercises(new Set());
    setWorkoutStartTime(new Date());
  };

  // Exit workout
  const exitWorkout = () => {
    if (completedExercises.size > 0) {
      if (confirm("You have progress. Do you want to exit? Your progress will be lost.")) {
        setIsWorkoutStarted(false);
        setCurrentExerciseIndex(0);
        setCompletedExercises(new Set());
        setWorkoutStartTime(null);
      }
    } else {
      setIsWorkoutStarted(false);
      setWorkoutStartTime(null);
    }
  };

  // Complete current exercise
  const completeExercise = () => {
    // Mark current exercise as completed
    setCompletedExercises((prev) => new Set([...prev, currentExerciseIndex]));
    toast.success(`✅ ${exerciseName} completed!`);

    // Move to next uncompleted exercise
    const nextIndex = exercises.findIndex(
      (_, i) => i > currentExerciseIndex && !completedExercises.has(i)
    );
    if (nextIndex !== -1) {
      setCurrentExerciseIndex(nextIndex);
      const restTime = exercises[nextIndex]?.restSeconds || 20;
      setRestTimeLeft(restTime);
      setIsResting(true);
    }
    // Reset exercise timer
    setIsExerciseTimerRunning(false);
    setExerciseTimeLeft(0);
  };

  // Skip exercise
  const skipExercise = () => {
    // Mark current as completed (skipped still counts as completed)
    setCompletedExercises((prev) => new Set([...prev, currentExerciseIndex]));
    
    const nextIndex = exercises.findIndex(
      (_, i) => i > currentExerciseIndex && !completedExercises.has(i)
    );
    if (nextIndex !== -1) {
      setCurrentExerciseIndex(nextIndex);
      setIsResting(false);
      setRestTimeLeft(0);
    }
    // Reset exercise timer
    setIsExerciseTimerRunning(false);
    setExerciseTimeLeft(0);
  };

  // Go to specific exercise
  const goToExercise = (index: number) => {
    // Allow redoing any exercise, even if completed
    setCurrentExerciseIndex(index);
    setIsResting(false);
    setIsExerciseTimerRunning(false);
    setExerciseTimeLeft(0);
    // Remove from completed if clicking on it again
    if (completedExercises.has(index)) {
      const newCompleted = new Set(completedExercises);
      newCompleted.delete(index);
      setCompletedExercises(newCompleted);
    }
  };

  // Skip rest
  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  // Start exercise timer
  const startExerciseTimer = () => {
    const duration = currentExercise?.duration || 20;
    setExerciseTimeLeft(duration);
    setIsExerciseTimerRunning(true);
  };

  // Stop exercise timer
  const stopExerciseTimer = () => {
    setIsExerciseTimerRunning(false);
  };

  // Finish workout
  const finishWorkout = () => {
    if (completedExercises.size === 0) {
      toast.error("Complete at least one exercise to log your workout.");
      return;
    }
    completeWorkoutMutation.mutate();
  };

  // Render active workout UI
  const renderActiveWorkout = () => (
    <div>
      {/* Progress Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={exitWorkout}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Exit
        </button>
        <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
          {completedExercises.size}/{exercises.length} completed
        </span>
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
              thumbnailUrl={exerciseObj?.thumbnailUrl}
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

            {/* Reps/Duration/Weight */}
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
                  {currentExercise.duration || 20}s
                </p>
              </div>
              {currentExercise.weight && (
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
            {exerciseObj?.instructions && exerciseObj.instructions.length > 0 && (
              <>
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

                {showInstructions && (
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                    }}
                  >
                    <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
                      {exerciseObj.instructions.map((inst: string, idx: number) => (
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
              </>
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
            const exObj = typeof exData === "string" ? undefined : exData;
            const exName = exObj?.name || exercise.exerciseName || exercise.name || "Exercise";

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
            backgroundColor: completeWorkoutMutation.isPending 
              ? "#9ca3af" 
              : completedExercises.size === exercises.length ? "#16a34a" : "#f59e0b",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: completeWorkoutMutation.isPending ? "not-allowed" : "pointer",
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: completeWorkoutMutation.isPending ? 0.7 : 1,
          }}
        >
          <Trophy style={{ width: 20, height: 20 }} />
          {completeWorkoutMutation.isPending
            ? "Saving..."
            : completedExercises.size === exercises.length
            ? "Complete Workout"
            : `Finish Early (${completedExercises.size}/${exercises.length})`}
        </button>
      )}
    </div>
  );

  // Render workout preview
  const renderWorkoutPreview = () => (
    <div className="client-card" style={{ overflow: "hidden" }}>
      <div
        style={{
          padding: "1rem",
          background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "0.8rem", opacity: 0.9 }}>
              {DAYS[dayOfWeek]}, {todayDateString}
            </p>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              {selectedTodayWorkout?.focus || "Today's Workout"}
            </h2>
            {exercises.length > 0 && (
              <p style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "0.25rem" }}>
                ⏱️ {exercises.reduce((total, ex) => total + (ex.duration || 20), 0)}s total
              </p>
            )}
          </div>
          {selectedTodayWorkout?.completed ? (
            <CheckCircle2 style={{ width: 28, height: 28 }} />
          ) : (
            <Dumbbell style={{ width: 28, height: 28 }} />
          )}
        </div>
      </div>

      <div style={{ padding: "1rem" }}>
        {selectedTodayWorkout?.isRestDay ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧘</p>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Rest Day</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              Take it easy and recover. You deserve it!
            </p>
          </div>
        ) : exercises.length > 0 ? (
          <>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem", paddingTop: "0.5rem" }}>
              Today&apos;s Exercises
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {exercises.map((exercise: Exercise, index: number) => {
                const exData = exercise.exerciseId;
                const exObj = typeof exData === "string" ? undefined : exData;
                const exName = exObj?.name || exercise.exerciseName || exercise.name || "Exercise";
                const exAnimation = exObj?.animationUrl;
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
                      thumbnailUrl={exObj?.thumbnailUrl}
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
            <button
              onClick={startWorkout}
              className="client-button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "1rem",
                width: "100%",
              }}
            >
              <Play style={{ width: 18, height: 18 }} />
              {selectedTodayWorkout?.completed ? "Redo Workout" : "Start Workout"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <p style={{ color: "#6b7280" }}>
              No exercises scheduled for today
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="client-page__sections">
      {/* Show header only when not in active workout */}
      {!isWorkoutStarted && (
        <>
          <header className="client-page__header">
            <h1 className="client-page__title">
              <Dumbbell
                style={{
                  width: 28,
                  height: 28,
                  marginRight: "0.5rem",
                  color: "var(--brand-primary)",
                }}
              />
              My Workouts
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Track your fitness journey and complete your daily workouts
            </p>
          </header>

          {/* Stats Overview */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              className="client-card"
              style={{
                padding: "1rem",
                textAlign: "center",
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              }}
            >
              <Trophy style={{ width: 24, height: 24, color: "#16a34a", margin: "0 auto 0.5rem" }} />
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16a34a" }}>
                {stats?.totalWorkouts || 0}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Total Workouts</p>
            </div>

            <div
              className="client-card"
              style={{
                padding: "1rem",
                textAlign: "center",
            background: stats?.todayCompleted 
              ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
              : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
          }}
        >
          <Flame style={{ 
            width: 24, 
            height: 24, 
            color: stats?.todayCompleted ? "#d97706" : "#9ca3af", 
            margin: "0 auto 0.5rem" 
          }} />
          <p style={{ 
            fontSize: "1.5rem", 
            fontWeight: 700, 
            color: stats?.todayCompleted ? "#d97706" : "#9ca3af",
            opacity: stats?.todayCompleted ? 1 : 0.6,
          }}>
            {stats?.todayCompleted 
              ? (stats?.streak || 0)
              : (stats?.yesterdayCompleted ? (stats?.streak || 0) : 0)}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Day Streak</p>
          {!stats?.todayCompleted && stats?.yesterdayCompleted && (
            <p style={{ fontSize: "0.6rem", color: "#9ca3af", marginTop: "0.25rem" }}>
              Complete today to increase!
            </p>
          )}
        </div>

        <div
          className="client-card"
          style={{
            padding: "1rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          }}
        >
          <Target style={{ width: 24, height: 24, color: "#2563eb", margin: "0 auto 0.5rem" }} />
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2563eb" }}>
            {stats?.completionRate || 0}%
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Completion Rate</p>
        </div>

            <div
              className="client-card"
              style={{
                padding: "1rem",
                textAlign: "center",
                background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
              }}
            >
              <Clock style={{ width: 24, height: 24, color: "#db2777", margin: "0 auto 0.5rem" }} />
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#db2777" }}>
                {stats?.totalDuration || 0}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Total Minutes</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "0.5rem",
            }}
          >
            {[
              { key: "today", label: "Today" },
              { key: "plans", label: "My Plans" },
              { key: "history", label: "History" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key as any)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.9rem",
                  fontWeight: view === tab.key ? 600 : 400,
                  color: view === tab.key ? "var(--brand-primary)" : "#6b7280",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom:
                    view === tab.key ? "2px solid var(--brand-primary)" : "2px solid transparent",
                  marginBottom: "-0.6rem",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Today's Workout */}
      {view === "today" && (
        <div>
          {todayLoading ? (
            <div
              className="client-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              Loading today&apos;s workout...
            </div>
          ) : selectedTodayWorkout ? (
            <>
              {todayWorkouts.length > 1 && !isWorkoutStarted && (
                <div
                  className="client-card"
                  style={{ padding: "1rem", marginBottom: "1rem" }}
                >
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
                            <div style={{ fontWeight: 600, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
              )}

              {isWorkoutStarted ? renderActiveWorkout() : renderWorkoutPreview()}
            </>
          ) : (
            <div
              className="client-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <Dumbbell
                style={{
                  width: 48,
                  height: 48,
                  color: "#d1d5db",
                  margin: "0 auto 1rem",
                }}
              />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                No Workout Plan Assigned
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Your coach hasn&apos;t assigned a workout plan yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      )}

      {/* My Plans */}
      {view === "plans" && !isWorkoutStarted && (
        <div>
          {plansLoading ? (
            <div
              className="client-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              Loading plans...
            </div>
          ) : plans.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {plans.map((plan: any) => (
                <Link
                  key={plan._id}
                  href={`/client/workouts/plan/${plan._id}`}
                  className="client-card"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem",
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                        {plan.name}
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                        {plan.goal?.replace(/_/g, " ")} •{" "}
                        {plan.difficulty} •{" "}
                        {plan.durationWeeks} weeks
                      </p>
                    </div>
                    <ChevronRight style={{ width: 20, height: 20, color: "#9ca3af" }} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="client-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <Calendar
                style={{
                  width: 48,
                  height: 48,
                  color: "#d1d5db",
                  margin: "0 auto 1rem",
                }}
              />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                No Plans Yet
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Your coach will assign workout plans to you.
              </p>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {view === "history" && !isWorkoutStarted && (
        <div>
          <Link
            href="/client/workouts/history"
            className="client-card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Calendar style={{ width: 20, height: 20, color: "var(--brand-primary)" }} />
              <span style={{ fontWeight: 500 }}>View Workout History</span>
            </div>
            <ChevronRight style={{ width: 20, height: 20, color: "#9ca3af" }} />
          </Link>
        </div>
      )}
    </div>
  );
}
