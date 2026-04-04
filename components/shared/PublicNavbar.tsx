"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { getAllowedBasePath } from "@/lib/auth";

const PUBLIC_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/footer-pages/about" },
  { label: "Pricing", href: "/footer-pages/pricing" },
  { label: "Contact", href: "/footer-pages/contact" },
  { label: "Help", href: "/footer-pages/help-center" },
];

const PublicNavbar = React.memo(function PublicNavbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const dashboardHref = useMemo(() => {
    if (!user?.role) return "/dashboard";
    const base = getAllowedBasePath(user.role);
    return `${base}/dashboard`;
  }, [user?.role]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <nav className="public-navbar" aria-label="Public navigation">
      <div className="public-navbar__container">
        <Link href="/" className="public-navbar__brand">
          FitCoach
        </Link>

        <div className="public-navbar__links" role="navigation" aria-label="Primary">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`public-navbar__link ${isActive(link.href) ? "public-navbar__link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="public-navbar__actions">
          {user ? (
            <Link href={dashboardHref} className="public-navbar__btn public-navbar__btn--primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="public-navbar__btn public-navbar__btn--ghost">
                Sign In
              </Link>
              <Link href="/auth/register" className="public-navbar__btn public-navbar__btn--primary">
                Get Started
              </Link>
            </>
          )}

          <button
            type="button"
            className="public-navbar__menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="public-navbar-mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="public-navbar-mobile-menu" className="public-navbar__mobile-menu">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`public-navbar__mobile-link ${isActive(link.href) ? "public-navbar__mobile-link--active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <Link
              href={dashboardHref}
              className="public-navbar__mobile-cta public-navbar__mobile-cta--primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="public-navbar__mobile-ctas">
              <Link
                href="/auth/login"
                className="public-navbar__mobile-cta public-navbar__mobile-cta--ghost"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="public-navbar__mobile-cta public-navbar__mobile-cta--primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
});

export default PublicNavbar;
