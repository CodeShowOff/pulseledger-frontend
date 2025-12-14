"use client";

import type { } from "next";
import "./globals.css";
import "../styles/admin.css";

import { usePathname } from "next/navigation";
import ThemeProvider from "@/providers/ThemeProvider";
import ToastProvider from "@/providers/ToastProvider";
import Navbar from "@/components/shared/NavBar";
import AuthCookieSync from "@/components/shared/AuthCookieSync";
import Footer from "@/components/shared/Footer";
import QueryProvider from "@/providers/QueryProvider";
import InstallPrompt from "@/components/shared/InstallPrompt";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PulseLedger</title>
        <meta name="description" content="Health and nutrition tracking for coaches and clients" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="PulseLedger" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PulseLedger" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body className="site-shell text-gray-900 antialiased">
        <QueryProvider>
          <Navbar />
          <ThemeProvider>
              <AuthCookieSync />
              <main className="site-main">
                {children}
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
              © {new Date().getFullYear()} PulseLedger. All rights reserved.
            </footer>
          )}
          <InstallPrompt />
        </QueryProvider>
        <div id="modal-root" />
      </body>
    </html>
  );
}
