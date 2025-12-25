// app/client/workouts/history/page.tsx
/**
 * Workout History Page
 * 
 * Purpose: Track and view past workout completion history in a calendar view
 * 
 * Features:
 * 1. Monthly Calendar View
 *    - Color-coded workout status (completed, partial, missed)
 *    - Today's date highlighted
 *    - Navigate between months
 *    - Only shows current and past dates (no future dates)
 * 
 * 2. Workout Statistics
 *    - Total completed workouts
 *    - Current streak (days in a row)
 *    - Total workout time
 * 
 * 3. Day Details
 *    - Click any day to view workout details
 *    - Shows exercise list with completion status
 *    - Displays workout duration and notes
 *    - Quick link to start today's workout if not completed
 * 
 * Status Colors:
 *    - Green: Completed
 *    - Yellow: Partial (some exercises completed)
 *    - Red: Missed
 *    - Gray: Rest day
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";
import { useClientWorkoutLogs, useClientWorkoutStats, ClientWorkoutLog } from "@/lib/queries/workouts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function WorkoutHistoryPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get the date range for the current month view
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  // Fetch workout logs for the month
  const { data: logsData, isLoading } = useClientWorkoutLogs({
    startDate: formatLocalDate(startOfMonth),
    endDate: formatLocalDate(endOfMonth),
    limit: 50,
  });

  // Fetch stats for the last 30 days
  const { data: stats } = useClientWorkoutStats(30);

  const logs = logsData?.data || [];

  // Create a map of date -> log for quick lookup
  const logMap = new Map<string, ClientWorkoutLog>();
  logs.forEach((log: ClientWorkoutLog) => {
    // Backend returns scheduledDate, not date
    const logWithScheduledDate = log as ClientWorkoutLog & { scheduledDate?: string | Date };
    const dateValue = logWithScheduledDate.scheduledDate || log.date;
    if (!dateValue) return; // Skip logs without a date
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return; // Skip invalid dates
    
    const dateKey = formatLocalDate(date);
    logMap.set(dateKey, log);
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = formatLocalDate(today);

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      const dateKey = formatLocalDate(date);
      const isFuture = date > today;
      
      days.push({
        day,
        date: dateKey,
        log: logMap.get(dateKey),
        isToday: dateKey === todayKey,
        isFuture,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const selectedLog = selectedDate ? logMap.get(selectedDate) : null;

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "#22c55e";
      case "partial":
        return "#eab308";
      case "missed":
        return "#ef4444";
      case "rest_day":
        return "#94a3b8";
      default:
        return "#e5e7eb";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return CheckCircle2;
      case "partial":
        return MinusCircle;
      case "missed":
        return XCircle;
      default:
        return null;
    }
  };

  return (
    <div className="client-page__sections">
      {/* Header */}
      <header className="client-page__header" style={{ marginBottom: "1rem" }}>
        <Link
          href="/client/workouts"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
          }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
          Back to Workouts
        </Link>
        <h1 className="client-page__title">
          <Calendar
            style={{
              width: 28,
              height: 28,
              marginRight: "0.5rem",
              color: "var(--brand-primary)",
            }}
          />
          Workout History
        </h1>
      </header>

      {/* Stats Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="client-card"
          style={{
            padding: "0.75rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          }}
        >
          <Trophy style={{ width: 20, height: 20, color: "#16a34a", margin: "0 auto 0.25rem" }} />
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#16a34a" }}>
            {stats?.completed || 0}
          </p>
          <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Completed</p>
        </div>

        <div
          className="client-card"
          style={{
            padding: "0.75rem",
            textAlign: "center",
            background: stats?.todayCompleted 
              ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
              : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
          }}
        >
          <Flame style={{ 
            width: 20, 
            height: 20, 
            color: stats?.todayCompleted ? "#d97706" : "#9ca3af", 
            margin: "0 auto 0.25rem" 
          }} />
          <p style={{ 
            fontSize: "1.25rem", 
            fontWeight: 700, 
            color: stats?.todayCompleted ? "#d97706" : "#9ca3af",
            opacity: stats?.todayCompleted ? 1 : 0.6,
          }}>
            {stats?.todayCompleted 
              ? (stats?.streak || 0)
              : (stats?.yesterdayCompleted ? (stats?.streak || 0) : 0)}
          </p>
          <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Day Streak</p>
        </div>

        <div
          className="client-card"
          style={{
            padding: "0.75rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
          }}
        >
          <Clock style={{ width: 20, height: 20, color: "#3b82f6", margin: "0 auto 0.25rem" }} />
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#3b82f6" }}>
            {stats?.totalDuration || 0}
          </p>
          <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Total Mins</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="client-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
        {/* Month Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={prevMonth}
            style={{
              padding: "0.5rem",
              background: "var(--bg-secondary)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>
          <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            style={{
              padding: "0.5rem",
              background: "var(--bg-secondary)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <ChevronRight style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Day Headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.25rem",
            marginBottom: "0.5rem",
          }}
        >
          {DAYS.map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                padding: "0.25rem",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.25rem",
          }}
        >
          {calendarDays.map((dayData, index) => (
            <button
              key={index}
              onClick={() => dayData && !dayData.isFuture && setSelectedDate(dayData.date)}
              disabled={!dayData || dayData.isFuture}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: dayData?.isToday
                  ? "var(--brand-primary)"
                  : selectedDate === dayData?.date
                  ? "var(--brand-primary-light)"
                  : dayData?.log
                  ? `${getStatusColor(dayData.log.status)}20`
                  : "transparent",
                border: dayData?.log
                  ? `2px solid ${getStatusColor(dayData.log.status)}`
                  : "1px solid var(--border-color)",
                borderRadius: "8px",
                cursor: dayData && !dayData.isFuture ? "pointer" : "default",
                fontSize: "0.85rem",
                fontWeight: dayData?.isToday ? 700 : 500,
                color: dayData?.isToday 
                  ? "white" 
                  : dayData?.isFuture 
                  ? "#d1d5db" 
                  : "inherit",
                opacity: dayData?.isFuture ? 0.4 : 1,
              }}
            >
              {dayData?.day}
              {dayData?.log && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: getStatusColor(dayData.log.status),
                    marginTop: "2px",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "1rem",
            fontSize: "0.7rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
            <span>Completed</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
            <span>Partial</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
            <span>Missed</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="client-card" style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {selectedLog ? (
            <>
              {/* Status Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: `${getStatusColor(selectedLog.status)}20`,
                  borderRadius: "20px",
                  marginBottom: "1rem",
                }}
              >
                {(() => {
                  const StatusIcon = getStatusIcon(selectedLog.status);
                  return StatusIcon ? (
                    <StatusIcon style={{ width: 16, height: 16, color: getStatusColor(selectedLog.status) }} />
                  ) : null;
                })()}
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: getStatusColor(selectedLog.status),
                    textTransform: "capitalize",
                  }}
                >
                  {selectedLog.status?.replace(/_/g, " ") || "Scheduled"}
                </span>
              </div>

              {/* Workout Info */}
              <div
                style={{
                  padding: "0.75rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <Dumbbell style={{ width: 18, height: 18, color: "var(--brand-primary)" }} />
                  <span style={{ fontWeight: 600 }}>
                    {selectedLog.workoutName ||
                      (typeof selectedLog.workoutPlanId === "string" ? undefined : selectedLog.workoutPlanId?.name) ||
                      "Workout"}
                  </span>
                </div>
                {selectedLog.actualDuration && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <Clock style={{ width: 14, height: 14 }} />
                    <span>{selectedLog.actualDuration} minutes</span>
                  </div>
                )}
              </div>

              {/* Exercise Summary */}
              {selectedLog.exerciseLogs && selectedLog.exerciseLogs.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    Exercises ({selectedLog.exerciseLogs.length})
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedLog.exerciseLogs.map((exercise, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.5rem 0.75rem",
                          border: "1px solid var(--border-color)",
                          borderRadius: "8px",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem" }}>{exercise.exerciseName}</span>
                        {exercise.completed ? (
                          <CheckCircle2 style={{ width: 18, height: 18, color: "#22c55e" }} />
                        ) : (
                          <XCircle style={{ width: 18, height: 18, color: "#ef4444" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.clientNotes && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "#fef3c7",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                  }}
                >
                  <strong>Notes:</strong> {selectedLog.clientNotes}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                No workout data for this day
              </p>
              <Link
                href="/client/workouts/today"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  background: "var(--brand-primary)",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Start Today&apos;s Workout
                <ChevronRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="client-card" style={{ padding: "3rem", textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #e5e7eb",
              borderTopColor: "#16a34a",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "var(--text-secondary)" }}>Loading workout history...</p>
        </div>
      )}

      {!isLoading && logs.length === 0 && (
        <div className="client-card" style={{ padding: "3rem", textAlign: "center" }}>
          <Calendar style={{ width: 48, height: 48, color: "#d1d5db", margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No Workout History Yet
          </h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Start completing workouts to see your progress here!
          </p>
          <Link
            href="/client/workouts/today"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "var(--brand-primary)",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Start Today&apos;s Workout
            <ChevronRight style={{ width: 18, height: 18 }} />
          </Link>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
