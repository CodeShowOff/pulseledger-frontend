import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const NOTIFS_QK = {
  unreadRoot: ["notifications", "unread-count"] as const,
  unread: (userId?: string | null) => ["notifications", "unread-count", userId ?? "anonymous"] as const,
  list: (page: number) => ["notifications", "list", page] as const,
  latest: (limit: number) => ["notifications", "latest", limit] as const,
};

type UnreadCountOptions = {
  enabled?: boolean;
  userId?: string | null;
};

export type NotificationItem = {
  _id: string;
  title?: string | null;
  message: string;
  type: "info" | "order" | "plan" | "system";
  meta?: Record<string, any>;
  readAt?: string | null;
  createdAt: string;
};

export type NotificationsListResponse = {
  success: boolean;
  data: NotificationItem[];
  unread: number;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
};

export function useUnreadCount({ enabled = true, userId }: UnreadCountOptions = {}) {
  return useQuery({
    queryKey: NOTIFS_QK.unread(userId),
    queryFn: async () => {
      const res = await api.get("/notifications/me/unread-count");
      return res.data.count as number;
    },
    enabled: enabled && Boolean(userId),
    staleTime: 15000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: NOTIFS_QK.list(page),
    queryFn: async () => {
      const res = await api.get(`/notifications/me`, { params: { page, limit: 20 } });
      return res.data as NotificationsListResponse;
    },
  });
}

export function useLatestNotifications(limit = 4) {
  return useQuery({
    queryKey: NOTIFS_QK.latest(limit),
    queryFn: async () => {
      const res = await api.get(`/notifications/me`, { params: { page: 1, limit } });
      return res.data as NotificationsListResponse;
    },
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/me/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFS_QK.unreadRoot });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch(`/notifications/me/read-all`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFS_QK.unreadRoot });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
