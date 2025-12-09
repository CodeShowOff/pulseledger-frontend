// src/components/client/AssignedPlans.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { CLIENT_PROGRESS_QUERY_KEY } from "@/lib/queries/clientProgress";

type Task = {
  title: string;
  description?: string | null;
  date?: string;
  completedByClient?: boolean;
};

type CurrentPlanPayload =
  | {
      type: "subscription";
      subscription: {
        _id: string;
        startDate?: string;
        endDate?: string;
        status: string;
        planId: {
          _id: string;
          title: string;
          description?: string;
          durationWeeks?: number;
          goal?: string;
        };
      };
    }
  | {
      type: "default";
      plan: {
        _id: string;
        title: string;
        description?: string;
        durationWeeks?: number;
        goal?: string;
        tasks?: Task[];
      };
    }
  | null;

type NormalizedPlan = {
  _id: string;
  title: string;
  description?: string;
  tasks?: Task[];
  startDate?: string;
  endDate?: string;
};

const fetchMyCurrentPlan = async (): Promise<NormalizedPlan | null> => {
  const res = await api.get("/subscriptions/my/current");
  const data: CurrentPlanPayload = res.data?.data ?? null;

  if (!data) return null;

  if (data.type === "subscription") {
    const { subscription } = data;
    const plan = subscription.planId;
    return {
      _id: plan._id,
      title: plan.title,
      description: plan.description,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      tasks: undefined, // tasks come from the actual Plan document via /plans when needed
    };
  }

  // default/fallback plan
  return {
    _id: data.plan._id,
    title: data.plan.title,
    description: data.plan.description,
    startDate: undefined,
    endDate: undefined,
    tasks: data.plan.tasks ?? [],
  };
};

export default function AssignedPlans() {
  const queryClient = useQueryClient();
  const { data: plan, isLoading, error } = useQuery({
    queryKey: ["myCurrentPlan"],
    queryFn: fetchMyCurrentPlan,
  });

  // Mark a task completed (client route: PATCH /plans/:planId/tasks/:taskIndex)
  const markTask = useMutation({
    mutationFn: async ({ planId, taskIndex }: { planId: string; taskIndex: number }) => {
      try {
        const res = await api.patch(`/plans/${planId}/tasks/${taskIndex}`);
        return res.data;
      } catch (err: any) {
        throw err?.response?.data?.message || "Failed to mark task";
      }
    },
    onSuccess: () => {
      toast.success("Task marked complete");
      queryClient.invalidateQueries({ queryKey: ["myPlans"] });
      queryClient.invalidateQueries({ queryKey: CLIENT_PROGRESS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["clientSummary"] });
    },
    onError: (err: any) => toast.error(typeof err === "string" ? err : "Failed to mark task"),
  });

  if (isLoading) return <p className="client-card__subtitle">Loading your current plan...</p>;
  if (error)
    return (
      <p className="client-card__subtitle" style={{ color: "#dc2626" }}>
        Error loading current plan: {String(error)}
      </p>
    );
  if (!plan)
    return (
      <p className="client-card__subtitle">No current plan assigned</p>
    );

  const startedLabel = plan.startDate
    ? new Date(plan.startDate).toLocaleDateString()
    : null;

  return (
    <div className="client-current-plan">
      <div className="client-current-plan__header">
        <p className="client-current-plan__eyebrow">Your Current Plan</p>
        <h3 className="client-current-plan__title">{plan.title}</h3>
      </div>

      {plan.description && (
        <p className="client-current-plan__description">{plan.description}</p>
      )}

      <div className="client-current-plan__badge-row">
        {startedLabel && (
          <span className="client-current-plan__badge">Started {startedLabel}</span>
        )}
      </div>

      {plan.tasks && plan.tasks.length > 0 && (
        <div className="client-current-plan__tasks">
          <p className="client-section-title" style={{ fontSize: "0.9rem" }}>
            Todays Tasks
          </p>
          <ul className="client-current-plan__tasks-list">
            {plan.tasks.map((task, idx) => {
              const isDone = !!task.completedByClient;
              return (
                <li key={idx} className="client-current-plan__task">
                  <div>
                    <p className="client-current-plan__task-title">{task.title}</p>
                    {task.description && (
                      <p className="client-current-plan__task-text">{task.description}</p>
                    )}
                    {task.date && (
                      <p className="client-current-plan__task-date">
                        {new Date(task.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div>
                    {isDone ? (
                      <span className="client-current-plan__task-status client-current-plan__task-status--done">
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          markTask.mutate({
                            planId: plan._id,
                            taskIndex: idx,
                          })
                        }
                        type="button"
                        className="client-button"
                        style={{ fontSize: "0.8rem", paddingInline: "0.85rem" }}
                        disabled={markTask.isPending}
                      >
                        {markTask.isPending ? "Marking..." : "Mark Complete"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* My Subscriptions button at the bottom */}
      <div style={{ marginTop: "1rem" }}>
        <Link
          href="/client/subscriptions"
          className="client-button"
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            padding: "0.65rem 1.5rem",
            fontSize: "0.9rem",
            textAlign: "center"
          }}
        >
          <CreditCard className="h-4 w-4" /> My Subscriptions
        </Link>
      </div>
    </div>
  );
}
