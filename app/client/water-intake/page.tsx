"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "@/lib/motion";
import { Droplets } from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const WaterIntakeTracker = dynamic(() => import("@/components/client/WaterIntakeTracker"), {
  loading: () => (
    <Card className="border-slate-200/80 bg-white/95">
      <div className="p-6 text-center text-sm text-slate-600">Loading water tracker...</div>
    </Card>
  ),
  ssr: false
});

export default function WaterIntakePage() {
  return (
    <div className="space-y-3 pt-4 md:pt-6">
      <RoleGuard role="client" />

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-white md:text-2xl">
                <Droplets className="h-6 w-6" />
                Water Intake
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
      >
        <WaterIntakeTracker />
      </motion.section>
    </div>
  );
}
