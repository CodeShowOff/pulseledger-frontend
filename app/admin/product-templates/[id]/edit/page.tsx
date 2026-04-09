"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductTemplateForm from "@/components/admin/ProductTemplateForm";
import { useProductTemplate } from "@/lib/queries/products";

export default function AdminEditProductTemplatePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: template, isLoading, isError } = useProductTemplate(id);

  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Edit Product Template</h1>
          <p className="admin-page-header__subtitle">
            Update template details, pricing, and publish status
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/product-templates" className="btn btn--outline">
            Back
          </Link>
        </div>
      </section>

      {isLoading ? (
        <div className="admin-card">Loading template...</div>
      ) : isError || !template ? (
        <div className="admin-card">Failed to load template.</div>
      ) : (
        <ProductTemplateForm template={template} />
      )}
    </div>
  );
}
