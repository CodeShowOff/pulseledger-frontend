"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

const ProductForm = dynamic(() => import("@/components/coach/ProductForm"), {
  loading: () => <div className="p-6 text-center">Loading form...</div>,
  ssr: false
});

export default function CoachCreateProductPage() {
  return (
    <div>
      <section className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
          <div>
            <h1 className="admin-page-header__title coach-page-header__title">Add Product</h1>
          </div>
          <div>
            <Link
              href="/coach/products"
              className="btn btn--outline"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} />
              Back
            </Link>
          </div>
        </div>
      </section>

      <div style={{ marginBottom: "0.75rem" }}>
        <Link
          href="/coach/products/templates"
          className="btn btn--primary"
          style={{ display: "inline-flex", width: "100%", justifyContent: "center" }}
        >
          Choose from Templates
        </Link>
      </div>

      <div className="admin-card">
        <ProductForm />
      </div>
    </div>
  );
}
