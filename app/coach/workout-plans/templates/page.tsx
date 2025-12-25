// app/coach/workout-plans/templates/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  useWorkoutTemplates,
  useCreateFromWorkoutTemplate,
  type WorkoutTemplate,
} from "@/lib/queries/workouts";
import getErrorMessage from "@/lib/getErrorMessage";

const PER_PAGE = 10;

export default function CoachWorkoutTemplatesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");

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

  const { data, isLoading } = useWorkoutTemplates(params);
  const createFromTemplate = useCreateFromWorkoutTemplate();

  const templates: WorkoutTemplate[] = data?.data ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, totalPages: 1, limit: PER_PAGE };

  const onUseTemplate = (templateId: string) => {
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
      }
    );
  };

  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title coach-page-header__title">
            Browse Templates
          </h1>
          <p className="admin-page-header__subtitle coach-page-header__subtitle">
            Clone an admin template into your own plan
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link
            href="/coach/workout-plans"
            className="btn btn--outline"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back
          </Link>
        </div>
      </section>

      <section className="admin-card" style={{ marginTop: "1.5rem" }}>
        <div className="admin-filters">
          <input
            className="admin-search-input"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <input
            className="admin-search-input"
            placeholder="Category (e.g. strength)"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          />
          <input
            className="admin-search-input"
            placeholder="Difficulty (beginner/intermediate/advanced)"
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Weeks</th>
                  <th>Days/week</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "0.75rem", textAlign: "center", color: "var(--admin-color-muted)" }}>
                      Loading templates...
                    </td>
                  </tr>
                ) : templates.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "0.75rem", textAlign: "center", color: "var(--admin-color-muted)" }}>
                      No templates found.
                    </td>
                  </tr>
                ) : (
                  templates.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <FileText style={{ width: 16, height: 16, color: "var(--admin-color-muted)" }} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{t.name}</div>
                            {t.description ? (
                              <div style={{ color: "var(--admin-color-muted)", fontSize: "var(--admin-font-size-xs)" }}>
                                {t.description}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--admin-color-muted)" }}>{t.category || "—"}</td>
                      <td style={{ color: "var(--admin-color-muted)" }}>{t.difficulty || "—"}</td>
                      <td style={{ color: "var(--admin-color-muted)" }}>{t.durationWeeks ?? "—"}</td>
                      <td style={{ color: "var(--admin-color-muted)" }}>{t.daysPerWeek ?? "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Link
                            href={`/coach/workout-plans/templates/${t._id}`}
                            className="btn btn--outline"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.5rem 0.75rem",
                            }}
                          >
                            <Eye style={{ width: 14, height: 14 }} />
                            View Details
                          </Link>
                          <button
                            type="button"
                            className="btn btn--primary"
                            onClick={() => onUseTemplate(t._id)}
                            disabled={createFromTemplate.isPending}
                            style={{ padding: "0.5rem 0.75rem" }}
                          >
                            Use Template
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-pagination">
          <div>
            Page {pagination.page} of {pagination.totalPages} (total {pagination.total})
          </div>
          <div className="admin-pagination__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
