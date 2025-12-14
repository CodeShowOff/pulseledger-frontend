"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/axios";
import axios from "axios";

const PlanForm = dynamic(() => import("@/components/coach/PlanForm"), {
  loading: () => <div className="p-6 text-center">Loading form...</div>,
  ssr: false
});

export default function CoachPlanEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const planId = params?.id as string;
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await api.get(`/plans/${planId}`);
        if (!active) return;
        setPlan(res.data.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const msg = (err as any).response?.data?.message || (err as any).message;
          setError(msg || "Failed to load plan");
        } else if (err instanceof Error) {
          setError(err.message || "Failed to load plan");
        } else {
          setError(String(err) || "Failed to load plan");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    if (planId) load();
    return () => {
      active = false;
    };
  }, [planId]);

  if (loading) {
    return <p>Loading plan...</p>;
  }

  if (error || !plan) {
    return <p className="text-red-600">{error || "Plan not found"}</p>;
  }

  return (
    <div>
      <section className="admin-page-header">
        <h1 className="admin-page-header__title coach-page-header__title">
          Edit Plan
        </h1>
      </section>

      <div className="admin-card">
        <PlanForm
          variant="page"
          plan={plan}
          onClose={() => router.push("/coach/plans")}
        />
      </div>
    </div>
  );
}
