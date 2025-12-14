// Coach Chat Page
"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChatContainer } from "@/components/chat";
import styles from "@/styles/chat.module.css";

export default function CoachChatPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams?.get("clientId") || undefined;

  // Hide footer on this page
  useEffect(() => {
    const footer = document.querySelector('footer, .site-footer');
    if (footer) {
      (footer as HTMLElement).style.display = 'none';
    }
    return () => {
      // Show footer when leaving
      const footer = document.querySelector('footer, .site-footer');
      if (footer) {
        (footer as HTMLElement).style.display = '';
      }
    };
  }, []);

  // Lock outer layout scrolling so only chat area scrolls
  useEffect(() => {
    const body = document.body;
    const siteShell = document.querySelector('.site-shell') as HTMLElement | null;

    const updateNavbarHeight = () => {
      const navbar = (document.querySelector('.site-navbar') || document.querySelector('.navbar-modern')) as HTMLElement | null;
      const navHeight = navbar?.offsetHeight ?? 76;
      document.documentElement.style.setProperty('--chat-navbar-height', `${navHeight}px`);
    };

    body.classList.add('chat-page-active');
    siteShell?.classList.add('chat-page-shell');
    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);

    // Observe navbar size changes (handles mobile two-row nav, dynamic content)
    const navbarEl = (document.querySelector('.site-navbar') || document.querySelector('.navbar-modern')) as HTMLElement | null;
    let resizeObserver: ResizeObserver | null = null;
    if (navbarEl && typeof window.ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(() => updateNavbarHeight());
      resizeObserver.observe(navbarEl);
    }

    return () => {
      body.classList.remove('chat-page-active');
      siteShell?.classList.remove('chat-page-shell');
      document.documentElement.style.removeProperty('--chat-navbar-height');
      window.removeEventListener('resize', updateNavbarHeight);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={styles.chatPageFull}>
      <ChatContainer userRole="coach" initialClientId={clientId} />
    </div>
  );
}
