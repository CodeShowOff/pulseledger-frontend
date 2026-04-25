"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import NotificationBell from "@/components/shared/NotificationBell";
import { useUnreadChatCount } from "@/lib/queries/chat";
import {
  House,
  LayoutDashboard,
  LineChart,
  CreditCard,
  Package,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";

const Navbar = React.memo(function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  const avatarUrl = useAuthStore((s) => s.user?.avatarUrl);
  const userId = user?.id ?? null;
  const shouldTrackUnreadCount =
    Boolean(accessToken) && (user?.role === "client" || user?.role === "coach");
  const { data: unreadCount = 0 } = useUnreadChatCount({
    enabled: shouldTrackUnreadCount,
    userId,
  });
  const normalizedUnreadCount = Number.isFinite(unreadCount)
    ? Math.max(0, Math.trunc(unreadCount))
    : 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isChatConversationOpen, setIsChatConversationOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const body = document.body;

    const syncConversationOpenState = () => {
      setIsChatConversationOpen(body.classList.contains("chat-conversation-open"));
    };

    syncConversationOpenState();

    const observer = new MutationObserver(syncConversationOpenState);
    observer.observe(body, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const isActive = useCallback(
    (p: string) => pathname === p || pathname?.startsWith(p + "/"),
    [pathname]
  );

  const clientLinks = [
    { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { label: "Plan", href: "/client/subscriptions", icon: CreditCard },
    { label: "Chat", href: "/client/chat", icon: MessageSquare },
    { label: "Progress", href: "/client/progress", icon: LineChart },
    { label: "Products", href: "/client/products", icon: Package },
  ];

  const coachLinks = [
    { label: "Dashboard", href: "/coach/dashboard", icon: LayoutDashboard },
    { label: "Chat", href: "/coach/chat", icon: MessageSquare },
    { label: "Clients", href: "/coach/clients", icon: Users },
    { label: "Plans", href: "/coach/plans", icon: FileText },
    { label: "Products", href: "/coach/products", icon: Package },
  ];

  const adminLinks = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Plans", href: "/admin/plans", icon: FileText },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  ];

  const links = useMemo(() => {
    if (!user) return [];
    if (user.role === "client") return clientLinks;
    if (user.role === "coach") return coachLinks;
    if (user.role === "admin") return adminLinks;
    return [];
  }, [user]);

  const isChatRoute = pathname?.startsWith("/client/chat") || pathname?.startsWith("/coach/chat");
  const isClientWorkoutTodayRoute = pathname === "/client/workouts/today";
  const showMobileBottomNav =
    !!user &&
    !(isChatRoute && isChatConversationOpen) &&
    !isClientWorkoutTodayRoute;

  useEffect(() => {
    const body = document.body;
    const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;

    if (showMobileBottomNav && isMobileViewport) {
      body.classList.add("mobile-bottom-nav-visible");
    } else {
      body.classList.remove("mobile-bottom-nav-visible");
    }

    return () => {
      body.classList.remove("mobile-bottom-nav-visible");
    };
  }, [showMobileBottomNav]);

  const handleLogout = useCallback(async () => {
    try {
      const { default: api } = await import("@/lib/axios");
      await api.post("/auth/logout");
    } catch {
      // ignore backend failures
    } finally {
      logout();
      router.replace("/auth/login");
    }
  }, [logout, router]);

  if (!user) {
    return null;
  }

  return (
    <>
      <nav className="navbar-modern navbar-modern--visible">
        <div className="navbar-modern__container">
          {/* Logo */}
          <Link href="/" className="navbar-modern__logo">
            <span className="navbar-modern__logo-text">FitCoach</span>
          </Link>

          {/* Desktop Navigation - in center */}
          <div className="navbar-modern__nav">
            {links.length > 0 && (
              <div className="navbar-modern__links">
                {links.map((link) => {
                  const isChatLink =
                    link.href === "/coach/chat" || link.href === "/client/chat";
                  const showBadge = isChatLink && normalizedUnreadCount > 0;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`navbar-modern__link ${isActive(link.href) ? "navbar-modern__link--active" : ""}`}
                    >
                      {link.label}
                      {showBadge && (
                        <span className="navbar-modern__badge">
                          {normalizedUnreadCount > 99 ? "99+" : normalizedUnreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="navbar-modern__actions">
            <div className="navbar-modern__user" ref={menuRef}>
              <NotificationBell />

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="navbar-modern__avatar"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={36}
                    height={36}
                    sizes="36px"
                    className="navbar-modern__avatar-img"
                  />
                ) : (
                  <div className="navbar-modern__avatar-fallback">
                    {user.fullName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div className="navbar-modern__dropdown">
                  <div className="navbar-modern__dropdown-header">
                    <span className="navbar-modern__dropdown-name">
                      {user.fullName}
                    </span>
                    <span className="navbar-modern__dropdown-role">
                      {user.role}
                    </span>
                  </div>
                  <div className="navbar-modern__dropdown-divider" />
                  <button
                    type="button"
                    className="navbar-modern__dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/profile");
                    }}
                  >
                    My Profile
                  </button>

                  {user.role === "client" && (
                    <button
                      type="button"
                      className="navbar-modern__dropdown-item"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/client/documents");
                      }}
                    >
                      My Documents
                    </button>
                  )}

                  <button
                    type="button"
                    className="navbar-modern__dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/notifications");
                    }}
                  >
                    Notifications
                  </button>
                  <div className="navbar-modern__dropdown-divider" />
                  <button
                    type="button"
                    className="navbar-modern__dropdown-item navbar-modern__dropdown-item--danger"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation Row - shows on mobile with icons, hidden on desktop */}
      {showMobileBottomNav && links.length > 0 && (
        <div className="navbar-modern__secondary">
          <div className="navbar-modern__secondary-inner">
            {links.map((link) => {
              const Icon = link.icon;
              const MobileIcon = link.href.endsWith("/dashboard")
                ? House
                : Icon;
              const isChatLink =
                link.href === "/coach/chat" || link.href === "/client/chat";
              const showBadge = isChatLink && normalizedUnreadCount > 0;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-modern__secondary-link ${isActive(link.href) ? "navbar-modern__secondary-link--active" : ""}`}
                >
                  <span className="navbar-modern__secondary-icon">
                    <MobileIcon size={20} strokeWidth={2} />
                    {showBadge && (
                      <span className="navbar-modern__secondary-badge">
                        {normalizedUnreadCount > 99 ? "99+" : normalizedUnreadCount}
                      </span>
                    )}
                  </span>
                  <span className="navbar-modern__secondary-label">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
});

export default Navbar;