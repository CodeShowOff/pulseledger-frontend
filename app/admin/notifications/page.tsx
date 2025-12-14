"use client";

import React, { useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

type Role = "client" | "coach" | "admin";

function isAxiosError(error: unknown): error is { response?: { data?: { message?: string } } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  );
}

export default function AdminSendNotificationsPage() {
  const [mode, setMode] = useState<"all" | "role">("all");
  const [role, setRole] = useState<Role>("client");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "order" | "plan" | "system">("info");
  const [submitting, setSubmitting] = useState(false);

  const target = useMemo(() => (mode === "all" ? { mode } : { mode, role }), [mode, role]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return toast.error("Message is required");
    setSubmitting(true);
    try {
      await api.post("/notifications/broadcast", {
        title: title.trim() || null,
        message: message.trim(),
        type,
        target,
      });
      toast.success("Notification sent");
      setMessage("");
      setTitle("");
    } catch (err: unknown) {
      let errorMessage = "Failed to send";
      if (isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="admin-page-header">
        <h1 className="admin-page-header__title">Send Notification</h1>
        <p className="admin-page-header__subtitle">Broadcast to all users or target a role.</p>
      </section>

      <div className="admin-card">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="mode" value="all" checked={mode === "all"} onChange={() => setMode("all")} />
              <span>All users</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="mode" value="role" checked={mode === "role"} onChange={() => setMode("role")} />
              <span>By role</span>
            </label>
            {mode === "role" && (
              <select className="border rounded-md px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="client">Clients</option>
                <option value="coach">Coaches</option>
                <option value="admin">Admins</option>
              </select>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title (optional)</label>
              <input className="w-full border rounded-md px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <select className="w-full border rounded-md px-3 py-2" value={type} onChange={(e) => setType(e.target.value as "info" | "order" | "plan" | "system")}>
                <option value="info">Info</option>
                <option value="order">Order</option>
                <option value="plan">Plan</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Message</label>
            <textarea className="w-full border rounded-md px-3 py-2 min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <div className="admin-page-header__actions">
            <button className="btn btn--primary" disabled={submitting}>
              {submitting ? "Sending..." : "Send"}
            </button>
            <button type="button" className="btn btn--outline" onClick={() => { setTitle(""); setMessage(""); }} disabled={submitting}>
              Clear
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
