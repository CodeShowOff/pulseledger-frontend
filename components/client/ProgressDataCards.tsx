// src/components/client/ProgressDataCards.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CLIENT_PROGRESS_QUERY_KEY,
  fetchClientProgressEntries,
} from "@/lib/queries/clientProgress";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";

export default function ProgressDataCards() {
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: CLIENT_PROGRESS_QUERY_KEY,
    queryFn: () => fetchClientProgressEntries(),
  });

  // State for Basic Info
  const [basicInfo, setBasicInfo] = useState({
    age: undefined as number | null | undefined,
    dateOfBirth: "" as string,
    gender: "",
    weight: undefined as number | undefined,
    height: undefined as number | undefined,
    notes: "",
  });

  // State for Smart Scale
  const [smartScale, setSmartScale] = useState({
    bodyFatPercentage: undefined as number | undefined,
    visceralFatLevel: undefined as number | undefined,
    muscleMass: undefined as number | undefined,
    metabolicAge: undefined as number | undefined,
    bodyWaterPercentage: undefined as number | undefined,
    boneMass: undefined as number | undefined,
  });

  // State for Lifestyle
  const [lifestyle, setLifestyle] = useState({
    dailyActivityLevel: "",
    hydrationHabits: "",
    personalGoals: "",
  });

  // State for Health History
  const [healthHistory, setHealthHistory] = useState({
    healthConditions: "",
    allergies: "",
    medications: "",
    pastWeightChanges: "",
  });

  // State for Vitals
  const [vitals, setVitals] = useState({
    bloodSugarFasting: undefined as number | undefined,
    bloodSugarRandom: undefined as number | undefined,
    bloodPressureSystolic: undefined as number | undefined,
    bloodPressureDiastolic: undefined as number | undefined,
  });

  // Store original values when entering edit mode to track changes
  const [originalBasicInfo, setOriginalBasicInfo] = useState(basicInfo);
  const [originalSmartScale, setOriginalSmartScale] = useState(smartScale);
  const [originalLifestyle, setOriginalLifestyle] = useState(lifestyle);
  const [originalHealthHistory, setOriginalHealthHistory] = useState(healthHistory);
  const [originalVitals, setOriginalVitals] = useState(vitals);

  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  // Helper function to calculate age from date of birth (fallback if backend doesn't send it)
  const calculateAge = (dateOfBirth: string | undefined | null): number | null => {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Load data from response
  useEffect(() => {
    if (response && response.data) {
      const profile = response.profile || {};
      const dataArray = response.data || [];

      // Helper: find entry with max date having the field defined (robust against ordering)
      const getLatestValue = (fieldName: string): any => {
        let latest: { date: string; value: any } | null = null;
        for (const raw of dataArray) {
          const entry = raw as any;
          if (entry[fieldName] != null) {
            if (!latest || new Date(entry.date) > new Date(latest.date)) {
              latest = { date: entry.date, value: entry[fieldName] };
            }
          }
        }
        return latest ? latest.value : undefined;
      };

      // Load profile data (non-tracking) and latest tracking data for basic info
      // Calculate age from dateOfBirth if backend doesn't send it
      const displayAge = profile.age ?? calculateAge(profile.dateOfBirth);
      
      setBasicInfo({
        age: displayAge,
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
        gender: profile.gender || "",
        weight: getLatestValue('weight'),
        height: getLatestValue('height'),
        notes: getLatestValue('notes') || "",
      });

      setLifestyle({
        dailyActivityLevel: profile.dailyActivityLevel || "",
        hydrationHabits: profile.hydrationHabits || "",
        personalGoals: profile.personalGoals || "",
      });

      setHealthHistory({
        healthConditions: profile.healthConditions || "",
        allergies: profile.allergies || "",
        medications: profile.medications || "",
        pastWeightChanges: profile.pastWeightChanges || "",
      });

      // Load latest tracking data for smart scale
      setSmartScale({
        bodyFatPercentage: getLatestValue('bodyFatPercentage'),
        visceralFatLevel: getLatestValue('visceralFatLevel'),
        muscleMass: getLatestValue('muscleMass'),
        metabolicAge: getLatestValue('metabolicAge'),
        bodyWaterPercentage: getLatestValue('bodyWaterPercentage'),
        boneMass: getLatestValue('boneMass'),
      });

      // Load latest tracking data for vitals
      setVitals({
        bloodSugarFasting: getLatestValue('bloodSugarFasting'),
        bloodSugarRandom: getLatestValue('bloodSugarRandom'),
        bloodPressureSystolic: getLatestValue('bloodPressureSystolic'),
        bloodPressureDiastolic: getLatestValue('bloodPressureDiastolic'),
      });
    }
  }, [response]);

  // Handler to enter edit mode and capture original values
  const handleEdit = useCallback((section: string) => {
    if (section === "basic") {
      setOriginalBasicInfo({ ...basicInfo });
    } else if (section === "scale") {
      setOriginalSmartScale({ ...smartScale });
    } else if (section === "lifestyle") {
      setOriginalLifestyle({ ...lifestyle });
    } else if (section === "health") {
      setOriginalHealthHistory({ ...healthHistory });
    } else if (section === "vitals") {
      setOriginalVitals({ ...vitals });
    }
    setEditingSection(section);
  }, [basicInfo, smartScale, lifestyle, healthHistory, vitals]);

  const handleSave = useCallback(
    async (section: string) => {
      setSaving(true);
      try {
        let payload: any = {};

        if (section === "basic") {
          // Only send fields that have changed or are explicitly being updated
          payload = {};
          if (basicInfo.dateOfBirth !== originalBasicInfo.dateOfBirth) {
            payload.dateOfBirth = basicInfo.dateOfBirth || undefined;
          }
          if (basicInfo.gender !== originalBasicInfo.gender) {
            payload.gender = basicInfo.gender || undefined;
          }
          if (basicInfo.weight !== originalBasicInfo.weight) {
            payload.weight = basicInfo.weight;
          }
          if (basicInfo.height !== originalBasicInfo.height) {
            payload.height = basicInfo.height;
          }
          if (basicInfo.notes !== originalBasicInfo.notes) {
            payload.notes = basicInfo.notes || undefined;
          }
        } else if (section === "scale") {
          // Only send smart scale fields that have changed
          payload = {};
          if (smartScale.bodyFatPercentage !== originalSmartScale.bodyFatPercentage) {
            payload.bodyFatPercentage = smartScale.bodyFatPercentage;
          }
          if (smartScale.visceralFatLevel !== originalSmartScale.visceralFatLevel) {
            payload.visceralFatLevel = smartScale.visceralFatLevel;
          }
          if (smartScale.muscleMass !== originalSmartScale.muscleMass) {
            payload.muscleMass = smartScale.muscleMass;
          }
          if (smartScale.metabolicAge !== originalSmartScale.metabolicAge) {
            payload.metabolicAge = smartScale.metabolicAge;
          }
          if (smartScale.bodyWaterPercentage !== originalSmartScale.bodyWaterPercentage) {
            payload.bodyWaterPercentage = smartScale.bodyWaterPercentage;
          }
          if (smartScale.boneMass !== originalSmartScale.boneMass) {
            payload.boneMass = smartScale.boneMass;
          }
        } else if (section === "lifestyle") {
          payload = {};
          if (lifestyle.dailyActivityLevel !== originalLifestyle.dailyActivityLevel) {
            payload.dailyActivityLevel = lifestyle.dailyActivityLevel || undefined;
          }
          if (lifestyle.hydrationHabits !== originalLifestyle.hydrationHabits) {
            payload.hydrationHabits = lifestyle.hydrationHabits || undefined;
          }
          if (lifestyle.personalGoals !== originalLifestyle.personalGoals) {
            payload.personalGoals = lifestyle.personalGoals || undefined;
          }
        } else if (section === "health") {
          payload = {};
          if (healthHistory.healthConditions !== originalHealthHistory.healthConditions) {
            payload.healthConditions = healthHistory.healthConditions || undefined;
          }
          if (healthHistory.allergies !== originalHealthHistory.allergies) {
            payload.allergies = healthHistory.allergies || undefined;
          }
          if (healthHistory.medications !== originalHealthHistory.medications) {
            payload.medications = healthHistory.medications || undefined;
          }
          if (healthHistory.pastWeightChanges !== originalHealthHistory.pastWeightChanges) {
            payload.pastWeightChanges = healthHistory.pastWeightChanges || undefined;
          }
        } else if (section === "vitals") {
          payload = {};
          if (vitals.bloodSugarFasting !== originalVitals.bloodSugarFasting) {
            payload.bloodSugarFasting = vitals.bloodSugarFasting;
          }
          if (vitals.bloodSugarRandom !== originalVitals.bloodSugarRandom) {
            payload.bloodSugarRandom = vitals.bloodSugarRandom;
          }
          if (vitals.bloodPressureSystolic !== originalVitals.bloodPressureSystolic) {
            payload.bloodPressureSystolic = vitals.bloodPressureSystolic;
          }
          if (vitals.bloodPressureDiastolic !== originalVitals.bloodPressureDiastolic) {
            payload.bloodPressureDiastolic = vitals.bloodPressureDiastolic;
          }
        }

        // Only make API call if there are changes
        if (Object.keys(payload).length === 0) {
          toast.info("No changes detected");
          setEditingSection(null);
          setSaving(false);
          return;
        }

        await api.post("/progress", payload);
        
        // Invalidate and refetch queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: CLIENT_PROGRESS_QUERY_KEY }),
          queryClient.invalidateQueries({ queryKey: ["clientSummary"] }),
        ]);
        
        // Wait a bit for the refetch to complete
        await queryClient.refetchQueries({ queryKey: CLIENT_PROGRESS_QUERY_KEY });
        
        toast.success("Progress updated successfully");
        setEditingSection(null);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const msg = (err as any).response?.data?.message || (err as any).message || "Failed to update progress";
          toast.error(msg);
        } else if (err instanceof Error) {
          toast.error(err.message || "Failed to update progress");
        } else {
          toast.error("Failed to update progress");
        }
      } finally {
        setSaving(false);
      }
    },
    [basicInfo, smartScale, lifestyle, healthHistory, vitals, originalBasicInfo, originalSmartScale, originalLifestyle, originalHealthHistory, originalVitals, queryClient]
  );

  const handleCancel = useCallback(
    (section: string) => {
      // Reload from response
      if (response) {
        const profile = response.profile || {};
        const dataArray = response.data || [];

        const getLatestValue = (fieldName: string): any => {
          let latest: { date: string; value: any } | null = null;
          for (const raw of dataArray) {
            const entry = raw as any;
            if (entry[fieldName] != null) {
              if (!latest || new Date(entry.date) > new Date(latest.date)) {
                latest = { date: entry.date, value: entry[fieldName] };
              }
            }
          }
          return latest ? latest.value : undefined;
        };

        if (section === "basic") {
          const displayAge = profile.age ?? calculateAge(profile.dateOfBirth);
          setBasicInfo({
            age: displayAge,
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
            gender: profile.gender || "",
            weight: getLatestValue('weight'),
            height: getLatestValue('height'),
            notes: getLatestValue('notes') || "",
          });
        } else if (section === "scale") {
          setSmartScale({
            bodyFatPercentage: getLatestValue('bodyFatPercentage'),
            visceralFatLevel: getLatestValue('visceralFatLevel'),
            muscleMass: getLatestValue('muscleMass'),
            metabolicAge: getLatestValue('metabolicAge'),
            bodyWaterPercentage: getLatestValue('bodyWaterPercentage'),
            boneMass: getLatestValue('boneMass'),
          });
        } else if (section === "lifestyle") {
          setLifestyle({
            dailyActivityLevel: profile.dailyActivityLevel || "",
            hydrationHabits: profile.hydrationHabits || "",
            personalGoals: profile.personalGoals || "",
          });
        } else if (section === "health") {
          setHealthHistory({
            healthConditions: profile.healthConditions || "",
            allergies: profile.allergies || "",
            medications: profile.medications || "",
            pastWeightChanges: profile.pastWeightChanges || "",
          });
        } else if (section === "vitals") {
          setVitals({
            bloodSugarFasting: getLatestValue('bloodSugarFasting'),
            bloodSugarRandom: getLatestValue('bloodSugarRandom'),
            bloodPressureSystolic: getLatestValue('bloodPressureSystolic'),
            bloodPressureDiastolic: getLatestValue('bloodPressureDiastolic'),
          });
        }
      }
      setEditingSection(null);
    },
    [response]
  );

  if (isLoading) {
    return <p className="client-card__subtitle">Loading progress data...</p>;
  }

  const sections = [
    { id: "basic", label: "Basic Measurements" },
    { id: "scale", label: "Smart Scale" },
    { id: "lifestyle", label: "Lifestyle & Habits" },
    { id: "health", label: "Health History" },
    { id: "vitals", label: "Vitals" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Section Switcher */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", overflowY: "hidden", flexWrap: "nowrap", paddingBottom: "0.5rem", scrollBehavior: "smooth" }}>
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`btn ${activeSection === section.id ? "btn--primary" : "btn--outline"}`}
            onClick={() => {
              setActiveSection(section.id);
              setEditingSection(null);
            }}
            style={{ fontSize: "0.9rem", flexShrink: 0, whiteSpace: "nowrap" }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Basic Info Card */}
      {activeSection === "basic" && (
        <div className="profile-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 className="client-card__section-title">Basic Measurements</h2>
          {editingSection !== "basic" && (
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: "0.8rem", paddingInline: "0.75rem", paddingBlock: "0.25rem" }}
              onClick={() => handleEdit("basic")}
            >
              Edit
            </button>
          )}
        </div>

        {editingSection !== "basic" ? (
          <div className="profile-fields" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <div className="profile-field">
              <dt className="profile-field__label">Age</dt>
              <dd className="profile-field__value">{basicInfo.age ?? "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Gender</dt>
              <dd className="profile-field__value">{basicInfo.gender || "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Weight (kg)</dt>
              <dd className="profile-field__value">{basicInfo.weight != null ? basicInfo.weight.toFixed(1) : "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Height (cm)</dt>
              <dd className="profile-field__value">{basicInfo.height ?? "-"}</dd>
            </div>
            <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
              <dt className="profile-field__label">Notes</dt>
              <dd className="profile-field__value">{basicInfo.notes || "-"}</dd>
            </div>
          </div>
        ) : (
          <div>
            <div className="client-form" style={{ gap: 8 }}>
              <div className="client-form__row">
                <label className="client-form__label">Date of Birth</label>
                <input
                  type="date"
                  className="client-form__control"
                  value={basicInfo.dateOfBirth}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBasicInfo({ ...basicInfo, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Gender</label>
                <select
                  className="client-form__control"
                  value={basicInfo.gender}
                  onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="client-form__control"
                  placeholder="e.g. 70.5"
                  value={basicInfo.weight ?? ""}
                  onChange={(e) => setBasicInfo({ ...basicInfo, weight: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="client-form__control"
                  placeholder="e.g. 172"
                  value={basicInfo.height ?? ""}
                  onChange={(e) => setBasicInfo({ ...basicInfo, height: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row client-form__row--full">
                <label className="client-form__label">Notes</label>
                <textarea
                  className="client-form__control client-form__control--textarea"
                  rows={3}
                  placeholder="Optional notes or comments..."
                  value={basicInfo.notes}
                  onChange={(e) => setBasicInfo({ ...basicInfo, notes: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => handleCancel("basic")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleSave("basic")}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Smart Scale Card */}
      {activeSection === "scale" && (
      <div className="profile-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 className="client-card__section-title">Smart Scale Measurements</h2>
          {editingSection !== "scale" && (
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: "0.8rem", paddingInline: "0.75rem", paddingBlock: "0.25rem" }}
              onClick={() => handleEdit("scale")}
            >
              Edit
            </button>
          )}
        </div>

        {editingSection !== "scale" ? (
          <div className="profile-fields" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <div className="profile-field">
              <dt className="profile-field__label">Body Fat %</dt>
              <dd className="profile-field__value">{smartScale.bodyFatPercentage != null ? smartScale.bodyFatPercentage.toFixed(1) : "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Visceral Fat Level</dt>
              <dd className="profile-field__value">{smartScale.visceralFatLevel != null ? smartScale.visceralFatLevel.toFixed(1) : "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Muscle Mass (kg)</dt>
              <dd className="profile-field__value">{smartScale.muscleMass != null ? smartScale.muscleMass.toFixed(1) : "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Metabolic Age</dt>
              <dd className="profile-field__value">{smartScale.metabolicAge != null ? `${smartScale.metabolicAge} years` : "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Body Water %</dt>
              <dd className="profile-field__value">{smartScale.bodyWaterPercentage != null ? smartScale.bodyWaterPercentage.toFixed(1) : "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Bone Mass (kg)</dt>
              <dd className="profile-field__value">{smartScale.boneMass != null ? smartScale.boneMass.toFixed(1) : "-"}</dd>
            </div>
          </div>
        ) : (
          <div>
            <div className="client-form" style={{ gap: 8 }}>
              <div className="client-form__row">
                <label className="client-form__label">Body Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  className="client-form__control"
                  placeholder="e.g. 18.5"
                  value={smartScale.bodyFatPercentage ?? ""}
                  onChange={(e) => setSmartScale({ ...smartScale, bodyFatPercentage: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Visceral Fat Level</label>
                <input
                  type="number"
                  step="0.1"
                  className="client-form__control"
                  placeholder="e.g. 8"
                  value={smartScale.visceralFatLevel ?? ""}
                  onChange={(e) => setSmartScale({ ...smartScale, visceralFatLevel: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Muscle Mass (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="client-form__control"
                  placeholder="e.g. 55.2"
                  value={smartScale.muscleMass ?? ""}
                  onChange={(e) => setSmartScale({ ...smartScale, muscleMass: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Metabolic Age</label>
                <input
                  type="number"
                  className="client-form__control"
                  placeholder="e.g. 28"
                  value={smartScale.metabolicAge ?? ""}
                  onChange={(e) => setSmartScale({ ...smartScale, metabolicAge: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Body Water %</label>
                <input
                  type="number"
                  step="0.1"
                  className="client-form__control"
                  placeholder="e.g. 58.3"
                  value={smartScale.bodyWaterPercentage ?? ""}
                  onChange={(e) => setSmartScale({ ...smartScale, bodyWaterPercentage: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Bone Mass (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="client-form__control"
                  placeholder="e.g. 3.2"
                  value={smartScale.boneMass ?? ""}
                  onChange={(e) => setSmartScale({ ...smartScale, boneMass: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => handleCancel("scale")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleSave("scale")}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Lifestyle Card */}
      {activeSection === "lifestyle" && (
      <div className="profile-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 className="client-card__section-title">Lifestyle & Habits</h2>
          {editingSection !== "lifestyle" && (
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: "0.8rem", paddingInline: "0.75rem", paddingBlock: "0.25rem" }}
              onClick={() => handleEdit("lifestyle")}
            >
              Edit
            </button>
          )}
        </div>

        {editingSection !== "lifestyle" ? (
          <div className="profile-fields" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <div className="profile-field">
              <dt className="profile-field__label">Daily Activity Level</dt>
              <dd className="profile-field__value">{lifestyle.dailyActivityLevel || "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Hydration Habits</dt>
              <dd className="profile-field__value">{lifestyle.hydrationHabits || "-"}</dd>
            </div>
            <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
              <dt className="profile-field__label">Personal Goals</dt>
              <dd className="profile-field__value">{lifestyle.personalGoals || "-"}</dd>
            </div>
          </div>
        ) : (
          <div>
            <div className="client-form" style={{ gap: 8 }}>
              <div className="client-form__row">
                <label className="client-form__label">Daily Activity Level</label>
                <select
                  className="client-form__control"
                  value={lifestyle.dailyActivityLevel}
                  onChange={(e) => setLifestyle({ ...lifestyle, dailyActivityLevel: e.target.value })}
                >
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
                <select
                  className="client-form__control"
                  value={lifestyle.hydrationHabits}
                  onChange={(e) => setLifestyle({ ...lifestyle, hydrationHabits: e.target.value })}
                >
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
                  className="client-form__control client-form__control--textarea"
                  rows={4}
                  placeholder="E.g. Weight loss, muscle gain, improved endurance, etc."
                  value={lifestyle.personalGoals}
                  onChange={(e) => setLifestyle({ ...lifestyle, personalGoals: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => handleCancel("lifestyle")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleSave("lifestyle")}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Health History Card */}
      {activeSection === "health" && (
      <div className="profile-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 className="client-card__section-title">Health History</h2>
          {editingSection !== "health" && (
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: "0.8rem", paddingInline: "0.75rem", paddingBlock: "0.25rem" }}
              onClick={() => handleEdit("health")}
            >
              Edit
            </button>
          )}
        </div>

        {editingSection !== "health" ? (
          <div className="profile-fields" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            <div className="profile-field">
              <dt className="profile-field__label">Health Conditions</dt>
              <dd className="profile-field__value" style={{ whiteSpace: "pre-wrap" }}>{healthHistory.healthConditions || "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Allergies</dt>
              <dd className="profile-field__value" style={{ whiteSpace: "pre-wrap" }}>{healthHistory.allergies || "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Medications</dt>
              <dd className="profile-field__value" style={{ whiteSpace: "pre-wrap" }}>{healthHistory.medications || "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Past Weight Changes</dt>
              <dd className="profile-field__value" style={{ whiteSpace: "pre-wrap" }}>{healthHistory.pastWeightChanges || "-"}</dd>
            </div>
          </div>
        ) : (
          <div>
            <div className="client-form" style={{ gap: 8 }}>
              <div className="client-form__row client-form__row--full">
                <label className="client-form__label">Health Conditions</label>
                <textarea
                  className="client-form__control client-form__control--textarea"
                  rows={3}
                  placeholder="E.g. Diabetes, thyroid, PCOS, etc."
                  value={healthHistory.healthConditions}
                  onChange={(e) => setHealthHistory({ ...healthHistory, healthConditions: e.target.value })}
                />
              </div>
              <div className="client-form__row client-form__row--full">
                <label className="client-form__label">Allergies</label>
                <textarea
                  className="client-form__control client-form__control--textarea"
                  rows={3}
                  placeholder="List any food or medication allergies"
                  value={healthHistory.allergies}
                  onChange={(e) => setHealthHistory({ ...healthHistory, allergies: e.target.value })}
                />
              </div>
              <div className="client-form__row client-form__row--full">
                <label className="client-form__label">Current Medications</label>
                <textarea
                  className="client-form__control client-form__control--textarea"
                  rows={3}
                  placeholder="List any medications you're currently taking"
                  value={healthHistory.medications}
                  onChange={(e) => setHealthHistory({ ...healthHistory, medications: e.target.value })}
                />
              </div>
              <div className="client-form__row client-form__row--full">
                <label className="client-form__label">Past Weight Changes</label>
                <textarea
                  className="client-form__control client-form__control--textarea"
                  rows={3}
                  placeholder="Describe any significant weight changes in the past"
                  value={healthHistory.pastWeightChanges}
                  onChange={(e) => setHealthHistory({ ...healthHistory, pastWeightChanges: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => handleCancel("health")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleSave("health")}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Vitals Card */}
      {activeSection === "vitals" && (
      <div className="profile-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 className="client-card__section-title">Vitals</h2>
          {editingSection !== "vitals" && (
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: "0.8rem", paddingInline: "0.75rem", paddingBlock: "0.25rem" }}
              onClick={() => handleEdit("vitals")}
            >
              Edit
            </button>
          )}
        </div>

        {editingSection !== "vitals" ? (
          <div className="profile-fields" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <div className="profile-field">
              <dt className="profile-field__label">Fasting Blood Sugar (mg/dL)</dt>
              <dd className="profile-field__value">{vitals.bloodSugarFasting != null ? vitals.bloodSugarFasting.toFixed(0) : "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Random Blood Sugar (mg/dL)</dt>
              <dd className="profile-field__value">{vitals.bloodSugarRandom != null ? vitals.bloodSugarRandom.toFixed(0) : "-"}</dd>
            </div>
            <div className="profile-field">
              <dt className="profile-field__label">Blood Pressure (mmHg)</dt>
              <dd className="profile-field__value">
                {vitals.bloodPressureSystolic != null && vitals.bloodPressureDiastolic != null
                  ? `${Math.round(vitals.bloodPressureSystolic)}/${Math.round(vitals.bloodPressureDiastolic)}`
                  : vitals.bloodPressureSystolic != null
                  ? `${Math.round(vitals.bloodPressureSystolic)}/-`
                  : vitals.bloodPressureDiastolic != null
                  ? `-/${Math.round(vitals.bloodPressureDiastolic)}`
                  : "-"}
              </dd>
            </div>
          </div>
        ) : (
          <div>
            <div className="client-form" style={{ gap: 8 }}>
              <div className="client-form__row">
                <label className="client-form__label">Fasting Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  className="client-form__control"
                  placeholder="e.g. 95"
                  value={vitals.bloodSugarFasting ?? ""}
                  onChange={(e) => setVitals({ ...vitals, bloodSugarFasting: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Random Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  className="client-form__control"
                  placeholder="e.g. 120"
                  value={vitals.bloodSugarRandom ?? ""}
                  onChange={(e) => setVitals({ ...vitals, bloodSugarRandom: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Blood Pressure - Systolic (mmHg)</label>
                <input
                  type="number"
                  className="client-form__control"
                  placeholder="e.g. 120"
                  value={vitals.bloodPressureSystolic ?? ""}
                  onChange={(e) => setVitals({ ...vitals, bloodPressureSystolic: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="client-form__row">
                <label className="client-form__label">Blood Pressure - Diastolic (mmHg)</label>
                <input
                  type="number"
                  className="client-form__control"
                  placeholder="e.g. 80"
                  value={vitals.bloodPressureDiastolic ?? ""}
                  onChange={(e) => setVitals({ ...vitals, bloodPressureDiastolic: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => handleCancel("vitals")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleSave("vitals")}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
