// src/components/client/AssignedPlans.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { CreditCard } from "lucide-react";

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
      };
    }
  | null;

type NormalizedPlan = {
  _id: string;
  title: string;
  description?: string;
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
    };
  }

  // default/fallback plan
  return {
    _id: data.plan._id,
    title: data.plan.title,
    description: data.plan.description,
    startDate: undefined,
    endDate: undefined,
  };
};

export default function AssignedPlans() {
  const { data: plan, isLoading, error } = useQuery({
    queryKey: ["myCurrentPlan"],
    queryFn: fetchMyCurrentPlan,
  });

  if (isLoading) return (
    <div style={{
      background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)",
      borderRadius: "1rem",
      border: "1px solid #e5e7eb",
      padding: "2rem",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)"
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
        marginBottom: "1rem"
      }}>
        <span style={{ fontSize: "1.5rem" }}>⏳</span>
      </div>
      <p style={{ 
        fontSize: "0.875rem",
        color: "#6b7280",
        margin: "0",
        fontWeight: "500"
      }}>
        Loading your current plan...
      </p>
    </div>
  );
  
  if (error) return (
    <div style={{
      background: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
      borderRadius: "1rem",
      border: "1px solid #fecaca",
      padding: "2rem",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.08)"
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #fee2e2, #fecaca)",
        marginBottom: "1rem"
      }}>
        <span style={{ fontSize: "1.5rem" }}>⚠️</span>
      </div>
      <p style={{ 
        fontSize: "0.875rem",
        color: "#dc2626",
        margin: "0",
        fontWeight: "500"
      }}>
        Error loading current plan: {String(error)}
      </p>
    </div>
  );
  
  if (!plan) return (
    <div style={{
      background: "linear-gradient(135deg, #fef9c3 0%, #ffffff 100%)",
      borderRadius: "1rem",
      border: "1px solid #fde68a",
      padding: "2rem",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.08)"
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #fde68a, #fcd34d)",
        marginBottom: "1rem"
      }}>
        <span style={{ fontSize: "1.5rem" }}>📋</span>
      </div>
      <p style={{ 
        fontSize: "0.875rem",
        color: "#92400e",
        margin: "0",
        fontWeight: "500"
      }}>
        No current plan assigned
      </p>
    </div>
  );

  const startedLabel = plan.startDate
    ? new Date(plan.startDate).toLocaleDateString()
    : null;

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "0.75rem",
      border: "1px solid #e5e7eb",
      padding: "1.1rem 1.1rem",
      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Icon Badge & Label */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem", flex: 1 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <p style={{ 
            fontSize: "0.75rem", 
            textTransform: "uppercase", 
            letterSpacing: "0.05em", 
            color: "#6b7280",
            fontWeight: "600",
            margin: "0"
          }}>
            Your Current Plan
          </p>
          {startedLabel && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              borderRadius: "999px",
              padding: "0.25rem 0.65rem",
              fontSize: "0.7rem",
              fontWeight: "500",
              backgroundColor: "#dbeafe",
              color: "#1e40af"
            }}>
              Started {startedLabel}
            </span>
          )}
        </div>
      </div>

      {/* Plan Title */}
      <h3 style={{ 
        fontSize: "1.5rem", 
        fontWeight: "700", 
        color: "#111827",
        marginTop: "0",
        marginRight: "0",
        marginBottom: "0.5rem",
        marginLeft: "0",
        lineHeight: "1.2"
      }}>
        {plan.title}
      </h3>

      {/* Plan Description if available */}
      {plan.description && (
        <p style={{
          fontSize: "0.8rem",
          color: "#6b7280",
          lineHeight: "1.5",
          marginTop: "0",
          marginRight: "0",
          marginBottom: "1rem",
          marginLeft: "0"
        }}>
          {plan.description}
        </p>
      )}

      {/* My Subscriptions Button */}
      <Link
        href="/client/subscriptions"
        className="client-button"
        style={{ 
          marginTop: "auto",
          textAlign: "center",
          padding: "0.65rem 1.5rem",
          fontSize: "0.9rem"
        }}
      >
        <CreditCard style={{ width: "16px", height: "16px", display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} /> 
        My Subscriptions
      </Link>
    </div>
  );
}
