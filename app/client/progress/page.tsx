// src/app/(client)/progress/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import ProgressPhotos from "@/components/client/ProgressPhotos";
import ProgressDataCards from "@/components/client/ProgressDataCards";

const DetailedProgressCharts = dynamic(() => import("@/components/client/DetailedProgressCharts"), {
  loading: () => <div className="p-6 text-center">Loading charts...</div>,
  ssr: false
});

export default function ClientProgressPage() {
  return (
    <div className="client-page__sections">
      <header className="client-page__header">
        <h1 className="client-page__title">Progress Log</h1>
      </header>

      {/* Progress Data Cards */}
      <ProgressDataCards />

      {/* Detailed Progress Charts */}
      <DetailedProgressCharts />

      {/* Progress Photos Section */}
      <ProgressPhotos />
    </div>
  );
}
