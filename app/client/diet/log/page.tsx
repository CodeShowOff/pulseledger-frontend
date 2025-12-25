// app/client/diet/log/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  Check,
  ChevronDown,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Dumbbell,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  useClientDietPlans,
  useClientDietLogByDate,
  useAddMealToLog,
  useCreateDietLog,
  LoggedFood,
  FoodItem,
} from "@/lib/queries/diet";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", icon: Coffee, color: "#f59e0b" },
  { value: "mid_morning_snack", label: "Morning Snack", icon: Sun, color: "#84cc16" },
  { value: "lunch", label: "Lunch", icon: Sun, color: "#22c55e" },
  { value: "afternoon_snack", label: "Afternoon Snack", icon: Sun, color: "#14b8a6" },
  { value: "dinner", label: "Dinner", icon: Moon, color: "#6366f1" },
  { value: "evening_snack", label: "Evening Snack", icon: Moon, color: "#8b5cf6" },
  { value: "pre_workout", label: "Pre-Workout", icon: Dumbbell, color: "#ec4899" },
  { value: "post_workout", label: "Post-Workout", icon: Dumbbell, color: "#f43f5e" },
];

function DietLogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMeal = searchParams.get("meal") || "breakfast";

  const [selectedMealType, setSelectedMealType] = useState(initialMeal);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<LoggedFood[]>([]);
  const [showMealSelector, setShowMealSelector] = useState(false);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = formatLocalDate(new Date());

  // Fetch diet plans and today's log
  const { data: plans = [] } = useClientDietPlans();
  const { data: todayLog, refetch: refetchLog } = useClientDietLogByDate(today);
  const addMealMutation = useAddMealToLog();
  const createLogMutation = useCreateDietLog();

  const activePlan = plans.find((p) => p.isActive);
  const currentMeal = MEAL_TYPES.find((m) => m.value === selectedMealType);

  // Search for foods
  useEffect(() => {
    const searchFoods = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await api.get(`/food-items?search=${encodeURIComponent(searchQuery)}&limit=20`);
        setSearchResults(res.data.data || []);
      } catch {
        toast.error("Failed to search foods");
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchFoods, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addFood = (food: FoodItem) => {
    const loggedFood: LoggedFood = {
      foodItemId: food._id,
      foodName: food.name,
      quantity: food.servingSize || 100,
      unit: food.servingUnit || "g",
      calories: food.nutrition?.calories || 0,
      protein: food.nutrition?.protein || 0,
      carbs: food.nutrition?.carbohydrates || 0,
      fat: food.nutrition?.fat || 0,
    };
    setSelectedFoods([...selectedFoods, loggedFood]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const updateFoodQuantity = (index: number, quantity: number) => {
    const original = searchResults.find((f) => f._id === selectedFoods[index].foodItemId);
    const ratio = quantity / (original?.servingSize || 100);

    setSelectedFoods(
      selectedFoods.map((food, i) =>
        i === index
          ? {
              ...food,
              quantity,
              calories: Math.round((original?.nutrition?.calories || 0) * ratio),
              protein: Math.round((original?.nutrition?.protein || 0) * ratio * 10) / 10,
              carbs: Math.round((original?.nutrition?.carbohydrates || 0) * ratio * 10) / 10,
              fat: Math.round((original?.nutrition?.fat || 0) * ratio * 10) / 10,
            }
          : food
      )
    );
  };

  const saveMeal = async () => {
    if (selectedFoods.length === 0) {
      toast.error("Please add at least one food item");
      return;
    }

    if (!activePlan) {
      toast.error("No active diet plan found");
      return;
    }

    const meal = {
      mealType: selectedMealType,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      foods: selectedFoods,
    };

    try {
      if (todayLog?._id) {
        // Add meal to existing log
        await addMealMutation.mutateAsync({ logId: todayLog._id, meal });
      } else {
        // Create new log with this meal
        await createLogMutation.mutateAsync({
          dietPlanId: activePlan._id,
          date: today,
          mealsLogged: [meal],
        });
      }

      toast.success(`${currentMeal?.label} logged successfully!`);
      router.push("/client/diet");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to log meal");
    }
  };

  const totalNutrition = selectedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="client-page__sections">
      {/* Header */}
      <header className="client-page__header" style={{ marginBottom: "1rem" }}>
        <Link
          href="/client/diet"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
          }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
          Back to Nutrition
        </Link>
        <h1 className="client-page__title">
          <Utensils
            style={{
              width: 28,
              height: 28,
              marginRight: "0.5rem",
              color: currentMeal?.color || "#16a34a",
            }}
          />
          Log {currentMeal?.label || "Meal"}
        </h1>
      </header>

      {/* Meal Type Selector */}
      <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setShowMealSelector(!showMealSelector)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {currentMeal && <currentMeal.icon style={{ width: 20, height: 20, color: currentMeal.color }} />}
            <span style={{ fontWeight: 500 }}>{currentMeal?.label}</span>
          </div>
          <ChevronDown
            style={{
              width: 20,
              height: 20,
              transform: showMealSelector ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>

        {showMealSelector && (
          <div
            style={{
              marginTop: "0.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.5rem",
            }}
          >
            {MEAL_TYPES.map((meal) => (
              <button
                key={meal.value}
                onClick={() => {
                  setSelectedMealType(meal.value);
                  setShowMealSelector(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  background: selectedMealType === meal.value ? `${meal.color}20` : "transparent",
                  border: `1px solid ${selectedMealType === meal.value ? meal.color : "var(--border-color)"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <meal.icon style={{ width: 18, height: 18, color: meal.color }} />
                <span style={{ fontSize: "0.85rem" }}>{meal.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Food Search */}
      <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Add Foods
        </h3>
        <div style={{ position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              width: 18,
              height: 18,
              color: "var(--text-tertiary)",
            }}
          />
          <input
            type="text"
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 0.75rem 0.75rem 40px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "0.9rem",
            }}
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div
            style={{
              marginTop: "0.5rem",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
            }}
          >
            {searchResults.map((food) => (
              <button
                key={food._id}
                onClick={() => addFood(food)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  borderBottom: "1px solid var(--border-color)",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>
                  <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>{food.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {food.servingSize} {food.servingUnit} • {food.nutrition?.calories} kcal
                  </p>
                </div>
                <Plus style={{ width: 20, height: 20, color: "#16a34a" }} />
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <p style={{ textAlign: "center", padding: "1rem", color: "var(--text-secondary)" }}>
            Searching...
          </p>
        )}
      </div>

      {/* Selected Foods */}
      {selectedFoods.length > 0 && (
        <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Selected Foods ({selectedFoods.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {selectedFoods.map((food, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "8px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>{food.foodName}</p>
                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span>{food.calories} kcal</span>
                    <span>P: {food.protein}g</span>
                    <span>C: {food.carbs}g</span>
                    <span>F: {food.fat}g</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="number"
                    value={food.quantity}
                    onChange={(e) => updateFoodQuantity(index, parseFloat(e.target.value) || 0)}
                    style={{
                      width: "60px",
                      padding: "0.25rem 0.5rem",
                      border: "1px solid var(--border-color)",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{food.unit}</span>
                  <button
                    onClick={() => removeFood(index)}
                    style={{
                      padding: "0.25rem",
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    <X style={{ width: 16, height: 16, color: "#ef4444" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              borderRadius: "8px",
            }}
          >
            <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem" }}>Meal Totals</p>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f97316" }}>{totalNutrition.calories}</p>
                <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>kcal</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ef4444" }}>{totalNutrition.protein.toFixed(1)}g</p>
                <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>Protein</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#3b82f6" }}>{totalNutrition.carbs.toFixed(1)}g</p>
                <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>Carbs</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#eab308" }}>{totalNutrition.fat.toFixed(1)}g</p>
                <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>Fat</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={saveMeal}
        disabled={selectedFoods.length === 0 || addMealMutation.isPending || createLogMutation.isPending}
        style={{
          width: "100%",
          padding: "1rem",
          background: selectedFoods.length === 0 
            ? "#9ca3af" 
            : "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: selectedFoods.length === 0 ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          transition: "all 0.2s",
        }}
      >
        <Check style={{ width: 20, height: 20 }} />
        {addMealMutation.isPending || createLogMutation.isPending ? "Saving..." : `Save ${currentMeal?.label}`}
      </button>
    </div>
  );
}

export default function DietLogPage() {
  return (
    <Suspense fallback={<div className="client-page__sections"><p>Loading...</p></div>}>
      <DietLogContent />
    </Suspense>
  );
}
