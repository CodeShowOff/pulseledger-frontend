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

export type ClientSubscriptionsPagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export type ClientSubscriptionsPageResponse = {
  items: SubscriptionPlan[];
  pagination: ClientSubscriptionsPagination;
};

type ClientSubscriptionsPageParams = {
  page: number;
  limit?: number;
  sort?: "latest" | "oldest";
};

const fetchClientSubscriptions = async (): Promise<SubscriptionPlan[]> => {
  const res = await api.get("/subscriptions/my");
  return res.data.data ?? [];
};

const fetchClientSubscriptionsPage = async ({
  page,
  limit = 5,
  sort = "latest",
}: ClientSubscriptionsPageParams): Promise<ClientSubscriptionsPageResponse> => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && Number(limit) > 0 ? Math.floor(limit) : 5;

  const res = await api.get("/subscriptions/my", {
    params: {
      page: safePage,
      limit: safeLimit,
      sort,
    },
  });

  const items = (res.data.data ?? []) as SubscriptionPlan[];
  const pagination = res.data.pagination as ClientSubscriptionsPagination | undefined;

  return {
    items,
    pagination:
      pagination ?? {
        currentPage: safePage,
        totalPages: Math.max(1, Math.ceil(items.length / safeLimit)),
        totalItems: items.length,
        itemsPerPage: safeLimit,
      },
  };
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

export function useClientSubscriptionsPage(params: ClientSubscriptionsPageParams) {
  const { page, limit = 5, sort = "latest" } = params;

  return useQuery({
    queryKey: [...CLIENT_SUBSCRIPTIONS_KEY, { page, limit, sort }],
    queryFn: () => fetchClientSubscriptionsPage({ page, limit, sort }),
    placeholderData: (previousData) => previousData,
  });
}

export function useCurrentPlan() {
  return useQuery({
    queryKey: CURRENT_PLAN_KEY,
    queryFn: fetchCurrentPlan,
  });
}
