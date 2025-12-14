"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface EarningsData {
  success: boolean;
  summary: {
    totalEarnings: number;
    subscriptionEarnings: number;
    orderEarnings: number;
    subscriptionCount: number;
    orderCount: number;
  };
  trend: Array<{
    month: string;
    subscriptionEarnings: number;
    orderEarnings: number;
    subscriptionCount: number;
    orderCount: number;
    totalEarnings: number;
  }>;
  subscriptions: Array<any>;
  orders: Array<any>;
}

export default function EarningsDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["coachEarnings"],
    queryFn: async () => {
      const res = await api.get("/coach/earnings");
      return res.data as EarningsData;
    },
  });

  if (isLoading) {
    return (
      <div className="admin-page-header">
        <p>Loading earnings data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "var(--admin-color-error)" }}>
        <p>Error loading earnings data</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalEarnings: 0,
    subscriptionEarnings: 0,
    orderEarnings: 0,
    subscriptionCount: 0,
    orderCount: 0,
  };

  const trend = data?.trend || [];

  return (
    <div>
      {/* Header */}
      <section className="admin-page-header">
        <h1 className="admin-page-header__title coach-page-header__title">
          💰 Earnings Dashboard
        </h1>
        <p className="admin-page-header__subtitle coach-page-header__subtitle">
          Track your income from subscriptions and product orders.
        </p>
      </section>

      {/* Summary Cards */}
      <section
        style={{
          marginTop: "1.25rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <div className="admin-card" style={{ borderLeft: "4px solid #10b981" }}>
          <p className="admin-card__label">Total Earnings</p>
          <p className="admin-card__value" style={{ color: "#10b981", fontSize: "1.8rem" }}>
            ₹{summary.totalEarnings.toFixed(2)}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--admin-color-muted)", marginTop: "0.35rem" }}>
            From subscriptions & orders
          </p>
        </div>

        <div className="admin-card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <p className="admin-card__label">Subscription Earnings</p>
          <p className="admin-card__value" style={{ color: "#3b82f6", fontSize: "1.8rem" }}>
            ₹{summary.subscriptionEarnings.toFixed(2)}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--admin-color-muted)", marginTop: "0.35rem" }}>
            {summary.subscriptionCount} active subscriptions
          </p>
        </div>

        <div className="admin-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <p className="admin-card__label">Order Earnings</p>
          <p className="admin-card__value" style={{ color: "#f59e0b", fontSize: "1.8rem" }}>
            ₹{summary.orderEarnings.toFixed(2)}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--admin-color-muted)", marginTop: "0.35rem" }}>
            {summary.orderCount} completed orders
          </p>
        </div>

        <div className="admin-card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <p className="admin-card__label">Average per Order</p>
          <p className="admin-card__value" style={{ color: "#8b5cf6", fontSize: "1.8rem" }}>
            ₹{summary.orderCount > 0 ? (summary.orderEarnings / summary.orderCount).toFixed(2) : "0"}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--admin-color-muted)", marginTop: "0.35rem" }}>
            Order average value
          </p>
        </div>
      </section>

      {/* Earnings Trend Chart */}
      {trend.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <div className="admin-card">
            <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              Earnings Trend
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number | string) => `₹${typeof value === 'number' ? value.toFixed(2) : value}`}
                />
                <Legend />
                <Bar
                  dataKey="subscriptionEarnings"
                  fill="#3b82f6"
                  name="Subscription Earnings"
                />
                <Bar dataKey="orderEarnings" fill="#f59e0b" name="Order Earnings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Summary Tables */}
      <section style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Subscription Summary */}
        <div className="admin-card">
          <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>
            Subscription Summary
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Active Subscriptions</span>
              <span style={{ color: "#3b82f6", fontWeight: "600" }}>{summary.subscriptionCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Total Revenue</span>
              <span style={{ color: "#3b82f6", fontWeight: "600" }}>₹{summary.subscriptionEarnings.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Avg per Subscription</span>
              <span style={{ color: "#3b82f6", fontWeight: "600" }}>
                ₹{summary.subscriptionCount > 0 ? (summary.subscriptionEarnings / summary.subscriptionCount).toFixed(2) : "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="admin-card">
          <h2 className="admin-page-header__title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>
            Order Summary
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Completed Orders</span>
              <span style={{ color: "#f59e0b", fontWeight: "600" }}>{summary.orderCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Total Revenue</span>
              <span style={{ color: "#f59e0b", fontWeight: "600" }}>₹{summary.orderEarnings.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Avg per Order</span>
              <span style={{ color: "#f59e0b", fontWeight: "600" }}>
                ₹{summary.orderCount > 0 ? (summary.orderEarnings / summary.orderCount).toFixed(2) : "0"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* No Data State */}
      {summary.totalEarnings === 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <div className="admin-card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontSize: "1rem", color: "#6b7280" }}>
              No earnings yet. Start by creating subscription plans and products!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
