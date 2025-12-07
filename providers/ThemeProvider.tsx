"use client";

import React, { useEffect } from "react";

// Minimal theme provider: applies `class="dark"` on <html> based on system preference
// and persists user choice via localStorage under key `theme`.
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored ?? (prefersDark ? "dark" : "light");

    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    // Keep in sync with system changes if no explicit choice stored
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("theme") == null) {
        if (e.matches) root.classList.add("dark");
        else root.classList.remove("dark");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return <>{children}</>;
}
