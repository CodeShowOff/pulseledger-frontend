"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";
import { motion } from "@/lib/motion";
import {
  Boxes,
  Package,
  PackagePlus,
  Pencil,
  RefreshCw,
  Search,
  ShoppingBag,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CoachRef = string | { _id: string };

type Product = {
  _id: string;
  name: string;
  description?: string;
  mrp?: number;
  price: number;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  coachId?: CoachRef;
};

type ProductsResponse = {
  success: boolean;
  data: Product[];
  pagination?: { total: number; page: number; totalPages: number };
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function getCoachId(coachRef?: CoachRef) {
  if (!coachRef) return "";
  if (typeof coachRef === "string") return coachRef;
  return coachRef._id ?? "";
}

function formatPrice(value?: number) {
  const safe = Number.isFinite(value) ? Number(value) : 0;
  return safe.toFixed(2);
}

const EditProductModal = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    mrp: String(product.mrp ?? 0),
    price: String(product.price ?? 0),
    category: product.category || "",
    imageUrl: product.imageUrl || "",
    isActive: product.isActive !== false,
  });

  const updateMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.put(`/products/${product._id}`, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        mrp: Number(form.mrp),
        price: Number(form.price),
        category: form.category.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        isActive: form.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachProducts"] });
      onClose();
    },
  });

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/55 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl border-slate-200/90 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Edit product</CardTitle>
              <CardDescription>Update details and availability.</CardDescription>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close edit modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={4}
                className="min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  MRP (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.mrp}
                  onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selling price (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Image URL
                </label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Active product
            </label>

            {updateMutation.isError ? (
              <p className="text-sm text-rose-600">Failed to update product. Please try again.</p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.status === "pending"}
              >
                {updateMutation.status === "pending" ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function CoachProductsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, error } = useQuery<ProductsResponse>({
    queryKey: ["coachProducts", page, debouncedSearch, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);
      if (user?.id) params.set("coachId", user.id);

      const res = await api.get(`/products?${params.toString()}`);
      return res.data as ProductsResponse;
    },
    placeholderData: keepPreviousData,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => p.category)
            .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const totalProducts = pagination?.total ?? products.length;

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachProducts"] });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const canManageProduct = (product: Product) => {
    const ownerId = getCoachId(product.coachId);
    if (!ownerId || !user?.id) return true;
    return ownerId === user.id;
  };

  const handleDelete = (product: Product) => {
    const ok = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );
    if (!ok) return;
    deleteMutation.mutate(product._id);
  };

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-5 md:gap-4 md:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="space-y-1.5">
                <Badge className="w-fit border-white/25 bg-white/15 text-[11px] text-white sm:text-xs">
                  Storefront
                </Badge>
                <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                  Manage your products like a pro
                </CardTitle>
              </div>

              <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:gap-2 md:justify-end">
                <Link href="/coach/orders" className="col-span-2 sm:col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Received Orders
                  </Button>
                </Link>
                <Link href="/coach/vouchers" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <TicketPercent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Vouchers
                  </Button>
                </Link>
                <Link href="/coach/products/create" className="min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-white/25 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <PackagePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Add Product
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5 sm:gap-3 sm:pt-2">
              <div className="min-w-0 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 sm:px-4 sm:py-3">
                <p className="text-[10px] uppercase tracking-wide text-blue-100 sm:text-[11px]">
                  Products
                </p>
                <p className="mt-0.5 text-lg font-semibold sm:mt-1 sm:text-xl">
                  {isLoading ? "--" : totalProducts}
                </p>
              </div>
              <div className="min-w-0 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 sm:px-4 sm:py-3">
                <p className="text-[10px] uppercase tracking-wide text-blue-100 sm:text-[11px]">
                  Visible categories
                </p>
                <p className="mt-0.5 text-lg font-semibold sm:mt-1 sm:text-xl">
                  {isLoading ? "--" : categoryOptions.length}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Search className="h-4 w-4" />
              </span>
              Find products
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by name or description"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex md:items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["coachProducts"] })}
                  disabled={isFetching}
                  className="w-full md:w-auto"
                >
                  <RefreshCw className={cn("h-4 w-4", isFetching ? "animate-spin" : "")} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Boxes className="h-4 w-4" />
              </span>
              Product catalog
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`product-skeleton-${index}`}
                    className="h-[280px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
                Failed to load products.
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <Package className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No products found</p>
                <p className="mt-1 text-xs text-slate-500">Try changing filters or add a new product.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {products.map((product) => {
                  const hasDiscount =
                    Number.isFinite(product.mrp) &&
                    Number(product.mrp) > Number(product.price);

                  return (
                    <article key={product._id} className="h-full">
                      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.55)]">
                        <div className="relative mb-3 flex h-[170px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={180}
                              height={160}
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
                              className="h-[150px] w-full object-contain p-2"
                            />
                          ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
                              <Package className="h-5 w-5" />
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">{product.name}</h3>
                            <Badge
                              variant={product.isActive ? "success" : "danger"}
                              className="shrink-0 px-2 py-0.5 text-[10px] normal-case tracking-normal"
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          {product.category ? (
                            <div className="mt-2">
                              <Badge
                                variant="secondary"
                                className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                              >
                                {product.category}
                              </Badge>
                            </div>
                          ) : null}

                          {product.description ? (
                            <DescriptionWithToggle text={product.description} />
                          ) : (
                            <p className="mt-2 text-xs text-slate-400">No description added.</p>
                          )}

                          <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                            <div className="flex items-center gap-2">
                              {hasDiscount ? (
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{formatPrice(product.mrp)}
                                </span>
                              ) : null}
                              <span className="text-base font-semibold text-slate-900">
                                ₹{formatPrice(product.price)}
                              </span>
                            </div>
                            {hasDiscount ? (
                              <p className="text-xs font-medium text-emerald-700">
                                Save ₹{formatPrice(Number(product.mrp) - Number(product.price))}
                              </p>
                            ) : null}
                          </div>

                          {canManageProduct(product) ? (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditing(product)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(product)}
                                disabled={deletingId === product._id}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {deletingId === product._id ? "Deleting" : "Delete"}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {pagination && pagination.totalPages > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <p className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                  {Number.isFinite(pagination.total) ? ` • ${pagination.total} total` : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.section>

      {editing ? (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function DescriptionWithToggle({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
        >
          View details
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs leading-5 text-slate-600">{text}</p>
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
      >
        Hide details
      </button>
    </div>
  );
}
