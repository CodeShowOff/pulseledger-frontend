"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Users, UserCheck, User, Package, ClipboardList, CreditCard, Trash2, Mail, Bug, MessageSquare, UserX, DollarSign, Settings } from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminDashboardPage() {
  type Overview = {
    totalUsers: number;
    totalCoaches: number;
    totalClients: number;
    totalProducts: number;
    totalPlans: number;
    totalSubscriptions: number;
    pendingSubscriptions: number;
  };

  const { data, isLoading, error } = useQuery<Overview>({
    queryKey: ["adminOverview"],
    queryFn: async () => {
      const res = await api.get("/admin/overview");
      return res.data.data as Overview;
    },
  });

  const queryClient = useQueryClient();
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const purgeMutation = useMutation({
    mutationFn: async () => {
      setPurgeLoading(true);
      const res = await api.post("/admin/users/purge-unverified");
      return res.data?.data as { deletedCount?: number };
    },
    onSuccess: (result) => {
      const count = result?.deletedCount ?? 0;
      toast.success(`Purged ${count} stale unverified user${count === 1 ? "" : "s"}.`);
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to purge unverified users");
    },
    onSettled: () => {
      setPurgeLoading(false);
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      setCleanupLoading(true);
      const res = await api.post("/admin/chat-cleanup");
      return res.data?.data as { deleted?: number };
    },
    onSuccess: (result) => {
      const count = result?.deleted ?? 0;
      toast.success(`Deleted ${count} old chat message${count === 1 ? "" : "s"} (older than 7 days).`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to cleanup old messages");
    },
    onSettled: () => {
      setCleanupLoading(false);
    },
  });

  if (isLoading) return <p>Loading overview...</p>;
  if (error || !data) return <p>Failed to load overview</p>;

	const stats = [
		{ label: "Total Users", value: data.totalUsers, icon: Users },
		{ label: "Coaches", value: data.totalCoaches, icon: UserCheck },
		{ label: "Clients", value: data.totalClients, icon: User },
		{ label: "Products", value: data.totalProducts, icon: Package },
		{ label: "Plans", value: data.totalPlans, icon: ClipboardList },
		{ label: "Subscriptions", value: data.totalSubscriptions, icon: CreditCard },
	];

  return (
    <div>
      <RoleGuard role="admin" />
      <header className="admin-page-header">
        <h1 className="admin-page-header__title">Dashboard</h1>
        <p className="admin-page-header__subtitle">
          High-level overview of users, products, plans and subscriptions.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => purgeMutation.mutate()}
            disabled={purgeLoading}
            className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {purgeLoading ? "Purging..." : "Purge unverified users"}
          </button>
          <button
            type="button"
            onClick={() => cleanupMutation.mutate()}
            disabled={cleanupLoading}
            className="inline-flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-60"
          >
            <MessageSquare className="h-4 w-4" />
            {cleanupLoading ? "Cleaning..." : "Delete old messages"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Purge removes unverified accounts. Delete old messages removes chat messages older than 7 days.
        </p>
      </header>

      <section className="admin-card-grid admin-card-grid--stats">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className="admin-card admin-card--stat">
            <div>
              <div className="admin-card__label">{label}</div>
              <div className="admin-card__value">{value}</div>
            </div>
            <Icon className="admin-card__icon" />
          </article>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Platform Management</h2>
        <div className="admin-card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "2rem" }}>
          <Link href="/admin/platform-subscriptions" className="admin-card" style={{ textDecoration: "none", cursor: "pointer", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Platform Subscriptions</div>
                <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>Manage coach subscription payments & approvals</p>
              </div>
              <DollarSign className="h-12 w-12" style={{ opacity: 0.8 }} />
            </div>
          </Link>
          <Link href="/admin/settings" className="admin-card" style={{ textDecoration: "none", cursor: "pointer", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "white", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Admin Settings</div>
                <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>Upload payment QR code & configure platform</p>
              </div>
              <Settings className="h-12 w-12" style={{ opacity: 0.8 }} />
            </div>
          </Link>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="admin-card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          <Link href="/admin/contact-submissions" className="admin-card admin-card--hover" style={{ textDecoration: "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <div className="admin-card__label">Contact Submissions</div>
                <p className="text-sm text-slate-500 mt-1">View messages from users</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/bug-reports" className="admin-card admin-card--hover" style={{ textDecoration: "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Bug className="h-8 w-8 text-red-500" />
              <div>
                <div className="admin-card__label">Bug Reports</div>
                <p className="text-sm text-slate-500 mt-1">Manage reported issues</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/feedback-submissions" className="admin-card admin-card--hover" style={{ textDecoration: "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <div>
                <div className="admin-card__label">Feedback</div>
                <p className="text-sm text-slate-500 mt-1">Review user feedback</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/deletion-requests" className="admin-card admin-card--hover" style={{ textDecoration: "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <UserX className="h-8 w-8 text-orange-500" />
              <div>
                <div className="admin-card__label">Deletion Requests</div>
                <p className="text-sm text-slate-500 mt-1">Review account deletion requests</p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
