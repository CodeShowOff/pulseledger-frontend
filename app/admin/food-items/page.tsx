// app/admin/food-items/page.tsx
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
} from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";

interface FoodItem {
  _id: string;
  name: string;
  brand?: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  nutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    saturatedFat?: number;
    cholesterol?: number;
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

const CATEGORIES = [
  "protein",
  "vegetables",
  "fruits",
  "grains",
  "dairy",
  "fats_oils",
  "beverages",
  "snacks",
  "condiments",
  "supplements",
  "prepared_meals",
  "indian_cuisine",
  "other",
];

const SERVING_UNITS = ["g", "ml", "oz", "cup", "tbsp", "tsp", "piece", "serving"];

export default function AdminFoodItemsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "other",
    servingSize: 100,
    servingUnit: "g",
    nutrition: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      saturatedFat: 0,
      cholesterol: 0,
    },
    isVerified: true,
    isActive: true,
  });

  // Fetch food items
  const { data, isLoading } = useQuery({
    queryKey: ["adminFoodItems", page, search],
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post("/food-items", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Food item created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminFoodItems"] });
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
      queryClient.invalidateQueries({ queryKey: ["adminFoodItems"] });
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
      queryClient.invalidateQueries({ queryKey: ["adminFoodItems"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete food item");
    },
  });

  const openCreateModal = () => {
    setEditingFood(null);
    setFormData({
      name: "",
      brand: "",
      category: "other",
      servingSize: 100,
      servingUnit: "g",
      nutrition: {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        saturatedFat: 0,
        cholesterol: 0,
      },
      isVerified: true,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (food: FoodItem) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      brand: food.brand || "",
      category: food.category,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      nutrition: {
        calories: food.nutrition.calories || 0,
        protein: food.nutrition.protein || 0,
        carbohydrates: food.nutrition.carbohydrates || 0,
        fat: food.nutrition.fat || 0,
        fiber: food.nutrition.fiber || 0,
        sugar: food.nutrition.sugar || 0,
        sodium: food.nutrition.sodium || 0,
        saturatedFat: food.nutrition.saturatedFat || 0,
        cholesterol: food.nutrition.cholesterol || 0,
      },
      isVerified: food.isVerified,
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

  const updateNutrition = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: value,
      },
    }));
  };

  return (
    <div>
      <RoleGuard role="admin" />

      <header className="admin-page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1 className="admin-page-header__title">Food Items Library</h1>
            <p className="admin-page-header__subtitle">
              Manage the global food database for coaches to build diet plans.
            </p>
          </div>
          <button onClick={openCreateModal} className="btn btn--primary">
            <Plus style={{ width: 18, height: 18, marginRight: "0.5rem" }} />
            Add Food Item
          </button>
        </div>
      </header>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            maxWidth: "400px",
          }}
        >
          <Search style={{ width: 18, height: 18, color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="Search food items..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Food Items List */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      ) : foodItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
        >
          <Utensils
            style={{
              width: 48,
              height: 48,
              color: "#d1d5db",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#6b7280" }}>
            No food items found. Add your first food item to get started.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1rem",
            }}
          >
            {foodItems.map((food) => (
              <div
                key={food._id}
                className="admin-card"
                style={{ padding: "1rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                        {food.name}
                      </h3>
                      {food.isVerified && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.15rem 0.4rem",
                            backgroundColor: "#dcfce7",
                            color: "#16a34a",
                            borderRadius: "999px",
                          }}
                        >
                          Verified
                        </span>
                      )}
                      {!food.isActive && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.15rem 0.4rem",
                            backgroundColor: "#fef3c7",
                            color: "#d97706",
                            borderRadius: "999px",
                          }}
                        >
                          Inactive
                        </span>
                      )}
                    </div>
                    {food.brand && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {food.brand}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {food.category.replace(/_/g, " ")} •{" "}
                      {food.servingSize}
                      {food.servingUnit}
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "0.5rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#f97316", fontWeight: 600 }}>
                          {food.nutrition.calories}
                        </p>
                        <p style={{ color: "#9ca3af" }}>kcal</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#ef4444", fontWeight: 600 }}>
                          {food.nutrition.protein}g
                        </p>
                        <p style={{ color: "#9ca3af" }}>Protein</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#3b82f6", fontWeight: 600 }}>
                          {food.nutrition.carbohydrates}g
                        </p>
                        <p style={{ color: "#9ca3af" }}>Carbs</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#eab308", fontWeight: 600 }}>
                          {food.nutrition.fat}g
                        </p>
                        <p style={{ color: "#9ca3af" }}>Fat</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button
                      onClick={() => openEditModal(food)}
                      style={{
                        padding: "0.4rem",
                        backgroundColor: "#eff6ff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <Edit2 style={{ width: 14, height: 14, color: "#2563eb" }} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete "${food.name}"?`
                          )
                        ) {
                          deleteMutation.mutate(food._id);
                        }
                      }}
                      style={{
                        padding: "0.4rem",
                        backgroundColor: "#fee2e2",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 style={{ width: 14, height: 14, color: "#dc2626" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "0.5rem",
                  backgroundColor: page === 1 ? "#f3f4f6" : "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft style={{ width: 18, height: 18 }} />
              </button>
              <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                style={{
                  padding: "0.5rem",
                  backgroundColor:
                    page === pagination.totalPages ? "#f3f4f6" : "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  cursor:
                    page === pagination.totalPages ? "not-allowed" : "pointer",
                }}
              >
                <ChevronRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
                {editingFood ? "Edit Food Item" : "Add Food Item"}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  padding: "0.25rem",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="auth-form__field">
                  <label className="auth-form__label">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    className="auth-form__input"
                    required
                  />
                </div>

                <div className="auth-form__field">
                  <label className="auth-form__label">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, brand: e.target.value }))
                    }
                    className="auth-form__input"
                    placeholder="Optional"
                  />
                </div>

                <div className="auth-form__field">
                  <label className="auth-form__label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
                    className="auth-form__input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <div className="auth-form__field" style={{ flex: 1 }}>
                    <label className="auth-form__label">Serving Size</label>
                    <input
                      type="number"
                      value={formData.servingSize}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          servingSize: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="auth-form__input"
                      min={0}
                      step="0.1"
                    />
                  </div>
                  <div className="auth-form__field" style={{ width: "80px" }}>
                    <label className="auth-form__label">Unit</label>
                    <select
                      value={formData.servingUnit}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          servingUnit: e.target.value,
                        }))
                      }
                      className="auth-form__input"
                    >
                      {SERVING_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div style={{ marginTop: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  Nutrition (per serving)
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "0.75rem",
                  }}
                >
                  <div className="auth-form__field">
                    <label
                      className="auth-form__label"
                      style={{ color: "#f97316" }}
                    >
                      Calories *
                    </label>
                    <input
                      type="number"
                      value={formData.nutrition.calories}
                      onChange={(e) =>
                        updateNutrition(
                          "calories",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="auth-form__input"
                      min={0}
                      required
                    />
                  </div>
                  <div className="auth-form__field">
                    <label
                      className="auth-form__label"
                      style={{ color: "#ef4444" }}
                    >
                      Protein (g) *
                    </label>
                    <input
                      type="number"
                      value={formData.nutrition.protein}
                      onChange={(e) =>
                        updateNutrition(
                          "protein",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="auth-form__input"
                      min={0}
                      step="0.1"
                      required
                    />
                  </div>
                  <div className="auth-form__field">
                    <label
                      className="auth-form__label"
                      style={{ color: "#3b82f6" }}
                    >
                      Carbs (g) *
                    </label>
                    <input
                      type="number"
                      value={formData.nutrition.carbohydrates}
                      onChange={(e) =>
                        updateNutrition(
                          "carbohydrates",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="auth-form__input"
                      min={0}
                      step="0.1"
                      required
                    />
                  </div>
                  <div className="auth-form__field">
                    <label
                      className="auth-form__label"
                      style={{ color: "#eab308" }}
                    >
                      Fat (g) *
                    </label>
                    <input
                      type="number"
                      value={formData.nutrition.fat}
                      onChange={(e) =>
                        updateNutrition("fat", parseFloat(e.target.value) || 0)
                      }
                      className="auth-form__input"
                      min={0}
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                {/* Additional nutrients */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "0.75rem",
                    marginTop: "1rem",
                  }}
                >
                  <div className="auth-form__field">
                    <label className="auth-form__label">Fiber (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.fiber}
                      onChange={(e) =>
                        updateNutrition(
                          "fiber",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="auth-form__input"
                      min={0}
                      step="0.1"
                    />
                  </div>
                  <div className="auth-form__field">
                    <label className="auth-form__label">Sugar (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.sugar}
                      onChange={(e) =>
                        updateNutrition(
                          "sugar",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="auth-form__input"
                      min={0}
                      step="0.1"
                    />
                  </div>
                  <div className="auth-form__field">
                    <label className="auth-form__label">Sodium (mg)</label>
                    <input
                      type="number"
                      value={formData.nutrition.sodium}
                      onChange={(e) =>
                        updateNutrition(
                          "sodium",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="auth-form__input"
                      min={0}
                    />
                  </div>
                  <div className="auth-form__field">
                    <label className="auth-form__label">Sat. Fat (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.saturatedFat}
                      onChange={(e) =>
                        updateNutrition(
                          "saturatedFat",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="auth-form__input"
                      min={0}
                      step="0.1"
                    />
                  </div>
                  <div className="auth-form__field">
                    <label className="auth-form__label">Cholest. (mg)</label>
                    <input
                      type="number"
                      value={formData.nutrition.cholesterol}
                      onChange={(e) =>
                        updateNutrition(
                          "cholesterol",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="auth-form__input"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  marginTop: "1.5rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        isVerified: e.target.checked,
                      }))
                    }
                  />
                  <span style={{ fontSize: "0.9rem" }}>Verified</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, isActive: e.target.checked }))
                    }
                  />
                  <span style={{ fontSize: "0.9rem" }}>Active</span>
                </label>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn--outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingFood
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
