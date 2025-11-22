// src/components/client/ProgressForm.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CLIENT_PROGRESS_QUERY_KEY } from "@/lib/queries/clientProgress";

const ProgressSchema = z.object({
  // Basic measurements
  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(20, "Weight too low")
    .max(500, "Weight too high")
    .optional()
    .or(z.nan().transform(() => undefined)),
  heightCm: z
    .number({ invalid_type_error: "Height must be a number" })
    .min(80, "Height too low")
    .max(250, "Height too high")
    .optional()
    .or(z.nan().transform(() => undefined)),
  notes: z.string().optional(),
  
  // Basic Info
  age: z
    .number({ invalid_type_error: "Age must be a number" })
    .min(5, "Age too low")
    .max(120, "Age too high")
    .optional()
    .or(z.nan().transform(() => undefined)),
  gender: z.string().optional(),
  
  // Smart Scale Measurements
  bodyFatPercentage: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0)
    .max(100)
    .optional()
    .or(z.nan().transform(() => undefined)),
  visceralFatLevel: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0)
    .max(50)
    .optional()
    .or(z.nan().transform(() => undefined)),
  muscleMass: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0)
    .max(200)
    .optional()
    .or(z.nan().transform(() => undefined)),
  metabolicAge: z
    .number({ invalid_type_error: "Must be a number" })
    .min(10)
    .max(120)
    .optional()
    .or(z.nan().transform(() => undefined)),
  bodyWaterPercentage: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0)
    .max(100)
    .optional()
    .or(z.nan().transform(() => undefined)),
  boneMass: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0)
    .max(20)
    .optional()
    .or(z.nan().transform(() => undefined)),
  
  // Lifestyle & Habits
  dailyActivityLevel: z.string().optional(),
  hydrationHabits: z.string().optional(),
  personalGoals: z.string().optional(),
  
  // Health History
  healthConditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  pastWeightChanges: z.string().optional(),
  
  // Vitals
  bloodSugarFasting: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0)
    .max(600)
    .optional()
    .or(z.nan().transform(() => undefined)),
  bloodSugarRandom: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0)
    .max(600)
    .optional()
    .or(z.nan().transform(() => undefined)),
  bloodPressureSystolic: z
    .number({ invalid_type_error: "Must be a number" })
    .min(40)
    .max(250)
    .optional()
    .or(z.nan().transform(() => undefined)),
  bloodPressureDiastolic: z
    .number({ invalid_type_error: "Must be a number" })
    .min(20)
    .max(200)
    .optional()
    .or(z.nan().transform(() => undefined)),
});

type ProgressFormData = z.infer<typeof ProgressSchema>;

export default function ProgressForm() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"basic" | "scale" | "lifestyle" | "health" | "vitals">("basic");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgressFormData>({
    resolver: zodResolver(ProgressSchema),
    defaultValues: {
      weight: undefined,
      heightCm: undefined,
      notes: "",
      age: undefined,
      gender: "",
      bodyFatPercentage: undefined,
      visceralFatLevel: undefined,
      muscleMass: undefined,
      metabolicAge: undefined,
      bodyWaterPercentage: undefined,
      boneMass: undefined,
      dailyActivityLevel: "",
      hydrationHabits: "",
      personalGoals: "",
      healthConditions: "",
      allergies: "",
      medications: "",
      pastWeightChanges: "",
      bloodSugarFasting: undefined,
      bloodSugarRandom: undefined,
      bloodPressureSystolic: undefined,
      bloodPressureDiastolic: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: ProgressFormData) => {
      const body: any = {
        weight: payload.weight,
        height: payload.heightCm,
        notes: payload.notes,
        age: payload.age,
        gender: payload.gender || undefined,
        bodyFatPercentage: payload.bodyFatPercentage,
        visceralFatLevel: payload.visceralFatLevel,
        muscleMass: payload.muscleMass,
        metabolicAge: payload.metabolicAge,
        bodyWaterPercentage: payload.bodyWaterPercentage,
        boneMass: payload.boneMass,
        dailyActivityLevel: payload.dailyActivityLevel || undefined,
        hydrationHabits: payload.hydrationHabits || undefined,
        personalGoals: payload.personalGoals || undefined,
        healthConditions: payload.healthConditions || undefined,
        allergies: payload.allergies || undefined,
        medications: payload.medications || undefined,
        pastWeightChanges: payload.pastWeightChanges || undefined,
        bloodSugarFasting: payload.bloodSugarFasting,
        bloodSugarRandom: payload.bloodSugarRandom,
        bloodPressureSystolic: payload.bloodPressureSystolic,
        bloodPressureDiastolic: payload.bloodPressureDiastolic,
      };
      return await api.post("/progress", body);
    },
    onSuccess: () => {
      toast.success("Progress updated successfully");
      queryClient.invalidateQueries({ queryKey: CLIENT_PROGRESS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["myPlans"] });
      queryClient.invalidateQueries({ queryKey: ["clientSummary"] });
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update progress");
    },
  });

  const onSubmit = async (data: ProgressFormData) => {
    mutation.mutate(data);
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "0.5rem", 
        marginBottom: "1rem", 
        overflowX: "auto",
        overflowY: "hidden",
        flexWrap: "nowrap",
        scrollBehavior: "smooth",
        paddingBottom: "0.5rem"
      }}>
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={activeTab === "basic" ? "client-button" : "client-button-secondary"}
          style={{ fontSize: "0.875rem", padding: "0.5rem 1rem", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Basic
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("scale")}
          className={activeTab === "scale" ? "client-button" : "client-button-secondary"}
          style={{ fontSize: "0.875rem", padding: "0.5rem 1rem", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Smart Scale
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lifestyle")}
          className={activeTab === "lifestyle" ? "client-button" : "client-button-secondary"}
          style={{ fontSize: "0.875rem", padding: "0.5rem 1rem", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Lifestyle
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("health")}
          className={activeTab === "health" ? "client-button" : "client-button-secondary"}
          style={{ fontSize: "0.875rem", padding: "0.5rem 1rem", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Health History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("vitals")}
          className={activeTab === "vitals" ? "client-button" : "client-button-secondary"}
          style={{ fontSize: "0.875rem", padding: "0.5rem 1rem", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Vitals
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="client-form">
        {/* BASIC TAB */}
        {activeTab === "basic" && (
          <>
            <div className="client-form__row">
              <label className="client-form__label">Age</label>
              <input
                type="number"
                {...register("age", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 25"
              />
              {errors.age && <p className="client-form__error">{errors.age.message}</p>}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Gender</label>
              <select {...register("gender")} className="client-form__control">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="client-form__error">{errors.gender.message}</p>}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                {...register("weight", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 70.5"
              />
              {errors.weight && <p className="client-form__error">{errors.weight.message}</p>}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                {...register("heightCm", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 172"
              />
              {errors.heightCm && <p className="client-form__error">{String(errors.heightCm.message)}</p>}
            </div>
            <div className="client-form__row client-form__row--full">
              <label className="client-form__label">Notes</label>
              <textarea
                {...register("notes")}
                className="client-form__control client-form__control--textarea"
                rows={3}
                placeholder="Optional notes or comments..."
              />
            </div>
          </>
        )}

        {/* SMART SCALE TAB */}
        {activeTab === "scale" && (
          <>
            <div className="client-form__row">
              <label className="client-form__label">Body Fat Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                {...register("bodyFatPercentage", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 18.5"
              />
              {errors.bodyFatPercentage && (
                <p className="client-form__error">{String(errors.bodyFatPercentage.message)}</p>
              )}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Visceral Fat Level (1-20)</label>
              <input
                type="number"
                step="0.1"
                {...register("visceralFatLevel", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 8"
              />
              {errors.visceralFatLevel && (
                <p className="client-form__error">{String(errors.visceralFatLevel.message)}</p>
              )}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Muscle Mass (kg)</label>
              <input
                type="number"
                step="0.1"
                {...register("muscleMass", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 55.2"
              />
              {errors.muscleMass && <p className="client-form__error">{String(errors.muscleMass.message)}</p>}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Metabolic Age (years)</label>
              <input
                type="number"
                {...register("metabolicAge", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 28"
              />
              {errors.metabolicAge && (
                <p className="client-form__error">{String(errors.metabolicAge.message)}</p>
              )}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Body Water Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                {...register("bodyWaterPercentage", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 58.3"
              />
              {errors.bodyWaterPercentage && (
                <p className="client-form__error">{String(errors.bodyWaterPercentage.message)}</p>
              )}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Bone Mass (kg)</label>
              <input
                type="number"
                step="0.1"
                {...register("boneMass", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 3.2"
              />
              {errors.boneMass && <p className="client-form__error">{String(errors.boneMass.message)}</p>}
            </div>
          </>
        )}

        {/* LIFESTYLE TAB */}
        {activeTab === "lifestyle" && (
          <>
            <div className="client-form__row">
              <label className="client-form__label">Daily Activity Level</label>
              <select {...register("dailyActivityLevel")} className="client-form__control">
                <option value="">Select...</option>
                <option value="None">None</option>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly active">Lightly active</option>
                <option value="Moderately active">Moderately active</option>
                <option value="Very active">Very active</option>
                <option value="Highly active / athlete">Highly active / athlete</option>
              </select>
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Hydration Habits</label>
              <select {...register("hydrationHabits")} className="client-form__control">
                <option value="">Select...</option>
                <option value="None">None</option>
                <option value="< 1 liter/day">&lt; 1 liter/day</option>
                <option value="1–2 liters/day">1–2 liters/day</option>
                <option value="2–3 liters/day">2–3 liters/day</option>
                <option value="> 3 liters/day">&gt; 3 liters/day</option>
              </select>
            </div>
            <div className="client-form__row client-form__row--full">
              <label className="client-form__label">Personal Goals</label>
              <textarea
                {...register("personalGoals")}
                className="client-form__control client-form__control--textarea"
                rows={4}
                placeholder="E.g. Weight loss, muscle gain, improved endurance, etc."
              />
            </div>
          </>
        )}

        {/* HEALTH HISTORY TAB */}
        {activeTab === "health" && (
          <>
            <div className="client-form__row client-form__row--full">
              <label className="client-form__label">Existing Health Conditions</label>
              <textarea
                {...register("healthConditions")}
                className="client-form__control client-form__control--textarea"
                rows={3}
                placeholder="E.g. Diabetes, thyroid, PCOS, etc."
              />
            </div>
            <div className="client-form__row client-form__row--full">
              <label className="client-form__label">Allergies</label>
              <textarea
                {...register("allergies")}
                className="client-form__control client-form__control--textarea"
                rows={3}
                placeholder="List any food or medication allergies"
              />
            </div>
            <div className="client-form__row client-form__row--full">
              <label className="client-form__label">Current Medications</label>
              <textarea
                {...register("medications")}
                className="client-form__control client-form__control--textarea"
                rows={3}
                placeholder="List any medications you're currently taking"
              />
            </div>
            <div className="client-form__row client-form__row--full">
              <label className="client-form__label">Past Weight Changes</label>
              <textarea
                {...register("pastWeightChanges")}
                className="client-form__control client-form__control--textarea"
                rows={3}
                placeholder="Describe any significant weight changes in the past"
              />
            </div>
          </>
        )}

        {/* VITALS TAB */}
        {activeTab === "vitals" && (
          <>
            <div className="client-form__row">
              <label className="client-form__label">Fasting Blood Sugar (mg/dL)</label>
              <input
                type="number"
                step="0.1"
                {...register("bloodSugarFasting", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 95"
              />
              {errors.bloodSugarFasting && (
                <p className="client-form__error">{String(errors.bloodSugarFasting.message)}</p>
              )}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Random Blood Sugar (mg/dL)</label>
              <input
                type="number"
                step="0.1"
                {...register("bloodSugarRandom", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 120"
              />
              {errors.bloodSugarRandom && (
                <p className="client-form__error">{String(errors.bloodSugarRandom.message)}</p>
              )}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Blood Pressure - Systolic (mmHg)</label>
              <input
                type="number"
                {...register("bloodPressureSystolic", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 120"
              />
              {errors.bloodPressureSystolic && (
                <p className="client-form__error">{String(errors.bloodPressureSystolic.message)}</p>
              )}
            </div>
            <div className="client-form__row">
              <label className="client-form__label">Blood Pressure - Diastolic (mmHg)</label>
              <input
                type="number"
                {...register("bloodPressureDiastolic", { valueAsNumber: true })}
                className="client-form__control"
                placeholder="e.g. 80"
              />
              {errors.bloodPressureDiastolic && (
                <p className="client-form__error">{String(errors.bloodPressureDiastolic.message)}</p>
              )}
            </div>
          </>
        )}

        <div className="client-form__actions">
          <button type="submit" disabled={isSubmitting} className="client-button">
            {isSubmitting ? "Saving..." : "Save Progress"}
          </button>
        </div>
      </form>
    </div>
  );
}
