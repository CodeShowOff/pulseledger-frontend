"use client";

import api from "@/lib/axios";

export type ClientProgressEntry = {
  date: string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  notes?: string | null;
  
  // Smart Scale Measurements
  bodyFatPercentage?: number | null;
  visceralFatLevel?: number | null;
  muscleMass?: number | null;
  metabolicAge?: number | null;
  bodyWaterPercentage?: number | null;
  boneMass?: number | null;
  
  // Vitals
  bloodSugarFasting?: number | null;
  bloodSugarRandom?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
};

export type ClientProgressProfile = {
  age?: number | null;
  gender?: string | null;
  dailyActivityLevel?: string | null;
  hydrationHabits?: string | null;
  personalGoals?: string | null;
  healthConditions?: string | null;
  allergies?: string | null;
  medications?: string | null;
  pastWeightChanges?: string | null;
};

export const CLIENT_PROGRESS_QUERY_KEY = ["clientProgressEntries"] as const;

export async function fetchClientProgressEntries(): Promise<{
  data: ClientProgressEntry[];
  profile: ClientProgressProfile;
}> {
  const res = await api.get(`/progress/my`);
  return {
    data: Array.isArray(res.data?.data) ? res.data.data : [],
    profile: res.data?.profile || {},
  };
}
