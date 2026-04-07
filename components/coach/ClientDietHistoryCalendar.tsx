"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Target,
  TrendingUp,
  Utensils,
} from "lucide-react";
import {
  ClientDietLog,
  useCoachClientDietLogs,
  useCoachClientDietStats,
} from "@/lib/queries/diet";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type DayStatus = "great" | "okay" | "low" | "none";

type Props = {
  clientId: string;
  clientName?: string;
};

const statusStyles: Record<DayStatus, { dot: string; tile: string; badge: string; label: string }> = {
  great: {
    dot: "bg-emerald-500",
    tile: "border-emerald-300 bg-emerald-50",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    label: "Great",
  },
  okay: {
    dot: "bg-amber-500",
    tile: "border-amber-300 bg-amber-50",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    label: "Okay",
  },
  low: {
    dot: "bg-rose-500",
    tile: "border-rose-300 bg-rose-50",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    label: "Low",
  },
  none: {
    dot: "bg-slate-200",
    tile: "border-slate-200 bg-white",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
    label: "No log",
  },
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const deriveStatus = (log?: ClientDietLog): DayStatus => {
  if (!log) return "none";
  const adherence = log.adherenceScore || 0;

  if (adherence >= 80) return "great";
  if (adherence >= 60) return "okay";
  return "low";
};

const formatMealType = (value?: string) => {
  if (!value) return "Meal";
  return value.replace(/_/g, " ");
};

export default function ClientDietHistoryCalendar({ clientId, clientName }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(formatLocalDate(new Date()));

  const startOfMonth = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    [currentMonth]
  );
  const endOfMonth = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
    [currentMonth]
  );

  const {
    data: logsData,
    isLoading,
    error: logsError,
  } = useCoachClientDietLogs(clientId, {
    startDate: formatLocalDate(startOfMonth),
    endDate: formatLocalDate(endOfMonth),
    limit: 62,
  });

  const {
    data: stats,
    error: statsError,
  } = useCoachClientDietStats(clientId, 30);

  const logs = (logsData?.data || []) as ClientDietLog[];

  const logMap = useMemo(() => {
    const map = new Map<string, ClientDietLog>();

    logs.forEach((log) => {
      const dateKey = formatLocalDate(new Date(log.date));
      const existing = map.get(dateKey);

      if (!existing) {
        map.set(dateKey, log);
        return;
      }

      const existingTime = new Date(existing.createdAt).getTime();
      const currentTime = new Date(log.createdAt).getTime();
      map.set(dateKey, currentTime > existingTime ? log : existing);
    });

    return map;
  }, [logs]);

  const monthDays = useMemo(() => {
    const items: Array<{
      day: number;
      date: string;
      log?: ClientDietLog;
      status: DayStatus;
      isToday: boolean;
      isFuture: boolean;
    }> = [];

    const totalDays = endOfMonth.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = formatLocalDate(today);

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      const dateKey = formatLocalDate(date);
      const log = logMap.get(dateKey);

      items.push({
        day,
        date: dateKey,
        log,
        status: deriveStatus(log),
        isToday: dateKey === todayKey,
        isFuture: date > today,
      });
    }

    return items;
  }, [currentMonth, endOfMonth, logMap]);

  const calendarDays = useMemo(() => {
    const padded: Array<null | (typeof monthDays)[number]> = [];
    const firstWeekday = startOfMonth.getDay();

    for (let index = 0; index < firstWeekday; index += 1) {
      padded.push(null);
    }

    monthDays.forEach((day) => padded.push(day));
    return padded;
  }, [monthDays, startOfMonth]);

  const selectedLog = selectedDate ? logMap.get(selectedDate) : null;

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return null;
    const [year, month, day] = selectedDate.split("-").map((piece) => Number(piece));
    const parsedDate = new Date(year, month - 1, day);

    return parsedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedDate]);

  const loggedDaysCount = logMap.size;

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const loadError = logsError || statsError;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Diet history calendar</h2>
        <p className="mt-1 text-xs text-slate-500">
          Monitor {clientName || "client"}&apos;s nutrition adherence and meal logging consistency.
        </p>
      </header>

      {loadError ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Unable to load diet history right now.
        </div>
      ) : null}

      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70">
        <div className="border-b border-r border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-orange-700">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            Avg calories
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{stats?.averageCalories || 0}</p>
        </div>

        <div className="border-b border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-700">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-600" />
            Avg adherence
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{stats?.averageAdherence || 0}%</p>
        </div>

        <div className="border-r border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-violet-700">
            <Calendar className="h-3.5 w-3.5 text-violet-600" />
            Days logged
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{loggedDaysCount}</p>
        </div>

        <div className="px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
            Good days
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {monthDays.filter((day) => day.status === "great" || day.status === "okay").length}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={previousMonth}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <p className="text-sm font-semibold text-slate-900">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </p>

          <button
            type="button"
            onClick={nextMonth}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div
              key={day}
              className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square min-h-[38px] rounded-lg border border-transparent sm:rounded-xl"
                />
              );
            }

            const statusConfig = statusStyles[dayData.status];

            return (
              <button
                key={dayData.date}
                type="button"
                onClick={() => (!dayData.isFuture ? setSelectedDate(dayData.date) : undefined)}
                disabled={dayData.isFuture}
                className={cn(
                  "relative aspect-square min-h-[38px] rounded-lg border text-center text-[11px] font-semibold transition sm:rounded-xl sm:text-xs",
                  dayData.isFuture
                    ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                    : selectedDate === dayData.date
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : statusConfig.tile,
                  dayData.isToday && "ring-2 ring-emerald-300"
                )}
              >
                <span>{dayData.day}</span>
                {dayData.log ? (
                  <span
                    className={cn(
                      "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                      statusConfig.dot
                    )}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500 sm:text-[11px]">
          {(["great", "okay", "low"] as DayStatus[]).map((status) => (
            <span key={status} className="inline-flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", statusStyles[status].dot)} />
              {statusStyles[status].label}
            </span>
          ))}
        </div>
      </div>

      {selectedDate ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">{selectedDateLabel}</h3>

          {selectedLog ? (
            <>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                    statusStyles[deriveStatus(selectedLog)].badge
                  )}
                >
                  {statusStyles[deriveStatus(selectedLog)].label}
                </span>
                <span className="text-xs text-slate-500">Adherence: {selectedLog.adherenceScore || 0}%</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                  <p className="font-semibold text-orange-700">{selectedLog.dailyTotals?.calories || 0}</p>
                  <p className="text-[10px] text-slate-500">kcal</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                  <p className="font-semibold text-rose-700">{selectedLog.dailyTotals?.protein || 0}g</p>
                  <p className="text-[10px] text-slate-500">Protein</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                  <p className="font-semibold text-cyan-700">{selectedLog.dailyTotals?.carbs || 0}g</p>
                  <p className="text-[10px] text-slate-500">Carbs</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                  <p className="font-semibold text-amber-700">{selectedLog.dailyTotals?.fat || 0}g</p>
                  <p className="text-[10px] text-slate-500">Fat</p>
                </div>
              </div>

              {selectedLog.meals?.length ? (
                <div className="mt-3 space-y-2">
                  {selectedLog.meals.map((meal, index) => (
                    <article key={`${meal.mealType}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{formatMealType(meal.mealType)}</p>
                        <p className="text-xs text-slate-500">
                          {meal.time ? new Date(meal.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                        </p>
                      </div>

                      {meal.foods?.length ? (
                        <p className="mt-1 text-xs text-slate-600">
                          {meal.foods.map((food) => food.foodName).filter(Boolean).join(" · ")}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500">No food items recorded.</p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No meals logged on this date.
                </p>
              )}

              {selectedLog.notes ? (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <span className="font-semibold">Client notes:</span> {selectedLog.notes}
                </p>
              ) : selectedLog.clientNotes ? (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <span className="font-semibold">Client notes:</span> {selectedLog.clientNotes}
                </p>
              ) : null}
            </>
          ) : (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <Utensils className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-2 text-sm text-slate-600">No nutrition log found for this day.</p>
            </div>
          )}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
          Loading nutrition history...
        </div>
      ) : null}

      {!isLoading && logs.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <Calendar className="mx-auto h-8 w-8 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No diet history yet</h3>
          <p className="mt-1 text-xs text-slate-500">
            Once {clientName || "this client"} starts logging meals, the timeline will appear here.
          </p>
        </div>
      ) : null}
    </section>
  );
}
