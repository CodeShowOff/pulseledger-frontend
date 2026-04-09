"use client";

import React from "react";
import Link from "next/link";
import ProductTemplateForm from "@/components/admin/ProductTemplateForm";

export default function AdminCreateProductTemplatePage() {
  return (
    <div>
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Create Product Template</h1>
          <p className="admin-page-header__subtitle">
            Create a global product template coaches can adopt
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/product-templates" className="btn btn--outline">
            Back
          </Link>
        </div>
      </section>

      <ProductTemplateForm />
    </div>
  );
}
