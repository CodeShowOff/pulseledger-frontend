"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Package } from "lucide-react";

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  stock: number;
  isActive: boolean;
  coachId?: { fullName: string; email: string };
  createdAt: string;
};

type ApiResponse = { data: Product[]; pagination: { total: number; page: number; totalPages: number } };

const fetchProducts = async (page = 1): Promise<ApiResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  const res = await api.get(`/admin/products?${params.toString()}`);
  return res.data;
};

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);

  const { data = { data: [], pagination: { total: 0, page: 1, totalPages: 1 } }, isLoading, error } = useQuery({
    queryKey: ["adminProducts", page],
    queryFn: () => fetchProducts(page),
  });

  const products: Product[] = data.data ?? [];
  const pagination = data.pagination ?? { total: 0, page: 1, totalPages: 1 };

  return (
    <div>
      <header className="admin-page-header">
        <h1 className="admin-page-header__title">Products</h1>
        <p className="admin-page-header__subtitle">
          View products listed by coaches and their availability.
        </p>
      </header>

      <section className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Coach</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                    Loading products...
                  </td>
                </tr>
              )}
              {error && !isLoading && (
                <tr>
                  <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center", color: "#dc2626" }}>
                    Failed to load products
                  </td>
                </tr>
              )}
              {!isLoading && !error &&
                products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.coachId?.fullName ?? "-"}</td>
                    <td>{p.category ?? "-"}</td>
                    <td>₹{p.price.toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={p.isActive ? "badge badge--success" : "badge badge--neutral"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              {!isLoading && !error && products.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <div>
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="admin-pagination__actions">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn--outline"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="btn btn--outline"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
