import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const CLIENT_PLAN_REQUESTS_KEY = ["clientPlanRequests"] as const;
export const COACH_PENDING_PLAN_REQUESTS_KEY = ["coachPendingPlanRequests"] as const;
export const COACH_CLIENT_PLAN_REQUESTS_KEY = (clientId: string) => ["coachClientPlanRequests", clientId] as const;

export type PlanRequest = {
  _id: string;
  planId: {
    _id: string;
    title: string;
    price?: number;
    durationWeeks?: number;
  } | null;
  clientId?: {
    _id: string;
    fullName?: string;
    email?: string;
  } | null;
  coachId?: string | null;
  status: "pending" | "approved" | "declined";
  notes?: string | null;
  paymentMode?: "cash" | "manual_qr" | null;
  paymentProofUrl?: string | null;
  createdAt: string;
  approvedAt?: string;
  declinedAt?: string;
};

const fetchClientPlanRequests = async (): Promise<PlanRequest[]> => {
  const res = await api.get("/plan-requests/my");
  return res.data.data ?? [];
};

export function useClientPlanRequests() {
  return useQuery({ queryKey: CLIENT_PLAN_REQUESTS_KEY, queryFn: fetchClientPlanRequests });
}

const fetchCoachPendingRequests = async (): Promise<PlanRequest[]> => {
  const res = await api.get("/plan-requests/coach/pending");
  return res.data.data ?? [];
};

export function useCoachPendingPlanRequests() {
  return useQuery({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY, queryFn: fetchCoachPendingRequests });
}

const fetchCoachClientRequests = async (clientId: string): Promise<PlanRequest[]> => {
  const res = await api.get(`/plan-requests/coach/client/${clientId}`);
  return res.data.data ?? [];
};

export function useCoachClientPlanRequests(clientId: string) {
  return useQuery({ queryKey: COACH_CLIENT_PLAN_REQUESTS_KEY(clientId), queryFn: () => fetchCoachClientRequests(clientId), enabled: !!clientId });
}
