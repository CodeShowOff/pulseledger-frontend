"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EarningsTrendPoint {
  monthLabel: string;
  subscriptionEarnings: number;
  orderEarnings: number;
}

interface EarningsTrendBarChartProps {
  data: EarningsTrendPoint[];
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function EarningsTrendBarChart({ data }: EarningsTrendBarChartProps) {
  return (
    <div className="w-full min-w-0">
      <ResponsiveContainer width="100%" height={340} minWidth={0}>
        <BarChart data={data} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 8" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="monthLabel" stroke="#64748b" tick={{ fontSize: 12 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(99,102,241,0.06)" }}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 10px 24px -18px rgba(15, 23, 42, 0.5)",
            }}
            formatter={(value) => {
              const normalized = Array.isArray(value) ? value[0] : value;
              return typeof normalized === "number" ? formatCurrency(normalized) : normalized;
            }}
          />
          <Legend />
          <Bar dataKey="subscriptionEarnings" fill="#4f46e5" name="Subscription" radius={[6, 6, 0, 0]} />
          <Bar dataKey="orderEarnings" fill="#f59e0b" name="Orders" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
