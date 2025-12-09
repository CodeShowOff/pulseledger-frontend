// Message list component - Displays messages with infinite scroll
"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { ChatMessage, TypingUser } from "@/lib/chatStore";
import MessageBubble from "./MessageBubble";
import { Loader2 } from "lucide-react";
import styles from "@/styles/chat.module.css";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDeleteMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onReplyMessage?: (message: ChatMessage) => void;
  typingUsers: Map<string, TypingUser>;
  isGroupChat?: boolean;
}

export default function MessageList({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  onDeleteMessage,
  onEditMessage,
  onReplyMessage,
  typingUsers,
  isGroupChat = false,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);
  const isInitialLoad = useRef(true);

  // Reset initial load flag when conversation changes (messages go to 0)
  useEffect(() => {
    if (messages.length === 0) {
      isInitialLoad.current = true;
    }
  }, [messages.length]);

  // Scroll to bottom instantly on initial load - no animation
  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesLength.current && prevMessagesLength.current > 0;
    
    // Scroll on new messages (not initial load)
    if (isNewMessage && !isInitialLoad.current) {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
    
    // Instant scroll to bottom on initial load - no timeout, no animation
    if (messages.length > 0 && isInitialLoad.current) {
      isInitialLoad.current = false;
      if (containerRef.current) {
        // Set scroll instantly without any delay or animation
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
    
    prevMessagesLength.current = messages.length;
  }, [messages.length, messages]);

  // Don't auto-scroll on initial load - let user see header, messages, and input naturally

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;
    const { scrollTop } = containerRef.current;
    if (scrollTop < 100) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  // Check if we should show sender for a message
  const shouldShowSender = (index: number, messagesInGroup: ChatMessage[]) => {
    if (index === 0) return true;
    const prevMessage = messagesInGroup[index - 1];
    const currentMessage = messagesInGroup[index];
    
    if (prevMessage.senderId !== currentMessage.senderId) return true;
    
    const prevTime = new Date(prevMessage.createdAt).getTime();
    const currentTime = new Date(currentMessage.createdAt).getTime();
    if (currentTime - prevTime > 5 * 60 * 1000) return true;
    
    return false;
  };

  const typingList = Array.from(typingUsers.values());

  return (
    <div ref={containerRef} onScroll={handleScroll} className={styles.messageList}>
      {/* Loading indicator at top */}
      {isLoading && hasMore && (
        <div className={styles.loadMoreButton}>
          <Loader2 className={styles.loadMoreSpinner} />
        </div>
      )}

      {/* Load more button */}
      {!isLoading && hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <button
            onClick={onLoadMore}
            style={{ fontSize: "0.875rem", color: "#3b82f6", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
          >
            Load older messages
          </button>
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className={styles.emptyState} style={{ height: "100%" }}>
          <div className={styles.emptyChatIcon} style={{ width: "4rem", height: "4rem", marginBottom: "1rem" }}>
            <svg style={{ width: "2rem", height: "2rem", color: "#9ca3af" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>No messages yet</p>
          <p className={styles.emptySubtitle}>Start the conversation!</p>
        </div>
      )}

      {/* Messages grouped by date */}
      {groupedMessages.map((group) => (
        <div key={group.date}>
          {/* Date separator */}
          <div className={styles.messageDate}>
            <div className={styles.messageDateText}>{group.date}</div>
          </div>

          {/* Messages */}
          {group.messages.map((message, messageIndex) => (
            <MessageBubble
              key={message._id}
              message={message}
              onDelete={onDeleteMessage}
              onEdit={onEditMessage}
              onReply={onReplyMessage}
              showSender={shouldShowSender(messageIndex, group.messages)}
              isGroupChat={isGroupChat}
            />
          ))}
        </div>
      ))}

      {/* Typing indicator */}
      {typingList.length > 0 && (
        <div className={styles.typingIndicator}>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <span style={{ width: "0.5rem", height: "0.5rem", background: "#9ca3af", borderRadius: "50%", animation: "bounce 1s infinite" }} />
            <span style={{ width: "0.5rem", height: "0.5rem", background: "#9ca3af", borderRadius: "50%", animation: "bounce 1s infinite 0.15s" }} />
            <span style={{ width: "0.5rem", height: "0.5rem", background: "#9ca3af", borderRadius: "50%", animation: "bounce 1s infinite 0.3s" }} />
          </div>
          <span>
            {typingList.length === 1
              ? `${typingList[0].userName} is typing...`
              : `${typingList.length} people are typing...`}
          </span>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
