// app/coach/workout-plans/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "@/lib/motion";
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Dumbbell,
  Target,
  Clock,
  Zap,
  Sparkles,
} from "lucide-react";
import { useCoachWorkoutPlan, WorkoutDay, WorkoutSession, PlanExercise } from "@/lib/queries/workouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DAYS_SUNDAY_FIRST = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAYS_MONDAY_FIRST = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function prettifyLabel(value?: string) {
  if (!value) return "Not set";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getDayLabel(day: WorkoutDay, dayIndex: number) {
  if (day.dayName?.trim()) return day.dayName;

  if (typeof day.dayOfWeek === "number" && day.dayOfWeek >= 0 && day.dayOfWeek < 7) {
    return DAYS_SUNDAY_FIRST[day.dayOfWeek];
  }

  if (typeof day.dayNumber === "number" && day.dayNumber >= 1 && day.dayNumber <= 7) {
    return DAYS_MONDAY_FIRST[day.dayNumber - 1];
  }

  return DAYS_SUNDAY_FIRST[dayIndex] || `Day ${dayIndex + 1}`;
}

function getExerciseName(exercise: PlanExercise) {
  if (typeof exercise.exerciseId === "object" && exercise.exerciseId?.name) {
    return exercise.exerciseId.name;
  }

  return exercise.exerciseName || "Exercise";
}

export default function ViewWorkoutPlanPage() {
  const params = useParams();
  const planIdParam = params?.id;
  const planId = Array.isArray(planIdParam) ? planIdParam[0] : planIdParam;
  const safePlanId = typeof planId === "string" ? planId : "";

  const { data: plan, isLoading, error } = useCoachWorkoutPlan(safePlanId);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            Loading plan...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm font-medium text-rose-700">Plan not found.</p>
            <Link href="/coach/workout-plans" className="w-fit">
              <Button variant="outline" size="sm">
                Back to Workout Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-4 md:pt-6">
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
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge className="w-fit border-white/25 bg-white/15 text-[11px] text-white sm:text-xs">
                    Workout Plan
                  </Badge>
                  {plan.isDraft ? (
                    <Badge className="w-fit !border-amber-200 !bg-amber-100 !text-amber-900 text-[10px] sm:text-xs">
                      Draft
                    </Badge>
                  ) : null}
                </div>

                <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                  {plan.name}
                </CardTitle>

                <CardDescription className="max-w-2xl text-xs !text-white/90 sm:text-sm md:text-base">
                  {plan.description ||
                    "Review your workout structure and keep sessions aligned with client goals."}
                </CardDescription>
              </div>

              <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:gap-2 md:justify-end">
                <Link href="/coach/workout-plans" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Workouts
                  </Button>
                </Link>

                <Link href={`/coach/workout-plans/${safePlanId}/edit`} className="min-w-0">
                  <Button
                    size="sm"
                    className="h-8 w-full !bg-white px-2.5 text-xs !text-indigo-700 hover:!bg-indigo-50 sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Edit Plan
                  </Button>
                </Link>
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
                <Target className="h-4 w-4" />
              </span>
              Plan overview
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Category</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Target className="h-3.5 w-3.5 text-emerald-600" />
                  {prettifyLabel(plan.category)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Difficulty</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Zap className="h-3.5 w-3.5 text-blue-600" />
                  {prettifyLabel(plan.difficulty)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Duration</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  {plan.durationWeeks ? `${plan.durationWeeks} weeks` : "Not set"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Days / Week</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-pink-600" />
                  {plan.daysPerWeek || plan.weeklySchedule?.length || 0} days
                </p>
              </div>
            </div>

            {plan.equipmentRequired && plan.equipmentRequired.length > 0 ? (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Dumbbell className="h-4 w-4 text-slate-500" />
                  Equipment required
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.equipmentRequired.map((equipment, idx) => (
                    <Badge
                      key={`${equipment}-${idx}`}
                      variant="secondary"
                      className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] normal-case tracking-normal text-slate-700"
                    >
                      {prettifyLabel(equipment)}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.section>

      {plan.subscriptionPlanIds && plan.subscriptionPlanIds.length > 0 ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                Linked subscription plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {plan.subscriptionPlanIds.map((subscriptionPlan) => (
                  <Badge
                    key={subscriptionPlan._id}
                    className="border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] normal-case tracking-normal text-indigo-700"
                  >
                    {subscriptionPlan.title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar className="h-4 w-4" />
              </span>
              Weekly schedule
            </CardTitle>
            <CardDescription>Daily session flow and exercise targets.</CardDescription>
          </CardHeader>

          <CardContent>
            {plan.weeklySchedule && plan.weeklySchedule.length > 0 ? (
              <div className="space-y-2">
                {plan.weeklySchedule.map((day: WorkoutDay, dayIndex: number) => {
                  const dayLabel = getDayLabel(day, dayIndex);
                  const workouts = day.workouts ?? [];
                  const hasMultipleWorkouts = workouts.length > 1;
                  const dayEstimatedDuration = workouts.reduce(
                    (total, workout) => total + (workout.estimatedDuration || 0),
                    0
                  );

                  return (
                    <article
                      key={day._id || `${day.dayName || "day"}-${dayIndex}`}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                    >
                      <div
                        className={cn(
                          "flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5",
                          day.isRestDay ? "bg-slate-50" : "bg-emerald-50/60"
                        )}
                      >
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900">{dayLabel}</h3>
                          {day.focusArea && !day.isRestDay ? (
                            <p className="text-xs text-slate-600">Focus: {day.focusArea}</p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {day.isRestDay ? (
                            <Badge
                              variant="secondary"
                              className="border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] normal-case tracking-normal text-slate-600"
                            >
                              Rest Day
                            </Badge>
                          ) : null}

                          {!day.isRestDay && dayEstimatedDuration > 0 ? (
                            <Badge
                              variant="secondary"
                              className="border border-slate-200 bg-white px-2 py-0.5 text-[11px] normal-case tracking-normal text-slate-700"
                            >
                              <Clock className="mr-1 h-3 w-3" />~{dayEstimatedDuration} min
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {day.isRestDay ? (
                        <div className="px-3 py-3 text-sm text-slate-500">
                          {day.restDayNotes || "Recovery day"}
                        </div>
                      ) : workouts.length > 0 ? (
                        <div className={cn("p-3", hasMultipleWorkouts ? "space-y-3" : "") }>
                          {workouts.map((workout: WorkoutSession, wIndex: number) => {
                            const workoutName = workout.name?.trim();
                            const isDuplicateDayName = workoutName
                              ? workoutName.toLowerCase() === dayLabel.trim().toLowerCase()
                              : false;
                            const workoutTitle =
                              workoutName && !isDuplicateDayName
                                ? workoutName
                                : workouts.length > 1
                                ? `Session ${wIndex + 1}`
                                : "";
                            const showWorkoutHeader = Boolean(workoutTitle);
                            const showTopSpacing = showWorkoutHeader || Boolean(workout.description);

                            return (
                              <section
                                key={workout._id || `${workout.name || "session"}-${wIndex}`}
                                className={cn(
                                  hasMultipleWorkouts
                                    ? "rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                                    : ""
                                )}
                              >
                                {showWorkoutHeader ? (
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                      {workoutTitle ? (
                                        <>
                                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-emerald-600 shadow-sm">
                                            <Dumbbell className="h-3.5 w-3.5" />
                                          </span>
                                          <p className="truncate text-sm font-semibold text-slate-800">
                                            {workoutTitle}
                                          </p>
                                        </>
                                      ) : null}
                                    </div>
                                  </div>
                                ) : null}

                                {workout.description ? (
                                  <p className={cn("text-xs leading-5 text-slate-600", showWorkoutHeader ? "mt-2" : "")}>{workout.description}</p>
                                ) : null}

                                {workout.exercises && workout.exercises.length > 0 ? (
                                  <div className={cn("space-y-2", showTopSpacing ? "mt-3" : "")}>
                                    {workout.exercises.map((exercise: PlanExercise, exIndex: number) => (
                                      <div
                                        key={exercise._id || `${exercise.order}-${exIndex}`}
                                        className="rounded-md border border-slate-200 bg-white p-2.5"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex min-w-0 items-center gap-2">
                                            <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-50 text-emerald-600">
                                              <Dumbbell className="h-3 w-3" />
                                            </span>
                                            <p className="truncate text-xs font-medium text-slate-800">
                                              {getExerciseName(exercise)}
                                            </p>
                                          </div>
                                          <span className="text-[11px] font-semibold text-slate-500">
                                            #{exIndex + 1}
                                          </span>
                                        </div>

                                        <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
                                          <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                                            <p className="text-[10px] uppercase tracking-wide text-slate-500">Reps</p>
                                            <p className="text-xs font-semibold text-slate-800">
                                              {exercise.reps ?? "—"}
                                            </p>
                                          </div>
                                          <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                                            <p className="text-[10px] uppercase tracking-wide text-slate-500">Duration</p>
                                            <p className="text-xs font-semibold text-slate-800">
                                              {exercise.duration ? `${exercise.duration}s` : "—"}
                                            </p>
                                          </div>
                                          <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                                            <p className="text-[10px] uppercase tracking-wide text-slate-500">Weight</p>
                                            <p className="text-xs font-semibold text-slate-800">
                                              {exercise.weight || "—"}
                                            </p>
                                          </div>
                                          <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                                            <p className="text-[10px] uppercase tracking-wide text-slate-500">Rest</p>
                                            <p className="text-xs font-semibold text-slate-800">
                                              {exercise.restSeconds ? `${exercise.restSeconds}s` : "—"}
                                            </p>
                                          </div>
                                        </div>

                                        {exercise.notes ? (
                                          <p className="mt-2 text-[11px] text-slate-500">Note: {exercise.notes}</p>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className={cn("text-xs text-slate-500", showTopSpacing ? "mt-3" : "")}>No exercises in this session.</p>
                                )}
                              </section>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-3 py-3 text-sm text-slate-500">No sessions added for this day.</div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
                No schedule configured for this plan.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
