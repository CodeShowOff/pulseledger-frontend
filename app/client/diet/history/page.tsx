// app/client/diet/history/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Flame,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Droplets,
} from "lucide-react";
import { useClientDietLogs, useClientDietStats, ClientDietLog } from "@/lib/queries/diet";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Helper function to format date in local timezone (avoids UTC conversion issues)
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DietHistoryPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get the date range for the current month view
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  // Fetch diet logs for the month
  const { data: logsData, isLoading } = useClientDietLogs({
    startDate: formatLocalDate(startOfMonth),
    endDate: formatLocalDate(endOfMonth),
    limit: 50,
  });

  // Fetch stats for the last 30 days
  const { data: stats } = useClientDietStats(30);

  const logs = logsData?.data || [];

  // Create a map of date -> log for quick lookup
  const logMap = new Map<string, ClientDietLog>();
  logs.forEach((log: ClientDietLog) => {
    const dateKey = formatLocalDate(new Date(log.date));
    logMap.set(dateKey, log);
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = formatLocalDate(today);
    
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

  const getAdherenceColor = (score?: number) => {
    if (!score) return "#e5e7eb";
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="client-page__sections">
      {/* Header */}
      <header className="client-page__header" style={{ marginBottom: "1rem" }}>
        <Link
          href="/client/diet"
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
          Back to Nutrition
        </Link>
        <h1 className="client-page__title">
          <Calendar
            style={{
              width: 28,
              height: 28,
              marginRight: "0.5rem",
              color: "#16a34a",
            }}
          />
          Nutrition History
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
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          }}
        >
          <Flame style={{ width: 20, height: 20, color: "#f59e0b", margin: "0 auto 0.25rem" }} />
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f59e0b" }}>
            {stats?.averageCalories || 0}
          </p>
          <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Avg Calories</p>
        </div>

        <div
          className="client-card"
          style={{
            padding: "0.75rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
          }}
        >
          <TrendingUp style={{ width: 20, height: 20, color: "#3b82f6", margin: "0 auto 0.25rem" }} />
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#3b82f6" }}>
            {stats?.averageAdherence || 0}%
          </p>
          <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Avg Adherence</p>
        </div>

        <div
          className="client-card"
          style={{
            padding: "0.75rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
          }}
        >
          <Droplets style={{ width: 20, height: 20, color: "#0ea5e9", margin: "0 auto 0.25rem" }} />
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0ea5e9" }}>
            {stats?.averageWaterIntake?.toFixed(1) || 0}L
          </p>
          <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Avg Water</p>
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
              disabled={!dayData || dayData?.isFuture}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: dayData?.isToday
                  ? "#16a34a"
                  : selectedDate === dayData?.date
                  ? "#dcfce7"
                  : dayData?.log
                  ? `${getAdherenceColor(dayData.log.adherenceScore)}20`
                  : "transparent",
                border: dayData?.log
                  ? `2px solid ${getAdherenceColor(dayData.log.adherenceScore)}`
                  : "1px solid var(--border-color)",
                borderRadius: "8px",
                cursor: dayData && !dayData.isFuture ? "pointer" : "default",
                fontSize: "0.85rem",
                fontWeight: dayData?.isToday ? 700 : 500,
                color: dayData?.isToday ? "white" : dayData?.isFuture ? "#9ca3af" : "inherit",
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
                    background: getAdherenceColor(dayData.log.adherenceScore),
                    marginTop: "2px",
                  }}
                />
              )}
            </button>
          ))}
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
              {/* Daily Totals */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  padding: "0.75rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "8px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "#f97316" }}>
                    {selectedLog.dailyTotals?.calories || 0}
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>kcal</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "#ef4444" }}>
                    {selectedLog.dailyTotals?.protein || 0}g
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Protein</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "#3b82f6" }}>
                    {selectedLog.dailyTotals?.carbs || 0}g
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Carbs</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "#eab308" }}>
                    {selectedLog.dailyTotals?.fat || 0}g
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280" }}>Fat</p>
                </div>
              </div>

              {/* Meals */}
              {selectedLog.meals && selectedLog.meals.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedLog.meals.map((meal, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "0.75rem",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: 500, textTransform: "capitalize" }}>
                          {meal.mealType.replace(/_/g, " ")}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {meal.time}
                        </span>
                      </div>
                      {meal.foods && meal.foods.length > 0 && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {meal.foods.map((food, i) => (
                            <span key={i}>
                              {food.foodName}
                              {i < meal.foods!.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1rem" }}>
                  No meals logged this day
                </p>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                No nutrition data logged for this day
              </p>
              <Link
                href="/client/diet/log"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Log a Meal
                <ChevronRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading history...</p>
        </div>
      )}
    </div>
  );
}
