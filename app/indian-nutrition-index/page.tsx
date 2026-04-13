"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import api from "@/lib/axios";

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

type IndianFoodsResponse = {
  success: boolean;
  data: IndianDish[];
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
  };
};

const PAGE_SIZE = 50;

export default function IndianNutritionIndexPage() {
  const [dishes, setDishes] = useState<IndianDish[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [highProtein, setHighProtein] = useState(false);
  const [lowCalorie, setLowCalorie] = useState(false);
  const [expandedDishes, setExpandedDishes] = useState<{ [key: string]: { nutrition: boolean; vitamins: boolean; minerals: boolean } }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalDishes, setTotalDishes] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, vegFilter, highProtein, lowCalorie]);

  useEffect(() => {
    setExpandedDishes({});
  }, [debouncedSearch, vegFilter, highProtein, lowCalorie]);

  useEffect(() => {
    let cancelled = false;
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    const fetchIndianFoods = async () => {
      try {
        if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params: Record<string, string | number | boolean> = {
          page,
          limit: PAGE_SIZE,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (vegFilter !== "all") params.vegFilter = vegFilter;
        if (highProtein) params.highProtein = true;
        if (lowCalorie) params.lowCalorie = true;

        const response = await api.get<IndianFoodsResponse>("/indian-foods", { params });
        const payload = response.data;
        const nextDishes = Array.isArray(payload?.data) ? payload.data : [];
        const pagination = payload?.pagination;

        if (cancelled || requestId !== latestRequestRef.current) return;

        setDishes((previous) => (page === 1 ? nextDishes : [...previous, ...nextDishes]));
        setTotalDishes(typeof pagination?.total === "number" ? pagination.total : nextDishes.length);
        setHasNextPage(Boolean(pagination?.hasNextPage));
        setErrorMessage("");
      } catch (err) {
        if (cancelled || requestId !== latestRequestRef.current) return;

        if (page === 1) {
          setDishes([]);
          setTotalDishes(0);
          setHasNextPage(false);
        }

        setErrorMessage("Failed to load Indian nutrition data. Please try again.");
      } finally {
        if (!cancelled && requestId === latestRequestRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    };

    fetchIndianFoods();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, vegFilter, highProtein, lowCalorie]);

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
          gap: "0",
          alignItems: "center",
          textAlign: "center",
          marginTop: "1.1rem",
          marginBottom: "0.4rem",
        }}
      >
          <h1
            className="profile-header__title"
            style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}
          >
            Indian Nutrition Search
          </h1>
      </header>

      <section
        className="profile-card"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr)"
            : "minmax(260px, 2fr) minmax(110px, 1fr) minmax(110px, 1fr) minmax(110px, 1fr)",
          gap: isMobile ? "0.65rem" : "0.75rem",
          alignItems: "flex-end",
          padding: isMobile ? "0.9rem" : "1rem 1.1rem",
        }}
      >
        <div style={{ minWidth: 0, gridColumn: isMobile ? "1 / -1" : "auto" }}>
          <label className="profile-field__label" style={{ fontSize: "0.76rem", marginBottom: "0.3rem" }}>SEARCH DISH</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish or category"
            className="auth-form__input"
            style={{ padding: "0.5rem 0.75rem", fontSize: "0.88rem", minHeight: "36px" }}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <label className="profile-field__label" style={{ fontSize: "0.76rem", marginBottom: "0.3rem" }}>TYPE</label>
            <select
              value={vegFilter}
              onChange={(e) => setVegFilter(e.target.value as "all" | "veg" | "nonveg")}
              className="auth-form__input"
            style={{ padding: "0.5rem 0.5rem", fontSize: "0.88rem", width: "100%", minHeight: "36px" }}
            >
              <option value="all">All</option>
              <option value="veg">Veg only</option>
              <option value="nonveg">Non-veg only</option>
            </select>
          </div>

        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          <label className="profile-field__label" style={{ fontSize: "0.72rem", marginBottom: "0.3rem", whiteSpace: "nowrap" }}>HIGH PROTEIN</label>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "0.875rem", 
              cursor: "pointer", 
              padding: "0.45rem",
              border: highProtein ? "1.5px solid #3b82f6" : "1.5px solid #d7dee8",
              borderRadius: "10px",
              background: highProtein ? "#eff6ff" : "#ffffff",
              transition: "all 0.2s ease",
              width: "100%",
              minHeight: "36px",
            }}>
              <input
                id="highProtein"
                type="checkbox"
                checked={highProtein}
                onChange={(e) => setHighProtein(e.target.checked)}
                style={{ 
                  margin: 0,
                  width: "17px",
                  height: "17px",
                  cursor: "pointer",
                  accentColor: "#3b82f6",
                }}
              />
            </label>
          </div>

        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          <label className="profile-field__label" style={{ fontSize: "0.72rem", marginBottom: "0.3rem", whiteSpace: "nowrap" }}>LOW CALORIE</label>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "0.875rem", 
              cursor: "pointer", 
              padding: "0.45rem",
              border: lowCalorie ? "1.5px solid #10b981" : "1.5px solid #d7dee8",
              borderRadius: "10px",
              background: lowCalorie ? "#ecfdf5" : "#ffffff",
              transition: "all 0.2s ease",
              width: "100%",
              minHeight: "36px",
            }}>
              <input
                id="lowCalorie"
                type="checkbox"
                checked={lowCalorie}
                onChange={(e) => setLowCalorie(e.target.checked)}
                style={{ 
                  margin: 0,
                  width: "17px",
                  height: "17px",
                  cursor: "pointer",
                  accentColor: "#10b981",
                }}
              />
            </label>
          </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {isLoading ? (
          <p className="profile-header__subtitle">
            Loading dishes...
          </p>
        ) : errorMessage ? (
          <p className="profile-header__subtitle">
            {errorMessage}
          </p>
        ) : dishes.length === 0 ? (
          <p className="profile-header__subtitle">
            No dishes match your filters yet.
          </p>
        ) : (
          dishes.map((dish) => {
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

    <section
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}
    >
      <p className="profile-header__subtitle" style={{ margin: 0 }}>
        {totalDishes > 0
          ? `Showing ${dishes.length} of ${totalDishes} dishes`
          : "No dishes available yet."}
      </p>

      {hasNextPage && (
        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isLoadingMore}
          className="auth-form__submit"
          style={{
            padding: "0.55rem 1rem",
            minWidth: "140px",
            fontSize: "0.85rem",
            opacity: isLoadingMore ? 0.75 : 1,
          }}
        >
          {isLoadingMore ? "Loading..." : "Load 50 more"}
        </button>
      )}
    </section>
  </div>
);
}
