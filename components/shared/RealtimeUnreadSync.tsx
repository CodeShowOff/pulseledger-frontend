"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { useChatStore } from "@/lib/chatStore";
import { CHAT_QK } from "@/lib/queries/chat";
import { NOTIFS_QK } from "@/lib/queries/notifications";

type ConversationUpdatePayload = {
  conversationId?: string;
  unreadIncrement?: number;
};

type ChatUnreadCountPayload = {
  count?: number;
};

type NotificationUnreadCountPayload = {
  count?: number;
};

const supportsChatUnread = (role?: string | null) => role === "client" || role === "coach";

export default function RealtimeUnreadSync() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = user?.id ?? null;

  const connect = useChatStore((s) => s.connect);
  const disconnect = useChatStore((s) => s.disconnect);
  const socket = useChatStore((s) => s.socket);

  const isAuthenticated = Boolean(user && accessToken);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
      return;
    }

    // Re-run connect when token rotates so socket auth stays up-to-date.
    connect();
  }, [isAuthenticated, accessToken, connect, disconnect]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: NOTIFS_QK.unread(userId) });
      }

      if (supportsChatUnread(user?.role) && userId) {
        queryClient.invalidateQueries({ queryKey: CHAT_QK.unreadCount(userId) });
      }
    };

    const handleConversationUpdate = (payload: ConversationUpdatePayload) => {
      if (!supportsChatUnread(user?.role) || !userId) return;

      const activeConversationId = useChatStore.getState().activeConversationId;
      if (activeConversationId && payload?.conversationId === activeConversationId) {
        return;
      }

      const increment = Number(payload?.unreadIncrement ?? 1);
      if (!Number.isFinite(increment) || increment <= 0) return;

      queryClient.setQueryData<number>(CHAT_QK.unreadCount(userId), (current = 0) =>
        Math.max(0, current + increment)
      );
    };

    const handleChatUnreadCount = (payload: ChatUnreadCountPayload) => {
      if (!supportsChatUnread(user?.role) || !userId) return;

      const count = Number(payload?.count);
      if (!Number.isFinite(count)) return;

      queryClient.setQueryData<number>(CHAT_QK.unreadCount(userId), Math.max(0, Math.trunc(count)));
    };

    const handleNotificationNew = () => {
      if (!userId) return;

      queryClient.setQueryData<number>(NOTIFS_QK.unread(userId), (current = 0) => Math.max(0, current + 1));

      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "latest"] });
    };

    const handleNotificationUnreadCount = (payload: NotificationUnreadCountPayload) => {
      if (!userId) return;

      const count = Number(payload?.count);
      if (!Number.isFinite(count)) return;

      queryClient.setQueryData<number>(NOTIFS_QK.unread(userId), Math.max(0, Math.trunc(count)));
    };

    socket.on("connect", handleConnect);
    socket.on("conversation:update", handleConversationUpdate);
    socket.on("chat:unread-count", handleChatUnreadCount);
    socket.on("notification:new", handleNotificationNew);
    socket.on("notification:unread-count", handleNotificationUnreadCount);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("conversation:update", handleConversationUpdate);
      socket.off("chat:unread-count", handleChatUnreadCount);
      socket.off("notification:new", handleNotificationNew);
      socket.off("notification:unread-count", handleNotificationUnreadCount);
    };
  }, [socket, queryClient, user?.role, userId]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return null;
}
