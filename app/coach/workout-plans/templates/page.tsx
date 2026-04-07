// app/coach/workout-plans/templates/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "@/lib/motion";
import {
  ArrowLeft,
  Dumbbell,
  Eye,
  FileText,
  Filter,
  Layers3,
  Search,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import {
  useWorkoutTemplates,
  useCreateFromWorkoutTemplate,
  type WorkoutTemplate,
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PER_PAGE = 10;
const DIFFICULTIES = ["", "beginner", "intermediate", "advanced"];

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const difficultyTone: Record<string, string> = {
  beginner: "border-emerald-200 bg-emerald-50 text-emerald-700",
  intermediate: "border-amber-200 bg-amber-50 text-amber-700",
  advanced: "border-rose-200 bg-rose-50 text-rose-700",
};

function prettifyLabel(value?: string) {
  if (!value) return "Not set";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CoachWorkoutTemplatesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: PER_PAGE,
      search: search || undefined,
      category: category || undefined,
      difficulty: difficulty || undefined,
      isActive: true,
    }),
    [page, search, category, difficulty]
  );

  const { data, isLoading, isFetching } = useWorkoutTemplates(params);
  const createFromTemplate = useCreateFromWorkoutTemplate();

  const templates: WorkoutTemplate[] = data?.data ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, totalPages: 1, limit: PER_PAGE };

  const onUseTemplate = (templateId: string) => {
    setCreatingTemplateId(templateId);
    createFromTemplate.mutate(
      { templateId, data: {} },
      {
        onSuccess: (res) => {
          const planId = (res as { data?: { _id?: string } })?.data?._id;
          toast.success("Workout plan created from template");
          if (planId) router.push(`/coach/workout-plans/${planId}/edit`);
          else router.push("/coach/workout-plans");
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, "Failed to create plan")),
        onSettled: () => setCreatingTemplateId(null),
      }
    );
  };

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
                <Badge className="w-fit border-white/25 bg-white/15 text-[11px] text-white sm:text-xs">
                  Workout Templates
                </Badge>
                <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                  Build plans faster with proven templates
                </CardTitle>
                <CardDescription className="max-w-2xl text-xs !text-white/90 sm:text-sm md:text-base">
                  Browse admin-curated workout templates, preview details, and clone the best fit into your coaching library.
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
                <Link href="/coach/workout-plans/create" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Blank Plan
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
                <Filter className="h-4 w-4" />
              </span>
              Filter templates
            </CardTitle>
            <CardDescription>Find templates by name, category, or difficulty.</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px] md:items-end">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by template name"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </label>
                <Input
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. strength, mobility"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                >
                  {DIFFICULTIES.map((item) => (
                    <option key={item || "all"} value={item}>
                      {item ? prettifyLabel(item) : "All difficulties"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
                <Layers3 className="h-4 w-4" />
              </span>
              Template catalog
            </CardTitle>
            <CardDescription>
              {isFetching && !isLoading
                ? "Refreshing templates..."
                : "Preview templates and clone them into editable plans."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`template-skeleton-${index}`}
                    className="h-[210px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
                  />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <FileText className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No templates found</p>
                <p className="mt-1 text-xs text-slate-500">Try changing filters to discover more options.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => (
                  <article key={template._id} className="h-full">
                    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.55)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                            {template.name}
                          </h3>
                          <p className="text-xs text-slate-500">Created template</p>
                        </div>
                        {template.isFeatured ? (
                          <Badge className="border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
                            <Star className="mr-1 h-3 w-3" />
                            Featured
                          </Badge>
                        ) : null}
                      </div>

                      {template.description ? (
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">
                          {template.description}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400">No description provided.</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge
                          variant="secondary"
                          className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] normal-case tracking-normal text-slate-700"
                        >
                          {prettifyLabel(template.category)}
                        </Badge>
                        <Badge
                          className={cn(
                            "border px-2 py-0.5 text-[10px] normal-case tracking-normal",
                            difficultyTone[(template.difficulty || "").toLowerCase()] ??
                              "border-slate-200 bg-slate-50 text-slate-700"
                          )}
                        >
                          {prettifyLabel(template.difficulty)}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-500">Weeks</p>
                          <p className="text-sm font-semibold text-slate-800">{template.durationWeeks ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-500">Days/Wk</p>
                          <p className="text-sm font-semibold text-slate-800">{template.daysPerWeek ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-500">Usage</p>
                          <p className="text-sm font-semibold text-slate-800">{template.usageCount ?? 0}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link href={`/coach/workout-plans/templates/${template._id}`}>
                          <Button type="button" variant="outline" size="sm" className="w-full">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onUseTemplate(template._id)}
                          disabled={createFromTemplate.isPending}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          {createFromTemplate.isPending && creatingTemplateId === template._id
                            ? "Using..."
                            : "Use Template"}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-sm text-slate-600">
                Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                {Number.isFinite(pagination.total) ? ` • ${pagination.total} total` : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((currentPage) => Math.min(Math.max(1, pagination.totalPages), currentPage + 1))
                  }
                  disabled={page >= Math.max(1, pagination.totalPages)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
