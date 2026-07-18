"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Boxes, Eye, FileText, Package, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateProductsFromTemplatesBulk,
  useCreateProductFromTemplate,
  useProductTemplateMetadata,
  useProductTemplates,
  type ProductTemplate,
} from "@/lib/queries/products";
import getErrorMessage from "@/lib/getErrorMessage";
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

const PER_PAGE = 12;

export default function CoachProductTemplatesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const selectVisibleRef = useRef<HTMLInputElement | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: PER_PAGE,
      search: search || undefined,
      category: category || undefined,
      companyName: companyName || undefined,
      isActive: true,
    }),
    [page, search, category, companyName]
  );

  const { data, isLoading } = useProductTemplates(params);
  const { data: metadata } = useProductTemplateMetadata();
  const createFromTemplate = useCreateProductFromTemplate();
  const createFromTemplatesBulk = useCreateProductsFromTemplatesBulk();

  const templates: ProductTemplate[] = data?.data ?? [];
  const pagination =
    data?.pagination ??
    ({ total: 0, page: 1, totalPages: 1, limit: PER_PAGE } as const);

  const selectedTemplateSet = useMemo(
    () => new Set(selectedTemplateIds),
    [selectedTemplateIds]
  );

  const allVisibleSelected =
    templates.length > 0 && templates.every((template) => selectedTemplateSet.has(template._id));
  const someVisibleSelected =
    templates.length > 0 && templates.some((template) => selectedTemplateSet.has(template._id));

  useEffect(() => {
    if (selectVisibleRef.current) {
      selectVisibleRef.current.indeterminate = someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const onUseTemplate = (templateId: string) => {
    setCreatingTemplateId(templateId);
    createFromTemplate.mutate(
      { templateId, data: {} },
      {
        onSuccess: () => {
          toast.success("Product created from template");
          router.push("/coach/products");
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, "Failed to create product")),
        onSettled: () => setCreatingTemplateId(null),
      }
    );
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };

  const toggleSelectVisible = () => {
    setSelectedTemplateIds((prev) => {
      const nextSet = new Set(prev);

      if (allVisibleSelected) {
        templates.forEach((template) => nextSet.delete(template._id));
      } else {
        templates.forEach((template) => nextSet.add(template._id));
      }

      return Array.from(nextSet);
    });
  };

  const onUseSelectedTemplates = () => {
    if (selectedTemplateIds.length === 0) {
      toast.error("Select at least one template");
      return;
    }

    createFromTemplatesBulk.mutate(
      { templateIds: selectedTemplateIds },
      {
        onSuccess: (response) => {
          const createdCount = response?.data?.createdCount ?? 0;
          const skippedCount = response?.data?.skippedCount ?? 0;

          if (createdCount > 0 && skippedCount > 0) {
            toast.success(`Created ${createdCount} products, skipped ${skippedCount}`);
          } else if (createdCount > 0) {
            toast.success(`Created ${createdCount} products from templates`);
          } else {
            toast.error("No products were created from selected templates");
          }

          setSelectedTemplateIds([]);

          if (createdCount > 0) {
            router.push("/coach/products");
          }
        },
        onError: (e: unknown) =>
          toast.error(getErrorMessage(e, "Failed to create selected products")),
      }
    );
  };

  const formatPrice = (value?: number) => {
    const safe = Number.isFinite(value) ? Number(value) : 0;
    return safe.toFixed(2);
  };

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <section>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-5 md:gap-4 md:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="space-y-1.5">
                <Badge className="w-fit border-white/25 bg-white/15 text-[11px] text-white sm:text-xs">
                  Templates
                </Badge>
                <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                  Product Templates
                </CardTitle>
                <CardDescription className="max-w-xl text-sm !text-white/90 md:text-base">
                  Choose an admin template and add it to your product catalog.
                </CardDescription>
              </div>

              <Link href="/coach/products" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full border-white/25 bg-white/10 px-3 text-sm text-white hover:bg-white/20 hover:text-white sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Search className="h-4 w-4" />
              </span>
              Find templates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-1">
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
                    placeholder="Search templates..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </label>
                <Input
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Category (e.g. supplement)"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company
                </label>
                <select
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                >
                  <option value="">All companies</option>
                  {(metadata?.companies || []).map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Boxes className="h-4 w-4" />
              </span>
              Template catalog
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  ref={selectVisibleRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectVisible}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Select all on this page
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-600">
                  Selected: {selectedTemplateIds.length}
                </span>
                {selectedTemplateIds.length > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplateIds([])}
                  >
                    Clear
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  onClick={onUseSelectedTemplates}
                  disabled={
                    selectedTemplateIds.length === 0 ||
                    createFromTemplate.isPending ||
                    createFromTemplatesBulk.isPending
                  }
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {createFromTemplatesBulk.isPending
                    ? "Using selected..."
                    : `Use Selected${selectedTemplateIds.length > 0 ? ` (${selectedTemplateIds.length})` : ""}`}
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`template-skeleton-${index}`}
                    className="h-[280px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
                  />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <Package className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No templates found</p>
                <p className="mt-1 text-xs text-slate-500">Try changing filters or search.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {templates.map((t) => {
                  const hasDiscount =
                    Number.isFinite(t.mrp) && Number(t.mrp) > Number(t.price);

                  return (
                    <article key={t._id} className="h-full min-w-0">
                      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.55)]">
                        <div className="relative mb-3 flex h-[170px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {t.imageUrl ? (
                            <Image
                              src={t.imageUrl}
                              alt={t.name}
                              width={180}
                              height={160}
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
                              className="h-[150px] w-full object-contain p-2"
                            />
                          ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
                              <FileText className="h-5 w-5" />
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-slate-900 break-words">
                              {t.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {t.isFeatured ? (
                                <Badge
                                  variant="success"
                                  className="shrink-0 px-2 py-0.5 text-[10px] normal-case tracking-normal"
                                >
                                  Featured
                                </Badge>
                              ) : null}
                              <label className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={selectedTemplateSet.has(t._id)}
                                  onChange={() => toggleTemplateSelection(t._id)}
                                  disabled={createFromTemplatesBulk.isPending}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                                />
                                Select
                              </label>
                            </div>
                          </div>

                          {t.description ? (
                            <DescriptionWithToggle text={t.description} />
                          ) : (
                            <p className="mt-2 text-xs text-slate-400">No description added.</p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            {t.category ? (
                              <Badge
                                variant="secondary"
                                className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                              >
                                {t.category}
                              </Badge>
                            ) : null}
                            {t.companyName ? (
                              <Badge
                                variant="secondary"
                                className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                              >
                                {t.companyName}
                              </Badge>
                            ) : null}
                          </div>

                          <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                            <div className="flex items-center gap-2">
                              {hasDiscount ? (
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{formatPrice(t.mrp)}
                                </span>
                              ) : null}
                              <span className="text-base font-semibold text-slate-900">
                                ₹{formatPrice(t.price)}
                              </span>
                            </div>
                            {hasDiscount ? (
                              <p className="text-xs font-medium text-emerald-700">
                                Save ₹{formatPrice(Number(t.mrp) - Number(t.price))}
                              </p>
                            ) : null}
                            <p className="text-xs text-slate-500">Used by coaches: {t.usageCount ?? 0}</p>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link href={`/coach/products/templates/${t._id}`}>
                              <Button type="button" variant="outline" size="sm" className="w-full">
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Button>
                            </Link>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => onUseTemplate(t._id)}
                              disabled={createFromTemplate.isPending || createFromTemplatesBulk.isPending}
                              className="w-full"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              {createFromTemplate.isPending && creatingTemplateId === t._id
                                ? "Using..."
                                : "Use"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {pagination.totalPages > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <p className="text-sm text-slate-600 break-words">
                  Page {pagination.page} of {pagination.totalPages}
                  {Number.isFinite(pagination.total) ? ` • ${pagination.total} total` : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                  >
                    Prev
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
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
      <p className="text-xs leading-5 text-slate-600 break-words">{text}</p>
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
