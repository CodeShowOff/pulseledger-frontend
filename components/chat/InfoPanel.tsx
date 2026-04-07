// Info panel component - Shows conversation details
"use client";

import React from "react";
import Image from "next/image";
import { X, Users, Bell, BellOff, Calendar, Shield, Megaphone } from "lucide-react";
import {
  Conversation,
  getConversationName,
  getConversationAvatar,
} from "@/lib/chatStore";
import { useAuthStore } from "@/lib/store";
import styles from "@/styles/chat.module.css";

interface InfoPanelProps {
  conversation: Conversation;
  isMuted: boolean;
  onClose: () => void;
  onToggleMute: (muted: boolean) => void;
  onViewMembers?: () => void;
}

export default function InfoPanel({
  conversation,
  isMuted,
  onClose,
  onToggleMute,
  onViewMembers,
}: InfoPanelProps) {
  const currentUserId = useAuthStore((s) => s.user?.id) || "";
  const name = getConversationName(conversation, currentUserId);
  const avatar = getConversationAvatar(conversation, currentUserId);

  const getTypeLabel = () => {
    switch (conversation.type) {
      case "global_broadcast":
        return "Global Announcement Channel";
      case "plan_group":
        return "Subscription Group";
      case "direct":
        return "Direct Message";
      default:
        return "Conversation";
    }
  };

  const getTypeIcon = () => {
    switch (conversation.type) {
      case "global_broadcast":
        return <Megaphone style={{ width: "1.25rem", height: "1.25rem", color: "#f59e0b" }} />;
      case "plan_group":
        return <Users style={{ width: "1.25rem", height: "1.25rem", color: "#3b82f6" }} />;
      default:
        return <Shield style={{ width: "1.25rem", height: "1.25rem", color: "#22c55e" }} />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelOverlay} onClick={onClose} />
      <div className={styles.infoPanelContent}>
        {/* Header */}
        <div className={styles.infoPanelHeader}>
          <h3 className={styles.infoPanelTitle}>Conversation Info</h3>
          <button onClick={onClose} className={styles.infoPanelClose}>
            <X style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>

        {/* Avatar & Name */}
        <div className={styles.infoPanelProfile}>
          <div className={styles.infoPanelAvatar}>
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={80}
                height={80}
                sizes="80px"
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div className={styles.infoPanelAvatarPlaceholder}>
                {getTypeIcon()}
              </div>
            )}
          </div>
          <h2 className={styles.infoPanelName}>{name}</h2>
          <p className={styles.infoPanelType}>{getTypeLabel()}</p>
        </div>

        {/* Description */}
        {conversation.description && (
          <div className={styles.infoPanelSection}>
            <h4 className={styles.infoPanelSectionTitle}>Description</h4>
            <p className={styles.infoPanelDescription}>{conversation.description}</p>
          </div>
        )}

        {/* Details */}
        <div className={styles.infoPanelSection}>
          <h4 className={styles.infoPanelSectionTitle}>Details</h4>
          <div className={styles.infoPanelDetails}>
            {conversation.memberCount && (
              <div className={styles.infoPanelDetailItem}>
                <Users style={{ width: "1rem", height: "1rem", color: "#6b7280" }} />
                <span>{conversation.memberCount} members</span>
              </div>
            )}
            <div className={styles.infoPanelDetailItem}>
              <Calendar style={{ width: "1rem", height: "1rem", color: "#6b7280" }} />
              <span>Created {formatDate(conversation.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.infoPanelSection}>
          <h4 className={styles.infoPanelSectionTitle}>Actions</h4>
          <div className={styles.infoPanelActions}>
            <button
              onClick={() => onToggleMute(!isMuted)}
              className={styles.infoPanelActionButton}
            >
              {isMuted ? (
                <>
                  <BellOff style={{ width: "1.25rem", height: "1.25rem" }} />
                  <span>Unmute Notifications</span>
                </>
              ) : (
                <>
                  <Bell style={{ width: "1.25rem", height: "1.25rem" }} />
                  <span>Mute Notifications</span>
                </>
              )}
            </button>

            {conversation.type !== "direct" && onViewMembers && (
              <button
                onClick={onViewMembers}
                className={styles.infoPanelActionButton}
              >
                <Users style={{ width: "1.25rem", height: "1.25rem" }} />
                <span>View Members</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
