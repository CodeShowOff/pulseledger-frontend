// src/app/(coach)/clients/page.tsx
"use client";

import React from "react";
import CoachClients from "../../../components/coach/CoachClients";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function CoachClientsPage() {
  return (
    <div className="mx-auto w-full max-w-[1640px] space-y-5 pt-2 md:pt-3">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 md:p-6 shadow-[0_14px_30px_-25px_rgba(15,23,42,0.45)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="secondary" className="mb-2 w-fit">Clients workspace</Badge>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Clients</h1>
            <p className="mt-1 text-sm text-slate-500">Manage clients, pending requests, and profile actions from one streamlined view.</p>
          </div>

          <Link
            href="/coach/received-requests"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_26px_-14px_rgba(79,70,229,0.7)] transition-all hover:brightness-105"
          >
            <Users className="h-4 w-4" />
            Received Requests
          </Link>
        </div>
      </motion.section>

      <CoachClients />
    </div>
  );
}
