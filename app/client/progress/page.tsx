// src/app/(client)/progress/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "@/lib/motion";
import ProgressPhotos from "@/components/client/ProgressPhotos";
import ProgressDataCards from "@/components/client/ProgressDataCards";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DetailedProgressCharts = dynamic(() => import("@/components/client/DetailedProgressCharts"), {
  loading: () => <div className="p-6 text-center">Loading charts...</div>,
  ssr: false
});

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function ClientProgressPage() {
  return (
    <div className="client-progress-refresh space-y-5 pt-4 md:pt-6">
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-4 p-6 md:p-7">
            <div className="space-y-2">
              <Badge className="w-fit border-white/25 bg-white/15 text-white">Progress Hub</Badge>
              <CardTitle className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Progress Log
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm !text-white/90 md:text-base">
                Track metrics, trends, and photos in one place.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
      >
        <ProgressDataCards />
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.1 }}
      >
        <DetailedProgressCharts />
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.14 }}
      >
        <ProgressPhotos />
      </motion.section>
    </div>
  );
}
