import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export type ContactStatus = "pending" | "contacted" | "converted" | "rejected";

export type ContactRequest = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  height?: number | null;
  weight?: number | null;
  age: number;
  gender: "male" | "female" | "other";
  message: string;
  status: ContactStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactRequestsResponse = {
  success: boolean;
  data: ContactRequest[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
};

export const COACH_CONTACT_REQUESTS_QUERY_KEY = (
  status: "" | ContactStatus = ""
) => ["contactRequests", status || "all"] as const;

export const COACH_PENDING_CONTACT_REQUEST_COUNT_KEY = [
  "contactRequests",
  "pending",
  "count",
] as const;

const fetchCoachContactRequests = async (
  status: "" | ContactStatus = ""
): Promise<ContactRequestsResponse> => {
  const res = await api.get("/contact-requests/coach/requests", {
    params: status ? { status } : undefined,
  });
  return res.data;
};

export function useCoachContactRequests(status: "" | ContactStatus = "") {
  return useQuery({
    queryKey: COACH_CONTACT_REQUESTS_QUERY_KEY(status),
    queryFn: () => fetchCoachContactRequests(status),
  });
}

const fetchCoachPendingContactRequestsCount = async (): Promise<number> => {
  const res = await api.get("/contact-requests/coach/requests", {
    params: {
      status: "pending",
      page: 1,
      limit: 1,
    },
  });

  return res.data?.pagination?.total ?? 0;
};

export function useCoachPendingContactRequestsCount() {
  return useQuery({
    queryKey: COACH_PENDING_CONTACT_REQUEST_COUNT_KEY,
    queryFn: fetchCoachPendingContactRequestsCount,
  });
}
