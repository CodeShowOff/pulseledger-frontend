"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useChatStore } from "@/lib/chatStore";
import NotificationBell from "@/components/shared/NotificationBell";
import { useUnreadChatCount } from "@/lib/queries/chat";
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Package,
  Users,
  ClipboardList,
  Mail,
  BookOpen,
  MessagesSquare,
} from "lucide-react";

const Navbar = React.memo(function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const avatarUrl = useAuthStore((s) => s.user?.avatarUrl);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const { data: unreadCount = 0 } = useUnreadChatCount();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;

      // Keep navbar visible on mobile where bottom tabs should remain persistent.
      if (isMobileViewport) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
        setMenuOpen(false); // Close dropdown when hiding
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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

  const isActive = useCallback(
    (p: string) => pathname === p || pathname?.startsWith(p + "/"),
    [pathname]
  );

  // Role-aware links WITH icons now
  const guestLinks = [
    { label: "About", href: "/footer-pages/about", icon: BookOpen },
    { label: "Contact", href: "/footer-pages/contact", icon: Mail },
  ];

  const clientLinks = [
    { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { label: "Plan", href: "/client/subscriptions", icon: CreditCard },
    { label: "Chat", href: "/client/chat", icon: MessagesSquare },
    { label: "Progress", href: "/client/progress", icon: TrendingUp },
    { label: "Products", href: "/client/products", icon: Package },
  ];

  const coachLinks = [
    { label: "Dashboard", href: "/coach/dashboard", icon: LayoutDashboard },
    { label: "Chat", href: "/coach/chat", icon: MessagesSquare },
    { label: "Clients", href: "/coach/clients", icon: Users },
    { label: "Plans", href: "/coach/plans", icon: ClipboardList },
    { label: "Products", href: "/coach/products", icon: Package },
  ];

  const adminLinks = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Plans", href: "/admin/plans", icon: ClipboardList },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  ];

  const links = useMemo(() => {
    if (!user) return guestLinks;
    if (user.role === "client") return clientLinks;
    if (user.role === "coach") return coachLinks;
    if (user.role === "admin") return adminLinks;
    return guestLinks;
  }, [user]);

  const isChatRoute = pathname?.startsWith("/client/chat") || pathname?.startsWith("/coach/chat");
  const showMobileBottomNav = (pathname !== "/" || !!user) && !(isChatRoute && !!activeConversationId);

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

  return (
    <>
      <nav className={`navbar-modern ${isVisible ? "navbar-modern--visible" : "navbar-modern--hidden"}`}>
        <div className="navbar-modern__container">
        {/* Logo */}
        <Link href="/" className="navbar-modern__logo">
          <span className="navbar-modern__logo-mark" aria-hidden="true">
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="navbar-modern__logo-icon"
              priority
            />
          </span>
          <span className="navbar-modern__logo-text">FitCoach</span>
        </Link>

        {/* Desktop Navigation - in center */}
        <div className="navbar-modern__nav">
          {(pathname !== "/" || user) && (
            <div className="navbar-modern__links">
              {links.map((link) => {
                const isChatLink = link.href === "/coach/chat" || link.href === "/client/chat";
                const showBadge = isChatLink && unreadCount > 0;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`navbar-modern__link ${isActive(link.href) ? "navbar-modern__link--active" : ""}`}
                  >
                    {link.label}
                    {showBadge && (
                      <span className="navbar-modern__badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
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
          {!user ? (
            <>
              <Link href="/auth/login" className="navbar-modern__btn navbar-modern__btn--ghost">
                Sign In
              </Link>
              <Link href="/auth/register" className="navbar-modern__btn navbar-modern__btn--primary">
                Get Started
              </Link>
            </>
          ) : (
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
                    <span className="navbar-modern__dropdown-name">{user.fullName}</span>
                    <span className="navbar-modern__dropdown-role">{user.role}</span>
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
          )}
        </div>
        </div>
      </nav>

      {/* Secondary Navigation Row - shows on mobile with icons, hidden on desktop */}
      {showMobileBottomNav && (
        <div className="navbar-modern__secondary">
          <div className="navbar-modern__secondary-inner">
            {links.map((link) => {
              const Icon = link.icon;
              const isChatLink = link.href === "/coach/chat" || link.href === "/client/chat";
              const showBadge = isChatLink && unreadCount > 0;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-modern__secondary-link ${isActive(link.href) ? "navbar-modern__secondary-link--active" : ""}`}
                >
                  <span className="navbar-modern__secondary-icon">
                    <Icon size={20} strokeWidth={2} />
                    {showBadge && (
                      <span className="navbar-modern__secondary-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="navbar-modern__secondary-label">{link.label}</span>
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