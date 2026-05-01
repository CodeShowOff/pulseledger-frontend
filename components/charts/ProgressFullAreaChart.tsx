"use client";

import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FullChartPoint = {
  isoDate?: string;
  [key: string]: string | number | null | undefined;
};

interface ProgressFullAreaChartProps {
  data: FullChartPoint[];
  chartId: string;
  dataKey: string;
  color: string;
  primaryName?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  secondaryName?: string;
  chartHeight: number;
  tickInterval: number;
  yAxisDomain: [number, number];
}

export default function ProgressFullAreaChart({
  data,
  chartId,
  dataKey,
  color,
  primaryName,
  secondaryDataKey,
  secondaryColor,
  secondaryName,
  chartHeight,
  tickInterval,
  yAxisDomain,
}: ProgressFullAreaChartProps) {
  const isDualSeries = Boolean(secondaryDataKey && secondaryColor);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
        <defs>
          <linearGradient id={`gradient-full-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="isoDate"
          stroke="#64748b"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={tickInterval}
          tickFormatter={(value: string) => {
            try {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                ...(data.length > 30 ? { year: "2-digit" } : {}),
              });
            } catch {
              return value;
            }
          }}
          style={{ fontSize: "0.7rem" }}
        />
        <YAxis
          stroke="#64748b"
          style={{ fontSize: "0.75rem" }}
          width={52}
          allowDecimals
          domain={yAxisDomain}
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
              year: "numeric",
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
            strokeWidth={2}
            fill={`url(#gradient-full-${chartId})`}
            baseValue="dataMin"
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
