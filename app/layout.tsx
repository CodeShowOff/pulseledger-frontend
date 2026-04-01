"use client";

import type { } from "next";
import "./globals.css";
import "../styles/admin.css";
import { Inter } from "next/font/google";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ThemeProvider from "@/providers/ThemeProvider";
import ToastProvider from "@/providers/ToastProvider";
import Navbar from "@/components/shared/NavBar";
import PublicNavbar from "@/components/shared/PublicNavbar";
import AuthCookieSync from "@/components/shared/AuthCookieSync";
import Footer from "@/components/shared/Footer";
import QueryProvider from "@/providers/QueryProvider";
import InstallPrompt from "@/components/shared/InstallPrompt";
import { publicRoutePrefixes, publicRoutes } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isPublicNavbarRoute =
    publicRoutes.includes(pathname) ||
    publicRoutePrefixes.some((prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`));

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>FitCoach</title>
        <meta name="description" content="Health and nutrition tracking for coaches and clients" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="FitCoach" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FitCoach" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body className={`${inter.className} site-shell bg-slate-50/80 text-gray-900 antialiased`}>
        <QueryProvider>
          {isPublicNavbarRoute ? <PublicNavbar /> : <Navbar />}
          <ThemeProvider>
              <AuthCookieSync />
              <main className="site-main">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
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
        </QueryProvider>
        <div id="modal-root" />
      </body>
    </html>
  );
}
