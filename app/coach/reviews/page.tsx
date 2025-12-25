"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import getErrorMessage from "@/lib/getErrorMessage";
import { ThumbsUp, ThumbsDown, Loader2, Eye, EyeOff, Calendar, User } from "lucide-react";
import { toast } from "sonner";

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

export default function ManageReviewsPage() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [page, setPage] = useState(1);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (filter === "pending") params.approved = "false";
      if (filter === "approved") params.approved = "true";

      const response = await api.get("/coach-reviews/manage", { params });
      setData(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, filter]);

  const handleToggleApproval = async (reviewId: string, currentStatus: boolean) => {
    setProcessingIds((prev) => new Set(prev).add(reviewId));
    try {
      await api.put(`/coach-reviews/${reviewId}/approval`, {
        isApproved: !currentStatus,
      });
      toast.success(currentStatus ? "Review hidden from profile" : "Review approved and visible on profile");
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

  if (loading && !data) {
    return (
      <main className="coach-page">
        <div className="coach-page__header">
          <h1 className="coach-page__title">Manage Client Reviews</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </main>
    );
  }

  return (
    <main className="coach-page">
      <div className="coach-page__header">
        <h1 className="coach-page__title">Manage Client Reviews</h1>
        <p className="coach-page__subtitle">
          Approve or hide client reviews that appear on your public profile
        </p>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="coach-card p-4">
            <div className="text-sm text-gray-600 mb-1">Total Reviews</div>
            <div className="text-3xl font-bold text-gray-900">{data.stats.total}</div>
          </div>
          <div className="coach-card p-4">
            <div className="text-sm text-gray-600 mb-1">Approved</div>
            <div className="text-3xl font-bold text-green-600">{data.stats.approved}</div>
          </div>
          <div className="coach-card p-4">
            <div className="text-sm text-gray-600 mb-1">Pending Approval</div>
            <div className="text-3xl font-bold text-orange-600">{data.stats.pending}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="coach-card mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => { setFilter("all"); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => { setFilter("pending"); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "pending"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending ({data?.stats.pending || 0})
          </button>
          <button
            onClick={() => { setFilter("approved"); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "approved"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Approved ({data?.stats.approved || 0})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {data?.reviews.length === 0 ? (
          <div className="coach-card text-center py-12">
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          data?.reviews.map((review) => (
            <div key={review._id} className="coach-card">
              <div className="flex items-start gap-4">
                {/* Client Avatar */}
                <div className="flex-shrink-0">
                  {review.client.avatarUrl ? (
                    <img
                      src={review.client.avatarUrl}
                      alt={review.client.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={24} className="text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.client.fullName}</h3>
                      <p className="text-sm text-gray-500">{review.client.email}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{review.review}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {review.isApproved && review.approvedAt && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Eye size={14} />
                        <span>
                          Approved on{" "}
                          {new Date(review.approvedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleToggleApproval(review._id, review.isApproved)}
                    disabled={processingIds.has(review._id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      review.isApproved
                        ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processingIds.has(review._id) ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : review.isApproved ? (
                      <>
                        <EyeOff size={16} />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {data.pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
            disabled={page === data.pagination.pages}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
