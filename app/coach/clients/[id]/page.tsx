"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import {
  COACH_CLIENT_PLAN_REQUESTS_KEY,
  COACH_PENDING_PLAN_REQUESTS_KEY,
  PlanRequest,
  useCoachClientPlanRequests,
} from "@/lib/queries/planRequests";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "@/lib/motion";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  ShoppingBag,
  UserRound,
  XCircle,
} from "lucide-react";
import ClientProgressPhotos from "@/components/coach/ClientProgressPhotos";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ClientAddress = {
  line1?: string;
  line2?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
};

type ClientPlanCurrent = {
  planTitle?: string;
  type?: "subscription" | "default" | string;
  durationWeeks?: number;
  price?: number;
  endDate?: string | null;
};

type ClientPlanDefault = {
  title?: string;
  durationWeeks?: number;
  price?: number;
};

type ClientData = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  avatarUrl?: string;
  createdAt?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  latestProgress?: {
    date?: string;
  } | null;
  address?: ClientAddress;
  planSummary?: {
    current?: ClientPlanCurrent | null;
    defaultPlan?: ClientPlanDefault | null;
  };
};

type CoachOrderItem = {
  name?: string;
  quantity?: number;
};

type CoachOrder = {
  _id: string;
  clientId?: string | { _id?: string };
  items?: CoachOrderItem[];
  finalAmount?: number;
  paymentMode?: string;
  status?: string;
  createdAt?: string;
};

type CoachOrdersResponse = {
  data?: CoachOrder[];
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const DetailedProgressCharts = dynamic(
  () => import("@/components/client/DetailedProgressCharts"),
  {
    ssr: false,
    loading: () => (
      <Card className="border-slate-200/80 bg-white/95">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">Loading progress charts...</p>
        </CardContent>
      </Card>
    ),
  }
);

function formatDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

function formatShortMonthYear(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function normalizeForWhatsApp(number?: string | null) {
  if (!number) return "";
  return number.replace(/[^\d]/g, "");
}

function getStatusTone(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "approved":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "fulfilled":
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "cancelled":
    case "rejected":
    case "declined":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default function ClientDetailPage() {
  const params = useParams();
  const idValue = params?.id;
  const id = Array.isArray(idValue) ? idValue[0] : (idValue as string | undefined) ?? "";
  const [ordersPage, setOrdersPage] = useState(1);

  const {
    data: client,
    isLoading: loadingClient,
    error: clientError,
  } = useQuery<ClientData>({
    queryKey: ["coachClient", id],
    queryFn: async () => {
      const res = await api.get(`/coach/clients/${id}`);
      return res.data.data as ClientData;
    },
    enabled: Boolean(id),
    retry: false,
  });

  const { data: allOrdersData, isLoading: loadingOrders } = useQuery<CoachOrdersResponse>({
    queryKey: ["coachOrders"],
    queryFn: async () => {
      const res = await api.get(`/orders/coach?limit=100`);
      return res.data as CoachOrdersResponse;
    },
    enabled: Boolean(id),
  });

  const clientOrders = useMemo(() => {
    const allOrders = Array.isArray(allOrdersData?.data) ? allOrdersData.data : [];
    return allOrders.filter((order) => {
      if (!order.clientId) return false;
      return typeof order.clientId === "string"
        ? order.clientId === id
        : order.clientId?._id === id;
    });
  }, [allOrdersData?.data, id]);

  const ordersPerPage = 5;
  const ordersStart = (ordersPage - 1) * ordersPerPage;
  const orders = clientOrders.slice(ordersStart, ordersStart + ordersPerPage);
  const ordersPagination = {
    page: ordersPage,
    totalPages: Math.ceil(clientOrders.length / ordersPerPage),
    total: clientOrders.length,
  };

  const {
    data: planRequests = [],
    isLoading: loadingRequests,
  } = useCoachClientPlanRequests(id || "");

  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await api.patch(`/plan-requests/${requestId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_CLIENT_PLAN_REQUESTS_KEY(id) });
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["coachClients"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await api.patch(`/plan-requests/${requestId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_CLIENT_PLAN_REQUESTS_KEY(id) });
      queryClient.invalidateQueries({ queryKey: COACH_PENDING_PLAN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["coachClients"] });
    },
  });

  if (loadingClient) {
    return (
      <div className="space-y-4 pt-4 md:pt-6">
        <div className="h-[210px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
          <div className="h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        </div>
      </div>
    );
  }

  if (clientError) {
    return (
      <div className="pt-4 md:pt-6">
        <Card className="border-rose-200 bg-rose-50">
          <CardHeader>
            <CardTitle className="text-base text-rose-800">Unable to open client profile</CardTitle>
            <CardDescription className="text-rose-700">
              Access denied. This client is not assigned to you or does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/coach/clients">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back to Clients
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="pt-4 md:pt-6">
        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader>
            <CardTitle className="text-base">Client not found</CardTitle>
            <CardDescription>This client is unavailable or no longer assigned to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/coach/clients">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back to Clients
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const address = client.address;
  const addressLine = [address?.city, address?.state, address?.postalCode]
    .filter(Boolean)
    .join(", ");
  const activePlan = client.planSummary?.current;
  const defaultPlan = client.planSummary?.defaultPlan;
  const whatsappTarget = normalizeForWhatsApp(
    client.whatsappNumber || client.phone || address?.phoneNumber
  );
  const whatsappHref = whatsappTarget
    ? `https://wa.me/${whatsappTarget}?text=${encodeURIComponent(
        `Hi ${client.fullName}, this is your coach from FitCoach.`
      )}`
    : null;

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <div className="flex items-center">
        <Link href="/coach/clients">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
      </div>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
        className="space-y-2"
      >
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/80 p-4 shadow-sm sm:p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-100 shadow-sm">
                {client.avatarUrl ? (
                  <Image
                    src={client.avatarUrl}
                    alt={client.fullName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-lg font-semibold text-slate-700">
                    {client.fullName?.charAt(0)?.toUpperCase() || "C"}
                  </span>
                )}
              </div>

              <div className="min-w-0 space-y-2">
                <h1 className="truncate text-[1.72rem] font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
                  {client.fullName}
                </h1>

                <p className="truncate text-sm font-medium text-slate-600">
                  {client.email}
                </p>
              </div>
            </div>

            <p className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Member since
              <span className="ml-1.5 text-xs font-semibold normal-case tracking-normal text-slate-800">
                {formatShortMonthYear(client.createdAt)}
              </span>
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 md:flex md:flex-wrap">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-emerald-500 bg-gradient-to-r from-emerald-600 to-green-500 px-4 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(22,163,74,0.85)] transition-all hover:brightness-105"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            ) : null}

            <Link href={`/coach/chat?clientId=${id}`} className="col-span-1">
              <Button
                variant="outline"
                className="h-10 w-full rounded-xl !border-blue-600 !bg-blue-600 px-4 text-sm font-semibold !text-white transition-all duration-200 hover:!border-blue-700 hover:!bg-blue-700 hover:!text-white"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
            </Link>

            <Link
              href={`/coach/clients/${id}/history`}
              className={cn("col-span-2 md:col-auto", !whatsappHref && "col-span-1")}
            >
              <Button
                variant="outline"
                className="h-10 w-full rounded-xl !border-blue-600 !bg-blue-600 px-4 text-sm font-semibold !text-white transition-all duration-200 hover:!border-blue-700 hover:!bg-blue-700 hover:!text-white"
              >
                <CalendarDays className="h-4 w-4" />
                View workout & diet history
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.04 }}
        className="grid gap-4 lg:grid-cols-[1.7fr_1fr]"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <UserRound className="h-4 w-4" />
              </span>
              Profile overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
              <p className="mb-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                Email
              </p>
              <p className="text-sm font-semibold text-slate-800 break-all">{client.email || "-"}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
              <p className="mb-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </p>
              <p className="text-sm font-semibold text-slate-800">{client.phone || "-"}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">WhatsApp</p>
              <p className="text-sm font-semibold text-slate-800">{client.whatsappNumber || "-"}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
              <p className="mb-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
                Latest progress update
              </p>
              <p className="text-sm font-semibold text-slate-800">{formatDate(client.latestProgress?.date)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <ClipboardList className="h-4 w-4" />
              </span>
              Plan overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activePlan ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-indigo-600">Current plan</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {activePlan.planTitle || "Plan"}
                </p>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <p>
                    Type: {activePlan.type === "subscription" ? "Subscription" : "Default"}
                  </p>
                  {activePlan.durationWeeks ? <p>Duration: {activePlan.durationWeeks} weeks</p> : null}
                  {typeof activePlan.price === "number" ? (
                    <p>Price: ₹{activePlan.price.toFixed(2)}</p>
                  ) : null}
                  {activePlan.type === "subscription" ? (
                    <p>Ends: {formatDate(activePlan.endDate)}</p>
                  ) : null}
                </div>
              </div>
            ) : defaultPlan ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Default template</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{defaultPlan.title || "Plan"}</p>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  {defaultPlan.durationWeeks ? <p>Duration: {defaultPlan.durationWeeks} weeks</p> : null}
                  {typeof defaultPlan.price === "number" ? (
                    <p>Price: ₹{defaultPlan.price.toFixed(2)}</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-4 text-sm text-slate-600">
                No plan assigned yet.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.08 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Activity className="h-4 w-4" />
              </span>
              Health information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Weight</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {typeof client.weight === "number" ? `${client.weight} kg` : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Height</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {typeof client.height === "number" ? `${client.height} cm` : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">BMI</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {typeof client.bmi === "number" ? client.bmi.toFixed(1) : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <MapPin className="h-4 w-4" />
              </span>
              Address
            </CardTitle>
            <CardDescription>Billing and delivery contact location.</CardDescription>
          </CardHeader>
          <CardContent>
            {address && (address.line1 || address.city || address.state) ? (
              <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm text-slate-700">
                {address.phoneNumber ? <p>{address.phoneNumber}</p> : null}
                {address.line1 ? <p>{address.line1}</p> : null}
                {address.line2 ? <p>{address.line2}</p> : null}
                {address.neighborhood ? <p>{address.neighborhood}</p> : null}
                {addressLine ? <p>{addressLine}</p> : null}
                {address.country ? <p>{address.country}</p> : null}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-4 text-sm text-slate-600">
                No address provided.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.1 }}
      >
        <ClientProgressPhotos clientId={id} />
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.12 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <ClipboardList className="h-4 w-4" />
              </span>
              Plan requests
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {loadingRequests ? (
              <p className="text-sm text-slate-500">Loading requests...</p>
            ) : planRequests.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-700">No requests yet.</p>
                <p className="mt-1 text-xs text-slate-500">Incoming requests will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {planRequests.map((req: PlanRequest, index: number) => (
                  <motion.article
                    key={req._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {req.planId?.title ?? "Plan removed"}
                        </p>
                        <p className="text-xs text-slate-500">Requested {formatDate(req.createdAt)}</p>
                        {req.notes ? (
                          <p className="pt-1 text-sm text-slate-600">Notes: {req.notes}</p>
                        ) : null}
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
                          getStatusTone(req.status)
                        )}
                      >
                        {req.status}
                      </span>
                    </div>

                    {req.status === "pending" ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => approveMutation.mutate(req._id)}
                          disabled={approveMutation.isPending || declineMutation.isPending}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {approveMutation.isPending ? "Approving..." : "Approve"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => declineMutation.mutate(req._id)}
                          disabled={approveMutation.isPending || declineMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                          {declineMutation.isPending ? "Declining..." : "Decline"}
                        </Button>
                      </div>
                    ) : null}
                  </motion.article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.14 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <ShoppingBag className="h-4 w-4" />
              </span>
              Orders history
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {loadingOrders ? (
              <p className="text-sm text-slate-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-700">No orders yet.</p>
                <p className="mt-1 text-xs text-slate-500">Client purchases will appear here once available.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-[680px] w-full text-sm">
                    <caption className="sr-only">Order history table for {client.fullName}</caption>
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Items</th>
                        <th className="px-3 py-2.5 font-semibold">Amount</th>
                        <th className="px-3 py-2.5 font-semibold">Payment</th>
                        <th className="px-3 py-2.5 font-semibold">Status</th>
                        <th className="px-3 py-2.5 font-semibold">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-t border-slate-200/80 align-top">
                          <td className="px-3 py-3 text-slate-700">
                            {(order.items ?? []).length} item(s)
                            {order.items && order.items.length > 0 ? (
                              <div className="mt-1 space-y-1 text-xs text-slate-500">
                                {order.items.map((item, idx) => (
                                  <p key={`${order._id}-item-${idx}`}>
                                    {item.name || "Item"} x{item.quantity ?? 1}
                                  </p>
                                ))}
                              </div>
                            ) : null}
                          </td>

                          <td className="px-3 py-3 font-semibold text-slate-900">
                            ₹{Number(order.finalAmount ?? 0).toFixed(2)}
                          </td>

                          <td className="px-3 py-3 capitalize text-slate-700">{order.paymentMode || "-"}</td>

                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
                                getStatusTone(order.status)
                              )}
                            >
                              {order.status || "unknown"}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {ordersPagination.totalPages > 1 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                    <p className="text-sm text-slate-600">
                      Page {ordersPagination.page} of {ordersPagination.totalPages}
                      {Number.isFinite(ordersPagination.total)
                        ? ` • ${ordersPagination.total} total`
                        : ""}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={ordersPagination.page <= 1}
                        onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={ordersPagination.page >= ordersPagination.totalPages}
                        onClick={() => setOrdersPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.16 }}
      >
        <DetailedProgressCharts clientId={id} viewerRole="coach" />
      </motion.section>
    </div>
  );
}
