"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/store";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce client search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  type ProductsResponse = {
    success: boolean;
    data: any[];
    pagination?: { total: number; page: number; totalPages: number };
  };


  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ["products", page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await api.get(`/products?${params.toString()}`);
      return res.data as ProductsResponse;
    },
    placeholderData: keepPreviousData,
  });

  const { addItem, updateQuantity, items, coachId } = useCartStore((state) => ({
    addItem: state.addItem,
    updateQuantity: state.updateQuantity,
    items: state.items,
    coachId: state.coachId,
  }));

  const userCoachId = useAuthStore((state) => state.user?.coachId ?? null);
  const role = useAuthStore((state) => state.user?.role);

  // Calculate number of unique item types in cart
  const cartItemsCount = items.length;

  const itemsById = useMemo(() => {
    const map = new Map<string, (typeof items)[number]>();
    items.forEach((item) => map.set(item.productId, item));
    return map;
  }, [items]);

  const handleAdd = (product: any) => {
    if (!product?.coachId) {
      toast.error("Unable to add this product right now.");
      return;
    }

    if (userCoachId && userCoachId !== product.coachId) {
      toast.error("You can only order products from your assigned coach.");
      return;
    }

    if (coachId && coachId !== product.coachId) {
      toast.error("All items in an order must be from the same coach.");
      return;
    }

    addItem(
      {
        productId: product._id,
        name: product.name,
        price: product.price ?? 0,
        coachId: product.coachId,
      },
      1
    );
    toast.success("Added to cart");
  };

  if (isLoading) return <p className="client-card__subtitle">Loading products...</p>;
  if (error)
    return (
      <p className="client-card__subtitle" style={{ color: "#b91c1c" }}>
        Failed to load products.
      </p>
    );

  return (
    <div className="client-page">
      <div className="client-page__inner">
        <header className="client-page__header">
          <h1 className="client-page__title">Products</h1>
          <p className="client-page__subtitle">
            Add items from your coach to the cart and submit an order. Your
            coach will review it from their dashboard.
          </p>
          <div style={{ marginTop: "0.75rem", maxWidth: 360 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or description"
              className="auth-form__input"
            />
          </div>
        </header>
        <div className="client-page__sections">
          <div className="client-card">
            <div
              className="client-card__header"
              style={{
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p className="client-card__title">Available Products</p>
                <p className="client-card__subtitle">
                  Choose items from your coach and manage quantities in your cart.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Link 
                  href="/client/cart" 
                  className="client-button"
                  style={{ position: "relative" }}
                >
                  My Cart
                  {cartItemsCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        backgroundColor: "#dc2626",
                        color: "white",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      {cartItemsCount > 99 ? "99+" : cartItemsCount}
                    </span>
                  )}
                </Link>
                {/* Voucher selection moved to My Cart page */}
                {role === "client" && (
                  <Link href="/client/orders" className="client-button client-button--outline">
                    Order History
                  </Link>
                )}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {data?.data?.length ? (
                data.data.map((p: any) => {
                  const cartItem = itemsById.get(p._id);
                  const inCart = Boolean(cartItem);
                  return (
                    <div key={p._id} className="client-card" style={{ boxShadow: "none", display: "flex", flexDirection: "column" }}>
                      {p.imageUrl && (
                        <div style={{ marginBottom: "0.5rem" }}>
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
                      <div className="client-card__header" style={{ marginBottom: "0.5rem" }}>
                        <div>
                          <p className="client-card__title" style={{ fontSize: "0.95rem" }}>
                            {p.name}
                          </p>
                          {p.description && (
                            <DescriptionWithToggle text={p.description} />
                          )}
                        </div>
                      </div>
                      <div className="client-meta-row" style={{ marginTop: 0, flexDirection: "column", alignItems: "flex-start", gap: "0.25rem", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          {p.mrp && p.mrp > p.price && (
                            <>
                              <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "0.85rem" }}>
                                ₹{(p.mrp ?? 0).toFixed(2)}
                              </span>
                              <span style={{ color: "#059669", fontWeight: "600", fontSize: "0.85rem" }}>
                                {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                              </span>
                            </>
                          )}
                        </div>
                        <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>₹{(p.price ?? 0).toFixed(2)}</span>
                        {p.category && (
                          <span className="client-pill" style={{ marginTop: "0.25rem" }}>
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: "0.6rem" }}>
                        {inCart ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderRadius: "999px",
                              border: "1px solid #e5e7eb",
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.8rem",
                            }}
                          >
                            <button
                              type="button"
                              style={{
                                padding: "0.15rem 0.5rem",
                                borderRadius: "999px",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                updateQuantity(
                                  p._id,
                                  Math.max(0, (cartItem?.quantity ?? 1) - 1)
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span>{cartItem?.quantity ?? 0}</span>
                            <button
                              type="button"
                              style={{
                                padding: "0.15rem 0.5rem",
                                borderRadius: "999px",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                updateQuantity(p._id, (cartItem?.quantity ?? 0) + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="client-button"
                            onClick={() => handleAdd(p)}
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="client-card__subtitle">No products found.</p>
              )}
            </div>
            {data?.pagination && (
              <div className="client-card" style={{ marginTop: "1rem" }}>
                <div className="admin-pagination" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                  <p className="client-card__subtitle" style={{ margin: 0 }}>
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="admin-pagination__controls" style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      disabled={data.pagination.page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="btn btn--outline"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={data.pagination.page >= data.pagination.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="btn btn--outline"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DescriptionWithToggle({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <p className="client-card__subtitle" style={{ fontSize: "0.8rem" }}>
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
      <p className="client-card__subtitle" style={{ fontSize: "0.8rem" }}>
        {text}
      </p>
      <p className="client-card__subtitle" style={{ fontSize: "0.8rem" }}>
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
