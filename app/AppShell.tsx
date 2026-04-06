"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

import QueryProvider from "@/providers/QueryProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import ToastProvider from "@/providers/ToastProvider";
import Navbar from "@/components/shared/NavBar";
import PublicNavbar from "@/components/shared/PublicNavbar";
import AuthCookieSync from "@/components/shared/AuthCookieSync";
import Footer from "@/components/shared/Footer";
import { publicRoutePrefixes, publicRoutes } from "@/lib/auth";
import { MotionProvider } from "@/lib/motion";

const InstallPrompt = dynamic(() => import("@/components/shared/InstallPrompt"), {
  ssr: false,
});

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { isHomePage, isPublicNavbarRoute } = useMemo(() => {
    const currentPath = pathname ?? "/";
    return {
      isHomePage: currentPath === "/",
      isPublicNavbarRoute:
        publicRoutes.includes(currentPath) ||
        publicRoutePrefixes.some((prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`)),
    };
  }, [pathname]);

  return (
    <QueryProvider>
      <MotionProvider>
        {isPublicNavbarRoute ? <PublicNavbar /> : <Navbar />}

        <ThemeProvider>
          <AuthCookieSync />

          <main className="site-main">{children}</main>

          <ToastProvider />
        </ThemeProvider>

        {isHomePage ? (
          <Footer />
        ) : (
          <footer
            style={{
              padding: "1.25rem 1rem",
              textAlign: "center",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              color: "#6b7280",
              fontSize: "0.875rem",
            }}
          >
            © {new Date().getFullYear()} FitCoach. All rights reserved.
          </footer>
        )}

        <InstallPrompt />
      </MotionProvider>
    </QueryProvider>
  );
}
