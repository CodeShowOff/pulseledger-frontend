"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Search,
  User,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import {
  COACH_PENDING_PLAN_REQUESTS_KEY,
  useCoachPendingPlanRequests,
} from "@/lib/queries/planRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import styles from "./CoachClients.module.css";

type Client = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  whatsappNumber?: string | null;
  latestProgress?: { weight?: number; bmi?: number; date?: string } | null;
  planSummary?: {
    current?: {
      planTitle?: string | null;
      type?: "subscription" | "default" | null;
      status?: string | null;
      endDate?: string | null;
      durationWeeks?: number | null;
      price?: number | null;
      isDefault?: boolean;
    } | null;
    pending?: Array<{
      subscriptionId: string;
      planTitle: string | null;
      requestedAt: string | null;
    }>;
    defaultPlan?: {
      title?: string;
      durationWeeks?: number;
      price?: number;
      isDefault?: boolean;
    } | null;
  };
};

type PendingPlanRequest = {
  _id: string;
  clientId?: { _id?: string };
  planId?: { title?: string };
};

const CLIENTS_PER_PAGE = 6;

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};

const fetchClients = async (search = "") => {
  const params = new URLSearchParams({ page: "1", limit: "100" });
  if (search.trim()) params.set("search", search.trim());
  const res = await api.get(`/coach/clients?${params.toString()}`);
  return res.data;
};

function getPlanLabel(client: Client) {
  if (client.planSummary?.current) {
    return {
      title: `${client.planSummary.current.planTitle || "Plan"}${
        client.planSummary.current.type === "default" ? " (Default)" : ""
      }`,
      endDate:
        client.planSummary.current.type === "subscription"
          ? formatDate(client.planSummary.current.endDate)
          : null,
    };
  }

  if (client.planSummary?.defaultPlan) {
    return {
      title: client.planSummary.defaultPlan.title || "Default plan",
      endDate: null,
    };
  }

  return {
    title: "No assigned plan",
    endDate: null,
  };
}

export default function CoachClients() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["coachClients", debouncedSearch],
    queryFn: () => fetchClients(debouncedSearch),
    placeholderData: (previousData) => previousData,
  });

  const { data: pendingRequestsData = [] } = useCoachPendingPlanRequests();
  const pendingRequests = pendingRequestsData as PendingPlanRequest[];
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/plan-requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachClients"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["coachSubscriptions"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/plan-requests/${id}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachClients"], exact: false });
    },
  });

  const clients: Client[] = data?.data ?? [];

  const totalPages = Math.max(1, Math.ceil(clients.length / CLIENTS_PER_PAGE));
  const paginatedClients = clients.slice(
    (currentPage - 1) * CLIENTS_PER_PAGE,
    currentPage * CLIENTS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageInfoText = useMemo(() => {
    if (!clients.length) return "No results";
    const start = (currentPage - 1) * CLIENTS_PER_PAGE + 1;
    const end = Math.min(currentPage * CLIENTS_PER_PAGE, clients.length);
    return `${start}-${end} of ${clients.length}`;
  }, [clients.length, currentPage]);

  if (isLoading && !data) {
    return (
      <Card className="border-slate-200/80 bg-white/95">
        <CardContent className="p-6 text-sm text-slate-500">Loading clients...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50/80">
        <CardContent className="p-6 text-sm font-medium text-rose-700">
          Error loading clients. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={styles.clientsRoot}>
      <Card className={styles.toolbarCard}>
        <CardContent className="px-5 pb-4 pt-5 md:px-5 md:pb-4 md:pt-5">
          <div className={styles.toolbarInner}>
            <div className={styles.toolbarCopy}>
              <h2 className={styles.toolbarTitle}>Assigned Clients</h2>
              <p className={styles.toolbarSubtext}>Overview of all clients linked to your coaching account.</p>
            </div>

            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, email, phone"
                className={styles.searchInput}
              />
              {isFetching ? (
                <span className={styles.searchStatus}>Updating...</span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={styles.list}>
        {paginatedClients.map((client, idx) => {
          const clientPending = pendingRequests.filter((r) => r.clientId?._id === client._id);
          const plan = getPlanLabel(client);

          return (
            <motion.div
              key={client._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              whileHover={{ y: -2 }}
              className={styles.cardMotion}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/coach/clients/${client._id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/coach/clients/${client._id}`);
                }
              }}
            >
              <Card className={styles.clientCard}>
                <CardContent className={styles.clientCardBody}>
                  <div className={styles.topRow}>
                    <div className={styles.identity}>
                      <div className={styles.avatar}>
                        <User className="h-5 w-5" />
                      </div>
                      <div className={styles.nameWrap}>
                        <p className={styles.clientName}>{client.fullName}</p>
                        <p className={styles.clientEmail}>
                          <Mail className="h-3.5 w-3.5" />
                          <span className={styles.clientEmailText}>{client.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className={styles.metricCard}>
                      <p className={styles.metricLabel}>
                        <Activity className="h-3.5 w-3.5" />
                        BMI
                      </p>
                      <p className={styles.metricValue}>{client.latestProgress?.bmi ?? "-"}</p>
                    </div>

                    <div className={styles.planCard}>
                      <div className={styles.planHeader}>
                        <p className={styles.planLabel}>
                          <FileText className="h-3.5 w-3.5" />
                          Plan
                        </p>
                        {plan.endDate ? (
                          <p className={styles.planEndDate}>
                            <Clock className="h-3.5 w-3.5" />
                            Ends {plan.endDate}
                          </p>
                        ) : null}
                      </div>
                      <p className={styles.planTitle}>{plan.title}</p>
                    </div>

                    <div className={styles.actions}>
                      {client.whatsappNumber ? (
                        <Badge variant="success" className={`normal-case tracking-normal ${styles.phoneBadge}`}>
                          <Phone className="mr-1 h-4 w-4" />
                          {client.whatsappNumber}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className={`normal-case tracking-normal ${styles.phoneBadge}`}>No phone</Badge>
                      )}

                      <Link
                        href={`/coach/chat?clientId=${client._id}`}
                        className={`${styles.linkBtn} ${styles.linkBtnPrimary}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Chat
                      </Link>
                    </div>
                  </div>

                  {clientPending.length > 0 ? (
                    <div className={styles.pendingBox}>
                      <p className={styles.pendingTitle}>
                        {clientPending.length} pending request{clientPending.length > 1 ? "s" : ""}
                      </p>
                      <div className={styles.pendingList}>
                        {clientPending.map((req) => (
                          <div key={req._id} className={styles.pendingItem}>
                            <p className={styles.pendingName}>{req.planId?.title || "Plan request"}</p>
                            <div className={styles.pendingActions}>
                              <Button
                                type="button"
                                size="sm"
                                className={styles.pendingBtn}
                                disabled={approveMutation.isPending || declineMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  approveMutation.mutate(req._id);
                                }}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className={styles.pendingBtn}
                                disabled={approveMutation.isPending || declineMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  declineMutation.mutate(req._id);
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {!clients.length ? (
        <Card className={styles.emptyCard}>
          <CardContent className={styles.emptyContent}>
            No clients match the current filters.
          </CardContent>
        </Card>
      ) : null}

      {totalPages > 1 ? (
        <Card className={styles.paginationCard}>
          <CardContent className={styles.paginationInner}>
            <p className={styles.pageText}>{pageInfoText}</p>

            <div className={styles.pageControls}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  type="button"
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="min-w-8 px-2"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
