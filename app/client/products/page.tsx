"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/store";
import { motion } from "@/lib/motion";
import {
  Boxes,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
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

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

type ProductsResponse = {
  success: boolean;
  data: any[];
  pagination?: { total: number; page: number; totalPages: number };
};

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce client search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

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

  if (isLoading)
    return (
      <div className="space-y-4 pt-4 md:pt-6" aria-live="polite">
        <div className="h-[210px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="h-[120px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="h-[320px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
      </div>
    );

  if (error)
    return (
      <div className="pt-4 md:pt-6">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-rose-700">Failed to load products.</p>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="whitespace-nowrap text-lg font-bold tracking-tight text-white sm:text-3xl">
                  Products
                </h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  Discover your coach’s products and add them to cart.
                </CardDescription>
              </div>

              <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <Link href="/client/cart" className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="relative h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="sm:hidden">My Cart</span>
                    <span className="hidden sm:inline">My Cart</span>
                    {cartItemsCount > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 py-0.5 text-[9px] font-bold leading-none text-white sm:static sm:ml-1 sm:min-w-5 sm:px-1.5 sm:text-[10px]">
                        {cartItemsCount > 99 ? "99+" : cartItemsCount}
                      </span>
                    ) : null}
                  </Button>
                </Link>

                {role === "client" ? (
                  <Link href="/client/orders" className="min-w-0 flex-1 sm:flex-none">
                    <Button
                      variant="outline"
                      className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                    >
                      <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="sm:hidden">Order History</span>
                      <span className="hidden sm:inline">Order History</span>
                    </Button>
                  </Link>
                ) : null}
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
        <div className="flex items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products"
              className="h-9 pl-9"
            />
          </div>
        </div>
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
            {data?.data?.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {data.data.map((p: any) => {
                  const cartItem = itemsById.get(p._id);
                  const inCart = Boolean(cartItem);
                  const hasDiscount = Number.isFinite(p.mrp) && Number(p.mrp) > Number(p.price);

                  return (
                    <article key={p._id} className="h-full">
                      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.55)]">
                        <div className="relative mb-3 h-[170px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
                              className="object-contain"
                            />
                          ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
                              <Package className="h-5 w-5" />
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col">
                          <h3 className="text-sm font-semibold text-slate-900">{p.name}</h3>

                          {p.description ? <DescriptionWithToggle text={p.description} /> : null}

                          <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                            <div className="flex items-center gap-2">
                              {hasDiscount ? (
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{(p.mrp ?? 0).toFixed(2)}
                                </span>
                              ) : null}

                              <span className="text-base font-semibold text-slate-900">
                                ₹{(p.price ?? 0).toFixed(2)}
                              </span>
                            </div>

                            {hasDiscount ? (
                              <p className="text-xs font-medium text-emerald-700">
                                {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                              </p>
                            ) : null}

                            {p.category ? (
                              <Badge
                                variant="secondary"
                                className="mt-1 px-2 py-0.5 text-[10px] normal-case tracking-normal"
                              >
                                {p.category}
                              </Badge>
                            ) : null}
                          </div>

                          <div className="mt-3">
                            {inCart ? (
                              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
                                <button
                                  type="button"
                                  className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                                  onClick={() =>
                                    updateQuantity(
                                      p._id,
                                      Math.max(0, (cartItem?.quantity ?? 1) - 1)
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>

                                <span className="text-sm font-semibold text-slate-800">
                                  {cartItem?.quantity ?? 0}
                                </span>

                                <button
                                  type="button"
                                  className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                                  onClick={() =>
                                    updateQuantity(p._id, (cartItem?.quantity ?? 0) + 1)
                                  }
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                className="w-full"
                                onClick={() => handleAdd(p)}
                              >
                                <ShoppingCart className="h-4 w-4" />
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <Package className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No products found</p>
                <p className="mt-1 text-xs text-slate-500">Try changing your search.</p>
              </div>
            )}

            {data?.pagination ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <p className="text-sm text-slate-600">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                  {Number.isFinite(data.pagination.total)
                    ? ` • ${data.pagination.total} total`
                    : ""}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={data.pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={data.pagination.page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.section>
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

      <div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
        >
          Hide details
        </button>
      </div>
    </div>
  );
}
