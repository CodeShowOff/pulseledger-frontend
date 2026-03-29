"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, Search, SendHorizontal, Users } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Client = {
  _id: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
};
type CoachNotificationMode = "allClients" | "specific";

function isAxiosError(error: unknown): error is { response?: { data?: { message?: string } } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  );
}

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function CoachSendNotificationsPage() {
  const [mode, setMode] = useState<CoachNotificationMode>("allClients");
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "order" | "plan" | "system">("info");
  const [submitting, setSubmitting] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const TITLE_MAX = 120;
  const MESSAGE_MAX = 1000;

  useEffect(() => {
    if (mode !== "specific") return;
    let ignore = false;
    (async () => {
      try {
        setLoadingClients(true);
        const res = await api.get("/coach/clients", {
          params: { page: 1, limit: 100 },
        });

        const clientList = Array.isArray(res.data?.data) ? (res.data.data as Client[]) : [];

        if (!ignore) {
          setClients(clientList);
        }
      } catch (err: unknown) {
        const errorMessage = isAxiosError(err)
          ? err.response?.data?.message || "Failed to load clients"
          : "Failed to load clients";
        toast.error(errorMessage);
      } finally {
        if (!ignore) {
          setLoadingClients(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [mode]);

  const onToggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();

    return clients.filter((client) => {
      const searchableParts = [client.fullName, client.email].filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0
      );

      return searchableParts.some((part) => part.toLowerCase().includes(q));
    });
  }, [clients, clientSearch]);

  const target = useMemo(() => {
    if (mode === "allClients") {
      return { mode: "coachClients" as const };
    }
    return { mode: "specific" as const, userIds: selected };
  }, [mode, selected]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return toast.error("Message is required");
    if (mode === "specific" && selected.length === 0) return toast.error("Select at least one client");
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
      setSelected([]);
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

  const titlePct = Math.min(100, Math.round((title.length / TITLE_MAX) * 100));
  const messagePct = Math.min(100, Math.round((message.length / MESSAGE_MAX) * 100));

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28 }}
      >
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-4 p-6 md:p-7">
            <div className="space-y-2">
              <Badge className="w-fit border-white/25 bg-white/15 text-white">Communication</Badge>
              <CardTitle className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Send notifications with precision
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm !text-white/90 md:text-base">
                Broadcast updates to all clients or target specific members with a focused message.
              </CardDescription>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-100">Recipient mode</p>
                <p className="mt-1 text-xl font-semibold">
                  {mode === "allClients" ? "All clients" : "Specific clients"}
                </p>
              </div>
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-100">Audience size</p>
                <p className="mt-1 text-xl font-semibold">
                  {mode === "specific" ? `${selected.length} selected` : "All active clients"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="h-4 w-4" />
              </span>
              Notification setup
            </CardTitle>
            <CardDescription>
              Pick recipients, write your message, and send instantly.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recipient mode
                </legend>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "allClients" ? "default" : "outline"}
                    aria-pressed={mode === "allClients"}
                    onClick={() => setMode("allClients")}
                    className={cn(
                      mode === "allClients"
                        ? "border border-indigo-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    All my clients
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "specific" ? "default" : "outline"}
                    aria-pressed={mode === "specific"}
                    onClick={() => setMode("specific")}
                    className={cn(
                      mode === "specific"
                        ? "border border-indigo-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    Specific clients
                  </Button>

                  <span
                    aria-live="polite"
                    className="ml-auto rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                  >
                    {mode === "specific" ? `${selected.length} selected` : "All clients selected"}
                  </span>
                </div>
              </fieldset>

              {mode === "specific" ? (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div>
                      <label
                        htmlFor="client-search"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Search clients
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="client-search"
                          placeholder="Search by name or email"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(filteredClients.map((c) => c._id))}
                        disabled={!filteredClients.length}
                      >
                        Select all
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected([])}
                        disabled={!selected.length}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50/70">
                    {loadingClients ? (
                      <p role="status" className="p-3 text-sm text-slate-500">
                        Loading clients...
                      </p>
                    ) : clients.length === 0 ? (
                      <p className="p-3 text-sm text-slate-500">No clients found.</p>
                    ) : filteredClients.length === 0 ? (
                      <p className="p-3 text-sm text-slate-500">No matches for your search.</p>
                    ) : (
                      <ul className="divide-y divide-slate-200">
                        {filteredClients.map((client) => {
                          const label = client.fullName || client.email || "Unknown client";
                          const secondaryEmail = client.email?.trim() || "";
                          const shouldShowSecondaryEmail =
                            secondaryEmail.length > 0 && secondaryEmail.toLowerCase() !== label.toLowerCase();

                          return (
                            <li key={client._id}>
                              <label
                                htmlFor={`client-${client._id}`}
                                className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 hover:bg-indigo-50/40"
                              >
                                <span className="flex min-w-0 items-center gap-3">
                                  <input
                                    id={`client-${client._id}`}
                                    type="checkbox"
                                    checked={selected.includes(client._id)}
                                    onChange={() => onToggle(client._id)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus-visible:ring-indigo-300"
                                  />
                                  <span className="truncate text-sm font-medium text-slate-700">{label}</span>
                                </span>
                                {shouldShowSecondaryEmail ? (
                                  <span className="hidden truncate text-xs text-slate-500 sm:inline-block">
                                    {secondaryEmail}
                                  </span>
                                ) : null}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="notification-title"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Title (optional)
                  </label>
                  <Input
                    id="notification-title"
                    maxLength={TITLE_MAX}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekly update"
                  />

                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-indigo-600 transition-all"
                        style={{ width: `${titlePct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      {title.length}/{TITLE_MAX}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="notification-type"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Type
                  </label>
                  <select
                    id="notification-type"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as "info" | "order" | "plan" | "system")
                    }
                  >
                    <option value="info">Info</option>
                    <option value="order">Order</option>
                    <option value="plan">Plan</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="notification-message"
                  className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  <MessageSquareText className="h-3.5 w-3.5" />
                  Message
                </label>
                <textarea
                  id="notification-message"
                  maxLength={MESSAGE_MAX}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your notification message. URLs become clickable (https://example.com)."
                  className="min-h-[160px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                />

                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-indigo-600 transition-all"
                      style={{ width: `${messagePct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    {message.length}/{MESSAGE_MAX}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {message.trim()
                    ? "URLs will auto-link when viewed by recipients."
                    : "Message required."}
                </p>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTitle("");
                    setMessage("");
                    setSelected([]);
                    setClientSearch("");
                  }}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  Clear
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || !message.trim() || (mode === "specific" && !selected.length)}
                  className="w-full sm:w-auto"
                >
                  <SendHorizontal className="h-4 w-4" />
                  {submitting ? "Sending..." : "Send notification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
