// src/components/client/ClientHeader.tsx
"use client";

import React from "react";
import { useAuthStore } from "@/lib/store";

const ClientHeader = React.memo(function ClientHeader() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="bg-white border-b p-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">Hello, {user?.fullName ?? "Client"}</h1>
        <p className="text-sm text-gray-500">Track progress & follow your plan</p>
      </div>
      <div className="text-sm text-gray-600">{user?.email}</div>
    </header>
  );
});

export default ClientHeader;
