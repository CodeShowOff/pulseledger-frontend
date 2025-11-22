"use client";

import React from "react";
import dynamic from "next/dynamic";
import RoleGuard from "@/components/shared/RoleGuard";

const WaterIntakeTracker = dynamic(() => import("@/components/client/WaterIntakeTracker"), {
  loading: () => <div className="p-6 text-center">Loading water tracker...</div>,
  ssr: false
});

export default function WaterIntakePage() {
  return (
    <div>
      <RoleGuard role="client" />
      <WaterIntakeTracker />
    </div>
  );
}
