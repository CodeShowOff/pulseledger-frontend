"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/axios";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";

// Lightweight edit modal component (could be moved to its own file later)
const EditProductModal = ({ product, onClose }: { product: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    mrp: product.mrp || 0,
    price: product.price || 0,
    category: product.category || "",
    imageUrl: product.imageUrl || "",
    isActive: product.isActive !== false,
  });

  const updateMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.put(`/products/${product._id}`, {
        ...form,
        mrp: Number(form.mrp),
        price: Number(form.price),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachProducts"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-lg rounded-md shadow-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1 w-full rounded border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} className="mt-1 w-full rounded border p-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">MRP (₹)</label>
              <input type="number" step="0.01" value={form.mrp} onChange={e => setForm(f => ({...f, mrp: e.target.value}))} className="mt-1 w-full rounded border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Selling Price (₹)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} className="mt-1 w-full rounded border p-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Category</label>
              <input value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="mt-1 w-full rounded border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Image URL</label>
              <input value={form.imageUrl} onChange={e => setForm(f => ({...f, imageUrl: e.target.value}))} className="mt-1 w-full rounded border p-2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="isActive" type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" disabled={updateMutation.status === 'pending'} className="px-4 py-2 rounded bg-blue-600 text-white">
              {updateMutation.status === 'pending' ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

type ProductsResponse = {
  success: boolean;
  data: any[];
  pagination?: { total: number; page: number; totalPages: number };
};

type Voucher = {
  _id: string;
  code: string;
  name: string;
  discountPercent: number;
  appliesToAllClients: boolean;
  isActive: boolean;
};

export default function CoachProductsPage() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ["coachProducts", page, debouncedSearch, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);
      if (user?.id) params.set("coachId", user.id); // only own products
      const res = await api.get(`/products?${params.toString()}`);
      return res.data as ProductsResponse; // includes success, data[], pagination
    },
    placeholderData: keepPreviousData,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  // Voucher list moved to /coach/vouchers page

  const categoryOptions = Array.from(
    new Set(
      (products || [])
        .map((p: any) => p.category)
        .filter((c: any) => typeof c === "string" && c.trim().length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachProducts"] });
    },
  });

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-600">Failed to load products.</p>;

  return (
    <div>
      <section className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 className="admin-page-header__title coach-page-header__title">My Products</h1>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Link href="/coach/orders" className="btn btn--outline">
              Received Orders
            </Link>
            <Link href="/coach/vouchers" className="btn btn--primary">
              Vouchers
            </Link>
            <Link href="/coach/products/create" className="btn btn--primary">
              Add Product
            </Link>
          </div>
        </div>
      </section>

      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div
          className="admin-card-grid"
          style={{ rowGap: "1rem", columnGap: "1rem" }}
        >
          <div>
            <label className="admin-card__label">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name/description"
              className="auth-form__input"
            />
          </div>
          <div>
            <label className="admin-card__label">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="auth-form__input"
            >
              <option value="">All categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["coachProducts"],
                })
              }
              className="btn btn--secondary"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Add Product form moved to /coach/products/create */}

      {/* Vouchers listing removed from products; see /coach/vouchers */}

      <div className="admin-card">
        {products.length ? (
          <div
            className="admin-card-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {products.map((p: any) => (
              <div key={p._id} className="admin-card" style={{ display: "flex", flexDirection: "column" }}>
                {p.imageUrl && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      width={150}
                      height={150}
                      style={{
                        width: "100%",
                        height: 150,
                        objectFit: "contain",
                        backgroundColor: "#f9fafb",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 className="admin-card__title">{p.name}</h3>
                  {p.description && (
                    <DescriptionWithToggle text={p.description} />
                  )}
                  <p
                    className="admin-page-header__subtitle"
                    style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}
                  >
                    MRP: ₹{p.mrp || 0} | Selling: ₹{p.price}
                  </p>
                  {p.category && (
                    <p
                      className="admin-page-header__subtitle"
                      style={{ marginTop: "0.25rem" }}
                    >
                      Category: {p.category}
                    </p>
                  )}
                  <p
                    className="admin-page-header__subtitle"
                    style={{
                      marginTop: "0.25rem",
                      color: p.isActive ? "#059669" : "#dc2626",
                      fontWeight: 500,
                    }}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                {p.coachId === user?.id && (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setEditing(p)}
                      className="btn btn--primary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(p._id)}
                      disabled={deleteMutation.status === "pending"}
                      className="btn btn--danger"
                    >
                      {deleteMutation.status === "pending"
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-page-header__subtitle">No products found.</p>
        )}

        {pagination && (
          <div className="admin-pagination" style={{ marginTop: "1.25rem" }}>
            <p className="admin-page-header__subtitle">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="admin-pagination__controls">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn--outline"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn btn--outline"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
        />
      )}
      
    </div>
  );
}

function DescriptionWithToggle({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <p className="admin-page-header__subtitle" style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            padding: 0,
            border: "none",
            background: "none",
            color: "#3b82f6",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          View details
        </button>
      </p>
    );
  }

  return (
    <div>
      <p className="admin-page-header__subtitle" style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
        {text}
      </p>
      <p className="admin-page-header__subtitle" style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          style={{
            padding: 0,
            border: "none",
            background: "none",
            color: "#3b82f6",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Hide details
        </button>
      </p>
    </div>
  );
}
