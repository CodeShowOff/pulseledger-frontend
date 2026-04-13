"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PreviewChartPoint = {
  isoDate?: string;
  [key: string]: string | number | null | undefined;
};

interface ProgressPreviewAreaChartProps {
  data: PreviewChartPoint[];
  chartId: string;
  dataKey: string;
  color: string;
  primaryName?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  secondaryName?: string;
}

export default function ProgressPreviewAreaChart({
  data,
  chartId,
  dataKey,
  color,
  primaryName,
  secondaryDataKey,
  secondaryColor,
  secondaryName,
}: ProgressPreviewAreaChartProps) {
  const isDualSeries = Boolean(secondaryDataKey && secondaryColor);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="isoDate"
          stroke="#64748b"
          tickFormatter={(value: string) => {
            try {
              return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            } catch {
              return value;
            }
          }}
          interval={0}
          minTickGap={0}
          allowDuplicatedCategory
          style={{ fontSize: "0.75rem" }}
        />
        <YAxis
          stroke="#64748b"
          style={{ fontSize: "0.75rem" }}
          width={35}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          labelFormatter={(value: unknown) => {
            if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) {
              return value as React.ReactNode;
            }
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
              return String(value);
            }
            return date.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }}
          labelStyle={{ color: "#1e293b", fontWeight: "600" }}
        />
        {isDualSeries ? (
          <>
            <Area
              type="monotone"
              dataKey={dataKey}
              name={primaryName ?? dataKey}
              stroke={color}
              strokeWidth={2.5}
              fill="none"
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey={secondaryDataKey!}
              name={secondaryName ?? secondaryDataKey!}
              stroke={secondaryColor!}
              strokeWidth={2.5}
              fill="none"
              dot={{ fill: secondaryColor!, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
              connectNulls={false}
            />
          </>
        ) : (
          <Area
            type="monotone"
            dataKey={dataKey}
            name={primaryName ?? dataKey}
            stroke={color}
            strokeWidth={3}
            fill={`url(#gradient-${chartId})`}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff" }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
