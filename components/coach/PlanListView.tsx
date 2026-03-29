// src/components/coach/PlanListView.tsx
"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit,
  FileText,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { CLIENT_PLANS_KEY } from "@/lib/queries/plans";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PlanClientsModal = dynamic(() => import("@/components/coach/PlanClientsModal"), {
  ssr: false,
});

type Plan = {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  createdAt?: string;
  price?: number;
  durationWeeks?: number;
  goal?: string;
  isDefault?: boolean;
};

const PLANS_PER_PAGE = 6;

const fetchPlans = async () => {
  const res = await api.get(`/plans?limit=100`);
  return res.data;
};

function mapStatusVariant(status?: string): "default" | "secondary" | "success" | "warning" {
  switch (status) {
    case "active":
      return "success";
    case "paused":
      return "warning";
    case "completed":
      return "default";
    default:
      return "secondary";
  }
}

export default function PlanListView() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanTitle, setSelectedPlanTitle] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["coachPlans"],
    queryFn: fetchPlans,
  });

  const plans: Plan[] = data?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/plans/${id}`),
    onSuccess: () => {
      toast.success("Plan deleted");
      queryClient.invalidateQueries({ queryKey: ["coachPlans"] });
      queryClient.invalidateQueries({ queryKey: CLIENT_PLANS_KEY });
    },
    onError: () => toast.error("Failed to delete plan"),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
          />
        ))}
      </div>
    );
  }

  const totalPlans = plans.length;
  const totalPages = Math.ceil(totalPlans / PLANS_PER_PAGE);
  const startIndex = (currentPage - 1) * PLANS_PER_PAGE;
  const paginatedPlans = plans.slice(startIndex, startIndex + PLANS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <span>
          Total plans: <span className="font-semibold text-slate-700">{totalPlans}</span>
        </span>
        <span>
          Showing {Math.min(startIndex + 1, Math.max(totalPlans, 1))}-
          {Math.min(startIndex + PLANS_PER_PAGE, totalPlans)} of {totalPlans}
        </span>
      </div>

      <div className="space-y-3">
        {paginatedPlans.map((plan) => {
          const statusVariant = mapStatusVariant(plan.status);

          return (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
            >
              <Card className="border-slate-200/80 bg-slate-50/55">
                <CardContent className="space-y-4 p-6 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-3 pt-0.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">{plan.title}</h3>
                        {plan.isDefault ? <Badge variant="default">Default</Badge> : null}
                      </div>
                      <p className="text-xs text-slate-500">Available to all eligible clients</p>
                    </div>
                    <Badge variant={statusVariant} className="capitalize">
                      {plan.status || "draft"}
                    </Badge>
                  </div>

                  <div className={cn("grid gap-3", plan.goal ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <p className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        <DollarSign className="h-3.5 w-3.5" /> Price
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        ₹{Number(plan.price ?? 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <p className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        <Calendar className="h-3.5 w-3.5" /> Duration
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {plan.durationWeeks ? `${plan.durationWeeks} weeks` : "—"}
                      </p>
                    </div>

                    {plan.goal ? (
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                        <p className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          <Target className="h-3.5 w-3.5" /> Goal
                        </p>
                        <p className="truncate text-sm font-semibold text-slate-800">{plan.goal}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/80 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlanId(plan._id);
                        setSelectedPlanTitle(plan.title);
                      }}
                      className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <Users className="h-4 w-4" />
                      View Clients
                    </Button>

                    <Link href={`/coach/plans/${plan._id}/edit`}>
                      <Button type="button" variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Delete this plan?")) {
                          deleteMutation.mutate(plan._id);
                        }
                      }}
                      disabled={plan.isDefault || deleteMutation.isPending}
                      className={plan.isDefault ? "opacity-50" : ""}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {plans.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50/80">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <FileText className="h-7 w-7" />
              </span>
              <p className="text-sm font-medium text-slate-700">No plans found</p>
              <p className="max-w-sm text-sm text-slate-500">
                Create your first plan to start assigning premium fitness programs to your clients.
              </p>
              <Link href="/coach/plans/create">
                <Button size="sm">Create Plan</Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              type="button"
              size="icon"
              variant={page === currentPage ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {selectedPlanId ? (
        <PlanClientsModal
          planId={selectedPlanId}
          planTitle={selectedPlanTitle}
          onClose={() => {
            setSelectedPlanId(null);
            setSelectedPlanTitle("");
          }}
        />
      ) : null}
    </div>
  );
}
