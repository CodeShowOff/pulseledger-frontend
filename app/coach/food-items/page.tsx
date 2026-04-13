// app/coach/food-items/page.tsx
"use client";

import React, { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { motion } from "@/lib/motion";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";
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

interface FoodItem {
  _id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  servingDescription?: string;
  nutrition: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
  isActive: boolean;
  isCustom?: boolean;
  createdBy?: { _id: string; name: string };
  createdAt: string;
}

interface FoodItemsResponse {
  data: FoodItem[];
  pagination?: {
    page: number;
    totalPages: number;
    total?: number;
  };
}

const CATEGORIES = [
  "protein",
  "carbs",
  "fats",
  "vegetables",
  "fruits",
  "dairy",
  "beverages",
  "snacks",
  "supplements",
  "grains",
  "lentil",
  "legumes",
  "nuts_seeds",
  "seafood",
  "poultry",
  "meat",
  "eggs",
  "sweets",
  "condiments",
  "other",
];

const SERVING_UNITS = ["g", "ml", "oz", "cup", "tbsp", "tsp", "piece", "serving", "bowl"];

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const selectFieldClassName =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70";

function formatCategoryLabel(value?: string) {
  if (!value) return "Not set";
  const formatted = value.replace(/_/g, " ");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function CoachFoodItemsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    servingSize: 100,
    servingUnit: "g",
    servingDescription: "",
    nutrition: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    },
    isActive: true,
  });

  // Fetch food items
  const { data, isLoading, isFetching, error } = useQuery<FoodItemsResponse>({
    queryKey: ["coachFoodItems", page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "20");
      if (search) params.append("search", search);
      const res = await api.get(`/food-items?${params.toString()}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const foodItems: FoodItem[] = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1 };

  // Separate custom and global food items
  const customFoodItems = foodItems.filter((f) => f.isCustom);
  const globalFoodItems = foodItems.filter((f) => !f.isCustom);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post("/food-items", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Custom food item created successfully");
      queryClient.invalidateQueries({ queryKey: ["coachFoodItems"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create food item");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await api.patch(`/food-items/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Food item updated successfully");
      queryClient.invalidateQueries({ queryKey: ["coachFoodItems"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update food item");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/food-items/${id}`);
    },
    onSuccess: () => {
      toast.success("Food item deleted");
      queryClient.invalidateQueries({ queryKey: ["coachFoodItems"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete food item");
    },
  });

  const openCreateModal = () => {
    setEditingFood(null);
    setFormData({
      name: "",
      category: "other",
      servingSize: 100,
      servingUnit: "g",
      servingDescription: "",
      nutrition: {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
      },
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (food: FoodItem) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      category: food.category,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      servingDescription: food.servingDescription || "",
      nutrition: {
        calories: food.nutrition.calories || 0,
        protein: food.nutrition.protein || 0,
        carbohydrates: food.nutrition.carbohydrates || 0,
        fat: food.nutrition.fat || 0,
        fiber: food.nutrition.fiber || 0,
        sugar: food.nutrition.sugar || 0,
      },
      isActive: food.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFood(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFood) {
      updateMutation.mutate({ id: editingFood._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isFormPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <RoleGuard role="coach" />

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
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl">
                  Build your custom food library
                </h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  Create reusable food entries for faster diet planning and nutrition tracking.
                </CardDescription>
              </div>

              <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <div className="min-w-0 flex-1 sm:flex-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openCreateModal}
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Add Custom Food Item
                  </Button>
                </div>
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
              Find food items
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or category"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex md:items-end">
                {isFetching ? (
                  <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating results...
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Showing {foodItems.length} item{foodItems.length === 1 ? "" : "s"} on this page
                  </p>
                )}
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
                <Sparkles className="h-4 w-4" />
              </span>
              Food catalog
            </CardTitle>
            <CardDescription>
              Manage your custom food items and browse the global food library.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`food-skeleton-${idx}`}
                    className="h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
                Failed to load food items.
              </div>
            ) : foodItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <Utensils className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No food items found</p>
                <p className="mt-1 text-xs text-slate-500">Try changing your search or add a custom food item.</p>
              </div>
            ) : (
              <>
                {customFoodItems.length > 0 ? (
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">My custom food items</h3>
                      <Badge className="px-2 py-0.5 text-[10px] normal-case tracking-normal">
                        {customFoodItems.length}
                      </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {customFoodItems.map((food) => (
                        <article key={food._id} className="h-full">
                          <div className="flex h-full flex-col rounded-2xl border border-violet-200 bg-violet-50/40 p-4 transition-all hover:border-violet-300 hover:shadow-[0_14px_30px_-24px_rgba(124,58,237,0.45)]">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-slate-900">
                                  {food.name}
                                </h4>
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatCategoryLabel(food.category)} • {food.servingSize} {food.servingUnit}
                                </p>
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5">
                                <Badge className="px-2 py-0.5 text-[10px] tracking-normal">Custom</Badge>
                                <Badge
                                  variant={food.isActive ? "success" : "danger"}
                                  className="px-2 py-0.5 text-[10px] tracking-normal"
                                >
                                  {food.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>

                            {food.servingDescription ? (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                                {food.servingDescription}
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-slate-400">No serving description added.</p>
                            )}

                            <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-white/85 p-2.5 text-xs">
                              <div className="text-slate-600">
                                Calories: <span className="font-semibold text-slate-900">{food.nutrition.calories || 0}</span>
                              </div>
                              <div className="text-slate-600">
                                Protein: <span className="font-semibold text-slate-900">{food.nutrition.protein || 0}g</span>
                              </div>
                              <div className="text-slate-600">
                                Carbs: <span className="font-semibold text-slate-900">{food.nutrition.carbohydrates || 0}g</span>
                              </div>
                              <div className="text-slate-600">
                                Fat: <span className="font-semibold text-slate-900">{food.nutrition.fat || 0}g</span>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(food)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm(`Delete "${food.name}"? This action cannot be undone.`)) {
                                    deleteMutation.mutate(food._id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}

                {globalFoodItems.length > 0 ? (
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">Global food library</h3>
                      <Badge variant="secondary" className="px-2 py-0.5 text-[10px] normal-case tracking-normal">
                        {globalFoodItems.length}
                      </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {globalFoodItems.map((food) => (
                        <article key={food._id} className="h-full">
                          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-[0_14px_30px_-24px_rgba(79,70,229,0.35)]">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-slate-900">
                                  {food.name}
                                </h4>
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatCategoryLabel(food.category)} • {food.servingSize} {food.servingUnit}
                                </p>
                              </div>
                              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] normal-case tracking-normal">
                                Global
                              </Badge>
                            </div>

                            {food.servingDescription ? (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                                {food.servingDescription}
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-slate-400">No serving description added.</p>
                            )}

                            <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs">
                              <div className="text-slate-600">
                                Calories: <span className="font-semibold text-slate-900">{food.nutrition.calories || 0}</span>
                              </div>
                              <div className="text-slate-600">
                                Protein: <span className="font-semibold text-slate-900">{food.nutrition.protein || 0}g</span>
                              </div>
                              <div className="text-slate-600">
                                Carbs: <span className="font-semibold text-slate-900">{food.nutrition.carbohydrates || 0}g</span>
                              </div>
                              <div className="text-slate-600">
                                Fat: <span className="font-semibold text-slate-900">{food.nutrition.fat || 0}g</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}

                {pagination.totalPages > 1 ? (
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
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/55 p-4"
          onClick={closeModal}
        >
          <Card
            className="w-full max-w-3xl border-slate-200/90 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">
                    {editingFood ? "Edit food item" : "Create custom food item"}
                  </CardTitle>
                  <CardDescription>
                    Save nutrition entries for quick and consistent meal planning.
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close food item modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="max-h-[calc(100vh-9rem)] overflow-y-auto pt-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClassName}>Food name *</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., Grilled Chicken Breast"
                  />
                </div>

                <div>
                  <label className={labelClassName}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className={selectFieldClassName}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {formatCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClassName}>Serving size *</label>
                    <Input
                      type="number"
                      value={formData.servingSize}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingSize: Number(e.target.value),
                        }))
                      }
                      required
                      min="0"
                      step="any"
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>Unit *</label>
                    <select
                      value={formData.servingUnit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingUnit: e.target.value,
                        }))
                      }
                      className={selectFieldClassName}
                      required
                    >
                      {SERVING_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClassName}>Serving description (optional)</label>
                  <Input
                    type="text"
                    value={formData.servingDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        servingDescription: e.target.value,
                      }))
                    }
                    placeholder="e.g., 1 medium piece, 1 cup"
                  />
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Nutrition information (per serving)
                  </h3>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClassName}>Calories</label>
                      <Input
                        type="number"
                        value={formData.nutrition.calories}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutrition: {
                              ...prev.nutrition,
                              calories: Number(e.target.value),
                            },
                          }))
                        }
                        min="0"
                        step="any"
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Protein (g)</label>
                      <Input
                        type="number"
                        value={formData.nutrition.protein}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutrition: {
                              ...prev.nutrition,
                              protein: Number(e.target.value),
                            },
                          }))
                        }
                        min="0"
                        step="any"
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Carbohydrates (g)</label>
                      <Input
                        type="number"
                        value={formData.nutrition.carbohydrates}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutrition: {
                              ...prev.nutrition,
                              carbohydrates: Number(e.target.value),
                            },
                          }))
                        }
                        min="0"
                        step="any"
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Fat (g)</label>
                      <Input
                        type="number"
                        value={formData.nutrition.fat}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutrition: {
                              ...prev.nutrition,
                              fat: Number(e.target.value),
                            },
                          }))
                        }
                        min="0"
                        step="any"
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Fiber (g)</label>
                      <Input
                        type="number"
                        value={formData.nutrition.fiber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutrition: {
                              ...prev.nutrition,
                              fiber: Number(e.target.value),
                            },
                          }))
                        }
                        min="0"
                        step="any"
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Sugar (g)</label>
                      <Input
                        type="number"
                        value={formData.nutrition.sugar}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutrition: {
                              ...prev.nutrition,
                              sugar: Number(e.target.value),
                            },
                          }))
                        }
                        min="0"
                        step="any"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isFormPending}>
                    {isFormPending
                      ? "Saving..."
                      : editingFood
                      ? "Update Food Item"
                      : "Create Food Item"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
