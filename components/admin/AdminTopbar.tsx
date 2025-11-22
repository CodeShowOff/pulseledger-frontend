// components/admin/AdminTopbar.tsx
"use client";

import React, { useCallback } from "react";
import { useAuthStore } from "@/lib/store";
import { LogOut } from "lucide-react";

export default function AdminTopbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = useCallback(async () => {
    try {
      const { default: api } = await import("@/lib/axios");
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors, proceed with local cleanup
    }
    logout();
    document.cookie = "accessToken=; Max-Age=0; path=/;";
    window.location.href = "/auth/login";
  }, [logout]);

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-700">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="text-sm text-gray-600">
            {user.fullName} <span className="text-gray-400">({user.role})</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-red-600 hover:underline"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </header>
  );
}
