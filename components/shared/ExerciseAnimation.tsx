// components/shared/ExerciseAnimation.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, RotateCcw, AlertCircle } from "lucide-react";

interface ExerciseAnimationProps {
  animationUrl?: string | null;
  thumbnailUrl?: string | null;
  exerciseName: string;
  size?: "small" | "medium" | "large";
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

/**
 * ExerciseAnimation Component
 * Displays animated exercise demonstrations (GIF, Lottie, or Video)
 * Features:
 * - Auto-detection of media type (gif, mp4, webm, lottie)
 * - Smooth looping animations
 * - Play/pause controls
 * - Fallback placeholder when no animation available
 * - Loading states
 */
export default function ExerciseAnimation({
  animationUrl,
  thumbnailUrl,
  exerciseName,
  size = "medium",
  autoPlay = true,
  showControls = true,
  className = "",
}: ExerciseAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaType, setMediaType] = useState<"gif" | "video" | "lottie" | null>(null);

  // Determine size dimensions
  const sizeStyles = {
    small: { width: "80px", height: "80px" },
    medium: { width: "140px", height: "140px" },
    large: {
      width: "100%",
      height: "clamp(180px, 54vw, 300px)",
      minHeight: "180px",
      maxWidth: "100%",
    },
  };

  // Detect media type from URL
  useEffect(() => {
    if (!animationUrl) {
      setMediaType(null);
      setIsLoading(false);
      return;
    }

    const url = animationUrl.toLowerCase();
    if (url.endsWith(".gif") || url.includes("gif")) {
      setMediaType("gif");
    } else if (url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("video")) {
      setMediaType("video");
    } else if (url.endsWith(".json") || url.includes("lottie")) {
      setMediaType("lottie");
    } else {
      // Default to gif for unknown types
      setMediaType("gif");
    }
  }, [animationUrl]);

  // Handle video play/pause
  useEffect(() => {
    if (videoRef.current && mediaType === "video") {
      if (isPlaying) {
        videoRef.current.play().catch(() => setHasError(true));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, mediaType]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  // Generate placeholder based on exercise name
  const getPlaceholderEmoji = () => {
    const name = exerciseName.toLowerCase();
    if (name.includes("squat")) return "🦵";
    if (name.includes("push") || name.includes("press") || name.includes("bench")) return "💪";
    if (name.includes("pull") || name.includes("row")) return "🏋️";
    if (name.includes("curl")) return "💪";
    if (name.includes("run") || name.includes("cardio")) return "🏃";
    if (name.includes("yoga") || name.includes("stretch")) return "🧘";
    if (name.includes("plank") || name.includes("core")) return "🫀";
    if (name.includes("jump") || name.includes("box")) return "⬆️";
    if (name.includes("dead") || name.includes("lift")) return "🏋️‍♂️";
    return "🏋️";
  };

  // Render fallback placeholder
  const renderPlaceholder = () => (
    <div
      style={{
        ...sizeStyles[size],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        borderRadius: "12px",
        border: "2px dashed #d1d5db",
        color: "#9ca3af",
        fontSize: size === "small" ? "1.5rem" : size === "medium" ? "2rem" : "2.5rem",
      }}
    >
      {hasError ? (
        <AlertCircle style={{ width: 24, height: 24, color: "#ef4444" }} />
      ) : (
        <span>{getPlaceholderEmoji()}</span>
      )}
      {size !== "small" && (
        <span style={{ fontSize: "0.65rem", marginTop: "0.25rem", textAlign: "center", padding: "0 0.25rem" }}>
          {hasError ? "Failed to load" : "No animation"}
        </span>
      )}
    </div>
  );

  // If no animation URL, show placeholder
  if (!animationUrl) {
    return renderPlaceholder();
  }

  return (
    <div
      className={`exercise-animation ${className}`}
      style={{
        position: "relative",
        ...sizeStyles[size],
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f9fafb",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: "2px solid #e5e7eb",
              borderTopColor: "#16a34a",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      )}

      {/* Error state */}
      {hasError && renderPlaceholder()}

      {/* GIF Animation */}
      {mediaType === "gif" && !hasError && (
        <Image
          src={isPlaying ? animationUrl : (thumbnailUrl || animationUrl)}
          alt={`${exerciseName} demonstration`}
          fill
          sizes={
            size === "small"
              ? "80px"
              : size === "medium"
              ? "140px"
              : "(max-width: 768px) 100vw, 600px"
          }
          loading="lazy"
          unoptimized
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: size === "large" ? "contain" : "cover",
            display: isLoading ? "none" : "block",
          }}
        />
      )}

      {/* Video Animation */}
      {mediaType === "video" && !hasError && (
        <video
          ref={videoRef}
          src={animationUrl}
          poster={thumbnailUrl || undefined}
          loop
          muted
          playsInline
          autoPlay={autoPlay}
          onLoadedData={handleLoad}
          onError={handleError}
          style={{
            width: "100%",
            height: "100%",
            objectFit: size === "large" ? "contain" : "cover",
            display: isLoading ? "none" : "block",
          }}
        />
      )}

      {/* Controls overlay */}
      {showControls && !isLoading && !hasError && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0.5rem",
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          className="exercise-animation__controls"
        >
          <button
            onClick={togglePlay}
            style={{
              padding: "0.25rem",
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause style={{ width: 14, height: 14, color: "#374151" }} />
            ) : (
              <Play style={{ width: 14, height: 14, color: "#374151" }} />
            )}
          </button>
          {mediaType === "video" && (
            <button
              onClick={restart}
              style={{
                padding: "0.25rem",
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Restart"
            >
              <RotateCcw style={{ width: 14, height: 14, color: "#374151" }} />
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .exercise-animation:hover .exercise-animation__controls {
          opacity: 1 !important;
        }

        @media (hover: none) {
          .exercise-animation .exercise-animation__controls {
            opacity: 1 !important;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * ExerciseAnimationCard - Full card with animation and exercise info
 */
export function ExerciseAnimationCard({
  animationUrl,
  thumbnailUrl,
  exerciseName,
  reps,
  duration,
  restSeconds,
  notes,
  instructions,
  isExpanded = false,
  onToggleExpand,
}: ExerciseAnimationProps & {
  reps?: number | string;
  duration?: number;
  restSeconds?: number;
  notes?: string;
  instructions?: string[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem",
          cursor: onToggleExpand ? "pointer" : "default",
        }}
        onClick={onToggleExpand}
      >
        {/* Animation */}
        <ExerciseAnimation
          animationUrl={animationUrl}
          thumbnailUrl={thumbnailUrl}
          exerciseName={exerciseName}
          size="medium"
          showControls={true}
        />

        {/* Exercise Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "#111827",
            }}
          >
            {exerciseName}
          </h3>

          {/* Reps/Duration */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            {reps && (
              <span
                style={{
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#dbeafe",
                  color: "#2563eb",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                {reps} reps
              </span>
            )}
            {duration && (
              <span
                style={{
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#fef3c7",
                  color: "#d97706",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                {duration}s hold
              </span>
            )}
            {restSeconds && restSeconds > 0 && (
              <span
                style={{
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#f3f4f6",
                  color: "#6b7280",
                  borderRadius: "6px",
                }}
              >
                {restSeconds}s rest
              </span>
            )}
          </div>

          {/* Notes preview */}
          {notes && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              📝 {notes}
            </p>
          )}
        </div>
      </div>

      {/* Expanded instructions */}
      {isExpanded && instructions && instructions.length > 0 && (
        <div
          style={{
            padding: "1rem",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
          }}
        >
          <h4
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
              color: "#374151",
            }}
          >
            How to perform:
          </h4>
          <ol
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {instructions.map((instruction, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: "0.85rem",
                  color: "#4b5563",
                  lineHeight: 1.5,
                }}
              >
                {instruction}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
