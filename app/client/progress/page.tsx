// src/app/(client)/progress/page.tsx
"use client";
import dynamic from "next/dynamic";
import ProgressPhotos from "@/components/client/ProgressPhotos";
import ProgressDataCards from "@/components/client/ProgressDataCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DetailedProgressCharts = dynamic(() => import("@/components/client/DetailedProgressCharts"), {
  loading: () => <ProgressChartsPlaceholder />,
  ssr: false
});

function ProgressChartsPlaceholder() {
  return (
    <Card className="border-slate-200/80 bg-white/95">
      <CardHeader>
        <CardTitle className="text-base">Progress charts</CardTitle>
        <CardDescription>
          Loading charts… just a moment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] rounded-xl bg-slate-100" />
      </CardContent>
    </Card>
  );
}

export default function ClientProgressPage() {
  return (
    <div className="client-progress-refresh space-y-5 pt-4 md:pt-6">
      <section>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="space-y-2">
              <h1 className="whitespace-nowrap text-lg font-bold tracking-tight text-white sm:text-3xl">
                Progress Log
              </h1>
              <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                Track metrics, trends, and photos in one place.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </section>

      <section>
        <ProgressDataCards />
      </section>

      <section>
        <DetailedProgressCharts />
      </section>

      <section>
        <ProgressPhotos />
      </section>
    </div>
  );
}
