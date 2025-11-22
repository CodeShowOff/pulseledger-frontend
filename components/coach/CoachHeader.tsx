"use client";

import React from "react";
import { useAuthStore } from "@/lib/store";

const CoachHeader = React.memo(function CoachHeader() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="bg-white border-b p-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold">Welcome back, {user?.fullName || "Coach"}</h1>
      <span className="text-sm text-gray-500">{user?.email}</span>
    </header>
  );
});

export default CoachHeader;
