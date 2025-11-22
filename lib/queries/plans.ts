import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const CLIENT_PLANS_KEY = ["clientPlans"] as const;

export type CoachPlan = {
  _id: string;
  title: string;
  description?: string;
  durationWeeks?: number;
  price?: number;
  goal?: string;
  isTemplate?: boolean;
  isDefault?: boolean;
  coachId?: {
    _id: string;
    fullName: string;
  } | null;
  status?: string;
  startDate?: string;
  tasks?: Array<{
    title: string;
    description?: string;
    date?: string;
    completedByClient?: boolean;
  }>;
};

const fetchClientPlans = async (): Promise<CoachPlan[]> => {
  const res = await api.get("/plans/my");
  return res.data.data ?? [];
};

export function useClientPlans() {
  return useQuery({ queryKey: CLIENT_PLANS_KEY, queryFn: fetchClientPlans });
}
