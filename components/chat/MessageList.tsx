// Message list component - Displays messages with infinite scroll
"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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

type VirtualRow =
  | {
      id: string;
      type: "date";
      dateLabel: string;
    }
  | {
      id: string;
      type: "message";
      message: ChatMessage;
      showSender: boolean;
    };

const DATE_SEPARATOR_ESTIMATED_HEIGHT = 42;
const MESSAGE_ROW_ESTIMATED_HEIGHT = 112;
const OVERSCAN_ROW_COUNT = 8;

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
  const prevFirstMessageId = useRef<string | null>(null);
  const prevLastMessageId = useRef<string | null>(null);
  const isInitialLoad = useRef(true);

  // Reset initial load flag when conversation changes (messages go to 0)
  useEffect(() => {
    if (messages.length === 0) {
      isInitialLoad.current = true;
      prevFirstMessageId.current = null;
      prevLastMessageId.current = null;
    }
  }, [messages.length]);

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    []
  );

  const virtualRows = React.useMemo<VirtualRow[]>(() => {
    const rows: VirtualRow[] = [];
    let currentDate = "";
    let previousMessageInGroup: ChatMessage | null = null;

    for (const message of messages) {
      const dateLabel = dateFormatter.format(new Date(message.createdAt));

      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        rows.push({
          id: `date-${message._id}`,
          type: "date",
          dateLabel,
        });
        previousMessageInGroup = null;
      }

      let showSender = true;
      if (previousMessageInGroup) {
        const sameSender = previousMessageInGroup.senderId === message.senderId;
        const prevTime = new Date(previousMessageInGroup.createdAt).getTime();
        const currentTime = new Date(message.createdAt).getTime();
        const withinFiveMinutes = currentTime - prevTime <= 5 * 60 * 1000;
        showSender = !sameSender || !withinFiveMinutes;
      }

      rows.push({
        id: `message-${message._id}`,
        type: "message",
        message,
        showSender,
      });
      previousMessageInGroup = message;
    }

    return rows;
  }, [messages, dateFormatter]);

  const rowVirtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (index) =>
      virtualRows[index]?.type === "date"
        ? DATE_SEPARATOR_ESTIMATED_HEIGHT
        : MESSAGE_ROW_ESTIMATED_HEIGHT,
    getItemKey: (index) => virtualRows[index]?.id ?? index,
    overscan: OVERSCAN_ROW_COUNT,
  });

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, []);

  // Scroll to bottom instantly on initial load and for newly appended messages
  useEffect(() => {
    if (messages.length === 0) return;

    const firstMessageId = messages[0]?._id ?? null;
    const lastMessageId = messages[messages.length - 1]?._id ?? null;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      scrollToBottom();
    } else {
      const prependedOlderMessages =
        prevFirstMessageId.current !== null &&
        firstMessageId !== prevFirstMessageId.current &&
        lastMessageId === prevLastMessageId.current;

      const appendedNewMessage =
        prevLastMessageId.current !== null &&
        lastMessageId !== prevLastMessageId.current;

      if (appendedNewMessage && !prependedOlderMessages) {
        scrollToBottom();
      }
    }

    prevFirstMessageId.current = firstMessageId;
    prevLastMessageId.current = lastMessageId;
  }, [messages, scrollToBottom]);

  // Don't auto-scroll on initial load - let user see header, messages, and input naturally

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;
    const { scrollTop } = containerRef.current;
    if (scrollTop < 100) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore]);

  const typingList = React.useMemo(() => Array.from(typingUsers.values()), [typingUsers]);

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

      {/* Virtualized messages */}
      {messages.length > 0 && (
        <div style={{ height: rowVirtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = virtualRows[virtualRow.index];
            if (!row) return null;

            return (
              <div
                key={row.id}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  display: "flow-root",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.type === "date" ? (
                  <div className={styles.messageDate}>
                    <div className={styles.messageDateText}>{row.dateLabel}</div>
                  </div>
                ) : (
                  <MessageBubble
                    message={row.message}
                    onDelete={onDeleteMessage}
                    onEdit={onEditMessage}
                    onReply={onReplyMessage}
                    showSender={row.showSender}
                    isGroupChat={isGroupChat}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
