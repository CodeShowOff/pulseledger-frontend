// app/coach/workout-plans/templates/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "@/lib/motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateFromWorkoutTemplate,
  useWorkoutTemplate,
} from "@/lib/queries/workouts";
import getErrorMessage from "@/lib/getErrorMessage";
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

const DAYS = [
  { num: 1, name: "Monday" },
  { num: 2, name: "Tuesday" },
  { num: 3, name: "Wednesday" },
  { num: 4, name: "Thursday" },
  { num: 5, name: "Friday" },
  { num: 6, name: "Saturday" },
  { num: 7, name: "Sunday" },
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

export default function CoachViewWorkoutTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateIdParam = params?.id;
  const templateId = Array.isArray(templateIdParam)
    ? templateIdParam[0]
    : templateIdParam;
  const safeTemplateId = typeof templateId === "string" ? templateId : "";

  const { data: template, isLoading, error } = useWorkoutTemplate(safeTemplateId);
  const createFromTemplate = useCreateFromWorkoutTemplate();

  const handleUseTemplate = () => {
    if (!safeTemplateId) return;

    createFromTemplate.mutate(
      { templateId: safeTemplateId, data: {} },
      {
        onSuccess: (res) => {
          const planId = (res as { data?: { _id?: string } })?.data?._id;
          toast.success("Workout plan created from template");
          if (planId) router.push(`/coach/workout-plans/${planId}/edit`);
          else router.push("/coach/workout-plans");
        },
        onError: (e: unknown) =>
          toast.error(getErrorMessage(e, "Failed to create plan")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            Loading template...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm font-medium text-rose-700">Template not found.</p>
            <Link href="/coach/workout-plans/templates" className="w-fit">
              <Button variant="outline" size="sm">
                Back to Templates
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
                    Workout Template
                  </Badge>
                  {template.isFeatured ? (
                    <Badge className="w-fit !border-amber-200 !bg-amber-100 !text-amber-900 text-[10px] sm:text-xs">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  ) : null}
                </div>

                <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                  {template.name}
                </CardTitle>

                <CardDescription className="max-w-2xl text-xs !text-white/90 sm:text-sm md:text-base">
                  {template.description ||
                    "Review this template and clone it into your coach workspace."}
                </CardDescription>
              </div>

              <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:gap-2 md:justify-end">
                <Link href="/coach/workout-plans/templates" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Templates
                  </Button>
                </Link>

                <Link href="/coach/workout-plans" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Workouts
                  </Button>
                </Link>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleUseTemplate}
                  disabled={createFromTemplate.isPending || !safeTemplateId}
                  className="col-span-2 h-8 w-full !bg-white px-2.5 text-xs !text-indigo-700 hover:!bg-indigo-50 sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {createFromTemplate.isPending ? "Creating..." : "Use Template"}
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
                <Target className="h-4 w-4" />
              </span>
              Template overview
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Category</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {prettifyLabel(template.category)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Difficulty</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {prettifyLabel(template.difficulty)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Duration</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {template.durationWeeks ? `${template.durationWeeks} weeks` : "Not set"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Days / Week</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {template.daysPerWeek || template.weeklySchedule?.length || 0}
                </p>
              </div>
            </div>

            {template.targetAudience ? (
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Users className="h-4 w-4 text-slate-500" />
                  Target Audience
                </p>
                <p className="text-sm leading-6 text-slate-600">{template.targetAudience}</p>
              </div>
            ) : null}

            {template.equipmentRequired && template.equipmentRequired.length > 0 ? (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Dumbbell className="h-4 w-4 text-slate-500" />
                  Equipment Required
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {template.equipmentRequired.map((equipment, idx) => (
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

            {template.tags && template.tags.length > 0 ? (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Sparkles className="h-4 w-4 text-slate-500" />
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map((tag, idx) => (
                    <Badge
                      key={`${tag}-${idx}`}
                      className="border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] normal-case tracking-normal text-indigo-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="text-xs text-slate-500">
              Used <span className="font-semibold text-slate-700">{template.usageCount || 0}</span> times by coaches.
            </p>
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
                <Calendar className="h-4 w-4" />
              </span>
              Weekly schedule
            </CardTitle>
            <CardDescription>Daily structure and exercise breakdown.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const scheduleDay = template.weeklySchedule?.find(
                  (item) => item.dayNumber === day.num
                );

                if (!scheduleDay) return null;

                return (
                  <article
                    key={day.num}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5",
                        scheduleDay.isRestDay ? "bg-slate-50" : "bg-emerald-50/60"
                      )}
                    >
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {scheduleDay.dayName || day.name}
                        </h3>
                        {scheduleDay.focusArea && !scheduleDay.isRestDay ? (
                          <p className="text-xs text-slate-600">Focus: {scheduleDay.focusArea}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {scheduleDay.isRestDay ? (
                          <Badge
                            variant="secondary"
                            className="border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] normal-case tracking-normal text-slate-600"
                          >
                            Rest Day
                          </Badge>
                        ) : null}

                        {!scheduleDay.isRestDay && scheduleDay.estimatedDuration ? (
                          <Badge
                            variant="secondary"
                            className="border border-slate-200 bg-white px-2 py-0.5 text-[11px] normal-case tracking-normal text-slate-700"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            ~{scheduleDay.estimatedDuration} min
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    {scheduleDay.isRestDay ? (
                      <div className="px-3 py-3 text-sm text-slate-500">Recovery day</div>
                    ) : scheduleDay.exercises && scheduleDay.exercises.length > 0 ? (
                      <div className="space-y-2 p-3">
                        {scheduleDay.exercises.map((exercise, exIndex) => {
                          const exerciseName =
                            typeof exercise.exerciseId === "object" && exercise.exerciseId?.name
                              ? exercise.exerciseId.name
                              : "Exercise";

                          return (
                            <div
                              key={`${day.num}-${exIndex}`}
                              className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-emerald-600 shadow-sm">
                                    <Dumbbell className="h-3.5 w-3.5" />
                                  </span>
                                  <p className="truncate text-sm font-medium text-slate-800">{exerciseName}</p>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-500">#{exIndex + 1}</span>
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
                                <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
                                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Reps</p>
                                  <p className="text-xs font-semibold text-slate-800">
                                    {exercise.reps ?? "—"}
                                  </p>
                                </div>
                                <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
                                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Duration</p>
                                  <p className="text-xs font-semibold text-slate-800">
                                    {exercise.duration ? `${exercise.duration}s` : "—"}
                                  </p>
                                </div>
                                <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
                                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Weight</p>
                                  <p className="text-xs font-semibold text-slate-800">
                                    {exercise.weight || "—"}
                                  </p>
                                </div>
                                <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
                                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Rest</p>
                                  <p className="text-xs font-semibold text-slate-800">
                                    {exercise.restSeconds ? `${exercise.restSeconds}s` : "—"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-3 py-3 text-sm text-slate-500">No exercises for this day.</div>
                    )}
                  </article>
                );
              })}
            </div>

            {!template.weeklySchedule || template.weeklySchedule.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
                No weekly schedule available in this template.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
