// Message bubble component - Individual chat message display
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChatMessage, formatMessageTime } from "@/lib/chatStore";
import { useAuthStore } from "@/lib/store";
import {
  MoreVertical,
  Trash2,
  Pencil,
  Reply,
  Check,
  CheckCheck,
  ExternalLink,
  X,
  Copy,
  Download,
} from "lucide-react";
import styles from "@/styles/chat.module.css";

const extractStandaloneUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return undefined;
};

interface MessageBubbleProps {
  message: ChatMessage;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onReply?: (message: ChatMessage) => void;
  showSender?: boolean;
  isGroupChat?: boolean;
}

function MessageBubble({
  message,
  onDelete,
  onEdit,
  onReply,
  showSender = true,
  isGroupChat = false,
}: MessageBubbleProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isOwn = message.senderId === currentUserId;
  const isSystem = message.type === "system";
  
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");
  const [linkCopySuccess, setLinkCopySuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const derivedLinkFromContent = extractStandaloneUrl(message.content);
  const linkHref = message.linkUrl?.trim() || derivedLinkFromContent;
  const shouldRenderLinkCard = Boolean(
    linkHref && (
      message.type === "link" ||
      message.linkUrl ||
      message.linkTitle ||
      message.linkDescription ||
      (message.content && derivedLinkFromContent && message.content.trim() === derivedLinkFromContent)
    )
  );

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Focus edit input
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing, editContent.length]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
    setLinkCopySuccess(false);
  }, [linkHref]);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message._id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleDownloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch image for download");
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const extension = blob.type?.split("/")[1] || "jpg";
      link.href = blobUrl;
      link.download = `chat-image-${message._id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // console.error("Failed to download image", error);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopySuccess(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setLinkCopySuccess(false), 2000);
    } catch {
      // console.error("Failed to copy link", error);
    }
  };

  // System message
  if (isSystem) {
    return (
      <div className={styles.messageSystem}>
        <div className={styles.messageSystemText}>{message.content}</div>
      </div>
    );
  }

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className={`${styles.messageWrapper} ${isOwn ? styles.messageWrapperOwn : styles.messageWrapperOther}`}>
        <div className={styles.messageSystemText} style={{ fontStyle: "italic" }}>
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.messageWrapper} ${isOwn ? styles.messageWrapperOwn : styles.messageWrapperOther}`}>
      {/* Avatar for others in group chat */}
      {!isOwn && isGroupChat && showSender && (
        <div className={styles.messageAvatar}>
          {message.senderAvatarUrl ? (
            <Image
              src={message.senderAvatarUrl}
              alt={message.senderName}
              width={32}
              height={32}
              style={{ width: "2rem", height: "auto", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ 
              width: "2rem", 
              height: "2rem", 
              borderRadius: "50%", 
              background: "linear-gradient(to bottom right, #60a5fa, #a855f7)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#fff", 
              fontSize: "0.75rem", 
              fontWeight: 700 
            }}>
              {message.senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message content */}
      <div className={styles.messageContentWrapper}>
        {/* Sender name for group chats */}
        {!isOwn && isGroupChat && showSender && (
          <p className={styles.messageSender}>
            {message.senderName}
            {message.senderRole === "coach" && (
              <span style={{ marginLeft: "0.25rem", color: "#f59e0b" }}>• Coach</span>
            )}
          </p>
        )}

          {/* Reply preview */}
          {message.replyToId && (
            <div style={{ 
              marginBottom: "0.25rem", 
              padding: "0.375rem 0.75rem", 
              borderRadius: "0.5rem", 
              fontSize: "0.75rem", 
              borderLeft: "2px solid",
              borderLeftColor: isOwn ? "#93c5fd" : "#d1d5db",
              background: isOwn ? "rgba(96, 165, 250, 0.2)" : "#f3f4f6"
            }}>
              <p style={{ fontWeight: 500, color: "#4b5563" }}>{message.replyToId.senderName}</p>
              <p style={{ color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{message.replyToId.content}</p>
            </div>
          )}

          {/* Main bubble */}
          <div className={`${styles.messageBubble} ${isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther}`}>
            {/* Editing mode */}
            {isEditing && message.type === "text" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <textarea
                  ref={editInputRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{ width: "100%", background: "transparent", resize: "none", outline: "none", minHeight: "60px", color: "inherit", border: "none" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleEdit();
                    }
                    if (e.key === "Escape") {
                      setIsEditing(false);
                      setEditContent(message.content || "");
                    }
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content || "");
                    }}
                    style={{ padding: "0.25rem", background: "none", border: "none", cursor: "pointer", borderRadius: "0.25rem" }}
                  >
                    <X style={{ width: "1rem", height: "1rem" }} />
                  </button>
                  <button onClick={handleEdit} style={{ padding: "0.25rem", background: "none", border: "none", cursor: "pointer", borderRadius: "0.25rem" }}>
                    <Check style={{ width: "1rem", height: "1rem" }} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Text content with inline time (WhatsApp style) */}
                {message.type === "text" && !shouldRenderLinkCard && (
                  <div className={styles.messageTextWrapper}>
                    <span className={styles.messageContent}>{message.content}</span>
                    <span className={styles.messageMeta}>
                      <span className={styles.messageTime}>
                        {formatMessageTime(message.createdAt)}
                        {message.isEdited && <span className={styles.messageEdited}> • edited</span>}
                      </span>
                      {isOwn && (
                        <CheckCheck style={{ width: "0.875rem", height: "0.875rem", opacity: 0.7 }} />
                      )}
                    </span>
                  </div>
                )}

                {/* Image content */}
                {message.type === "image" && message.mediaUrl && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Image
                      src={message.mediaThumbnailUrl || message.mediaUrl}
                      alt="Shared image"
                      width={300}
                      height={200}
                      className={styles.messageImage}
                      style={{ width: "auto", height: "auto" }}
                    />
                    <div className={styles.imageActions}>
                      <button
                        type="button"
                        className={styles.imageActionButton}
                        onClick={() => {
                          void handleDownloadImage(message.mediaUrl!);
                        }}
                      >
                        <Download style={{ width: "0.9rem", height: "0.9rem" }} />
                        Download
                      </button>
                    </div>
                    {message.content && (
                      <p style={{ fontSize: "0.875rem" }}>{message.content}</p>
                    )}
                    <div className={styles.messageMeta}>
                      <span className={styles.messageTime}>
                        {formatMessageTime(message.createdAt)}
                        {message.isEdited && <span className={styles.messageEdited}> • edited</span>}
                      </span>
                      {isOwn && (
                        <CheckCheck style={{ width: "0.875rem", height: "0.875rem", opacity: 0.7 }} />
                      )}
                    </div>
                  </div>
                )}

                {/* Link content */}
                {shouldRenderLinkCard && linkHref && (
                  <div>
                    <a
                      href={linkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.messageLink}
                      style={{ display: "block", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid", borderColor: isOwn ? "rgba(255,255,255,0.2)" : "#e5e7eb" }}
                    >
                      {message.linkImageUrl && (
                        <Image
                          src={message.linkImageUrl}
                          alt={message.linkTitle || "Link preview"}
                          width={300}
                          height={150}
                          style={{ width: "100%", height: "auto", objectFit: "cover" }}
                        />
                      )}
                      <div style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <ExternalLink style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                          <p style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{message.linkTitle || linkHref}</p>
                        </div>
                        {message.linkDescription && (
                          <p style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: isOwn ? "rgba(219, 234, 254, 1)" : "#6b7280" }}>
                            {message.linkDescription}
                          </p>
                        )}
                      </div>
                    </a>
                    <div className={styles.imageActions} style={{ marginTop: "0.5rem" }}>
                      <button
                        type="button"
                        className={`${styles.imageActionButton} ${linkCopySuccess ? styles.imageActionButtonSuccess : ""}`.trim()}
                        onClick={() => {
                          void handleCopyLink(linkHref);
                        }}
                      >
                        {linkCopySuccess ? (
                          <Check style={{ width: "0.85rem", height: "0.85rem" }} />
                        ) : (
                          <Copy style={{ width: "0.85rem", height: "0.85rem" }} />
                        )}
                        {linkCopySuccess ? "Link copied" : "Copy link"}
                      </button>
                    </div>
                    <div className={styles.messageMeta} style={{ marginTop: "0.25rem" }}>
                      <span className={styles.messageTime}>
                        {formatMessageTime(message.createdAt)}
                        {message.isEdited && <span className={styles.messageEdited}> • edited</span>}
                      </span>
                      {isOwn && (
                        <CheckCheck style={{ width: "0.875rem", height: "0.875rem", opacity: 0.7 }} />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          {/* Message actions - hover menu */}
          {!isEditing && (
            <div
              ref={menuRef}
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                [isOwn ? "left" : "right"]: "-2rem",
                opacity: showMenu ? 1 : 0,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => !showMenu && (e.currentTarget.style.opacity = "0")}
            >
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{ padding: "0.375rem", borderRadius: "50%", background: "none", border: "none", cursor: "pointer" }}
              >
                <MoreVertical style={{ width: "1rem", height: "1rem", color: "#9ca3af" }} />
              </button>

              {showMenu && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  marginTop: "0.25rem",
                  background: "#fff",
                  borderRadius: "0.5rem",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e5e7eb",
                  padding: "0.25rem 0",
                  minWidth: "120px",
                  zIndex: 10,
                  [isOwn ? "right" : "left"]: 0
                }}>
                  <button
                    onClick={() => { onReply?.(message); setShowMenu(false); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "#374151", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                  >
                    <Reply style={{ width: "1rem", height: "1rem" }} />
                    Reply
                  </button>
                  {isOwn && message.type === "text" && (
                    <button
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "#374151", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                    >
                      <Pencil style={{ width: "1rem", height: "1rem" }} />
                      Edit
                    </button>
                  )}
                  {isOwn && (
                    <button
                      onClick={() => { onDelete?.(message._id); setShowMenu(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "#dc2626", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                    >
                      <Trash2 style={{ width: "1rem", height: "1rem" }} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MemoizedMessageBubble = React.memo(MessageBubble);
MemoizedMessageBubble.displayName = "MessageBubble";

export default MemoizedMessageBubble;
