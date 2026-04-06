"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import getErrorMessage from "@/lib/getErrorMessage";
import { motion } from "@/lib/motion";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  MessageSquareText,
  RefreshCw,
  User2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Review {
  _id: string;
  client: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    email: string;
  };
  review: string;
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    pending: number;
    approved: number;
    total: number;
  };
}

type ReviewFilter = "all" | "pending" | "approved";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(value).toLocaleDateString(
    "en-US",
    options ?? {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

export default function ManageReviewsPage() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [page, setPage] = useState(1);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params: { page: number; limit: number; approved?: string } = {
        page,
        limit: 10,
      };

      if (filter === "pending") params.approved = "false";
      if (filter === "approved") params.approved = "true";

      const response = await api.get("/coach-reviews/manage", { params });
      setData(response.data.data as ReviewsData);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleApproval = async (reviewId: string, currentStatus: boolean) => {
    setProcessingIds((prev) => new Set(prev).add(reviewId));
    try {
      await api.put(`/coach-reviews/${reviewId}/approval`, {
        isApproved: !currentStatus,
      });
      toast.success(
        currentStatus
          ? "Review hidden from profile"
          : "Review approved and visible on profile"
      );
      fetchReviews();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  const stats = data?.stats ?? {
    pending: 0,
    approved: 0,
    total: 0,
  };

  const filterOptions = useMemo(
    () => [
      { value: "all" as const, label: "All reviews", count: stats.total },
      { value: "pending" as const, label: "Pending", count: stats.pending },
      { value: "approved" as const, label: "Approved", count: stats.approved },
    ],
    [stats.approved, stats.pending, stats.total]
  );

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-4 p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className="w-fit border-white/25 bg-white/15 text-white">Reputation</Badge>
                <CardTitle className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Manage client reviews with confidence
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm !text-white/90 md:text-base">
                  Approve or hide testimonials that appear on your public profile.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchReviews}
                  disabled={loading}
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <RefreshCw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-100">Total reviews</p>
                <p className="mt-1 text-xl font-semibold">{loading && !data ? "--" : stats.total}</p>
              </div>
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-100">Approved</p>
                <p className="mt-1 text-xl font-semibold">{loading && !data ? "--" : stats.approved}</p>
              </div>
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-100">Pending approval</p>
                <p className="mt-1 text-xl font-semibold">{loading && !data ? "--" : stats.pending}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Filter className="h-4 w-4" />
              </span>
              Filter reviews
            </CardTitle>
            <CardDescription>Switch between all, pending, and approved feedback.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const active = filter === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => {
                      setFilter(option.value);
                      setPage(1);
                    }}
                    className={cn(
                      active
                        ? option.value === "approved"
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : option.value === "pending"
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {option.label}
                    <span
                      className={cn(
                        "ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {option.count}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <MessageSquareText className="h-4 w-4" />
              </span>
              Reviews queue
            </CardTitle>
            <CardDescription>
              Moderate testimonials and choose what appears publicly.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {loading && !data ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`review-skeleton-${index}`}
                  className="h-[158px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
                />
              ))
            ) : (data?.reviews.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <MessageSquareText className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No reviews found</p>
                <p className="mt-1 text-xs text-slate-500">Try a different filter to view more feedback.</p>
              </div>
            ) : (
              data?.reviews.map((review, index) => (
                <motion.article
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/20">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          {review.client.avatarUrl ? (
                            <img
                              src={review.client.avatarUrl}
                              alt={review.client.fullName}
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <span className="grid h-11 w-11 place-items-center rounded-full bg-indigo-100 text-indigo-600">
                              <User2 className="h-5 w-5" />
                            </span>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-900">
                                {review.client.fullName}
                              </h3>
                              <Badge
                                variant={review.isApproved ? "success" : "warning"}
                                className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
                              >
                                {review.isApproved ? "Approved" : "Pending"}
                              </Badge>
                            </div>
                            <p className="truncate text-xs text-slate-500">{review.client.email}</p>

                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                              {review.review}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(review.createdAt)}
                              </span>

                              {review.isApproved && review.approvedAt ? (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Approved on {formatDate(review.approvedAt, { month: "short", day: "numeric" })}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  Awaiting approval
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 lg:pl-3">
                        <Button
                          type="button"
                          size="sm"
                          variant={review.isApproved ? "outline" : "default"}
                          onClick={() =>
                            handleToggleApproval(review._id, review.isApproved)
                          }
                          disabled={processingIds.has(review._id)}
                          className={cn(
                            "min-w-[112px]",
                            review.isApproved
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          )}
                        >
                          {processingIds.has(review._id) ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Updating
                            </>
                          ) : review.isApproved ? (
                            <>
                              <EyeOff className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Approve
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))
            )}

            {data && data.pagination.pages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <p className="text-sm text-slate-600">
                  Page {data.pagination.page} of {data.pagination.pages}
                  {Number.isFinite(data.pagination.total)
                    ? ` • ${data.pagination.total} total`
                    : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setPage((p) => Math.min(data.pagination.pages, p + 1))
                    }
                    disabled={page === data.pagination.pages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
