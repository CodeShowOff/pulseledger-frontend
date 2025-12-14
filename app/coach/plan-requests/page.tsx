"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useCoachPendingPlanRequests, COACH_PENDING_PLAN_REQUESTS_KEY } from "@/lib/queries/planRequests";

type CoachSubscription = {
  _id: string;
  status: string;
  planId?: { _id: string; title: string } | null;
  planTitle?: string;
  clientId?: { _id: string; fullName?: string; email?: string } | null;
  createdAt?: string;
};

export default function CoachPlanRequestsPage() {
  const { data: requests = [], isLoading, error } = useCoachPendingPlanRequests();
  const queryClient = useQueryClient();

  const { data: subsResponse } = useQuery<{ success: boolean; data: CoachSubscription[] }>({
    queryKey: ["coachSubscriptions"],
    queryFn: async () => {
      const res = await api.get("/subscriptions/coach");
      return res.data;
    },
  });

  const activeSubsByClient = useMemo(() => {
    const map = new Map<string, CoachSubscription>();
    (subsResponse?.data ?? []).forEach((sub) => {
      const clientId = sub.clientId?._id;
      if (!clientId) return;
      if (sub.status === "approved") {
        const existing = map.get(clientId);
        // keep the latest approved
        const existingCreated = existing?.createdAt ? new Date(existing.createdAt).getTime() : 0;
        const currentCreated = sub.createdAt ? new Date(sub.createdAt).getTime() : 0;
        if (!existing || currentCreated > existingCreated) {
          map.set(clientId, sub);
        }
      }
    });
    return map;
  }, [subsResponse]);

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/plan-requests/${id}/approve`);
    },
    onSuccess: () => {
      toast.success("Request approved");
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachSubscriptions"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to approve");
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/plan-requests/${id}/decline`);
    },
    onSuccess: () => {
      toast.success("Request declined");
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachSubscriptions"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to decline");
    },
  });

  if (isLoading) return <p>Loading pending requests...</p>;
  if (error) return <p className="text-red-600">Failed to load pending plan requests.</p>;

  return (
    <div>
      <section className="admin-page-header">
        <h1 className="admin-page-header__title coach-page-header__title">
          Pending Plan Requests
        </h1>
      </section>

      {requests.length ? (
        <div className="admin-card-grid">
          {requests.map((req) => {
            const active = activeSubsByClient.get(req.clientId?._id || "");
            return (
              <div key={req._id} className="admin-card">
                <div>
                  <p className="admin-card__label">
                    {req.planId?.title ?? "Plan removed"}
                  </p>
                  <p className="admin-page-header__subtitle">
                    Client: {req.clientId?.fullName ?? "Unknown"}
                  </p>
                  {active && (
                    <p
                      className="admin-page-header__subtitle"
                      style={{ color: "#059669", marginTop: "0.25rem", fontSize: "0.8rem" }}
                    >
                      Active Subscription: {active.planId?.title || active.planTitle || "(title removed)"}
                    </p>
                  )}
                  {req.notes && (
                    <p className="admin-page-header__subtitle" style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
                      Notes: {req.notes}
                    </p>
                  )}
                  <p className="admin-page-header__subtitle" style={{ marginTop: "0.25rem", fontSize: "0.75rem" }}>
                    Requested: {new Date(req.createdAt).toLocaleString()}
                  </p>
                  <div style={{ marginTop: "0.5rem" }}>
                    <p className="admin-page-header__subtitle" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                      Payment Method:
                    </p>
                    <p className="admin-page-header__subtitle" style={{ fontSize: "0.75rem" }}>
                      {req.paymentMode === "cash" && "Cash on Delivery"}
                      {req.paymentMode === "manual_qr" && "QR Payment"}
                      {!req.paymentMode && "Not specified"}
                    </p>
                    {req.paymentMode === "manual_qr" && req.paymentProofUrl && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <a
                          href={req.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "underline", color: "#2563eb", fontSize: "0.75rem" }}
                        >
                          View Payment Proof
                        </a>
                        <Image
                          src={req.paymentProofUrl}
                          alt="Payment proof"
                          width={300}
                          height={200}
                          style={{
                            marginTop: "0.5rem",
                            maxWidth: "100%",
                            height: "auto",
                            maxHeight: "200px",
                            borderRadius: "0.375rem",
                            border: "1px solid #e5e7eb",
                            filter: "brightness(1.2)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <button
                    type="button"
                    disabled={approveMutation.isPending || declineMutation.isPending}
                    onClick={() => approveMutation.mutate(req._id)}
                    className="btn btn--primary"
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={approveMutation.isPending || declineMutation.isPending}
                    onClick={() => declineMutation.mutate(req._id)}
                    className="btn btn--danger"
                  >
                    {declineMutation.isPending ? "Declining..." : "Decline"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="admin-page-header__subtitle">No pending requests.</p>
      )}
    </div>
  );
}
