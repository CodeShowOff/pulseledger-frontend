// Chat header component - Shows conversation info and actions
"use client";

import React from "react";
import Image from "next/image";
import { useAuthStore } from "@/lib/store";
import {
  Conversation,
  getConversationName,
  getConversationAvatar,
  TypingUser,
} from "@/lib/chatStore";
import {
  ArrowLeft,
  Users,
  Volume2,
  VolumeX,
  Info,
  Megaphone,
} from "lucide-react";
import styles from "@/styles/chat.module.css";

interface ChatHeaderProps {
  conversation: Conversation;
  typingUsers: Map<string, TypingUser>;
  onlineUsers: Set<string>;
  onBack?: () => void;
  onViewMembers?: () => void;
  onToggleMute?: (muted: boolean) => void;
  onViewInfo?: () => void;
  isMuted?: boolean;
}

export default function ChatHeader({
  conversation,
  typingUsers,
  onlineUsers,
  onBack,
  onViewMembers,
  onToggleMute,
  onViewInfo,
  isMuted = false,
}: ChatHeaderProps) {
  const currentUserId = useAuthStore((s) => s.user?.id) || "";
  const name = getConversationName(conversation, currentUserId);
  const avatar = getConversationAvatar(conversation, currentUserId);

  // Get typing indicator text
  const typingText = React.useMemo(() => {
    const typingList = Array.from(typingUsers.values());
    if (typingList.length === 0) return null;
    if (typingList.length === 1) return `${typingList[0].userName} is typing...`;
    if (typingList.length === 2) return `${typingList[0].userName} and ${typingList[1].userName} are typing...`;
    return `${typingList.length} people are typing...`;
  }, [typingUsers]);

  // Get online status for direct chat
  const isOnline = React.useMemo(() => {
    if (conversation.type !== "direct") return false;
    
    const otherUserId = typeof conversation.coachId === "object" && conversation.coachId._id !== currentUserId
      ? conversation.coachId._id
      : typeof conversation.clientId === "object" && conversation.clientId._id !== currentUserId
        ? conversation.clientId._id
        : null;
    
    return otherUserId ? onlineUsers.has(otherUserId) : false;
  }, [conversation, currentUserId, onlineUsers]);

  // Subtitle text
  const subtitle = React.useMemo(() => {
    if (typingText) return typingText;
    
    if (conversation.type === "direct") {
      return isOnline ? "Online" : "Offline";
    }
    
    if (conversation.memberCount) {
      return `${conversation.memberCount} members`;
    }
    
    if (conversation.type === "global_broadcast") {
      return "Announcements channel";
    }
    
    return conversation.description || "";
  }, [conversation, typingText, isOnline]);

  // Get conversation icon
  const getIcon = () => {
    switch (conversation.type) {
      case "global_broadcast":
        return <Megaphone className={`${styles.chatHeaderButtonIcon} ${styles.amber}`} />;
      case "plan_group":
        return <Users className={`${styles.chatHeaderButtonIcon} ${styles.blue}`} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.chatHeader}>
      {/* Back button (mobile) */}
      {onBack && (
        <button onClick={onBack} className={styles.chatHeaderBack}>
          <ArrowLeft className={styles.chatHeaderButtonIcon} />
        </button>
      )}

      {/* Avatar */}
      <div className={styles.avatarWrapper} style={{ flexShrink: 0 }}>
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={40}
            height={40}
            className={styles.avatar}
            style={{ width: "2.5rem", height: "2.5rem" }}
          />
        ) : (
          <div className={styles.avatarPlaceholder} style={{ width: "2.5rem", height: "2.5rem" }}>
            {getIcon() || (
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#6b7280" }}>
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.chatHeaderInfo}>
        <h2 className={styles.chatHeaderName}>{name}</h2>
        <p className={`${styles.chatHeaderStatus} ${typingText ? styles.chatHeaderTyping : ""}`}>
          {subtitle}
        </p>
      </div>

      {/* Actions */}
      <div className={styles.chatHeaderActions}>
        {/* View members (for groups) */}
        {conversation.type !== "direct" && onViewMembers && (
          <button
            onClick={onViewMembers}
            className={styles.chatHeaderButton}
            title="View members"
          >
            <Users className={styles.chatHeaderButtonIcon} />
          </button>
        )}

        {/* Mute toggle */}
        {onToggleMute && (
          <button
            onClick={() => onToggleMute(!isMuted)}
            className={styles.chatHeaderButton}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className={styles.chatHeaderButtonIcon} /> : <Volume2 className={styles.chatHeaderButtonIcon} />}
          </button>
        )}

        {/* More options */}
        {onViewInfo && (
          <button 
            className={styles.chatHeaderButton} 
            title="View info"
            onClick={onViewInfo}
          >
            <Info className={styles.chatHeaderButtonIcon} />
          </button>
        )}
      </div>
    </div>
  );
}
