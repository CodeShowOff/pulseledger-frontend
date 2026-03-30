"use client";

import { type ComponentType, type FormEvent, type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useMyCoachQuery } from "@/lib/queries/coach";
import api from "@/lib/axios";
import getErrorMessage from "@/lib/getErrorMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const actionLinkClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-200";

const whatsappActionClass =
  "inline-flex h-8 items-center gap-2 rounded-xl border border-emerald-500 bg-gradient-to-r from-emerald-600 to-green-500 px-3 text-xs font-semibold text-white shadow-[0_10px_24px_-14px_rgba(22,163,74,0.85)] transition-all hover:brightness-105";

function InfoTile({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-slate-50/80 p-3", className)}>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex items-start gap-2 text-sm font-medium text-slate-800">
        {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /> : null}
        <span className="break-words">{value}</span>
      </div>
    </div>
  );
}

export default function ClientCoachProfilePage() {
  const { data, isLoading, error } = useMyCoachQuery();

  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(true);
  const [reviewFormData, setReviewFormData] = useState({ review: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!data?._id) {
      setCheckingReview(false);
      setHasReviewed(false);
      return;
    }

    let cancelled = false;
    setCheckingReview(true);

    const checkReview = async () => {
      try {
        const res = await api.get(`/coach-reviews/check/${data._id}`);
        if (!cancelled) {
          setHasReviewed(res.data.data?.hasReviewed ?? false);
        }
      } catch {
        if (!cancelled) {
          setHasReviewed(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingReview(false);
        }
      }
    };

    checkReview();

    return () => {
      cancelled = true;
    };
  }, [data?._id]);

  const handleReviewSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data?._id) return;

    const trimmedReview = reviewFormData.review.trim();
    if (trimmedReview.length < 10) {
      alert("Please write at least 10 characters in your feedback.");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post("/coach-reviews", {
        coachId: data._id,
        review: trimmedReview,
      });
      alert("Feedback submitted successfully! Your coach can choose to show it on their public profile.");
      setHasReviewed(true);
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to submit feedback"));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!data?.whatsappNumber) return;
    const phone = data.whatsappNumber.replace(/[^0-9]/g, "");
    if (!phone) return;

    const text = encodeURIComponent(`Hi ${data.fullName}, I am your client. Can we chat?`);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const coachCode = data?.coachCode || data?.referralCode;
  const hasAddress = Boolean(
    data?.address &&
      [
        data.address.line1,
        data.address.line2,
        data.address.phoneNumber,
        data.address.neighborhood,
        data.address.city,
        data.address.state,
        data.address.postalCode,
        data.address.country,
      ].some((value) => Boolean(value?.trim()))
  );

  const joinedDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null;

  if (isLoading) {
    return (
      <div className="client-page__sections space-y-4 md:space-y-5">
        <Card className="border-slate-200/80 bg-white/95">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-500" />
            <p className="text-sm text-slate-600">Loading coach profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-page__sections space-y-4 md:space-y-5">
        <Card className="border-rose-200/80 bg-rose-50/70">
          <CardContent className="space-y-3 p-6">
            <p className="text-sm font-medium text-rose-700">Unable to load coach information.</p>
            <Link
              href="/client/dashboard"
              className={cn(actionLinkClass, "w-fit border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="client-page__sections space-y-4 md:space-y-5">
        <Card className="border-amber-200/80 bg-amber-50/80">
          <CardContent className="space-y-3 p-6">
            <p className="text-sm font-medium text-amber-800">You do not have a coach assigned yet.</p>
            <Link
              href="/client/dashboard"
              className={cn(actionLinkClass, "w-fit border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="client-page__sections space-y-4 md:space-y-5">
      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28 }}>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-4 p-5 sm:p-6">
            <div className="space-y-2">
              <Badge className="w-fit border-white/25 bg-white/15 text-white">Coach Profile</Badge>
              <CardTitle className="text-2xl font-bold tracking-tight text-white md:text-3xl">My Coach</CardTitle>
              <CardDescription className="max-w-2xl text-sm !text-white/90 md:text-base">
                Keep your coach details in one place and stay connected with quick access to support.
              </CardDescription>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {data.isActive !== undefined ? (
                <span
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-normal text-white shadow-sm backdrop-blur-sm sm:h-9 sm:gap-2 sm:px-3.5 sm:text-xs sm:tracking-wide",
                    data.isActive
                      ? "border-emerald-200/65 bg-emerald-400/35"
                      : "border-rose-200/65 bg-rose-400/35"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      data.isActive ? "bg-emerald-50" : "bg-rose-50"
                    )}
                    aria-hidden="true"
                  />
                  {data.isActive ? "Active coach" : "Inactive coach"}
                </span>
              ) : null}

              {coachCode ? (
                <span className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/30 bg-white/14 px-2.5 text-[11px] font-semibold uppercase tracking-normal text-white shadow-sm backdrop-blur-sm sm:h-9 sm:px-3.5 sm:text-xs sm:tracking-wide">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Code: {coachCode}
                </span>
              ) : null}
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.04 }}
      >
        <Card className="border-slate-200/80 bg-white/95">
          <CardContent className="space-y-5 p-5 pt-6 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {data.avatarUrl ? (
                  <Image
                    src={data.avatarUrl}
                    alt={data.fullName}
                    width={80}
                    height={80}
                    className="profile-photo--filtered h-20 w-20 shrink-0 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-semibold text-white shadow-sm">
                    {data.fullName?.[0]?.toUpperCase() || "C"}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-slate-900">{data.fullName}</h2>
                  <p className="text-sm capitalize text-slate-600">{data.role}</p>
                  {data.companyName ? (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {data.companyName}
                    </p>
                  ) : null}
                </div>
              </div>

              {data.whatsappNumber ? (
                <button
                  type="button"
                  className={whatsappActionClass}
                  onClick={handleOpenWhatsApp}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile label="Email" value={data.email} icon={Mail} />
              {data.phone ? <InfoTile label="Phone" value={data.phone} icon={Phone} /> : null}
              {data.whatsappNumber ? (
                <InfoTile label="WhatsApp" value={data.whatsappNumber} icon={MessageCircle} />
              ) : null}
              {data.companyName ? <InfoTile label="Company" value={data.companyName} icon={Building2} /> : null}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.08 }}
      >
        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <UserRound className="h-4 w-4" />
              </span>
              Profile details
            </CardTitle>
            <CardDescription>A quick look at your coach&apos;s background and expertise.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
            <InfoTile label="Role" value={data.role} icon={UserRound} className="capitalize" />
            {typeof data.experienceYears === "number" ? (
              <InfoTile label="Experience" value={`${data.experienceYears} years`} icon={Sparkles} />
            ) : null}
            {data.specialization ? (
              <InfoTile label="Specialization" value={data.specialization} icon={Sparkles} />
            ) : null}
            {joinedDate ? <InfoTile label="Joined" value={joinedDate} icon={ShieldCheck} /> : null}
          </CardContent>
        </Card>
      </motion.section>

      {data.bio ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.12 }}
        >
          <Card className="border-slate-200/80 bg-white/95">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Bio</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-6 text-slate-700">{data.bio}</p>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      {hasAddress ? (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.28, delay: 0.16 }}
        >
          <Card className="border-slate-200/80 bg-white/95">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-50 text-cyan-600">
                  <MapPin className="h-4 w-4" />
                </span>
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
              {data.address?.line1 ? (
                <InfoTile label="Address Line 1" value={data.address.line1} className="sm:col-span-2" />
              ) : null}
              {data.address?.line2 ? (
                <InfoTile label="Address Line 2" value={data.address.line2} className="sm:col-span-2" />
              ) : null}
              {data.address?.phoneNumber ? (
                <InfoTile label="Phone Number" value={data.address.phoneNumber} icon={Phone} />
              ) : null}
              {data.address?.neighborhood ? (
                <InfoTile label="Neighborhood / Locality" value={data.address.neighborhood} />
              ) : null}
              {data.address?.city ? <InfoTile label="City / Town" value={data.address.city} /> : null}
              {data.address?.state ? (
                <InfoTile label="State / Province / Region" value={data.address.state} />
              ) : null}
              {data.address?.postalCode ? (
                <InfoTile label="Postal Code / ZIP / PIN" value={data.address.postalCode} />
              ) : null}
              {data.address?.country ? <InfoTile label="Country" value={data.address.country} /> : null}
            </CardContent>
          </Card>
        </motion.section>
      ) : null}

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.2 }}
      >
        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <Send className="h-4 w-4" />
              </span>
              Feedback for your coach
            </CardTitle>
            <CardDescription>
              Share a short review about your coaching experience. Your coach can approve it to show on
              their public profile.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            {checkingReview ? (
              <p className="text-sm text-slate-600">Checking if you&apos;ve already given feedback...</p>
            ) : hasReviewed ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                You have already submitted feedback for this coach. Thank you!
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="coach-feedback" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Feedback
                  </label>
                  <textarea
                    id="coach-feedback"
                    value={reviewFormData.review}
                    onChange={(e) =>
                      setReviewFormData((prev) => ({
                        ...prev,
                        review: e.target.value,
                      }))
                    }
                    minLength={10}
                    maxLength={1000}
                    required
                    className="min-h-[110px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Write a few lines about how your coach has helped you..."
                  />
                  <p className="text-xs text-slate-500">
                    Minimum 10 characters. Your feedback may appear publicly after your coach approves it.
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="submit" disabled={submittingReview}>
                    {submittingReview ? "Submitting..." : "Submit feedback"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.24 }}
      >
        <div className={cn("grid gap-2", coachCode ? "grid-cols-2" : "grid-cols-1", "sm:flex sm:flex-wrap")}>
          <Link
            href="/client/dashboard"
            className={cn(
              actionLinkClass,
              "h-9 w-full gap-1.5 rounded-lg px-2 text-[11px] border-slate-200 bg-white text-slate-700 hover:bg-slate-50 sm:h-10 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:hidden">Dashboard</span>
            <span className="hidden sm:inline">Back to dashboard</span>
          </Link>

          {coachCode ? (
            <Link
              href={`/public/${encodeURIComponent(coachCode)}`}
              className={cn(
                actionLinkClass,
                "h-9 w-full gap-1.5 rounded-lg px-2 text-[11px] border-indigo-600 bg-indigo-600 !text-white hover:bg-indigo-700 sm:h-10 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
              )}
            >
              <Globe2 className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
              <span className="sm:hidden">Public profile</span>
              <span className="hidden sm:inline">Visit public profile</span>
            </Link>
          ) : null}
        </div>
      </motion.section>
    </div>
  );
}
