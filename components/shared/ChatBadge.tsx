// Chat badge component - Shows unread chat count in navbar
"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useUnreadChatCount } from "@/lib/queries/chat";
import { useAuthStore } from "@/lib/store";

const ChatBadge = React.memo(function ChatBadge() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const shouldTrackUnreadCount =
    Boolean(accessToken) && (role === "coach" || role === "client");
  const { data: unread = 0 } = useUnreadChatCount({
    enabled: shouldTrackUnreadCount,
    userId,
  });
  const prev = useRef(0);

  const chatLink = role === "coach" ? "/coach/chat" : "/client/chat";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (unread > prev.current) {
      const newCount = unread - prev.current;
      toast.info(`${newCount} new message${newCount > 1 ? "s" : ""}`);
    }
    prev.current = unread;
  }, [unread]);

  return (
    <Link
      href={chatLink}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Chat${unread > 0 ? ` - ${unread} unread` : ""}`}
    >
      <MessageSquare
        className={`w-5 h-5 ${unread > 0 ? "text-blue-500" : "text-gray-600 dark:text-gray-300"}`}
      />
      {unread > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
});

export default ChatBadge;
