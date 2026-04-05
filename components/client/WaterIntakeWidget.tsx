"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { GlassWater, ExternalLink, Plus, X } from "lucide-react";
import Link from "next/link";

interface WaterIntakeEntry {
  _id: string;
  amountLiters: number;
  date: string;
  goal: number;
  notes?: string;
  createdAt?: string;
}

interface TodayDataResponse {
  amountLiters: number;
  goal: number;
  date: string;
  clientId: string;
  entries: WaterIntakeEntry[];
}

type WaterIntakeWidgetProps = {
  compact?: boolean;
};

const ML_IN_LITER = 1000;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatLitersCompact = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
};

const popupOptions = [
  { amountLiters: 0.25, label: "250ml" },
  { amountLiters: 0.5, label: "500ml" },
  { amountLiters: 1, label: "1L" },
] as const;

export default function WaterIntakeWidget({ compact = false }: WaterIntakeWidgetProps) {
  const queryClient = useQueryClient();
  const [isLogModalOpen, setIsLogModalOpen] = React.useState(false);
  const [customAmountMl, setCustomAmountMl] = React.useState("");

  // Fetch user's daily water goal
  const { data: goalData } = useQuery<{ data: { goal: number } }>({
    queryKey: ["waterGoal"],
    queryFn: async () => {
      const res = await api.get("/water-intake/goal");
      return res.data;
    },
  });

  // Fetch today's water intake
  const { data: todayData } = useQuery<{ data: TodayDataResponse }>({
    queryKey: ["waterIntakeToday"],
    queryFn: async () => {
      const res = await api.get("/water-intake/today");
      return res.data;
    },
  });

  // Log water intake mutation
  const logMutation = useMutation({
    mutationFn: async (amount: number) => {
      // Get today's date in YYYY-MM-DD format (client's local date)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDate = `${year}-${month}-${day}`;
      
      const res = await api.post("/water-intake", {
        amountLiters: amount,
        date: todayDate, // Send as "YYYY-MM-DD" string
        notes: null,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Water intake logged!");
      queryClient.invalidateQueries({ queryKey: ["waterIntakeToday"] });
      queryClient.invalidateQueries({ queryKey: ["waterIntakeAnalytics"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to log water intake");
    },
  });

  const handleQuickLog = (amount: number) => {
    if (amount <= 0 || amount > 100) {
      toast.error("Invalid amount");
      return;
    }
    logMutation.mutate(amount);
  };

  const closeLogModal = React.useCallback(() => {
    setIsLogModalOpen(false);
    setCustomAmountMl("");
  }, []);

  const handlePresetLog = (amountLiters: number) => {
    handleQuickLog(amountLiters);
    closeLogModal();
  };

  const handleCustomLog = () => {
    const parsedMl = Number(customAmountMl);

    if (!customAmountMl || Number.isNaN(parsedMl) || parsedMl <= 0) {
      toast.error("Enter a valid amount in ml");
      return;
    }

    if (parsedMl > 100000) {
      toast.error("Custom amount cannot exceed 100L");
      return;
    }

    const amountLiters = parsedMl / ML_IN_LITER;
    handleQuickLog(amountLiters);
    closeLogModal();
  };

  React.useEffect(() => {
    if (!isLogModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLogModal();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isLogModalOpen, closeLogModal]);

  const totalLiters = todayData?.data?.amountLiters || 0;
  const goalLiters = goalData?.data?.goal || 3.5;
  const progressPercent = goalLiters > 0 ? clamp((totalLiters / goalLiters) * 100, 0, 100) : 0;

  const totalLitersLabel = formatLitersCompact(totalLiters);
  const goalLitersLabel = formatLitersCompact(goalLiters);
  const remainingLiters = Math.max(0, goalLiters - totalLiters);
  const amountRatioText = `${totalLitersLabel}/${goalLitersLabel}L`;
  const isLongAmountRatio = amountRatioText.length >= 9;

  const ringSize = compact ? "h-36 w-36" : "h-[min(74vw,15rem)] w-[min(74vw,15rem)] sm:h-64 sm:w-64";

  const ringStrokeWidth = compact ? 11 : 14;
  const ringCenter = 120;
  const ringRadius = 94;
  const circumference = 2 * Math.PI * ringRadius;
  const gaugeGapDegrees = compact ? 66 : 70;
  const gaugeVisibleDegrees = 360 - gaugeGapDegrees;
  const arcLength = (circumference * gaugeVisibleDegrees) / 360;
  const gapLength = circumference - arcLength;
  const progressArcLength = (arcLength * progressPercent) / 100;
  const gaugeRotationDeg = 122;
  const ringGradientId = React.useId();

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border border-sky-100/80 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-[0_20px_40px_-30px_rgba(14,116,144,0.55)] ${
          compact ? "h-full p-3" : "p-4 sm:p-5"
        }`}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="relative z-[1] space-y-3 sm:space-y-4">
          <div className="flex min-h-8 items-center justify-between gap-2.5">
            <div className="min-w-0">
              <h3 className={`truncate font-bold leading-tight text-slate-900 ${compact ? "text-sm" : "text-base"}`}>
                Water Intake
              </h3>
            </div>

            <Link
              href="/client/water-intake"
              title="View full water intake log"
              className={`grid shrink-0 place-items-center rounded-xl border border-sky-200/80 bg-white/90 text-sky-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                compact ? "h-8 w-8" : "h-9 w-9"
              }`}
            >
              <ExternalLink className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
            </Link>
          </div>

          <div className="mx-auto w-full text-center">
            <div className={`relative mx-auto ${ringSize}`} aria-label={`${Math.round(progressPercent)} percent hydrated`}>
              <svg viewBox="0 0 240 240" className="h-full w-full" role="presentation">
                <defs>
                  <linearGradient id={ringGradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="55%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>

                <circle
                  cx={ringCenter}
                  cy={ringCenter}
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.22)"
                  strokeWidth={ringStrokeWidth}
                  strokeDasharray={`${arcLength} ${gapLength}`}
                  style={{
                    transform: `rotate(${gaugeRotationDeg}deg)`,
                    transformOrigin: "50% 50%",
                  }}
                />

                <circle
                  cx={ringCenter}
                  cy={ringCenter}
                  r={ringRadius}
                  fill="none"
                  stroke={`url(#${ringGradientId})`}
                  strokeWidth={ringStrokeWidth}
                  strokeLinecap={progressArcLength > 0 ? "round" : "butt"}
                  strokeDasharray={`${progressArcLength} ${circumference}`}
                  style={{
                    transform: `rotate(${gaugeRotationDeg}deg)`,
                    transformOrigin: "50% 50%",
                    transition: "stroke-dasharray 900ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                  className="motion-reduce:transition-none"
                />
              </svg>

              <div
                className={`pointer-events-none absolute inset-0 flex items-center justify-center px-5 text-center ${
                  compact ? "" : "sm:px-6"
                }`}
              >
                <p
                  className={`max-w-[92%] whitespace-nowrap tabular-nums font-extrabold leading-none tracking-tight ${
                    compact
                      ? isLongAmountRatio
                        ? "text-[1.03rem]"
                        : "text-[1.17rem]"
                      : isLongAmountRatio
                        ? "text-[1.3rem] sm:text-[1.55rem]"
                        : "text-[1.45rem] sm:text-[1.75rem]"
                  }`}
                >
                  <span className="text-sky-500">{totalLitersLabel}</span>
                  <span className="text-slate-900">/{goalLitersLabel}</span>
                  <span className={`ml-1 font-semibold text-slate-500 ${compact ? "text-[0.66rem]" : "text-[0.8rem] sm:text-[0.92rem]"}`}>
                    L
                  </span>
                </p>
              </div>

              <div className="absolute left-1/2 top-[83.5%] -translate-x-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(true)}
                  disabled={logMutation.isPending}
                  className={`group relative grid place-items-center rounded-full border border-sky-200/90 bg-white/95 text-sky-700 shadow-[0_10px_25px_-14px_rgba(2,132,199,0.75)] transition-all duration-300 ease-out motion-reduce:transition-none ${
                    logMutation.isPending
                      ? "cursor-not-allowed opacity-60"
                      : "hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 active:translate-y-0"
                  } ${compact ? "h-11 w-11" : "h-12 w-12 sm:h-14 sm:w-14"}`}
                  aria-label="Log water intake"
                >
                  <GlassWater className={compact ? "h-5 w-5" : "h-5 w-5 sm:h-6 sm:w-6"} />
                  <span
                    className={`absolute -top-1 -right-1 grid place-items-center rounded-full bg-sky-600 text-white shadow-sm ${
                      compact ? "h-[17px] w-[17px]" : "h-4 w-4 sm:h-[18px] sm:w-[18px]"
                    }`}
                    aria-hidden="true"
                  >
                    <Plus className={compact ? "h-2.5 w-2.5" : "h-2.5 w-2.5 sm:h-3 sm:w-3"} />
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-2 border-t border-sky-100/80 pt-2 ${compact ? "gap-1.5 text-center" : "gap-3 text-left"}`}>
            <div className="min-w-0">
              <p className={compact ? "text-[10px] font-semibold leading-tight text-slate-500" : "text-[11px] font-medium uppercase tracking-wide text-slate-500"}>
                Consumed
              </p>
              <p className={compact ? "mt-0.5 whitespace-nowrap text-[1.02rem] font-bold leading-tight text-slate-900" : "mt-1 text-sm font-bold text-slate-900 sm:text-base"}>
                {totalLiters.toFixed(1)}L
              </p>
            </div>

            <div className="min-w-0">
              <p className={compact ? "text-[10px] font-semibold leading-tight text-slate-500" : "text-[11px] font-medium uppercase tracking-wide text-slate-500"}>
                Remaining
              </p>
              <p className={compact ? "mt-0.5 whitespace-nowrap text-[1.02rem] font-bold leading-tight text-slate-900" : "mt-1 text-sm font-bold text-slate-900 sm:text-base"}>
                {remainingLiters.toFixed(1)}L
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLogModalOpen ? (
        <div
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/45 p-3 pb-24 backdrop-blur-[1px] sm:items-center sm:p-4 sm:pb-4"
          onClick={closeLogModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="water-log-modal-title"
            className="w-full max-w-sm max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl border border-sky-100 bg-white p-4 shadow-2xl sm:max-h-[90dvh] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 id="water-log-modal-title" className="text-base font-semibold text-slate-900">
                How much water?
              </h4>
              <button
                type="button"
                onClick={closeLogModal}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
                aria-label="Close water log popup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {popupOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handlePresetLog(option.amountLiters)}
                  disabled={logMutation.isPending}
                  className={`rounded-xl border border-sky-200 bg-sky-50 px-2 py-2 text-sm font-semibold text-sky-700 transition-all duration-200 ${
                    logMutation.isPending
                      ? "cursor-not-allowed opacity-60"
                      : "hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <label htmlFor="water-custom-amount" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Custom (ml)
              </label>

              <div className="flex items-center gap-2">
                <input
                  id="water-custom-amount"
                  type="number"
                  min="1"
                  step="50"
                  inputMode="numeric"
                  placeholder="e.g. 350"
                  value={customAmountMl}
                  onChange={(event) => setCustomAmountMl(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-300"
                />

                <button
                  type="button"
                  onClick={handleCustomLog}
                  disabled={logMutation.isPending}
                  className={`h-10 shrink-0 rounded-xl px-4 text-sm font-semibold text-white transition-colors ${
                    logMutation.isPending
                      ? "cursor-not-allowed bg-sky-400"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
