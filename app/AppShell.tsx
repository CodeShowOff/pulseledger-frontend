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
import RealtimeUnreadSync from "@/components/shared/RealtimeUnreadSync";
import Footer from "@/components/shared/Footer";
import { publicRoutePrefixes, publicRoutes } from "@/lib/auth";

const InstallPrompt = dynamic(() => import("@/components/shared/InstallPrompt"), {
  ssr: false,
});

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { isPublicNavbarRoute } = useMemo(() => {
    const currentPath = pathname ?? "/";
    return {
      isPublicNavbarRoute:
        publicRoutes.includes(currentPath) ||
        publicRoutePrefixes.some((prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`)),
    };
  }, [pathname]);

  return (
    <QueryProvider>
      <RealtimeUnreadSync />

      {isPublicNavbarRoute ? <PublicNavbar /> : <Navbar />}

      <ThemeProvider>
        <AuthCookieSync />

        <main className={`site-main${isPublicNavbarRoute ? "" : " site-main--with-bottom-nav"}`}>
          {children}
        </main>

        <ToastProvider />
      </ThemeProvider>

      {isPublicNavbarRoute && <Footer />}

      <InstallPrompt />
    </QueryProvider>
  );
}
