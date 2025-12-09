// Conversation list component - Shows all chats in sidebar with 3 sections like WhatsApp
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/lib/store";
import {
  Conversation,
  getConversationName,
  getConversationAvatar,
  formatConversationTime,
} from "@/lib/chatStore";
import { MessageSquare, Users, Megaphone, User, ChevronDown, ChevronRight } from "lucide-react";
import styles from "@/styles/chat.module.css";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
  isLoading?: boolean;
}

function ConversationListItem({
  conversation,
  isActive,
  currentUserId,
  onSelect,
}: {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  onSelect: () => void;
}) {
  const name = getConversationName(conversation, currentUserId);
  const avatar = getConversationAvatar(conversation, currentUserId);
  const hasUnread = conversation.unreadCount > 0;

  const getIconInfo = () => {
    switch (conversation.type) {
      case "global_broadcast":
        return { Icon: Megaphone, colorClass: "amber" };
      case "plan_group":
        return { Icon: Users, colorClass: "blue" };
      case "direct":
        return { Icon: User, colorClass: "green" };
      default:
        return { Icon: MessageSquare, colorClass: "gray" };
    }
  };

  const { Icon, colorClass } = getIconInfo();

  return (
    <button
      onClick={onSelect}
      className={`${styles.conversationItem} ${isActive ? styles.conversationItemActive : ""}`}
    >
      {/* Avatar */}
      <div className={styles.avatarWrapper}>
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <Icon className={`${styles.avatarIcon} ${styles[colorClass]}`} />
          </div>
        )}
        {/* Unread badge */}
        {hasUnread && (
          <span className={styles.avatarBadge}>
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={styles.conversationContent}>
        <div className={styles.conversationHeader}>
          <h3 className={`${styles.conversationName} ${hasUnread ? styles.conversationNameUnread : ""}`}>
            {name}
          </h3>
          <span className={styles.conversationTime}>
            {formatConversationTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p className={`${styles.conversationPreview} ${hasUnread ? styles.conversationPreviewUnread : ""}`}>
          {conversation.lastMessagePreview || "No messages yet"}
        </p>
      </div>
    </button>
  );
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  isLoading = false,
}: ConversationListProps) {
  const currentUserId = useAuthStore((s) => s.user?.id) || "";
  const [expandedSections, setExpandedSections] = useState({
    broadcast: true,
    groups: true,
    direct: true,
  });

  // Group conversations by type
  const grouped = useMemo(() => {
    const broadcast: Conversation[] = [];
    const groups: Conversation[] = [];
    const direct: Conversation[] = [];

    conversations.forEach((conv) => {
      switch (conv.type) {
        case "global_broadcast":
          broadcast.push(conv);
          break;
        case "plan_group":
          groups.push(conv);
          break;
        case "direct":
          direct.push(conv);
          break;
      }
    });

    return { broadcast, groups, direct };
  }, [conversations]);

  // Get unread counts per section
  const unreadCounts = useMemo(() => ({
    broadcast: grouped.broadcast.reduce((sum, c) => sum + c.unreadCount, 0),
    groups: grouped.groups.reduce((sum, c) => sum + c.unreadCount, 0),
    direct: grouped.direct.reduce((sum, c) => sum + c.unreadCount, 0),
  }), [grouped]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.loadingItem}>
            <div className={styles.loadingAvatar} />
            <div className={styles.loadingContent}>
              <div className={`${styles.loadingLine} ${styles.loadingLineShort}`} />
              <div className={`${styles.loadingLine} ${styles.loadingLineShorter}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <MessageSquare className={styles.emptyIcon} />
        <p className={styles.emptyTitle}>No conversations yet</p>
        <p className={styles.emptySubtitle}>
          Start chatting to see your conversations here
        </p>
      </div>
    );
  }

  // Section header component
  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    colorClass,
    section, 
    count,
    unread 
  }: { 
    title: string; 
    icon: React.ElementType; 
    colorClass: "amber" | "blue" | "green";
    section: keyof typeof expandedSections; 
    count: number;
    unread: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className={styles.sectionHeader}
    >
      <div className={`${styles.sectionIconWrapper} ${styles[colorClass]}`}>
        <Icon className={`${styles.sectionIcon} ${styles[colorClass]}`} />
      </div>
      <span className={styles.sectionTitle}>
        {title}
      </span>
      <div className={styles.sectionMeta}>
        {unread > 0 && (
          <span className={styles.unreadBadge}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
        <span className={styles.sectionCount}>
          {count}
        </span>
        {expandedSections[section] ? (
          <ChevronDown className={styles.chevronIcon} />
        ) : (
          <ChevronRight className={styles.chevronIcon} />
        )}
      </div>
    </button>
  );

  return (
    <div className={styles.conversationList}>
      <div className={styles.conversationListScroll}>
        {/* Section 1: Global Community / Announcements */}
        {grouped.broadcast.length > 0 && (
          <div className={styles.sectionDivider}>
            <SectionHeader
              title="Global Community"
              icon={Megaphone}
              colorClass="amber"
              section="broadcast"
              count={grouped.broadcast.length}
              unread={unreadCounts.broadcast}
            />
            {expandedSections.broadcast && (
              <div className={styles.sectionContent}>
                {grouped.broadcast.map((conv) => (
                  <ConversationListItem
                    key={conv._id}
                    conversation={conv}
                    isActive={conv._id === activeId}
                    currentUserId={currentUserId}
                    onSelect={() => onSelect(conv)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 2: Subscription Plans / Communities */}
        {grouped.groups.length > 0 && (
          <div className={styles.sectionDivider}>
            <SectionHeader
              title="My Subscriptions"
              icon={Users}
              colorClass="blue"
              section="groups"
              count={grouped.groups.length}
              unread={unreadCounts.groups}
            />
            {expandedSections.groups && (
              <div className={styles.sectionContent}>
                {grouped.groups.map((conv) => (
                  <ConversationListItem
                    key={conv._id}
                    conversation={conv}
                    isActive={conv._id === activeId}
                    currentUserId={currentUserId}
                    onSelect={() => onSelect(conv)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 3: Direct Chat with Coach */}
        {grouped.direct.length > 0 && (
          <div>
            <SectionHeader
              title="Chat with Coach"
              icon={User}
              colorClass="green"
              section="direct"
              count={grouped.direct.length}
              unread={unreadCounts.direct}
            />
            {expandedSections.direct && (
              <div className={styles.sectionContent}>
                {grouped.direct.map((conv) => (
                  <ConversationListItem
                    key={conv._id}
                    conversation={conv}
                    isActive={conv._id === activeId}
                    currentUserId={currentUserId}
                    onSelect={() => onSelect(conv)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state when no conversations in any section */}
        {grouped.broadcast.length === 0 && grouped.groups.length === 0 && grouped.direct.length === 0 && (
          <div className={styles.emptyState}>
            <MessageSquare className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
