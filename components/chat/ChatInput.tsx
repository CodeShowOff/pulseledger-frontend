// Chat input component - Message composer with attachments
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/lib/chatStore";
import { Send, Image as ImageIcon, Link as LinkIcon, X, Loader2 } from "lucide-react";
import styles from "@/styles/chat.module.css";

interface ChatInputProps {
  onSendMessage: (data: {
    type: "text" | "image" | "link";
    content?: string;
    file?: File;
    linkUrl?: string;
    linkTitle?: string;
    replyToId?: string;
  }) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  replyTo?: ChatMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
  canSendMedia?: boolean;
}

export default function ChatInput({
  onSendMessage,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = "Type a message...",
  canSendMedia = true,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus textarea on mount and when conversation changes
  useEffect(() => {
    const focusInput = () => {
      if (textareaRef.current && !showLinkInput) {
        textareaRef.current.focus();
      }
    };
    
    // Immediate focus
    focusInput();
    
    // Also try after delays for both mobile and desktop
    const timer1 = setTimeout(focusInput, 50);
    const timer2 = setTimeout(focusInput, 150);
    const timer3 = setTimeout(focusInput, 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [showLinkInput]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!onTyping) return;
    onTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  }, [onTyping]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Clear image preview
  const clearImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit message
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Link submission
    if (showLinkInput && linkUrl.trim()) {
      setIsSubmitting(true);
      try {
        const normalizedUrl = linkUrl.trim();
        const normalizedTitle = linkTitle.trim();
        await onSendMessage({
          type: "link",
          content: normalizedUrl, // Keep URL in content for persistence
          linkUrl: normalizedUrl,
          linkTitle: normalizedTitle || normalizedUrl, // Use URL as title if no title provided
          replyToId: replyTo?._id,
        });
        setLinkUrl("");
        setLinkTitle("");
        setShowLinkInput(false);
        onCancelReply?.();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Image submission
    if (selectedImage) {
      setIsSubmitting(true);
      try {
        await onSendMessage({
          type: "image",
          file: selectedImage,
          content: message.trim() || undefined,
          replyToId: replyTo?._id,
        });
        setMessage("");
        clearImage();
        onCancelReply?.();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Text submission
    if (message.trim()) {
      setIsSubmitting(true);
      const messageToSend = message.trim();
      setMessage(""); // Clear immediately for better UX
      
      try {
        await onSendMessage({
          type: "text",
          content: messageToSend,
          replyToId: replyTo?._id,
        });
        onCancelReply?.();
      } catch (error) {
        // Restore message on error
        setMessage(messageToSend);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = message.trim() || selectedImage || (showLinkInput && linkUrl.trim());

  return (
    <div className={styles.chatInputContainer}>
      {/* Reply preview */}
      {replyTo && (
        <div className={styles.replyPreview}>
          <div className={styles.replyPreviewContent}>
            <p className={styles.replyPreviewLabel}>Replying to {replyTo.senderName}</p>
            <p className={styles.replyPreviewText}>
              {replyTo.type === "image" ? "📷 Photo" : replyTo.content}
            </p>
          </div>
          <button onClick={onCancelReply} className={styles.replyPreviewClose}>
            <X style={{ width: "1rem", height: "1rem" }} />
          </button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div style={{ position: "relative", display: "inline-block", marginBottom: "0.75rem" }}>
          <img
            src={imagePreview}
            alt="Selected"
            style={{ height: "6rem", borderRadius: "0.5rem", objectFit: "cover" }}
          />
          <button
            onClick={clearImage}
            style={{
              position: "absolute",
              top: "-0.5rem",
              right: "-0.5rem",
              padding: "0.25rem",
              background: "#ef4444",
              color: "#fff",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
          >
            <X style={{ width: "0.75rem", height: "0.75rem" }} />
          </button>
        </div>
      )}

      {/* Link input */}
      {showLinkInput && (
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "0.5rem", 
          marginBottom: "0.75rem", 
          padding: "0.75rem", 
          background: "#f3f4f6", 
          borderRadius: "0.5rem" 
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Share a link</span>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
                setLinkTitle("");
              }}
              style={{ padding: "0.25rem", background: "none", border: "none", cursor: "pointer", borderRadius: "0.25rem" }}
            >
              <X style={{ width: "1rem", height: "1rem", color: "#9ca3af" }} />
            </button>
          </div>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: "0.875rem",
              outline: "none"
            }}
          />
          <input
            type="text"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Link title (optional)"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: "0.875rem",
              outline: "none"
            }}
          />
        </div>
      )}

      {/* Main input area */}
      <div
        className={`${styles.inputWrapper} ${showLinkInput ? styles.inputWrapperLinkMode : ""}`.trim()}
      >
        {/* Attachment buttons */}
        {canSendMedia && !showLinkInput && (
          <div className={styles.inputActions}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={styles.inputActionButton}
              title="Attach image"
            >
              <ImageIcon className={styles.inputActionIcon} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => setShowLinkInput(true)}
              className={styles.inputActionButton}
              title="Share link"
            >
              <LinkIcon className={styles.inputActionIcon} />
            </button>
          </div>
        )}

        {/* Text input */}
        {!showLinkInput && (
          <div className={styles.textareaWrapper}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className={styles.textarea}
            />
          </div>
        )}

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          disabled={isSubmitting || !canSubmit}
          className={styles.sendButton}
          style={{ opacity: canSubmit && !isSubmitting ? 1 : 0.5 }}
        >
          {isSubmitting ? (
            <Loader2 className={styles.sendButtonIcon} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Send className={styles.sendButtonIcon} />
          )}
        </button>
      </div>
    </div>
  );
}
