"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useUnreadCount } from "@/lib/queries/notifications";
import { useAuthStore } from "@/lib/store";

const NotificationBell = React.memo(function NotificationBell() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasSession = Boolean(userId && accessToken);
  const { data: unread = 0 } = useUnreadCount({ enabled: hasSession, userId });
  const prev = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (unread > prev.current) {
      // show a non-intrusive toast when new notifications arrive
      const newCount = unread - prev.current;
      toast.info(`${newCount} new notification${newCount > 1 ? "s" : ""}`);
      // Optionally use Web Notifications API when permitted
      // Note: On mobile browsers, we must use ServiceWorker.showNotification() instead of new Notification()
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          // Try using Service Worker first (required for mobile)
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification("New notifications", {
                body: `You have ${unread} unread notifications.`,
                icon: "/notification-bell.png",
              });
            }).catch(() => {});
          } else {
            // Fallback for desktop browsers
            new Notification("New notifications", { body: `You have ${unread} unread notifications.` });
          }
        } catch {
          // Silently fail - toast notification is already shown
        }
      } else if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
    prev.current = unread;
  }, [unread]);

  return (
    <>
      <style jsx>{`
        @keyframes bellSwing {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-10deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .bell-icon-animate {
          animation: bellSwing 2s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
      <Link
        href="/notifications"
        className="site-navbar__avatar-button bell-button"
        style={{ 
          width: 40, 
          height: 40, 
          verticalAlign: "middle", 
          lineHeight: 0, 
          padding: 0,
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible"
        }}
        aria-label="Notifications"
      >
        <Image
          src="/notification-bell.png"
          alt="Notifications"
          width={24}
          height={24}
          className={unread > 0 ? "bell-icon-animate" : ""}
          style={{ display: "block" }}
        />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: -2,
              minWidth: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: "18px",
              textAlign: "center",
              padding: "0 5px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              pointerEvents: "none",
              zIndex: 10
            }}
            aria-label={`${unread} unread notifications`}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
    </>
  );
});

export default NotificationBell;
