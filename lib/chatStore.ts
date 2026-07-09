// Chat Store - Socket.IO connection and real-time state management
import { create } from "zustand";
import type { Socket } from "socket.io-client";
import { useAuthStore } from "./store";
import { refreshAuthSingleFlight } from "./axios";

// ============ Types ============

export type ConversationType = "global_broadcast" | "plan_group" | "direct";
export type MessageType = "text" | "image" | "link" | "system";

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaThumbnailUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  senderName: string;
  senderAvatarUrl?: string;
  senderRole: string;
  isEdited?: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  replyToId?: {
    _id: string;
    content?: string;
    type: MessageType;
    senderName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  type: ConversationType;
  coachId: string | { _id: string; fullName: string; avatarUrl?: string };
  clientId?: string | { _id: string; fullName: string; avatarUrl?: string };
  planId?: string | { _id: string; title: string };
  planTitle?: string;
  name?: string;
  description?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  lastMessageSenderId?: string;
  unreadCount: number;
  lastReadAt?: string;
  memberCount?: number;
  isActive: boolean;
  isMuted?: boolean;
  createdAt?: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface ChatState {
  // Connection
  socket: Socket | null;
  socketAuthToken: string | null;
  isConnected: boolean;
  connectionError: string | null;

  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  
  // Messages for active conversation
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;

  // Typing indicators
  typingUsers: Map<string, TypingUser>;

  // Online status
  onlineUsers: Set<string>;

  // Unread count
  totalUnreadCount: number;

  // Notification callback
  onNotification: ((data: { title: string; message: string; conversationId: string }) => void) | null;
  setNotificationCallback: (callback: ((data: { title: string; message: string; conversationId: string }) => void) | null) => void;

  // Actions
  connect: () => void;
  disconnect: () => void;
  setActiveConversation: (conversationId: string | null) => void;
  sendMessage: (data: SendMessageData) => Promise<ChatMessage | null>;
  sendTyping: (isTyping: boolean) => void;
  deleteMessage: (messageId: string) => Promise<boolean>;
  editMessage: (messageId: string, content: string) => Promise<boolean>;
  loadMoreMessages: () => Promise<void>;
  markAsRead: () => void;
  checkOnlineStatus: (userIds: string[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  setConversations: (conversations: Conversation[]) => void;
  clearMessages: () => void;
}

interface SendMessageData {
  type?: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaPublicId?: string;
  mediaThumbnailUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  replyToId?: string;
}

const extractStandaloneUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return undefined;
};

const normalizeMessage = (message: ChatMessage): ChatMessage => {
  let normalized = message;
  let mutated = false;

  const ensureClone = () => {
    if (!mutated) {
      normalized = { ...normalized };
      mutated = true;
    }
  };

  const extractedUrl = extractStandaloneUrl(message.content);

  if (!message.linkUrl && extractedUrl) {
    ensureClone();
    normalized.linkUrl = extractedUrl;
  }

  if (normalized.linkUrl) {
    const trimmed = normalized.linkUrl.trim();
    if (trimmed !== normalized.linkUrl) {
      ensureClone();
      normalized.linkUrl = trimmed;
    }
    if (normalized.type !== "link") {
      ensureClone();
      normalized.type = "link";
    }
  }

  return normalized;
};

const normalizeMessages = (messages: ChatMessage[]): ChatMessage[] => messages.map(normalizeMessage);

// ============ Socket Events ============

const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_CONVERSATION: "conversation:join",
  LEAVE_CONVERSATION: "conversation:leave",
  SEND_MESSAGE: "message:send",
  MESSAGE_HISTORY: "message:history",
  MARK_READ: "conversation:read",
  DELETE_MESSAGE: "message:delete",
  EDIT_MESSAGE: "message:edit",
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  PRESENCE_CHECK: "presence:check",
  
  // Server -> Client
  NEW_MESSAGE: "message:new",
  MESSAGE_DELETED: "message:deleted",
  MESSAGE_EDITED: "message:edited",
  CONVERSATION_UPDATE: "conversation:update",
  MESSAGE_NOTIFICATION: "message:notification",
  TYPING_UPDATE: "typing:update",
} as const;

let connectAttemptId = 0;

const SOCKET_TOKEN_REFRESH_BUFFER_MS = 30_000;
const SOCKET_EMIT_TIMEOUT_MS = 10_000;

const getTokenExpiryMs = (token: string): number | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const b64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "===".slice((b64.length + 3) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: number };

    if (typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

const syncRefreshedAuthState = (token: string, userData?: Record<string, unknown>) => {
  const authStore = useAuthStore.getState();
  authStore.setAccessToken(token);

  if (userData) {
    authStore.setUser(userData as any);
  }

  if (typeof document !== "undefined") {
    document.cookie = `accessToken=${token}; path=/; max-age=900;`;
  }
};

const resolveSocketToken = async (): Promise<{ token: string | null; reason?: string }> => {
  const authStore = useAuthStore.getState();
  const accessToken = authStore.accessToken;

  if (!accessToken) {
    return { token: null, reason: "Not authenticated" };
  }

  const expiryMs = getTokenExpiryMs(accessToken);
  if (!expiryMs) {
    return { token: accessToken };
  }

  const msUntilExpiry = expiryMs - Date.now();
  if (msUntilExpiry > SOCKET_TOKEN_REFRESH_BUFFER_MS) {
    return { token: accessToken };
  }

  try {
    const refreshed = await refreshAuthSingleFlight();
    const nextToken = refreshed?.accessToken;

    if (nextToken) {
      syncRefreshedAuthState(nextToken, refreshed?.user);
      return { token: nextToken };
    }

    if (msUntilExpiry > 0) {
      return { token: accessToken };
    }

    return { token: null, reason: "Session expired. Please sign in again." };
  } catch {
    if (msUntilExpiry > 0) {
      return { token: accessToken };
    }

    return { token: null, reason: "Session expired. Please sign in again." };
  }
};

// ============ Store ============

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  socket: null,
  socketAuthToken: null,
  isConnected: false,
  connectionError: null,
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingMessages: false,
  hasMoreMessages: true,
  typingUsers: new Map(),
  onlineUsers: new Set(),
  totalUnreadCount: 0,
  onNotification: null,
  
  setNotificationCallback: (callback) => set({ onNotification: callback }),

  // Connect to socket server
  connect: () => {
    const attemptId = ++connectAttemptId;
    set({ connectionError: null });

    void (async () => {
      try {
        const { token, reason } = await resolveSocketToken();

        if (attemptId !== connectAttemptId) return;

        if (!token) {
          const existingSocket = get().socket;
          if (existingSocket) {
            existingSocket.disconnect();
          }
          set({
            socket: null,
            socketAuthToken: null,
            isConnected: false,
            connectionError: reason || "Not authenticated",
          });
          return;
        }

        const existingSocket = get().socket;
        const existingSocketToken = get().socketAuthToken;

        if (existingSocket) {
          if (existingSocketToken !== token) {
            existingSocket.auth = { token };
            set({ socketAuthToken: token, connectionError: null });
          }

          if (!existingSocket.connected) {
            existingSocket.connect();
          }

          return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          (typeof window !== "undefined" ? "http://localhost:5000" : "");

        const { io } = await import("socket.io-client");

        // Exit if a newer connect/disconnect cycle has already started.
        if (attemptId !== connectAttemptId || get().socket) {
          return;
        }

        // console.log("🔌 Connecting to socket:", socketUrl);

        const newSocket = io(socketUrl, {
          auth: { token },
          transports: ["polling", "websocket"], // Start with polling, then upgrade to websocket
          upgrade: true,
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 30000,
          forceNew: true,
        });

        // Connection events
        newSocket.on("connect", () => {
          // console.log("🔌 Socket connected");
          set({ isConnected: true, connectionError: null, socketAuthToken: token });

          // If a conversation was selected before socket was ready,
          // re-select it now to join room and fetch message history.
          const { activeConversationId, messages } = get();
          if (activeConversationId && messages.length === 0) {
            get().setActiveConversation(activeConversationId);
          }
        });

        newSocket.on("disconnect", (reason) => {
          // console.log("🔌 Socket disconnected:", reason);
          set({ isConnected: false, isLoadingMessages: false });
        });

        newSocket.on("connect_error", (error) => {
          // console.warn("🔌 Socket connection error:", error.message);
          const message = error.message || "Failed to connect to chat server";
          const normalized = message.toLowerCase();
          const isAuthError =
            normalized.includes("invalid or expired token") ||
            normalized.includes("authentication required") ||
            normalized.includes("authentication failed");

          // Don't set connection error for transient websocket errors during upgrade
          // Only set error if we've exhausted reconnection attempts or it's a critical error
          const isTransientError = normalized.includes("websocket error") || 
                                  normalized.includes("transport close") ||
                                  normalized.includes("xhr poll error");

          if (isAuthError) {
            newSocket.disconnect();
            if (get().socket === newSocket) {
              set({
                socket: null,
                socketAuthToken: null,
                connectionError: message,
                isConnected: false,
              });
            }
            return;
          }

          if (!isTransientError) {
            set({ connectionError: message, isConnected: false });
          }
        });

        // Message events
        newSocket.on(SOCKET_EVENTS.NEW_MESSAGE, (data: { message: ChatMessage; conversationId: string }) => {
          const { activeConversationId, messages } = get();
          const normalizedMessage = normalizeMessage(data.message);
          
          // Add message if it's for the active conversation
          if (data.conversationId === activeConversationId) {
            // Check if message already exists (prevent duplicates)
            const exists = messages.some((m) => m._id === normalizedMessage._id);
            if (!exists) {
              set({ messages: [...messages, normalizedMessage] });
            }
          }
        });

        newSocket.on(SOCKET_EVENTS.MESSAGE_DELETED, (data: { messageId: string; conversationId: string }) => {
          const { activeConversationId, messages } = get();
          
          if (data.conversationId === activeConversationId) {
            set({
              messages: messages.map((m) =>
                m._id === data.messageId
                  ? { ...m, isDeleted: true, content: undefined, mediaUrl: undefined }
                  : m
              ),
            });
          }
        });

        newSocket.on(SOCKET_EVENTS.MESSAGE_EDITED, (data: { 
          messageId: string; 
          conversationId: string; 
          content: string; 
          editedAt: string;
        }) => {
          const { activeConversationId, messages } = get();
          
          if (data.conversationId === activeConversationId) {
            set({
              messages: messages.map((m) =>
                m._id === data.messageId
                  ? { ...m, content: data.content, isEdited: true, editedAt: data.editedAt }
                  : m
              ),
            });
          }
        });

        newSocket.on(SOCKET_EVENTS.CONVERSATION_UPDATE, (data: {
          conversationId: string;
          lastMessageAt: string;
          lastMessagePreview: string;
          lastMessageSenderId: string;
          unreadIncrement?: number;
        }) => {
          const { conversations, activeConversationId, totalUnreadCount } = get();
          const incomingUnreadIncrement = Number(data.unreadIncrement ?? 0);
          const unreadIncrement =
            Number.isFinite(incomingUnreadIncrement) && incomingUnreadIncrement > 0
              ? incomingUnreadIncrement
              : 0;
          const isActiveConversation = data.conversationId === activeConversationId;

          // Keep backend unread counters in sync while actively viewing a chat.
          // Without this, unread can drift on the server even though the user is reading live.
          if (isActiveConversation && unreadIncrement > 0) {
            get().markAsRead();
          }
          
          set({
            conversations: conversations.map((c) =>
              c._id === data.conversationId
                ? {
                    ...c,
                    lastMessageAt: data.lastMessageAt,
                    lastMessagePreview: data.lastMessagePreview,
                    lastMessageSenderId: data.lastMessageSenderId,
                    unreadCount: isActiveConversation 
                      ? 0 
                      : c.unreadCount + unreadIncrement,
                  }
                : c
            ),
            totalUnreadCount: isActiveConversation 
              ? totalUnreadCount 
              : totalUnreadCount + unreadIncrement,
          });
        });

        newSocket.on(SOCKET_EVENTS.TYPING_UPDATE, (data: {
          conversationId: string;
          userId: string;
          userName: string;
          isTyping: boolean;
        }) => {
          const { activeConversationId, typingUsers } = get();
          
          if (data.conversationId === activeConversationId) {
            const newTypingUsers = new Map(typingUsers);
            
            if (data.isTyping) {
              newTypingUsers.set(data.userId, data);
            } else {
              newTypingUsers.delete(data.userId);
            }
            
            set({ typingUsers: newTypingUsers });
          }
        });

        // Listen for message notifications (when not viewing that conversation)
        newSocket.on(SOCKET_EVENTS.MESSAGE_NOTIFICATION, (data: {
          conversationId: string;
          message: ChatMessage;
          senderName: string;
        }) => {
          const { activeConversationId, onNotification } = get();
          const normalizedMessage = normalizeMessage(data.message);
          
          // Only show notification if we're not viewing that conversation
          if (data.conversationId !== activeConversationId && onNotification) {
            onNotification({
              title: data.senderName,
              message: normalizedMessage.content || normalizedMessage.linkUrl || "Sent a message",
              conversationId: data.conversationId,
            });
          }
        });

        set({ socket: newSocket, socketAuthToken: token });
      } catch (error) {
        if (attemptId !== connectAttemptId) return;
        const message =
          error instanceof Error ? error.message : "Failed to initialize chat connection";
        set({ connectionError: message, isConnected: false });
      }
    })();
  },

  // Disconnect from socket server
  disconnect: () => {
    connectAttemptId += 1;
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, socketAuthToken: null, isConnected: false, connectionError: null });
      return;
    }

    set({ socketAuthToken: null, isConnected: false, connectionError: null });
  },

  // Set active conversation and join room
  setActiveConversation: (conversationId) => {
    const { socket, activeConversationId } = get();
    
    // Leave previous conversation
    if (socket && activeConversationId) {
      socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId: activeConversationId });
    }

    // Closing conversation should immediately stop loading state.
    if (!conversationId) {
      set({
        activeConversationId: null,
        messages: [],
        isLoadingMessages: false,
        hasMoreMessages: true,
        typingUsers: new Map(),
      });
      return;
    }

    // If socket isn't ready or not connected, keep selected conversation but avoid stuck loading.
    // Message history will be loaded when socket connects.
    const isSocketReady = !!socket && socket.connected;
    set({ 
      activeConversationId: conversationId, 
      messages: [], 
      isLoadingMessages: isSocketReady,
      hasMoreMessages: true,
      typingUsers: new Map(),
    });

    if (!isSocketReady) return;

    // Join new conversation
    socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId }, (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        // console.error("Failed to join conversation:", response.error);
      }
    });

    // Load initial messages with timeout to prevent infinite loading
    const historyTimeoutId = setTimeout(() => {
      if (get().activeConversationId === conversationId && get().isLoadingMessages) {
        set({ isLoadingMessages: false });
      }
    }, SOCKET_EMIT_TIMEOUT_MS);

    socket.emit(
      SOCKET_EVENTS.MESSAGE_HISTORY,
      { conversationId, limit: 50 },
      (response: { success: boolean; messages?: ChatMessage[]; error?: string }) => {
        clearTimeout(historyTimeoutId);
        if (response.success && response.messages) {
          const normalized = normalizeMessages(response.messages);
          set({ 
            messages: normalized,
            isLoadingMessages: false,
            hasMoreMessages: normalized.length >= 50,
          });
        } else {
          set({ isLoadingMessages: false });
        }
      }
    );

    // Update unread count
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  // Send a message
  sendMessage: async (data) => {
    const { socket, activeConversationId } = get();
    
    if (!socket || !socket.connected || !activeConversationId) return null;

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(null), SOCKET_EMIT_TIMEOUT_MS);

      socket.emit(
        SOCKET_EVENTS.SEND_MESSAGE,
        { conversationId: activeConversationId, ...data },
        (response: { success: boolean; message?: ChatMessage; error?: string }) => {
          clearTimeout(timeoutId);
          if (response.success && response.message) {
            // Message will be added via NEW_MESSAGE event
            resolve(response.message);
          } else {
            // console.error("Failed to send message:", response.error);
            resolve(null);
          }
        }
      );
    });
  },

  // Send typing indicator
  sendTyping: (isTyping) => {
    const { socket, activeConversationId } = get();
    
    if (!socket || !activeConversationId) return;

    socket.emit(
      isTyping ? SOCKET_EVENTS.TYPING_START : SOCKET_EVENTS.TYPING_STOP,
      { conversationId: activeConversationId }
    );
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const { socket } = get();
    
    if (!socket || !socket.connected) return false;

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(false), SOCKET_EMIT_TIMEOUT_MS);

      socket.emit(
        SOCKET_EVENTS.DELETE_MESSAGE,
        { messageId },
        (response: { success: boolean; error?: string }) => {
          clearTimeout(timeoutId);
          resolve(response.success);
        }
      );
    });
  },

  // Edit a message
  editMessage: async (messageId, content) => {
    const { socket } = get();
    
    if (!socket || !socket.connected) return false;

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(false), SOCKET_EMIT_TIMEOUT_MS);

      socket.emit(
        SOCKET_EVENTS.EDIT_MESSAGE,
        { messageId, content },
        (response: { success: boolean; error?: string }) => {
          clearTimeout(timeoutId);
          resolve(response.success);
        }
      );
    });
  },

  // Load more messages (pagination)
  loadMoreMessages: async () => {
    const { socket, activeConversationId, messages, isLoadingMessages, hasMoreMessages } = get();
    
    if (!socket || !socket.connected || !activeConversationId || isLoadingMessages || !hasMoreMessages) return;

    const oldestMessage = messages[0];
    if (!oldestMessage) return;

    set({ isLoadingMessages: true });

    const loadMoreTimeoutId = setTimeout(() => {
      if (get().isLoadingMessages) {
        set({ isLoadingMessages: false });
      }
    }, SOCKET_EMIT_TIMEOUT_MS);

    socket.emit(
      SOCKET_EVENTS.MESSAGE_HISTORY,
      { conversationId: activeConversationId, limit: 50, before: oldestMessage.createdAt },
      (response: { success: boolean; messages?: ChatMessage[]; error?: string }) => {
        clearTimeout(loadMoreTimeoutId);
        if (response.success && response.messages) {
          const normalized = normalizeMessages(response.messages);
          set({ 
            messages: [...normalized, ...messages],
            isLoadingMessages: false,
            hasMoreMessages: normalized.length >= 50,
          });
        } else {
          set({ isLoadingMessages: false });
        }
      }
    );
  },

  // Mark conversation as read
  markAsRead: () => {
    const { socket, activeConversationId } = get();
    
    if (!socket || !activeConversationId) return;

    socket.emit(SOCKET_EVENTS.MARK_READ, { conversationId: activeConversationId });
  },

  // Check online status of users
  checkOnlineStatus: (userIds) => {
    const { socket } = get();
    
    if (!socket) return;

    socket.emit(
      SOCKET_EVENTS.PRESENCE_CHECK,
      { userIds },
      (response: { success: boolean; onlineStatus?: Record<string, boolean> }) => {
        if (response.success && response.onlineStatus) {
          const onlineSet = new Set<string>();
          Object.entries(response.onlineStatus).forEach(([userId, isOnline]) => {
            if (isOnline) onlineSet.add(userId);
          });
          set({ onlineUsers: onlineSet });
        }
      }
    );
  },

  // Add a new conversation
  addConversation: (conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }));
  },

  // Update a conversation
  updateConversation: (conversationId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversationId ? { ...c, ...updates } : c
      ),
    }));
  },

  // Set all conversations (from API)
  setConversations: (conversations) => {
    set({ conversations });
  },

  // Clear messages
  clearMessages: () => {
    set({ messages: [], hasMoreMessages: true });
  },
}));

// Helper to get conversation display name
export function getConversationName(conversation: Conversation, currentUserId: string): string {
  if (conversation.type === "direct") {
    const coach = conversation.coachId;
    const client = conversation.clientId;
    
    if (typeof coach === "object" && coach._id !== currentUserId) {
      return coach.fullName;
    }
    if (typeof client === "object" && client._id !== currentUserId) {
      return client.fullName;
    }
  }
  
  if (conversation.type === "plan_group" && conversation.planTitle) {
    return `${conversation.planTitle} Community`;
  }
  
  if (conversation.type === "global_broadcast") {
    // Check if current user is the coach
    const coachId = typeof conversation.coachId === "object"
      ? conversation.coachId._id
      : conversation.coachId;

    if (coachId && String(coachId) === String(currentUserId)) {
      return "My Announcements";
    }

    // For clients, show the coach's name when available
    if (typeof conversation.coachId === "object" && conversation.coachId.fullName) {
      return `${conversation.coachId.fullName}'s Announcements`;
    }

    return conversation.name || "Announcements";
  }
  
  if (conversation.name) return conversation.name;

  return "Chat";
}

// Helper to get conversation avatar
export function getConversationAvatar(conversation: Conversation, currentUserId: string): string | null {
  if (conversation.type === "direct") {
    const coach = conversation.coachId;
    const client = conversation.clientId;
    
    if (typeof coach === "object" && coach._id !== currentUserId) {
      return coach.avatarUrl || null;
    }
    if (typeof client === "object" && client._id !== currentUserId) {
      return client.avatarUrl || null;
    }
  }
  
  return null;
}

// Helper to format message time
export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Helper to format last message time for conversation list
export function formatConversationTime(dateStr?: string): string {
  if (!dateStr) return "";
  
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (isYesterday) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
