"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type PublicProgressPoint = {
  week: string;
  avgBMI: number;
};

interface PublicProgressChartProps {
  data: PublicProgressPoint[];
}

export default function PublicProgressChart({ data }: PublicProgressChartProps) {
  const [isCompactScreen, setIsCompactScreen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const applyMatch = () => setIsCompactScreen(mediaQuery.matches);

    applyMatch();
    mediaQuery.addEventListener("change", applyMatch);

    return () => mediaQuery.removeEventListener("change", applyMatch);
  }, []);

  const sanitizedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [] as PublicProgressPoint[];

    return data
      .map((point, index) => {
        const rawWeek =
          typeof point?.week === "string"
            ? point.week.trim()
            : String(point?.week ?? "").trim();

        const weekMatch = rawWeek.match(/^(\d{4})-W(\d{1,2})$/);
        let weekLabel = rawWeek;

        if (weekMatch) {
          const weekNum = Number(weekMatch[2]);
          if (!Number.isFinite(weekNum) || weekNum < 1 || weekNum > 53) return null;
          weekLabel = `${weekMatch[1]}-W${weekNum}`;
        } else if (!rawWeek) {
          weekLabel = `W${index + 1}`;
        }

        const bmi =
          typeof point?.avgBMI === "number"
            ? point.avgBMI
            : Number(point?.avgBMI);

        // Keep only realistic finite BMI values to avoid chart corruption.
        if (!Number.isFinite(bmi) || bmi < 5 || bmi > 80) return null;

        return {
          week: weekLabel,
          avgBMI: Number(bmi.toFixed(1)),
        };
      })
      .filter((item): item is PublicProgressPoint => item !== null);
  }, [data]);

  const { yMin, yMax } = React.useMemo(() => {
    if (!sanitizedData.length) {
      return { yMin: 15, yMax: 30 };
    }

    const values = sanitizedData.map((point) => point.avgBMI);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;
    const pad = spread < 1 ? 0.8 : Math.max(0.6, spread * 0.2);

    const lower = Number((min - pad).toFixed(1));
    let upper = Number((max + pad).toFixed(1));

    if (upper - lower < 1) {
      upper = Number((lower + 1).toFixed(1));
    }

    return { yMin: lower, yMax: upper };
  }, [sanitizedData]);

  const chartMargin = React.useMemo(
    () =>
      isCompactScreen
        ? { top: 6, right: 2, left: -8, bottom: 6 }
        : { top: 8, right: 10, left: 2, bottom: 8 },
    [isCompactScreen]
  );

  const formatWeekTick = React.useCallback((value: string) => {
    if (typeof value !== "string") return value;
    const match = value.match(/^(\d{4})-W(\d{1,2})$/);
    if (!match) return value;
    return `W${match[2]}`;
  }, []);

  if (!sanitizedData.length) {
    return (
      <div className="cpp-progress__chart" style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          No valid progress data available.
        </p>
      </div>
    );
  }

  return (
    <div className="cpp-progress__chart">
      <ResponsiveContainer width="100%" height={isCompactScreen ? 250 : 300}>
        <AreaChart data={sanitizedData} margin={chartMargin}>
          <defs>
            <linearGradient id="colorBMIPublic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: isCompactScreen ? 11 : 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            tickMargin={isCompactScreen ? 6 : 8}
            minTickGap={isCompactScreen ? 10 : 16}
            interval="preserveStartEnd"
            padding={{ left: 0, right: 0 }}
            scale="point"
            tickFormatter={formatWeekTick}
          />
          <YAxis
            tick={{ fontSize: isCompactScreen ? 11 : 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            width={isCompactScreen ? 42 : 52}
            tickCount={4}
            domain={[yMin, yMax]}
            tickFormatter={(value) =>
              Number.isFinite(Number(value)) ? Number(value).toFixed(1) : ""
            }
          />
          <Tooltip
            formatter={(value: number | string) => {
              const bmi = Number(value);
              return Number.isFinite(bmi) ? [bmi.toFixed(1), "Avg BMI"] : ["-", "Avg BMI"];
            }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="avgBMI"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#colorBMIPublic)"
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
