import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const MY_COACH_QUERY_KEY = ["myCoach"] as const;

export type CoachProfile = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  whatsappNumber?: string;
  companyName?: string;
  specialization?: string;
  experienceYears?: number;
  bio?: string;
  createdAt?: string;
  avatarUrl?: string;
  coachCode?: string;
  referralCode?: string;
  isActive?: boolean;
  address?: {
    phoneNumber?: string;
    line1?: string;
    line2?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
};

const fetchMyCoach = async (): Promise<CoachProfile | null> => {
  const res = await api.get("/users/my-coach");
  return res.data.data ?? null;
};

export function useMyCoachQuery() {
  return useQuery({ queryKey: MY_COACH_QUERY_KEY, queryFn: fetchMyCoach });
}
