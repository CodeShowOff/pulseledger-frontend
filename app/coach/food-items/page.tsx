// app/coach/food-items/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Utensils,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";

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
  const { data, isLoading } = useQuery({
    queryKey: ["coachFoodItems", page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "20");
      if (search) params.append("search", search);
      const res = await api.get(`/food-items?${params.toString()}`);
      return res.data;
    },
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

  return (
    <div>
      <RoleGuard role="coach" />

      {/* Header */}
      <section className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title coach-page-header__title">
            Food Library
          </h1>
          <p className="admin-page-header__subtitle coach-page-header__subtitle">
            Create custom food items for your clients. You can also use the global food library below.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn--primary">
          <Plus size={18} />
          Add Custom Food Item
        </button>
      </section>

      <section
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "1.25rem",
          marginTop: "1.5rem",
        }}
      >
        {/* Search */}
        <div className="admin-search">
          <Search size={18} className="admin-search__icon" />
          <input
            type="text"
            placeholder="Search food items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search__input"
          />
        </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
          <p>Loading food items...</p>
        </div>
      ) : (
        <>
          {/* Custom Food Items Section */}
          {customFoodItems.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Sparkles size={20} style={{ color: "#8b5cf6" }} />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
                  My Custom Food Items ({customFoodItems.length})
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                }}
              >
                {customFoodItems.map((food) => (
                  <div
                    key={food._id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderLeft: "3px solid #8b5cf6",
                      borderRadius: "8px",
                      padding: "1rem",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                            {food.name}
                          </h3>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              padding: "0.15rem 0.4rem",
                              backgroundColor: "#f3e8ff",
                              color: "#8b5cf6",
                              borderRadius: "999px",
                              fontWeight: 600,
                            }}
                          >
                            CUSTOM
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.75rem" }}>
                          {food.category.replace(/_/g, " ")} • {food.servingSize} {food.servingUnit}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <div style={{ fontSize: "0.75rem" }}>
                            <span style={{ color: "#6b7280" }}>Calories:</span>{" "}
                            <span style={{ fontWeight: 600 }}>{food.nutrition.calories || 0}</span>
                          </div>
                          <div style={{ fontSize: "0.75rem" }}>
                            <span style={{ color: "#6b7280" }}>Protein:</span>{" "}
                            <span style={{ fontWeight: 600 }}>{food.nutrition.protein || 0}g</span>
                          </div>
                          <div style={{ fontSize: "0.75rem" }}>
                            <span style={{ color: "#6b7280" }}>Carbs:</span>{" "}
                            <span style={{ fontWeight: 600 }}>{food.nutrition.carbohydrates || 0}g</span>
                          </div>
                          <div style={{ fontSize: "0.75rem" }}>
                            <span style={{ color: "#6b7280" }}>Fat:</span>{" "}
                            <span style={{ fontWeight: 600 }}>{food.nutrition.fat || 0}g</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.25rem", marginLeft: "0.5rem" }}>
                        <button
                          onClick={() => openEditModal(food)}
                          style={{
                            padding: "0.4rem",
                            backgroundColor: "#eff6ff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Edit"
                        >
                          <Edit2 size={16} style={{ color: "#3b82f6" }} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${food.name}"?`)) {
                              deleteMutation.mutate(food._id);
                            }
                          }}
                          style={{
                            padding: "0.4rem",
                            backgroundColor: "#fef2f2",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global Food Items Section */}
          {globalFoodItems.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                Global Food Library ({globalFoodItems.length})
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                }}
              >
                {globalFoodItems.map((food) => (
                  <div
                    key={food._id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1rem",
                      transition: "all 0.2s",
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        {food.name}
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.75rem" }}>
                        {food.category.replace(/_/g, " ")} • {food.servingSize} {food.servingUnit}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <div style={{ fontSize: "0.75rem" }}>
                          <span style={{ color: "#6b7280" }}>Calories:</span>{" "}
                          <span style={{ fontWeight: 600 }}>{food.nutrition.calories || 0}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem" }}>
                          <span style={{ color: "#6b7280" }}>Protein:</span>{" "}
                          <span style={{ fontWeight: 600 }}>{food.nutrition.protein || 0}g</span>
                        </div>
                        <div style={{ fontSize: "0.75rem" }}>
                          <span style={{ color: "#6b7280" }}>Carbs:</span>{" "}
                          <span style={{ fontWeight: 600 }}>{food.nutrition.carbohydrates || 0}g</span>
                        </div>
                        <div style={{ fontSize: "0.75rem" }}>
                          <span style={{ color: "#6b7280" }}>Fat:</span>{" "}
                          <span style={{ fontWeight: 600 }}>{food.nutrition.fat || 0}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="admin-pagination__button"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <span className="admin-pagination__info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="admin-pagination__button"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">
                {editingFood ? "Edit Food Item" : "Create Custom Food Item"}
              </h2>
              <button onClick={closeModal} className="admin-modal__close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div className="auth-form__field">
                <label className="auth-form__label">Food Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="auth-form__input"
                  required
                  placeholder="e.g., Grilled Chicken Breast"
                />
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="auth-form__input"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, " ").charAt(0).toUpperCase() + cat.replace(/_/g, " ").slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="auth-form__field">
                  <label className="auth-form__label">Serving Size *</label>
                  <input
                    type="number"
                    value={formData.servingSize}
                    onChange={(e) => setFormData((p) => ({ ...p, servingSize: Number(e.target.value) }))}
                    className="auth-form__input"
                    required
                    min="0"
                    step="any"
                  />
                </div>

                <div className="auth-form__field">
                  <label className="auth-form__label">Unit *</label>
                  <select
                    value={formData.servingUnit}
                    onChange={(e) => setFormData((p) => ({ ...p, servingUnit: e.target.value }))}
                    className="auth-form__input"
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

              <div className="auth-form__field">
                <label className="auth-form__label">Serving Description (Optional)</label>
                <input
                  type="text"
                  value={formData.servingDescription}
                  onChange={(e) => setFormData((p) => ({ ...p, servingDescription: e.target.value }))}
                  className="auth-form__input"
                  placeholder="e.g., 1 medium piece, 1 cup"
                />
              </div>

              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginTop: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                  Nutrition Information (per serving)
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="auth-form__field">
                    <label className="auth-form__label">Calories</label>
                    <input
                      type="number"
                      value={formData.nutrition.calories}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          nutrition: { ...p.nutrition, calories: Number(e.target.value) },
                        }))
                      }
                      className="auth-form__input"
                      min="0"
                      step="any"
                    />
                  </div>

                  <div className="auth-form__field">
                    <label className="auth-form__label">Protein (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.protein}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          nutrition: { ...p.nutrition, protein: Number(e.target.value) },
                        }))
                      }
                      className="auth-form__input"
                      min="0"
                      step="any"
                    />
                  </div>

                  <div className="auth-form__field">
                    <label className="auth-form__label">Carbohydrates (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.carbohydrates}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          nutrition: { ...p.nutrition, carbohydrates: Number(e.target.value) },
                        }))
                      }
                      className="auth-form__input"
                      min="0"
                      step="any"
                    />
                  </div>

                  <div className="auth-form__field">
                    <label className="auth-form__label">Fat (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.fat}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          nutrition: { ...p.nutrition, fat: Number(e.target.value) },
                        }))
                      }
                      className="auth-form__input"
                      min="0"
                      step="any"
                    />
                  </div>

                  <div className="auth-form__field">
                    <label className="auth-form__label">Fiber (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.fiber}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          nutrition: { ...p.nutrition, fiber: Number(e.target.value) },
                        }))
                      }
                      className="auth-form__input"
                      min="0"
                      step="any"
                    />
                  </div>

                  <div className="auth-form__field">
                    <label className="auth-form__label">Sugar (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.sugar}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          nutrition: { ...p.nutrition, sugar: Number(e.target.value) },
                        }))
                      }
                      className="auth-form__input"
                      min="0"
                      step="any"
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal__footer">
                <button type="button" onClick={closeModal} className="admin-button">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button admin-button--primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingFood
                    ? "Update Food Item"
                    : "Create Food Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
