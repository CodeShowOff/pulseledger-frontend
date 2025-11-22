"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ProductForm = dynamic(() => import("@/components/coach/ProductForm"), {
  loading: () => <div className="p-6 text-center">Loading form...</div>,
  ssr: false
});

export default function CoachCreateProductPage() {
  return (
    <div>
      <section className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 className="admin-page-header__title coach-page-header__title">Add Product</h1>
            <p className="admin-page-header__subtitle coach-page-header__subtitle">
              Create a new product for your clients to purchase.
            </p>
          </div>
          <div>
            <Link href="/coach/products" className="btn btn--outline">Back to Products</Link>
          </div>
        </div>
      </section>

      <div className="admin-card">
        <ProductForm />
      </div>
    </div>
  );
}
