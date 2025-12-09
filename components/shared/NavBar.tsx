"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import NotificationBell from "@/components/shared/NotificationBell";
import { useUnreadChatCount } from "@/lib/queries/chat";
import {
  Home,
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Package,
  Users,
  ClipboardList,
  Info,
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
  const { data: unreadCount = 0 } = useUnreadChatCount();

  const [menuOpen, setMenuOpen] = useState(false);
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

  const isActive = useCallback(
    (p: string) => pathname === p || pathname?.startsWith(p + "/"),
    [pathname]
  );

  // Role-aware links WITH icons now
  const guestLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "About", href: "/footer-pages/about", icon: BookOpen },
    { label: "Contact", href: "/footer-pages/contact", icon: Mail },
  ];

  const clientLinks = [
    { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { label: "Chat", href: "/client/chat", icon: MessagesSquare },
    { label: "Progress", href: "/client/progress", icon: TrendingUp },
    { label: "Products", href: "/client/products", icon: Package },
  ];

  const coachLinks = [
    { label: "Dashboard", href: "/coach/dashboard", icon: LayoutDashboard },
    { label: "Chat", href: "/coach/chat", icon: MessagesSquare },
    { label: "Clients", href: "/coach/clients", icon: Users },
    { label: "Products", href: "/coach/products", icon: Package },
    { label: "My Plans", href: "/coach/plans", icon: ClipboardList },
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
    if (user.role === "client") return [{ label: "Home", href: "/", icon: Home }, ...clientLinks];
    if (user.role === "coach") return [{ label: "Home", href: "/", icon: Home }, ...coachLinks];
    if (user.role === "admin") return [{ label: "Home", href: "/", icon: Home }, ...adminLinks];
    return guestLinks;
  }, [user]);

  const handleLogout = useCallback(async () => {
    try {
      const { default: api } = await import("@/lib/axios");
      await api.post("/auth/logout");
    } catch (err) {
      // ignore backend failures
    } finally {
      logout();
      router.replace("/auth/login");
    }
  }, [logout, router]);

  return (
    <nav
      className="site-navbar"
      style={{
        background: "linear-gradient(90deg, #f3f4f6 0%, #e0f2fe 55%, #ede9fe 100%)",
        borderBottom: "1px solid #d1d5db",
        boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)",
        top: 0,
        zIndex: 30,
      }}
    >
      <div className="site-navbar__inner">
        <div>
          <Link
            href="/"
            className="site-navbar__brand"
            style={{ fontSize: "1.5rem" }}
          >
            <span>PulseLedger</span>
          </Link>
        </div>

        {/* right controls */}
        <div className="site-navbar__actions">
          {!user && (
            <>
              <Link href="/auth/login" className="site-navbar__link-button">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="site-navbar__link-button site-navbar__link-button--outline"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <div className="site-navbar__action-group" ref={menuRef}>
              <NotificationBell />

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="site-navbar__avatar-button"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  overflow: "hidden",
                  padding: 0,
                  border: "1px solid #e5e7eb",
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginLeft: 4,
                }}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={40}
                    height={40}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      filter: "brightness(1.2)",
                    }}
                  />
                ) : (
                  <div
                    className="client-profile-avatar"
                    style={{ width: "100%", height: "100%", fontSize: 12 }}
                  >
                    {user.fullName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div className="site-navbar__menu">
                  <button
                    type="button"
                    className="site-navbar__menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/profile");
                    }}
                  >
                    My Profile
                  </button>

                  <button
                    type="button"
                    className="site-navbar__menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/notifications");
                    }}
                  >
                    Notifications
                  </button>

                  <button
                    type="button"
                    className="site-navbar__menu-item site-navbar__menu-item--danger"
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

      {/* secondary nav row - Hide on home page when not logged in AND hide on chat pages */}
      {(pathname !== "/" || user) && !pathname?.includes("/chat") && (
        <div
          className="site-navbar__inner"
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "0.35rem",
            paddingBottom: "0.35rem",
            justifyContent: "center",
          }}
        >
        <nav
          className="site-navbar__actions"
          style={{
            overflowX: "auto",
            justifyContent: "center",
            display: "flex",
            gap: "1rem",
          }}
        >
          {links.map((link) => {
            const Icon = link.icon;
            const isChatLink = link.href === "/coach/chat" || link.href === "/client/chat";
            const showBadge = isChatLink && unreadCount > 0;

            return (
              <div key={link.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <Link
                  href={link.href}
                  className={
                    isActive(link.href)
                      ? "site-navbar__link-button"
                      : "site-navbar__link-button--outline"
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    position: "relative",
                  }}
                >
                  {/* Mobile: icon only */}
                  {Icon && (
                    <span className="mobile-icon" style={{ position: "relative" }}>
                      <Icon size={18} strokeWidth={2} />
                      {showBadge && (
                        <span style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          minWidth: "16px",
                          height: "16px",
                          padding: "0 4px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          fontSize: "9px",
                          fontWeight: 700,
                          borderRadius: "999px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}>
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </span>
                  )}

                  {/* Desktop: text only */}
                  <span className="desktop-label">{link.label}</span>
                  {showBadge && (
                    <span className="desktop-label chat-badge-desktop" style={{
                      minWidth: "20px",
                      height: "20px",
                      padding: "0 6px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: 700,
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "0.25rem",
                    }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                {/* Label below icon for mobile */}
                <span
                  className="mobile-label"
                  style={{
                    fontSize: "0.6rem",
                    marginTop: "0.25rem",
                    color: isActive(link.href) ? "#2563eb" : "#6b7280",
                    fontWeight: isActive(link.href) ? "600" : "400",
                    textAlign: "center",
                    lineHeight: "1",
                    maxWidth: "50px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>
      )}
    </nav>
  );
});

export default Navbar;
