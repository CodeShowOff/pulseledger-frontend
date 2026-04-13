"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { motion } from "@/lib/motion";
import {
  Calendar,
  ClipboardList,
  FilePenLine,
  Filter,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
  UserPlus,
  Weight,
} from "lucide-react";
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

type ContactStatus = "pending" | "contacted" | "converted" | "rejected";

interface ContactRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  height?: number | null;
  weight?: number | null;
  age: number;
  gender: "male" | "female" | "other";
  message: string;
  status: ContactStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContactRequestsResponse {
  success: boolean;
  data: ContactRequest[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

const STATUS_FILTER_OPTIONS: Array<{ value: "" | ContactStatus; label: string }> = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_BADGE_CLASS: Record<ContactStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  contacted: "border-blue-200 bg-blue-50 text-blue-700",
  converted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const fetchContactRequests = async (
  status?: string
): Promise<ContactRequestsResponse> => {
  const params = status ? `?status=${status}` : "";
  const res = await api.get(`/contact-requests/coach/requests${params}`);
  return res.data;
};

export default function ReceivedRequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<"" | ContactStatus>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<ContactStatus>("pending");

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["contactRequests", selectedStatus],
    queryFn: () => fetchContactRequests(selectedStatus),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: ContactStatus;
      notes?: string;
    }) => {
      const res = await api.put(`/contact-requests/coach/requests/${id}`, { status, notes });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactRequests"] });
      setEditingId(null);
    },
  });

  const handleUpdateStatus = (id: string, status: ContactStatus, notes?: string) => {
    updateMutation.mutate({ id, status, notes });
  };

  const startEditing = (request: ContactRequest) => {
    setEditingId(request._id);
    setEditStatus(request.status);
    setEditNotes(request.notes || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditStatus("pending");
    setEditNotes("");
  };

  const saveEditing = (id: string) => {
    handleUpdateStatus(id, editStatus, editNotes);
  };

  const formatDate = (dateString: string) => {
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-5 pt-4 md:pt-6">
        <div className="h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="h-[120px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="grid gap-3 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`request-skeleton-${idx}`}
              className="h-[260px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4 md:pt-6">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-rose-700">
              Failed to load contact requests. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl">
                  Received contact requests
                </h1>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block sm:text-base">
                  Stay on top of every new lead and move requests through your funnel quickly.
                </CardDescription>
              </div>

              <Badge
                variant="secondary"
                className="w-fit border-white/25 bg-white/10 px-2.5 py-1 text-white"
                aria-label={`${data?.pagination.total ?? 0} contact request${
                  (data?.pagination.total ?? 0) === 1 ? "" : "s"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                {(data?.pagination.total ?? 0) > 99
                  ? "99+"
                  : data?.pagination.total ?? 0} {" "}
                Total
              </Badge>
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
              Filter requests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2">
                {STATUS_FILTER_OPTIONS.map((option) => {
                  const active = selectedStatus === option.value;

                  return (
                    <Button
                      key={option.value || "all"}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() => setSelectedStatus(option.value)}
                      className={cn(
                        "min-w-[92px] snap-start justify-center whitespace-nowrap rounded-full",
                        active
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
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
                <ClipboardList className="h-4 w-4" />
              </span>
              Requests queue
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {(data?.data.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">No contact requests found</p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedStatus
                    ? `No ${selectedStatus} requests are available right now.`
                    : "New contact requests will appear here once clients submit them."}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 xl:grid-cols-2">
                {data?.data.map((request, index) => {
                  const isEditing = editingId === request._id;

                  return (
                    <motion.article
                      key={request._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: index * 0.02 }}
                    >
                      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/20">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                              {request.firstName} {request.lastName}
                            </h3>
                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(request.createdAt)}
                            </p>
                          </div>

                          <Badge
                            variant="secondary"
                            className={cn(
                              "px-2 py-0.5 text-[10px] normal-case tracking-normal",
                              STATUS_BADGE_CLASS[request.status]
                            )}
                          >
                            {request.status}
                          </Badge>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate">{request.phone}</span>
                          </div>

                          {request.email ? (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate">{request.email}</span>
                            </div>
                          ) : null}

                          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Age/Gender:</span>
                            <span>
                              {request.age} • {request.gender}
                            </span>
                          </div>

                          {request.height || request.weight ? (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
                              <Weight className="h-3.5 w-3.5 text-slate-400" />
                              <span>
                                {request.height ? `${request.height} cm` : "-"}
                                {request.height && request.weight ? " • " : ""}
                                {request.weight ? `${request.weight} kg` : ""}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                          <p className="mb-1 inline-flex items-center gap-1.5 font-semibold text-slate-700">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Message
                          </p>
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {request.message}
                          </p>
                        </div>

                        {isEditing ? (
                          <div className="mt-3 space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                            <div>
                              <label
                                htmlFor={`status-${request._id}`}
                                className="text-xs font-semibold text-slate-700"
                              >
                                Status
                              </label>
                              <select
                                id={`status-${request._id}`}
                                value={editStatus}
                                onChange={(e) =>
                                  setEditStatus(e.target.value as ContactStatus)
                                }
                                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-300"
                              >
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="converted">Converted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor={`notes-${request._id}`}
                                className="text-xs font-semibold text-slate-700"
                              >
                                Notes
                              </label>
                              <textarea
                                id={`notes-${request._id}`}
                                rows={3}
                                maxLength={500}
                                placeholder="Add your notes here..."
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-300"
                              />
                              <p className="mt-1 text-right text-[11px] text-slate-500">
                                {editNotes.length}/500
                              </p>
                            </div>
                          </div>
                        ) : request.notes ? (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                            <p className="mb-0.5 font-semibold text-slate-700">Your notes</p>
                            <p className="whitespace-pre-wrap text-sm italic text-slate-600">
                              {request.notes}
                            </p>
                          </div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                type="button"
                                onClick={() => saveEditing(request._id)}
                                disabled={updateMutation.isPending}
                                className="bg-indigo-600 text-white hover:bg-indigo-700"
                              >
                                {updateMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  "Save"
                                )}
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEditing}
                                disabled={updateMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => startEditing(request)}
                              >
                                <FilePenLine className="h-4 w-4" />
                                Update status
                              </Button>

                              {request.status === "pending" ? (
                                <Button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateStatus(request._id, "contacted")
                                  }
                                  disabled={updateMutation.isPending}
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  {updateMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    "Mark as contacted"
                                  )}
                                </Button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
