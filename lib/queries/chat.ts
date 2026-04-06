// Chat API queries - React Query hooks for REST endpoints
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Conversation, ChatMessage } from "@/lib/chatStore";

export const CHAT_QK = {
  conversations: ["chat", "conversations"] as const,
  conversation: (id: string) => ["chat", "conversation", id] as const,
  messages: (id: string) => ["chat", "messages", id] as const,
  members: (id: string) => ["chat", "members", id] as const,
  unreadCount: ["chat", "unread-count"] as const,
  broadcast: ["chat", "broadcast"] as const,
};

// ============ Conversation Queries ============

export function useConversations() {
  return useQuery({
    queryKey: CHAT_QK.conversations,
    queryFn: async () => {
      try {
        const res = await api.get("/chat/conversations");
        return (res.data.data ?? []) as Conversation[];
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });
}

export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: CHAT_QK.conversation(conversationId || ""),
    queryFn: async () => {
      if (!conversationId) return null;
      try {
        const res = await api.get(`/chat/conversations/${conversationId}`);
        return (res.data.data ?? null) as Conversation | null;
      } catch {
        return null;
      }
    },
    enabled: !!conversationId,
  });
}

export function useConversationMembers(conversationId: string | null) {
  return useQuery({
    queryKey: CHAT_QK.members(conversationId || ""),
    queryFn: async () => {
      if (!conversationId) return [];
      try {
        const res = await api.get(`/chat/conversations/${conversationId}/members`);
        return (res.data.data ?? []) as Array<{
          _id: string;
          fullName: string;
          avatarUrl?: string;
          email: string;
          role: string; // Member role in conversation (admin, member)
          joinedAt: string;
        }>;
      } catch {
        return [];
      }
    },
    enabled: !!conversationId,
  });
}

export function useUnreadChatCount() {
  return useQuery({
    queryKey: CHAT_QK.unreadCount,
    queryFn: async () => {
      try {
        const res = await api.get("/chat/unread-count");
        const count = res.data.data?.unreadCount ?? res.data.count ?? 0;
        return typeof count === "number" ? count : 0;
      } catch {
        return 0;
      }
    },
    refetchInterval: 30000,
  });
}

export function useBroadcastChannel() {
  return useQuery({
    queryKey: CHAT_QK.broadcast,
    queryFn: async () => {
      try {
        const res = await api.get("/chat/broadcast");
        return (res.data.data ?? null) as Conversation | null;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
  });
}

// ============ Message Queries ============

export function useMessages(conversationId: string | null, page = 1) {
  return useQuery({
    queryKey: [...CHAT_QK.messages(conversationId || ""), page],
    queryFn: async () => {
      if (!conversationId) return { messages: [], hasMore: false };
      try {
        const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
          params: { page, limit: 50 },
        });
        return {
          messages: (res.data.data ?? []) as ChatMessage[],
          hasMore: res.data.pagination?.hasMore ?? false,
        };
      } catch {
        return { messages: [], hasMore: false };
      }
    },
    enabled: !!conversationId,
  });
}

// ============ Mutations ============

export function useSendMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      type = "text",
      content,
      linkUrl,
      linkTitle,
      linkDescription,
      linkImageUrl,
    }: {
      conversationId: string;
      type?: "text" | "link";
      content?: string;
      linkUrl?: string;
      linkTitle?: string;
      linkDescription?: string;
      linkImageUrl?: string;
    }) => {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
        type,
        content,
        linkUrl,
        linkTitle,
        linkDescription,
        linkImageUrl,
      });
      return res.data.data as ChatMessage;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: CHAT_QK.messages(variables.conversationId) });
      qc.invalidateQueries({ queryKey: CHAT_QK.conversations });
    },
  });
}

export function useUploadChatImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      file,
      caption,
    }: {
      conversationId: string;
      file: File;
      caption?: string;
    }) => {
      const formData = new FormData();
      formData.append("image", file);
      if (caption) formData.append("content", caption);

      const res = await api.post(`/chat/conversations/${conversationId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data as ChatMessage;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: CHAT_QK.messages(variables.conversationId) });
      qc.invalidateQueries({ queryKey: CHAT_QK.conversations });
    },
  });
}

export function useMarkChatAsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await api.post(`/chat/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHAT_QK.unreadCount });
      qc.invalidateQueries({ queryKey: CHAT_QK.conversations });
    },
  });
}

export function useStartDirectChat() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post(`/chat/direct/${userId}`);
      return res.data.data as Conversation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHAT_QK.conversations });
    },
  });
}

export function useToggleMute() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, muted }: { conversationId: string; muted: boolean }) => {
      const res = await api.patch(`/chat/conversations/${conversationId}/mute`, { muted });
      return res.data.data;
    },
    onMutate: async ({ conversationId, muted }) => {
      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey: CHAT_QK.conversations });

      // Snapshot the previous value
      const previousConversations = qc.getQueryData<Conversation[]>(CHAT_QK.conversations);

      // Optimistically update conversations
      if (previousConversations) {
        qc.setQueryData<Conversation[]>(CHAT_QK.conversations, 
          previousConversations.map(c => 
            c._id === conversationId ? { ...c, isMuted: muted } : c
          )
        );
      }

      return { previousConversations };
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        qc.setQueryData(CHAT_QK.conversations, context.previousConversations);
      }
    },
    onSettled: (_, __, variables) => {
      qc.invalidateQueries({ queryKey: CHAT_QK.conversation(variables.conversationId) });
      qc.invalidateQueries({ queryKey: CHAT_QK.conversations });
    },
  });
}
