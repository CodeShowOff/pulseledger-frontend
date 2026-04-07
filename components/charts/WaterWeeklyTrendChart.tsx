"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WaterTrendPoint = {
  date: string;
  dayLabel: string;
  amountValue: number;
  goalValue: number;
};

interface WaterWeeklyTrendChartProps {
  data: WaterTrendPoint[];
}

export default function WaterWeeklyTrendChart({ data }: WaterWeeklyTrendChartProps) {
  return (
    <div className="h-[330px] w-full rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50/70 to-white p-2 sm:p-3">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 4 }}>
          <defs>
            <linearGradient id="waterAmountFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="waterAmountStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="dayLabel"
            tickLine={false}
            axisLine={{ stroke: "#cbd5e1" }}
            interval={0}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            domain={[0, "auto"]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(value) => Number(value ?? 0).toFixed(1)}
          />
          <Tooltip
            cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
            }}
            formatter={(value: number | string) => `${Number(value ?? 0).toFixed(1)}L`}
            labelFormatter={(label) => {
              const matched = data.find((point) => point.dayLabel === label);
              const date = new Date(matched?.date ?? String(label));
              if (Number.isNaN(date.getTime())) return String(label);
              return date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              });
            }}
          />

          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: "0.75rem", paddingBottom: "6px" }}
          />

          <Area
            type="monotone"
            dataKey="amountValue"
            stroke="none"
            fill="url(#waterAmountFill)"
            legendType="none"
          />
          <Line
            type="monotone"
            dataKey="amountValue"
            stroke="url(#waterAmountStroke)"
            strokeWidth={2.8}
            dot={{ fill: "#0ea5e9", r: 4, stroke: "#ffffff", strokeWidth: 1.5 }}
            activeDot={{ r: 6, fill: "#ffffff", stroke: "#0ea5e9", strokeWidth: 2 }}
            name="Amount (L)"
          />
          <Line
            type="monotone"
            dataKey="goalValue"
            stroke="#10b981"
            strokeWidth={2.2}
            strokeDasharray="6 6"
            dot={false}
            activeDot={{ r: 5, fill: "#10b981" }}
            name="Goal (L)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
