"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";

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

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        fontSize: "0.95rem",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          alignItems: "center",
          textAlign: "center",
        }}
      >
          <h1
            className="profile-header__title"
            style={{ fontSize: "1.8rem", fontWeight: 700 }}
          >
            Indian Food Nutrition Index
          </h1>
          <p
            className="profile-header__subtitle"
            style={{ fontSize: "0.95rem" }}
          >
          Search and explore nutrition facts for popular Indian dishes.
        </p>
      </header>

      <section
        className="profile-card"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem 1rem",
          alignItems: "flex-end",
        }}
      >
        <div style={{ minWidth: 220, flex: 1 }}>
          <label className="profile-field__label">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Dish or category"
            className="auth-form__input"
          />
        </div>

        <div style={{ minWidth: 180 }}>
          <label className="profile-field__label">Veg / Non-veg</label>
          <select
            value={vegFilter}
            onChange={(e) => setVegFilter(e.target.value as any)}
            className="auth-form__input"
          >
            <option value="all">All</option>
            <option value="veg">Veg only</option>
            <option value="nonveg">Non-veg only</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="profile-field__label">Highlight</span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                id="highProtein"
                type="checkbox"
                checked={highProtein}
                onChange={(e) => setHighProtein(e.target.checked)}
              />
              <span className="profile-field__value">High Protein (15g+)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                id="lowCalorie"
                type="checkbox"
                checked={lowCalorie}
                onChange={(e) => setLowCalorie(e.target.checked)}
              />
              <span className="profile-field__value">Low Calorie (≤ 250 kcal)</span>
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
          filtered.map((dish) => (
            <div
              key={dish.name}
              className="profile-card"
              style={{
                padding: "1rem 1.1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                borderLeft: dish.vegetarian
                  ? "4px solid rgba(16, 185, 129, 0.5)" // green accent for veg
                  : "4px solid rgba(239, 68, 68, 0.5)", // red accent for non-veg
                background:
                  dish.calories_kcal <= 250
                    ? "linear-gradient(to right, rgba(34,197,94,0.04), white)"
                    : "linear-gradient(to right, rgba(59,130,246,0.03), white)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div className="client-card__title" style={{ fontSize: "1.05rem" }}>
                    {dish.name}
                  </div>
                  <div
                    className="client-card__subtitle"
                    style={{
                      fontSize: "0.85rem",
                      color: dish.vegetarian ? "#047857" : "#b91c1c",
                    }}
                  >
                    {dish.category} • {dish.vegetarian ? "Veg" : "Non-veg"}
                  </div>
                  <div
                    className="profile-field__value"
                    style={{ fontSize: "0.8rem", marginTop: 2 }}
                  >
                    Serving size: {dish.serving_size_g} g
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    alignItems: "flex-end",
                    minWidth: 120,
                  }}
                >
                  {isHighProteinDish(dish) && (
                    <span className="badge badge--success">High Protein</span>
                  )}
                  {isLowCalorieDish(dish) && (
                    <span className="badge badge--info">Low Calorie</span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "0.5rem 1.5rem",
                  marginTop: "0.25rem",
                }}
              >
                <div>
                  <div className="profile-field__label">Energy & Macros</div>
                    <div className="profile-field__value">{dish.calories_kcal} kcal</div>
                    <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                      Protein {dish.protein_g} g
                    </div>
                    <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                      Carbs {dish.carbs_g} g
                    </div>
                    <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                      Fats {dish.fat_g} g
                    </div>
                </div>

                <div>
                  <div className="profile-field__label">Fiber & Sugar</div>
                  <div className="profile-field__value">Fiber {dish.fiber_g} g</div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Sugar {dish.sugar_g} g
                  </div>
                </div>

                <div>
                  <div className="profile-field__label">Vitamins</div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Vitamin A: {dish.vitamin_A_ug} μg
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    B-complex: {dish.vitamin_B_mg} mg
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Vitamin C: {dish.vitamin_C_mg} mg
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Vitamin D: {dish.vitamin_D_IU} IU
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Vitamin E: {dish.vitamin_E_mg} mg
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Vitamin K: {dish.vitamin_K_ug} μg
                  </div>
                </div>

                <div>
                  <div className="profile-field__label">Minerals</div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Iron: {dish.iron_mg} mg
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Calcium: {dish.calcium_mg} mg
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Magnesium: {dish.magnesium_mg} mg
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Potassium: {dish.potassium_mg} mg
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Sodium: {dish.sodium_mg} mg
                  </div>
                  <div className="profile-field__value" style={{ fontSize: "0.8rem" }}>
                    Zinc: {dish.zinc_mg} mg
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
