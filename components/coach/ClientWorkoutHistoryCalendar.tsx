"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  MinusCircle,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  ClientWorkoutLog,
  useCoachClientWorkoutLogs,
  useCoachClientWorkoutStats,
} from "@/lib/queries/workouts";
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

type DayStatus = ClientWorkoutLog["status"] | "none";

type Props = {
  clientId: string;
  clientName?: string;
};

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const statusStyles: Record<DayStatus, { dot: string; tile: string; label: string; badge: string }> = {
  completed: {
    dot: "bg-emerald-500",
    tile: "border-emerald-300 bg-emerald-50",
    label: "Completed",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  partial: {
    dot: "bg-amber-500",
    tile: "border-amber-300 bg-amber-50",
    label: "Partial",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  missed: {
    dot: "bg-rose-500",
    tile: "border-rose-300 bg-rose-50",
    label: "Missed",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
  rest_day: {
    dot: "bg-slate-400",
    tile: "border-slate-300 bg-slate-50",
    label: "Rest day",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
  },
  scheduled: {
    dot: "bg-indigo-400",
    tile: "border-indigo-300 bg-indigo-50",
    label: "Scheduled",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  in_progress: {
    dot: "bg-violet-500",
    tile: "border-violet-300 bg-violet-50",
    label: "In progress",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
  },
  none: {
    dot: "bg-slate-200",
    tile: "border-slate-200 bg-white",
    label: "No workout",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
  },
};

const deriveDayStatus = (logs: ClientWorkoutLog[]): DayStatus => {
  if (!logs.length) return "none";

  const statusSet = new Set(logs.map((log) => log.status));
  if (statusSet.size === 1) {
    return logs[0].status;
  }

  if (statusSet.has("in_progress")) return "in_progress";
  if (statusSet.has("scheduled")) return "scheduled";

  if (statusSet.has("completed") || statusSet.has("partial")) {
    if (statusSet.has("missed") || statusSet.has("scheduled")) {
      return "partial";
    }

    if (statusSet.has("partial")) return "partial";
    return "completed";
  }

  if (statusSet.has("missed")) return "missed";
  if (statusSet.has("rest_day")) return "rest_day";

  return "none";
};

export default function ClientWorkoutHistoryCalendar({ clientId, clientName }: Props) {
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
    isLoading: loadingLogs,
    error: logsError,
  } = useCoachClientWorkoutLogs(clientId, {
    startDate: formatLocalDate(startOfMonth),
    endDate: formatLocalDate(endOfMonth),
    limit: 62,
  });

  const {
    data: stats,
    isLoading: loadingStats,
    error: statsError,
  } = useCoachClientWorkoutStats(clientId, 30);

  const logs = (logsData?.data || []) as ClientWorkoutLog[];

  const logsByDate = useMemo(() => {
    const map = new Map<string, ClientWorkoutLog[]>();

    logs.forEach((log) => {
      const entry = log as ClientWorkoutLog & { scheduledDate?: string | Date };
      const dateValue = entry.scheduledDate || entry.date;
      if (!dateValue) return;

      const parsedDate = new Date(dateValue);
      if (Number.isNaN(parsedDate.getTime())) return;

      const dateKey = formatLocalDate(parsedDate);
      const dayLogs = map.get(dateKey);

      if (dayLogs) {
        dayLogs.push(log);
      } else {
        map.set(dateKey, [log]);
      }
    });

    for (const dayLogs of map.values()) {
      dayLogs.sort((a, b) => {
        const aTime = new Date((a as ClientWorkoutLog & { date?: string }).scheduledDate || a.date || 0).getTime();
        const bTime = new Date((b as ClientWorkoutLog & { date?: string }).scheduledDate || b.date || 0).getTime();
        return bTime - aTime;
      });
    }

    return map;
  }, [logs]);

  const monthDays = useMemo(() => {
    const items: Array<{
      day: number;
      date: string;
      logs: ClientWorkoutLog[];
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
      const logsForDate = logsByDate.get(dateKey) || [];

      items.push({
        day,
        date: dateKey,
        logs: logsForDate,
        status: deriveDayStatus(logsForDate),
        isToday: dateKey === todayKey,
        isFuture: date > today,
      });
    }

    return items;
  }, [currentMonth, endOfMonth, logsByDate]);

  const calendarDays = useMemo(() => {
    const padded: Array<null | (typeof monthDays)[number]> = [];

    const firstWeekday = startOfMonth.getDay();
    for (let index = 0; index < firstWeekday; index += 1) {
      padded.push(null);
    }

    monthDays.forEach((day) => padded.push(day));

    return padded;
  }, [monthDays, startOfMonth]);

  const selectedLogs = selectedDate ? logsByDate.get(selectedDate) || [] : [];

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

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getStatusIcon = (status?: ClientWorkoutLog["status"]) => {
    if (status === "completed") return CheckCircle2;
    if (status === "partial") return MinusCircle;
    if (status === "missed") return XCircle;
    return null;
  };

  const streakValue = stats?.todayCompleted
    ? stats?.streak || 0
    : stats?.yesterdayCompleted
      ? stats?.streak || 0
      : 0;

  const loadError = logsError || statsError;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Workout history calendar</h2>
        <p className="mt-1 text-xs text-slate-500">
          Track {clientName || "client"}&apos;s workout consistency and completion day by day.
        </p>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Unable to load workout history right now.
        </div>
      ) : null}

      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70">
        <div className="border-b border-r border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <Trophy className="h-3.5 w-3.5 text-emerald-600" />
            Completed
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{stats?.completed || 0}</p>
        </div>

        <div className="border-b border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-orange-700">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            Streak
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{loadingStats ? "--" : streakValue}</p>
        </div>

        <div className="border-r border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-700">
            <Clock3 className="h-3.5 w-3.5 text-cyan-600" />
            Minutes
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{stats?.totalDuration || 0}</p>
        </div>

        <div className="px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-violet-700">
            <Target className="h-3.5 w-3.5 text-violet-600" />
            Completion rate
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{stats?.completionRate || 0}%</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <p className="text-sm font-semibold text-slate-900">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </p>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div>
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

              const status = dayData.status;
              const statusConfig = statusStyles[status];

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
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : statusConfig.tile,
                    dayData.isToday && "ring-2 ring-indigo-300"
                  )}
                >
                  <span>{dayData.day}</span>
                  {dayData.logs.length > 0 ? (
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
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 sm:text-[11px]">
          {["completed", "partial", "missed", "rest_day", "scheduled", "in_progress"].map((status) => (
            <span key={status} className="inline-flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", statusStyles[status as DayStatus].dot)} />
              {statusStyles[status as DayStatus].label}
            </span>
          ))}
        </div>
      </div>

      {selectedDate ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">{selectedDateLabel}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {selectedLogs.length} session{selectedLogs.length === 1 ? "" : "s"} logged
          </p>

          {selectedLogs.length > 0 ? (
            <div className="mt-3 space-y-3">
              {selectedLogs.map((selectedLog) => (
                <article
                  key={selectedLog._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedLog.workoutName ||
                        (typeof selectedLog.workoutPlanId === "string"
                          ? "Workout"
                          : selectedLog.workoutPlanId?.name) ||
                        "Workout"}
                    </p>

                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                        statusStyles[(selectedLog.status || "none") as DayStatus].badge
                      )}
                    >
                      {(() => {
                        const Icon = getStatusIcon(selectedLog.status);
                        return Icon ? <Icon className="h-3.5 w-3.5" /> : null;
                      })()}
                      {statusStyles[(selectedLog.status || "none") as DayStatus].label}
                    </div>
                  </div>

                  {selectedLog.actualDuration ? (
                    <p className="mt-2 text-xs text-slate-500">Duration: {selectedLog.actualDuration} minutes</p>
                  ) : null}
                  {typeof selectedLog.caloriesBurned === "number" ? (
                    <p className="mt-0.5 text-xs text-slate-500">Calories: {selectedLog.caloriesBurned}</p>
                  ) : null}

                  {selectedLog.exerciseLogs?.length ? (
                    <div className="mt-3 space-y-2">
                      {selectedLog.exerciseLogs.map((exercise, index) => (
                        <div
                          key={`${selectedLog._id}-${exercise.exerciseName}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                        >
                          <p className="truncate text-sm text-slate-700">{exercise.exerciseName}</p>
                          {exercise.completed ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          ) : exercise.skipped ? (
                            <MinusCircle className="h-4 w-4 shrink-0 text-amber-500" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {selectedLog.clientNotes ? (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <span className="font-semibold">Client note:</span> {selectedLog.clientNotes}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
              No workout log found for this date.
            </div>
          )}
        </div>
      ) : null}

      {loadingLogs ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
          Loading workout history...
        </div>
      ) : null}

      {!loadingLogs && logs.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <Calendar className="mx-auto h-8 w-8 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No workout history yet</h3>
          <p className="mt-1 text-xs text-slate-500">
            Once {clientName || "this client"} starts logging workouts, the timeline will appear here.
          </p>
        </div>
      ) : null}
    </section>
  );
}
