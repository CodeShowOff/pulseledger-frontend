"use client";

import React from "react";
import dynamic from "next/dynamic";
import RoleGuard from "@/components/shared/RoleGuard";

const EarningsDashboard = dynamic(() => import("@/components/coach/EarningsDashboard"), {
  loading: () => <div className="p-6 text-center">Loading earnings dashboard...</div>,
  ssr: false
});

export default function CoachEarningsPage() {
  return (
    <div>
      <RoleGuard role="coach" />
      <EarningsDashboard />
    </div>
  );
}
