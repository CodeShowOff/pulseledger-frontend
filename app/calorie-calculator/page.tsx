"use client";

import React, { useState } from "react";

const activityOptions = [
  { value: "sedentary", label: "Sedentary (little or no exercise)", multiplier: 1.2 },
  { value: "light", label: "Lightly active (1-3 days/week)", multiplier: 1.375 },
  { value: "moderate", label: "Moderately active (3-5 days/week)", multiplier: 1.55 },
  { value: "very", label: "Very active (6-7 days/week)", multiplier: 1.725 },
  { value: "extra", label: "Extra active (physical job & training)", multiplier: 1.9 },
];

const goalOptions = [
  { value: "lose", label: "Lose Weight" },
  { value: "maintain", label: "Maintain Weight" },
  { value: "gain", label: "Gain Weight" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

function calculateBMR(age: number, gender: string, weightKg: number, heightCm: number): number {
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function round(value: number): number {
  return Math.round(value);
}

export default function CalorieCalculatorPage() {
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("male");
  const [height, setHeight] = useState<string>(""); // cm
  const [weight, setWeight] = useState<string>(""); // kg
  const [activity, setActivity] = useState<string>("sedentary");
  const [goal, setGoal] = useState<string>("maintain");

  const [bmr, setBmr] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const [targetCalories, setTargetCalories] = useState<number | null>(null);
  const [macros, setMacros] = useState<{ protein: number; carbs: number; fats: number } | null>(
    null
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (!ageNum || !heightNum || !weightNum) {
      return;
    }

    const activityMultiplier =
      activityOptions.find((opt) => opt.value === activity)?.multiplier || 1.2;

    const bmrValue = calculateBMR(ageNum, gender, weightNum, heightNum);
    const tdeeValue = bmrValue * activityMultiplier;

    let target = tdeeValue;
    if (goal === "lose") {
      target = tdeeValue - 500;
    } else if (goal === "gain") {
      target = tdeeValue + 300;
    }

    const safeTarget = Math.max(target, 1200); // basic floor for safety

    // Macro breakdown: 30% protein, 40% carbs, 30% fats
    const proteinCalories = safeTarget * 0.3;
    const carbCalories = safeTarget * 0.4;
    const fatCalories = safeTarget * 0.3;

    const proteinGrams = proteinCalories / 4;
    const carbGrams = carbCalories / 4;
    const fatGrams = fatCalories / 9;

    setBmr(round(bmrValue));
    setTdee(round(tdeeValue));
    setTargetCalories(round(safeTarget));
    setMacros({
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbGrams),
      fats: Math.round(fatGrams),
    });
  };

  return (
    <div className="profile-shell">
      <div className="profile-inner">
        <section className="profile-header" style={{ marginBottom: "0.85rem" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h1 className="profile-header__title" style={{ margin: 0, textAlign: "center" }}>
              Daily Calorie Calculator
            </h1>
          </div>
        </section>

        <div className="profile-grid">
          <form className="profile-card" onSubmit={handleCalculate}>
            <h2 className="profile-header__title" style={{ fontSize: "1rem", marginBottom: 8 }}>
              Your Details
            </h2>
            <div className="profile-fields">
              <div className="profile-field">
                <label className="profile-field__label">Age</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="auth-form__input"
                  placeholder="e.g. 30"
                  required
                />
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="auth-form__input"
                >
                  {genderOptions.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Height (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="auth-form__input"
                  placeholder="e.g. 170"
                  required
                />
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Weight (kg)</label>
                <input
                  type="number"
                  min={35}
                  max={250}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="auth-form__input"
                  placeholder="e.g. 70"
                  required
                />
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Activity Level</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="auth-form__input"
                >
                  {activityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="auth-form__input"
                >
                  {goalOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="auth-form__submit auth-form__submit--secondary"
              style={{ marginTop: "0.75rem" }}
            >
              🧮 Calculate
            </button>
          </form>

          <div className="profile-card">
            <h2 className="profile-header__title" style={{ fontSize: "1rem", marginBottom: 8 }}>
              Results
            </h2>
            {bmr && tdee && targetCalories && macros ? (
              <div className="profile-fields">
                <div className="profile-field">
                  <div className="profile-field__label">BMR (Basal Metabolic Rate)</div>
                  <div className="profile-field__value">{bmr} kcal/day</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field__label">TDEE (Total Daily Energy Expenditure)</div>
                  <div className="profile-field__value">{tdee} kcal/day</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field__label">Suggested Daily Intake</div>
                  <div className="profile-field__value">{targetCalories} kcal/day</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field__label">Macro Breakdown</div>
                  <div className="profile-field__value">
                    Protein: {macros.protein} g • Carbs: {macros.carbs} g • Fats: {" "}
                    {macros.fats} g
                  </div>
                </div>
              </div>
            ) : (
              <p className="profile-header__subtitle">
                Fill in your details and click Calculate to see your results.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
