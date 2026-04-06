// src/app/(coach)/clients/page.tsx
"use client";

import React from "react";
import CoachClients from "../../../components/coach/CoachClients";
import Link from "next/link";
import { motion } from "@/lib/motion";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useCoachPendingPlanRequests } from "@/lib/queries/planRequests";

export default function CoachClientsPage() {
  const { data: pendingRequestsData = [] } = useCoachPendingPlanRequests();
  const pendingCount = pendingRequestsData.length;

  return (
    <div className="mx-auto w-full max-w-[1640px] space-y-5 pt-2 md:pt-3">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-5 text-white md:p-6 shadow-[0_14px_30px_-25px_rgba(79,70,229,0.55)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge className="mb-2 w-fit border-white/25 bg-white/15 text-white">Clients workspace</Badge>
            <h1 className="text-2xl font-bold tracking-tight text-white">My Clients</h1>
            <p className="mt-1 text-sm text-white/90">Manage clients, pending requests, and profile actions from one streamlined view.</p>
          </div>

          <Link
            href="/coach/received-requests"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_26px_-14px_rgba(79,70,229,0.7)] transition-all hover:bg-white/20"
          >
            <Users className="h-4 w-4" />
            Received Requests
            {pendingCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                {pendingCount > 99 ? "99+" : pendingCount}
              </span>
            ) : null}
          </Link>
        </div>
      </motion.section>

      <CoachClients />
    </div>
  );
}
