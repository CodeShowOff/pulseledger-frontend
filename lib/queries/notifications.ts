import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const NOTIFS_QK = {
  unread: ["notifications", "unread-count"] as const,
  list: (page: number) => ["notifications", "list", page] as const,
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

export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIFS_QK.unread,
    queryFn: async () => {
      const res = await api.get("/notifications/me/unread-count");
      return res.data.count as number;
    },
    // Poll periodically to simulate push updates
    refetchInterval: 30000,
  });
}

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: NOTIFS_QK.list(page),
    queryFn: async () => {
      const res = await api.get(`/notifications/me`, { params: { page, limit: 20 } });
      return res.data as { success: boolean; data: NotificationItem[]; unread: number; pagination: { total: number; page: number; totalPages: number } };
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
      qc.invalidateQueries({ queryKey: NOTIFS_QK.unread });
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
      qc.invalidateQueries({ queryKey: NOTIFS_QK.unread });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
