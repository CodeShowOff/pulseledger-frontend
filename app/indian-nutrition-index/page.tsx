"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export type IndianDish = {
  name: string;
  category: string;
  vegetarian: boolean;
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  vitamin_A_ug: number;
  vitamin_B_mg: number;
  vitamin_C_mg: number;
  vitamin_D_IU: number;
  vitamin_E_mg: number;
  vitamin_K_ug: number;
  iron_mg: number;
  calcium_mg: number;
  magnesium_mg: number;
  potassium_mg: number;
  sodium_mg: number;
  zinc_mg: number;
  serving_size_g: number;
};

export default function IndianNutritionIndexPage() {
  const [allDishes, setAllDishes] = useState<IndianDish[]>([]);
  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [highProtein, setHighProtein] = useState(false);
  const [lowCalorie, setLowCalorie] = useState(false);
  const [expandedDishes, setExpandedDishes] = useState<{ [key: string]: { nutrition: boolean; vitamins: boolean; minerals: boolean } }>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dataModule = await import("../../data/indianFoods.json");
        const data = (dataModule.default || dataModule) as IndianDish[];
        if (!cancelled) setAllDishes(data);
      } catch (err) {
        // Failed to load Indian foods data
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return allDishes.filter((dish) => {
      if (vegFilter === "veg" && !dish.vegetarian) return false;
      if (vegFilter === "nonveg" && dish.vegetarian) return false;

      if (highProtein && dish.protein_g < 15) return false;
      if (lowCalorie && dish.calories_kcal > 250) return false;

      if (!s) return true;

      const haystack = `${dish.name} ${dish.category}`.toLowerCase();
      return haystack.includes(s);
    });
  }, [allDishes, search, vegFilter, highProtein, lowCalorie]);

  const isHighProteinDish = useCallback((dish: IndianDish) => dish.protein_g >= 15, []);
  const isLowCalorieDish = useCallback((dish: IndianDish) => dish.calories_kcal <= 250, []);

  const toggleSection = (dishName: string, section: 'nutrition' | 'vitamins' | 'minerals') => {
    setExpandedDishes(prev => ({
      ...prev,
      [dishName]: {
        ...prev[dishName],
        [section]: !prev[dishName]?.[section]
      }
    }));
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0.5rem 1rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        fontSize: "0.95rem",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.125rem",
          alignItems: "center",
          textAlign: "center",
          marginTop: "1.5rem",
          marginBottom: "1rem",
        }}
      >
          <h1
            className="profile-header__title"
            style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}
          >
            Indian Food Nutrition Index
          </h1>
          <p
            className="profile-header__subtitle"
            style={{ fontSize: "0.85rem", margin: 0 }}
          >
          Search and explore nutrition facts for popular Indian dishes.
        </p>
      </header>

      <section
        className="profile-card"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "flex-end",
          padding: "1.25rem 1.5rem",
        }}
      >
        <div style={{ minWidth: 220, flex: "1 1 220px" }}>
          <label className="profile-field__label" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>SEARCH</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Dish or category"
            className="auth-form__input"
            style={{ padding: "0.6rem 0.85rem", fontSize: "0.9rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "nowrap" }}>
          <div style={{ minWidth: 110, width: 110 }}>
            <label className="profile-field__label" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>TYPE</label>
            <select
              value={vegFilter}
              onChange={(e) => setVegFilter(e.target.value as any)}
              className="auth-form__input"
              style={{ padding: "0.6rem 0.5rem", fontSize: "0.9rem", width: "100%" }}
            >
              <option value="all">All</option>
              <option value="veg">Veg only</option>
              <option value="nonveg">Non-veg only</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label className="profile-field__label" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>HIGH PROTEIN</label>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "0.875rem", 
              cursor: "pointer", 
              padding: "0.6rem 0.85rem",
              border: highProtein ? "2px solid #3b82f6" : "2px solid #e2e8f0",
              borderRadius: "8px",
              background: highProtein ? "#eff6ff" : "#ffffff",
              transition: "all 0.2s ease",
              width: "100%",
              minHeight: "38px",
            }}>
              <input
                id="highProtein"
                type="checkbox"
                checked={highProtein}
                onChange={(e) => setHighProtein(e.target.checked)}
                style={{ 
                  margin: 0,
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#3b82f6",
                }}
              />
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label className="profile-field__label" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>LOW CALORIE</label>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "0.875rem", 
              cursor: "pointer", 
              padding: "0.6rem 0.85rem",
              border: lowCalorie ? "2px solid #10b981" : "2px solid #e2e8f0",
              borderRadius: "8px",
              background: lowCalorie ? "#ecfdf5" : "#ffffff",
              transition: "all 0.2s ease",
              width: "100%",
              minHeight: "38px",
            }}>
              <input
                id="lowCalorie"
                type="checkbox"
                checked={lowCalorie}
                onChange={(e) => setLowCalorie(e.target.checked)}
                style={{ 
                  margin: 0,
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#10b981",
                }}
              />
            </label>
          </div>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filtered.length === 0 ? (
          <p className="profile-header__subtitle">
            No dishes match your filters yet.
          </p>
        ) : (
          filtered.map((dish) => {
            const isNutritionExpanded = expandedDishes[dish.name]?.nutrition || false;
            const isVitaminsExpanded = expandedDishes[dish.name]?.vitamins || false;
            const isMineralsExpanded = expandedDishes[dish.name]?.minerals || false;

            return (
              <div
                key={dish.name}
                className="profile-card"
                style={{
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  background: dish.vegetarian
                    ? "linear-gradient(to right, rgba(16, 185, 129, 0.1), white)"
                    : "linear-gradient(to right, rgba(239, 68, 68, 0.1), white)",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Header Section */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#1e293b", margin: "0 0 0.25rem 0" }}>
                      {dish.name}
                    </h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: dish.vegetarian ? "#059669" : "#dc2626",
                          fontWeight: "500",
                        }}
                      >
                        {dish.vegetarian ? "🌱 Vegetarian" : "🍖 Non-vegetarian"}
                      </span>
                      <span style={{ color: "#cbd5e1" }}>•</span>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {dish.category}
                      </span>
                      <span style={{ color: "#cbd5e1" }}>•</span>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {dish.serving_size_g}g serving
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {isHighProteinDish(dish) && (
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          borderRadius: "12px",
                          background: "#dcfce7",
                          color: "#166534",
                        }}
                      >
                        High Protein
                      </span>
                    )}
                    {isLowCalorieDish(dish) && (
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          borderRadius: "12px",
                          background: "#dbeafe",
                          color: "#1e40af",
                        }}
                      >
                        Low Calorie
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Nutrition Grid - Dropdown on Mobile, Always Visible on Desktop */}
                {isMobile ? (
                  <>
                    {/* Mobile: Compact Buttons Row */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => toggleSection(dish.name, 'nutrition')}
                        style={{
                          flex: "1",
                          minWidth: "90px",
                          padding: "0.5rem 0.75rem",
                          background: "#f0fdf4",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "0.25rem",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "#166534",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#dcfce7")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                      >
                        {/* <span>📊</span> */}
                        <span>Nutrition</span>
                        {isNutritionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      <button
                        onClick={() => toggleSection(dish.name, 'vitamins')}
                        style={{
                          flex: "1",
                          minWidth: "90px",
                          padding: "0.5rem 0.75rem",
                          background: "#fef3c7",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "0.25rem",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "#92400e",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fde68a")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fef3c7")}
                      >
                        {/* <span>💊</span> */}
                        <span>Vitamins</span>
                        {isVitaminsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      <button
                        onClick={() => toggleSection(dish.name, 'minerals')}
                        style={{
                          flex: "1",
                          minWidth: "90px",
                          padding: "0.5rem 0.75rem",
                          background: "#dbeafe",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "0.25rem",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "#1e3a8a",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#bfdbfe")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#dbeafe")}
                      >
                        {/* <span>⚡</span> */}
                        <span>Minerals</span>
                        {isMineralsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {/* Expandable Content Sections */}
                    {isNutritionExpanded && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                          gap: "1rem",
                          padding: "1rem",
                          background: "linear-gradient(to bottom, #f8fafc, #ffffff)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          marginTop: "0.5rem",
                        }}
                      >
                        {/* Calories */}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                            CALORIES
                          </div>
                          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0ea5e9" }}>
                            {dish.calories_kcal}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>kcal</div>
                        </div>

                        {/* Protein */}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                            PROTEIN
                          </div>
                          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>
                            {dish.protein_g}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                        </div>

                        {/* Carbs */}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                            CARBS
                          </div>
                          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>
                            {dish.carbs_g}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                        </div>

                        {/* Fats */}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                            FATS
                          </div>
                          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#8b5cf6" }}>
                            {dish.fat_g}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                        </div>

                        {/* Fiber */}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                            FIBER
                          </div>
                          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#06b6d4" }}>
                            {dish.fiber_g}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                        </div>

                        {/* Sugar */}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                            SUGAR
                          </div>
                          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ec4899" }}>
                            {dish.sugar_g}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                        </div>
                      </div>
                    )}

                    {isVitaminsExpanded && (
                      <div
                        style={{
                          padding: "1rem",
                          background: "#fffbeb",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "0.75rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          marginTop: "0.5rem",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin A</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_A_ug} μg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>B-Complex</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_B_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin C</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_C_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin D</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_D_IU} IU
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin E</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_E_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin K</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_K_ug} μg
                          </div>
                        </div>
                      </div>
                    )}

                    {isMineralsExpanded && (
                      <div
                        style={{
                          padding: "1rem",
                          background: "#eff6ff",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "0.75rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          marginTop: "0.5rem",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Iron</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.iron_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Calcium</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.calcium_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Magnesium</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.magnesium_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Potassium</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.potassium_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Sodium</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.sodium_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Zinc</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.zinc_mg} mg
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: "1rem",
                      padding: "1rem",
                      background: "linear-gradient(to bottom, #f8fafc, #ffffff)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {/* Calories */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                        CALORIES
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0ea5e9" }}>
                        {dish.calories_kcal}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>kcal</div>
                    </div>

                    {/* Protein */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                        PROTEIN
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>
                        {dish.protein_g}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                    </div>

                    {/* Carbs */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                        CARBS
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>
                        {dish.carbs_g}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                    </div>

                    {/* Fats */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                        FATS
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#8b5cf6" }}>
                        {dish.fat_g}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                    </div>

                    {/* Fiber */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                        FIBER
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#06b6d4" }}>
                        {dish.fiber_g}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                    </div>

                    {/* Sugar */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "500" }}>
                        SUGAR
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ec4899" }}>
                        {dish.sugar_g}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>grams</div>
                    </div>
                  </div>

                  {/* Vitamins Dropdown */}
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => toggleSection(dish.name, 'vitamins')}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        background: "#fef3c7",
                        border: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fde68a")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fef3c7")}
                    >
                      <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#92400e" }}>
                        💊 Vitamins
                      </span>
                      {isVitaminsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {isVitaminsExpanded && (
                      <div
                        style={{
                          padding: "1rem",
                          background: "#fffbeb",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "0.75rem",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin A</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_A_ug} μg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>B-Complex</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_B_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin C</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_C_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin D</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_D_IU} IU
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin E</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_E_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "500" }}>Vitamin K</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#44403c" }}>
                            {dish.vitamin_K_ug} μg
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Minerals Dropdown */}
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => toggleSection(dish.name, 'minerals')}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        background: "#dbeafe",
                        border: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#bfdbfe")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#dbeafe")}
                    >
                      <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e3a8a" }}>
                        ⚡ Minerals
                      </span>
                      {isMineralsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {isMineralsExpanded && (
                      <div
                        style={{
                          padding: "1rem",
                          background: "#eff6ff",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "0.75rem",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Iron</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.iron_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Calcium</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.calcium_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Magnesium</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.magnesium_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Potassium</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.potassium_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Sodium</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.sodium_mg} mg
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>Zinc</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                            {dish.zinc_mg} mg
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </section>
  </div>
);
}
