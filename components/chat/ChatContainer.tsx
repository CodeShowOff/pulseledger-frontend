// Main Chat Container component - Combines all chat UI elements
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import {
  useChatStore,
  Conversation,
  ChatMessage,
  getConversationName,
} from "@/lib/chatStore";
import { shallow } from "zustand/shallow";
import { useConversations, useUploadChatImage, useToggleMute } from "@/lib/queries/chat";
import { ArrowLeft } from "lucide-react";

import ConversationList from "./ConversationList";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import MembersModal from "./MembersModal";
import InfoPanel from "./InfoPanel";
import styles from "@/styles/chat.module.css";

interface ChatContainerProps {
  userRole: "client" | "coach";
  initialClientId?: string;
}

export default function ChatContainer({ userRole, initialClientId }: ChatContainerProps) {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id) || "";
  const dashboardHref = userRole === "coach" ? "/coach/dashboard" : "/client/dashboard";
  
  // Chat store state (selector-based subscription to avoid unrelated rerenders)
  const {
    isConnected,
    connectionError,
    conversations,
    activeConversationId,
    messages,
    isLoadingMessages,
    hasMoreMessages,
    typingUsers,
    onlineUsers,
  } = useChatStore(
    (state) => ({
      isConnected: state.isConnected,
      connectionError: state.connectionError,
      conversations: state.conversations,
      activeConversationId: state.activeConversationId,
      messages: state.messages,
      isLoadingMessages: state.isLoadingMessages,
      hasMoreMessages: state.hasMoreMessages,
      typingUsers: state.typingUsers,
      onlineUsers: state.onlineUsers,
    }),
    shallow
  );

  // Chat store actions (kept separate so action references stay stable)
  const {
    connect,
    disconnect,
    setActiveConversation,
    setConversations,
    loadMoreMessages,
    sendMessage,
    sendTyping,
    deleteMessage,
    editMessage,
    markAsRead,
    checkOnlineStatus,
    setNotificationCallback,
  } = useChatStore(
    (state) => ({
      connect: state.connect,
      disconnect: state.disconnect,
      setActiveConversation: state.setActiveConversation,
      setConversations: state.setConversations,
      loadMoreMessages: state.loadMoreMessages,
      sendMessage: state.sendMessage,
      sendTyping: state.sendTyping,
      deleteMessage: state.deleteMessage,
      editMessage: state.editMessage,
      markAsRead: state.markAsRead,
      checkOnlineStatus: state.checkOnlineStatus,
      setNotificationCallback: state.setNotificationCallback,
    }),
    shallow
  );

  // Query for initial conversations
  const { data: apiConversations, isLoading: isLoadingConversations } = useConversations();

  // Mutations
  const uploadImage = useUploadChatImage();
  const toggleMute = useToggleMute();

  // Set up notification callback
  useEffect(() => {
    setNotificationCallback((data) => {
      // Show toast notification for new messages
      toast(data.title, {
        description: data.message.length > 50 ? data.message.substring(0, 50) + "..." : data.message,
        action: {
          label: "View",
          onClick: () => setActiveConversation(data.conversationId),
        },
      });
    });

    return () => setNotificationCallback(null);
  }, [setNotificationCallback, setActiveConversation]);

  // Local state
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  // Sync API conversations to store
  useEffect(() => {
    if (apiConversations && apiConversations.length > 0) {
      setConversations(apiConversations);
    }
  }, [apiConversations, setConversations]);

  // Auto-select conversation for specific client (when coming from client profile)
  useEffect(() => {
    if (initialClientId && conversations.length > 0 && !activeConversationId) {
      // Find direct conversation with this client
      const clientConversation = conversations.find(
        (conv) =>
          conv.type === "direct" &&
          (typeof conv.clientId === "object"
            ? conv.clientId._id === initialClientId
            : conv.clientId === initialClientId)
      );
      
      if (clientConversation) {
        setActiveConversation(clientConversation._id);
        setIsMobileListVisible(false);
      }
    }
  }, [initialClientId, conversations, activeConversationId, setActiveConversation]);

  // Active conversation
  const activeConversation = useMemo(
    () => conversations.find((c) => c._id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  // Mark when a specific conversation is open (used to hide mobile bottom nav)
  useEffect(() => {
    const body = document.body;
    if (activeConversationId) {
      body.classList.add("chat-conversation-open");
    } else {
      body.classList.remove("chat-conversation-open");
    }

    return () => {
      body.classList.remove("chat-conversation-open");
    };
  }, [activeConversationId]);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Check online status for relevant users
  useEffect(() => {
    if (!isConnected || conversations.length === 0) return;

    const userIds = new Set<string>();
    conversations.forEach((conv) => {
      if (conv.type === "direct") {
        if (typeof conv.coachId === "object") userIds.add(conv.coachId._id);
        if (typeof conv.clientId === "object") userIds.add(conv.clientId._id);
      }
    });

    if (userIds.size > 0) {
      checkOnlineStatus(Array.from(userIds));
    }
  }, [isConnected, conversations, checkOnlineStatus]);

  // Mark as read when viewing conversation
  useEffect(() => {
    if (activeConversationId) {
      markAsRead();
    }
  }, [activeConversationId, markAsRead]);

  // Handle conversation selection
  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      setActiveConversation(conversation._id);
      setReplyTo(null);
      setIsMobileListVisible(false);
    },
    [setActiveConversation]
  );

  // Handle back to list (mobile)
  const handleBackToList = useCallback(() => {
    // Deep-linked chat (e.g. /coach/chat?clientId=...): go back to previous page.
    if (initialClientId) {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push(dashboardHref);
      }
      return;
    }

    setActiveConversation(null);
    setIsMobileListVisible(true);
  }, [initialClientId, router, dashboardHref, setActiveConversation]);

  // Handle send message
  const handleSendMessage = useCallback(
    async (data: {
      type: "text" | "image" | "link";
      content?: string;
      file?: File;
      linkUrl?: string;
      linkTitle?: string;
      replyToId?: string;
    }) => {
      if (!activeConversationId) return;

      try {
        if (data.type === "image" && data.file) {
          // Upload image via REST API
          await uploadImage.mutateAsync({
            conversationId: activeConversationId,
            file: data.file,
            caption: data.content,
          });
        } else {
          // Send via socket
          await sendMessage({
            type: data.type,
            content: data.content,
            linkUrl: data.linkUrl,
            linkTitle: data.linkTitle,
            replyToId: data.replyToId,
          });
        }
      } catch (error) {
        toast.error("Failed to send message");
      }
    },
    [activeConversationId, sendMessage, uploadImage]
  );

  // Handle delete message
  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      const success = await deleteMessage(messageId);
      if (!success) {
        toast.error("Failed to delete message");
      }
    },
    [deleteMessage]
  );

  // Handle edit message
  const handleEditMessage = useCallback(
    async (messageId: string, content: string) => {
      const success = await editMessage(messageId, content);
      if (!success) {
        toast.error("Failed to edit message");
      }
    },
    [editMessage]
  );

  // Handle mute toggle
  const handleToggleMute = useCallback(
    async (muted: boolean) => {
      if (!activeConversationId) return;
      
      try {
        await toggleMute.mutateAsync({ conversationId: activeConversationId, muted });
        toast.success(muted ? "Conversation muted" : "Conversation unmuted");
      } catch (error) {
        toast.error("Failed to update mute setting");
      }
    },
    [activeConversationId, toggleMute]
  );

  // Check if user can send messages in active conversation
  const canSendMessages = useMemo(() => {
    if (!activeConversation) return false;
    
    // In broadcast, only coach can send
    if (activeConversation.type === "global_broadcast") {
      const coachId = typeof activeConversation.coachId === "object"
        ? activeConversation.coachId._id
        : activeConversation.coachId;
      return coachId === currentUserId;
    }
    
    return true;
  }, [activeConversation, currentUserId]);

  // Check if it's a group chat
  const isGroupChat = activeConversation?.type !== "direct";

  // Connection error handling
  if (connectionError) {
    const isTimeoutError = connectionError.toLowerCase().includes("timeout");
    
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <svg className={styles.errorIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className={styles.errorTitle}>
            {isTimeoutError ? "Server Unavailable" : "Connection Error"}
          </h3>
          <p className={styles.errorMessage}>{connectionError}</p>
          {isTimeoutError && (
            <p className={styles.errorHint}>
              The chat server might be offline or restarting. Please ensure the backend server is running.
            </p>
          )}
          <button onClick={connect} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      {/* Sidebar - Conversation List */}
      <div className={`${styles.sidebar} ${!isMobileListVisible ? styles.sidebarHidden : ""}`}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderRow}>
            <h1 className={styles.sidebarTitle}>Messages</h1>
            <Link href={dashboardHref} className={styles.sidebarBackButton}>
              <ArrowLeft className={styles.sidebarBackIcon} />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Conversation List */}
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          userRole={userRole}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`${styles.mainArea} ${isMobileListVisible && !activeConversationId ? styles.mainAreaHidden : ""}`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              conversation={activeConversation}
              typingUsers={typingUsers}
              onlineUsers={onlineUsers}
              onBack={handleBackToList}
              onViewMembers={isGroupChat ? () => setShowMembers(true) : undefined}
              onToggleMute={handleToggleMute}
              onViewInfo={() => setShowInfo(true)}
              isMuted={activeConversation.isMuted}
            />

            {/* Messages */}
            <MessageList
              messages={messages}
              isLoading={isLoadingMessages}
              hasMore={hasMoreMessages}
              onLoadMore={loadMoreMessages}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
              onReplyMessage={setReplyTo}
              typingUsers={typingUsers}
              isGroupChat={isGroupChat}
            />

            {/* Input */}
            {canSendMessages ? (
              <ChatInput
                onSendMessage={handleSendMessage}
                onTyping={sendTyping}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                disabled={!isConnected}
                canSendMedia={activeConversation.type !== "global_broadcast" || userRole === "coach"}
              />
            ) : (
              <div className={styles.readOnlyMessage}>
                Only the coach can send messages in this channel
              </div>
            )}

            {/* Members Modal */}
            {showMembers && activeConversation && (
              <MembersModal
                conversationId={activeConversation._id}
                conversationName={getConversationName(activeConversation, currentUserId)}
                onClose={() => setShowMembers(false)}
              />
            )}

            {/* Info Panel */}
            {showInfo && (
              <InfoPanel
                conversation={activeConversation}
                isMuted={activeConversation.isMuted || false}
                onClose={() => setShowInfo(false)}
                onToggleMute={(muted) => {
                  handleToggleMute(muted);
                }}
                onViewMembers={isGroupChat ? () => {
                  setShowInfo(false);
                  setShowMembers(true);
                } : undefined}
              />
            )}
          </>
        ) : (
          // Empty state
          <div className={styles.emptyChatState}>
            <div className={styles.emptyChatContent}>
              <div className={styles.emptyChatIcon}>
                <svg className={styles.emptyChatIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className={styles.emptyChatTitle}>
                Select a conversation
              </h3>
              <p className={styles.emptyChatText}>
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
