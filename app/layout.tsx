import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/admin.css";

import ThemeProvider from "@/providers/ThemeProvider";
import ToastProvider from "@/providers/ToastProvider";
import Navbar from "@/components/shared/NavBar";
import AuthCookieSync from "@/components/shared/AuthCookieSync";
import Footer from "@/components/shared/Footer";
import QueryProvider from "@/providers/QueryProvider";
import InstallPrompt from "@/components/shared/InstallPrompt";

export const metadata: Metadata = {
  title: "PulseLedger",
  description: "Health and nutrition tracking for coaches and clients",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PulseLedger",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="PulseLedger" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PulseLedger" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
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
          <Footer />
          <InstallPrompt />
        </QueryProvider>
        <div id="modal-root" />
      </body>
    </html>
  );
}
