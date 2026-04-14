// src/app/(coach)/clients/page.tsx
"use client";

import CoachClients from "../../../components/coach/CoachClients";
import Link from "next/link";
import { motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useCoachPendingContactRequestsCount } from "@/lib/queries/contactRequests";

export default function CoachClientsPage() {
  const { data: pendingCount = 0 } = useCoachPendingContactRequestsCount();

  return (
    <div className="mx-auto w-full max-w-[1640px] space-y-5 pt-2 md:pt-3">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white shadow-[0_14px_30px_-25px_rgba(79,70,229,0.55)]">
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl">
                  My Clients
                </h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  Manage clients and requests.
                </CardDescription>
              </div>

              <div className="flex w-full flex-nowrap gap-1.5 sm:w-auto sm:gap-2 md:justify-end">
                <Link
                  href="/coach/received-requests"
                  className="min-w-0 flex-1 sm:flex-none"
                >
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-1.5 whitespace-nowrap border-white/25 bg-white/10 px-2 text-[11px] font-semibold leading-none text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
                  >
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Contact Requests
                    {pendingCount > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    ) : null}
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <CoachClients />
    </div>
  );
}
