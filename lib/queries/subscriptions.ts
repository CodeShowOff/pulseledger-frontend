import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const CLIENT_SUBSCRIPTIONS_KEY = ["clientSubscriptions"] as const;
export const CURRENT_PLAN_KEY = ["clientCurrentPlan"] as const;

export type SubscriptionPlan = {
  _id: string;
  planId: {
    _id: string;
    title: string;
    description?: string;
    durationWeeks?: number;
    price?: number;
    goal?: string;
    isDefault?: boolean;
  } | null;
  status: string;
  amount: number;
  paymentMode: string;
  paymentProofUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  durationWeeks?: number;
  planTitle?: string;
  notes?: string;
  coachId?: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  createdAt: string;
};

export type CurrentPlanResponse =
  | {
      type: "subscription";
      subscription: SubscriptionPlan;
    }
  | {
      type: "default";
      plan: {
        _id: string;
        title: string;
        description?: string;
        durationWeeks?: number;
        price?: number;
        goal?: string;
        isDefault?: boolean;
      };
    }
  | null;

const fetchClientSubscriptions = async (): Promise<SubscriptionPlan[]> => {
  const res = await api.get("/subscriptions/my");
  return res.data.data ?? [];
};

const fetchCurrentPlan = async (): Promise<CurrentPlanResponse> => {
  const res = await api.get("/subscriptions/my/current");
  return res.data.data ?? null;
};

export function useClientSubscriptions() {
  return useQuery({
    queryKey: CLIENT_SUBSCRIPTIONS_KEY,
    queryFn: fetchClientSubscriptions,
  });
}

export function useCurrentPlan() {
  return useQuery({
    queryKey: CURRENT_PLAN_KEY,
    queryFn: fetchCurrentPlan,
  });
}
