"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteProductTemplate,
  useProductTemplateMetadata,
  useProductTemplates,
  type ProductTemplate,
} from "@/lib/queries/products";
import getErrorMessage from "@/lib/getErrorMessage";

const PER_PAGE = 10;

export default function AdminProductTemplatesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isActive, setIsActive] = useState("");
  const [isFeatured, setIsFeatured] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit: PER_PAGE,
      search: search || undefined,
      category: category || undefined,
      companyName: companyName || undefined,
      isActive: isActive === "" ? undefined : isActive === "true",
      isFeatured: isFeatured === "" ? undefined : isFeatured === "true",
    }),
    [page, search, category, companyName, isActive, isFeatured]
  );

  const { data, isLoading } = useProductTemplates(params);
  const { data: metadata } = useProductTemplateMetadata();
  const deleteMutation = useDeleteProductTemplate();

  const templates: ProductTemplate[] = data?.data ?? [];
  const pagination =
    data?.pagination ??
    ({ total: 0, page: 1, totalPages: 1, limit: PER_PAGE } as const);

  const onDelete = (id: string) => {
    if (!window.confirm("Delete this product template?")) return;

    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Template deleted"),
      onError: (e: unknown) => toast.error(getErrorMessage(e, "Failed to delete")),
    });
  };

  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Product Templates</h1>
          <p className="admin-page-header__subtitle">
            Global product templates coaches can adopt and sell
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link
            href="/admin/product-templates/create"
            className="btn btn--primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Create Template
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
            placeholder="Category (e.g. protein)"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="admin-search-input"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Company: All</option>
            {(metadata?.companies || []).map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
          <select
            className="admin-search-input"
            value={isActive}
            onChange={(e) => {
              setIsActive(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select
            className="admin-search-input"
            value={isFeatured}
            onChange={(e) => {
              setIsFeatured(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Featured: All</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
        </div>

        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Company</th>
                  <th>MRP</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Usage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        color: "var(--admin-color-muted)",
                      }}
                    >
                      Loading templates...
                    </td>
                  </tr>
                ) : templates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        color: "var(--admin-color-muted)",
                      }}
                    >
                      No templates found.
                    </td>
                  </tr>
                ) : (
                  templates.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        {t.description ? (
                          <div
                            style={{
                              color: "var(--admin-color-muted)",
                              fontSize: "var(--admin-font-size-xs)",
                            }}
                          >
                            {t.description}
                          </div>
                        ) : null}
                      </td>
                      <td style={{ color: "var(--admin-color-muted)" }}>{t.category || "—"}</td>
                      <td style={{ color: "var(--admin-color-muted)" }}>{t.companyName || "—"}</td>
                      <td style={{ color: "var(--admin-color-muted)" }}>₹{Number(t.mrp || 0).toFixed(2)}</td>
                      <td style={{ color: "var(--admin-color-muted)" }}>₹{Number(t.price || 0).toFixed(2)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <span className={t.isActive ? "badge badge--success" : "badge badge--danger"}>
                            {t.isActive ? "Active" : "Inactive"}
                          </span>
                          {t.isFeatured ? <span className="badge badge--success">Featured</span> : null}
                        </div>
                      </td>
                      <td style={{ color: "var(--admin-color-muted)" }}>{t.usageCount ?? 0}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="btn btn--outline"
                            onClick={() => router.push(`/admin/product-templates/${t._id}/edit`)}
                            title="Edit"
                          >
                            <Pencil style={{ width: 16, height: 16 }} />
                          </button>
                          <button
                            type="button"
                            className="btn btn--outline"
                            onClick={() => onDelete(t._id)}
                            disabled={deleteMutation.isPending}
                            title="Delete"
                          >
                            <Trash2 style={{ width: 16, height: 16 }} />
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
