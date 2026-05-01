// src/app/client/progress/detailed/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

const FullProgressChart = dynamic(() => import("@/components/client/FullProgressChart"), {
  loading: () => <div className="p-6 text-center">Loading chart...</div>,
  ssr: false,
});

function DetailedChartContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chartType = searchParams.get("chart") || "weight";

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <ArrowLeft size={16} />
          Back to Progress
        </button>
      </div>

      <FullProgressChart chartType={chartType} />
    </>
  );
}

export default function DetailedProgressPage() {
  return (
    <div className="client-page__sections">
      <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
        <DetailedChartContent />
      </Suspense>
    </div>
  );
}
