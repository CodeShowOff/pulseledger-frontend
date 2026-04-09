"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateProductFromTemplate,
  useProductTemplate,
} from "@/lib/queries/products";
import getErrorMessage from "@/lib/getErrorMessage";

export default function CoachProductTemplateDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: template, isLoading, isError } = useProductTemplate(id);
  const createFromTemplate = useCreateProductFromTemplate();

  const handleUseTemplate = () => {
    if (!id) return;

    createFromTemplate.mutate(
      { templateId: id, data: {} },
      {
        onSuccess: () => {
          toast.success("Product created from template");
          router.push("/coach/products");
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, "Failed to create product")),
      }
    );
  };

  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title coach-page-header__title">
            Product Template Details
          </h1>
          <p className="admin-page-header__subtitle coach-page-header__subtitle">
            Review and add this template to your product catalog
          </p>
        </div>
        <div className="admin-page-header__actions" style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            href="/coach/products/templates"
            className="btn btn--outline"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back
          </Link>
          <button
            type="button"
            className="btn btn--primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            onClick={handleUseTemplate}
            disabled={createFromTemplate.isPending || !id}
          >
            <Sparkles style={{ width: 14, height: 14 }} />
            {createFromTemplate.isPending ? "Using..." : "Use Template"}
          </button>
        </div>
      </section>

      {isLoading ? (
        <div className="admin-card" style={{ marginTop: "1.5rem" }}>
          Loading template...
        </div>
      ) : isError || !template ? (
        <div className="admin-card" style={{ marginTop: "1.5rem" }}>
          Failed to load template.
        </div>
      ) : (
        <section className="admin-card" style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{template.name}</h2>
              {template.description ? (
                <p style={{ marginTop: "0.5rem", color: "var(--admin-color-muted)" }}>
                  {template.description}
                </p>
              ) : null}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "0.75rem",
              }}
            >
              <div className="admin-card" style={{ margin: 0 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-color-muted)" }}>MRP</div>
                <div style={{ fontWeight: 700, marginTop: "0.2rem" }}>₹{Number(template.mrp || 0).toFixed(2)}</div>
              </div>
              <div className="admin-card" style={{ margin: 0 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-color-muted)" }}>Price</div>
                <div style={{ fontWeight: 700, marginTop: "0.2rem" }}>₹{Number(template.price || 0).toFixed(2)}</div>
              </div>
              <div className="admin-card" style={{ margin: 0 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-color-muted)" }}>Category</div>
                <div style={{ fontWeight: 700, marginTop: "0.2rem" }}>{template.category || "—"}</div>
              </div>
              <div className="admin-card" style={{ margin: 0 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-color-muted)" }}>Usage</div>
                <div style={{ fontWeight: 700, marginTop: "0.2rem" }}>{template.usageCount || 0}</div>
              </div>
            </div>

            {template.tags && template.tags.length > 0 ? (
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginBottom: "0.5rem",
                    color: "var(--admin-color-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  <Tag style={{ width: 14, height: 14 }} />
                  Tags
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {template.tags.map((tag, idx) => (
                    <span key={`${tag}-${idx}`} className="badge badge--neutral">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn--primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                onClick={handleUseTemplate}
                disabled={createFromTemplate.isPending || !id}
              >
                <Package style={{ width: 14, height: 14 }} />
                {createFromTemplate.isPending ? "Creating..." : "Use This Template"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
