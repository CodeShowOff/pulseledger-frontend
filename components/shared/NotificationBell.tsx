"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useUnreadCount } from "@/lib/queries/notifications";

const NotificationBell = React.memo(function NotificationBell() {
  const { data: unread = 0 } = useUnreadCount();
  const prev = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (unread > prev.current) {
      // show a non-intrusive toast when new notifications arrive
      const newCount = unread - prev.current;
      toast.info(`${newCount} new notification${newCount > 1 ? "s" : ""}`);
      // Optionally use Web Notifications API when permitted
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("New notifications", { body: `You have ${unread} unread notifications.` });
        } else if (Notification.permission === "default") {
          Notification.requestPermission();
        }
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
        className="site-navbar__avatar-button relative bell-button"
        style={{ width: 40, height: 40, verticalAlign: "middle", lineHeight: 0, padding: 0 }}
        aria-label="Notifications"
      >
        <Image
          src="/notification-bell.png"
          alt="Notifications"
          width={24}
          height={24}
          className={unread > 0 ? "bell-icon-animate" : ""}
          style={{ display: "block", margin: "auto" }}
        />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center px-1 shadow"
            style={{ fontWeight: 600 }}
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
