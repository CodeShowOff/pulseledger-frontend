// Members modal component - Shows conversation members
"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, Crown, Shield, User } from "lucide-react";
import { useConversationMembers } from "@/lib/queries/chat";
import { useAuthStore } from "@/lib/store";
import styles from "@/styles/chat.module.css";

interface MembersModalProps {
  conversationId: string;
  conversationName: string;
  onClose: () => void;
}

export default function MembersModal({
  conversationId,
  conversationName,
  onClose,
}: MembersModalProps) {
  const { data: members, isLoading } = useConversationMembers(conversationId);
  const currentUser = useAuthStore((s) => s.user);
  const isCoach = currentUser?.role === "coach";

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />;
      case "admin":
        return <Shield style={{ width: "1rem", height: "1rem", color: "#3b82f6" }} />;
      default:
        return <User style={{ width: "1rem", height: "1rem", color: "#9ca3af" }} />;
    }
  };

  const getRoleBadge = (memberRole: string, userRole: string) => {
    if (userRole === "coach") {
      return (
        <span className={styles.memberBadge} style={{ background: "#fef3c7", color: "#b45309" }}>
          Coach
        </span>
      );
    }
    if (memberRole === "owner") {
      return (
        <span className={styles.memberBadge} style={{ background: "#f3e8ff", color: "#7c3aed" }}>
          Owner
        </span>
      );
    }
    if (memberRole === "admin") {
      return (
        <span className={styles.memberBadge} style={{ background: "#dbeafe", color: "#2563eb" }}>
          Admin
        </span>
      );
    }
    return null;
  };

  return (
    <div className={styles.modalOverlay}>
      {/* Backdrop */}
      <div
        style={{ position: "absolute", inset: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Members</h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{conversationName}</p>
          </div>
          <button onClick={onClose} className={styles.modalClose}>
            <X style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>

        {/* Members list */}
        <div className={styles.modalContent}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.loadingItem}>
                  <div className={styles.loadingAvatar} style={{ width: "2.5rem", height: "2.5rem" }} />
                  <div className={styles.loadingContent}>
                    <div className={`${styles.loadingLine} ${styles.loadingLineShort}`} />
                    <div className={`${styles.loadingLine} ${styles.loadingLineShorter}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <div>
              {members.map((member) => (
                <div key={member._id} className={styles.memberItem}>
                  {/* Avatar */}
                  <div style={{ position: "relative" }}>
                    {member.avatarUrl ? (
                      <Image
                        src={member.avatarUrl}
                        alt={member.fullName}
                        width={40}
                        height={40}
                        className={styles.memberAvatar}
                      />
                    ) : (
                      <div className={styles.memberAvatarPlaceholder}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#6b7280" }}>
                          {member.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Role icon */}
                    <div style={{ 
                      position: "absolute", 
                      bottom: "-0.25rem", 
                      right: "-0.25rem", 
                      background: "#fff", 
                      borderRadius: "50%", 
                      padding: "0.125rem" 
                    }}>
                      {getRoleIcon(member.role)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className={styles.memberInfo}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <p className={styles.memberName}>{member.fullName}</p>
                      {getRoleBadge(member.role, member.role)}
                    </div>
                    {isCoach && (
                      <p className={styles.memberRole}>{member.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>No members found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: "1rem", 
          borderTop: "1px solid #e5e7eb", 
          background: "#f9fafb", 
          textAlign: "center" 
        }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {members?.length || 0} member{(members?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
