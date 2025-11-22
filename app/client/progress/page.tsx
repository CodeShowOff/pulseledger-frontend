// src/app/(client)/progress/page.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import ProgressPhotos from "@/components/client/ProgressPhotos";
import ProgressDataCards from "@/components/client/ProgressDataCards";

const DetailedProgressCharts = dynamic(() => import("@/components/client/DetailedProgressCharts"), {
  loading: () => <div className="p-6 text-center">Loading charts...</div>,
  ssr: false
});

export default function ClientProgressPage() {
  return (
    <div className="client-page">
      <div className="client-page__inner">
        <header className="client-page__header">
          <h1 className="client-page__title">Progress Log</h1>
          <p className="client-page__subtitle">
            View and update your health metrics and track your progress over time.
          </p>
        </header>

        <div className="client-page__sections">
          {/* Progress Data Cards */}
          <ProgressDataCards />

          {/* Detailed Progress Charts */}
          <DetailedProgressCharts />

          {/* Progress Photos Section */}
          <ProgressPhotos />
        </div>
      </div>
    </div>
  );
}
