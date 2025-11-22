"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner"; 
import styles from "./coach-notifications.module.css";

type Client = { _id: string; name?: string; email?: string };
type CoachNotificationMode = "allClients" | "specific";

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
        const res = await api.get("/coach/clients");
        if (!ignore) setClients(res.data?.data || []);
      } catch (err) {
        toast.error("Failed to load clients");
      } finally {
        setLoadingClients(false);
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
    return clients.filter(c => (c.name || c.email || "").toLowerCase().includes(q));
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
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  const titlePct = Math.min(100, Math.round((title.length / TITLE_MAX) * 100));
  const messagePct = Math.min(100, Math.round((message.length / MESSAGE_MAX) * 100));

  return (
    <div className={styles.wrapper}>
      <section className={styles.header}>
        <h1 className={styles.title}>Send Notification</h1>
        <p className={styles.subtitle}>Notify all clients or choose specific clients.</p>
      </section>

      <div className={styles.card}>
        <form onSubmit={onSubmit} className={styles.form}>
          {/* Delivery mode toggle */}
          <fieldset className={styles.modeFieldset}>
            <legend className={styles.legend}>Recipient Mode</legend>
            <div className={styles.modeRow}>
              <button
                type="button"
                onClick={() => setMode("allClients")}
                className={`${styles.modeBtn} ${mode === "allClients" ? styles.modeBtnActive : ""}`}
              >
                All my clients
              </button>
              <button
                type="button"
                onClick={() => setMode("specific")}
                className={`${styles.modeBtn} ${mode === "specific" ? styles.modeBtnActive : ""}`}
              >
                Specific clients
              </button>
              {mode === "specific" && (
                <span className={styles.selectedCount}>{selected.length} selected</span>
              )}
            </div>
          </fieldset>

          {mode === "specific" && (
            <div className={styles.clientPicker}>
              <div className={styles.clientPickerRow}>
                <input
                  placeholder="Search clients..."
                  className={styles.searchInput}
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
                <div className={styles.clientPickerActions}>
                  <button
                    type="button"
                    onClick={() => setSelected(filteredClients.map(c => c._id))}
                    disabled={!filteredClients.length}
                    className={styles.smallBtn}
                  >Select all</button>
                  <button
                    type="button"
                    onClick={() => setSelected([])}
                    disabled={!selected.length}
                    className={styles.smallBtn}
                  >Clear</button>
                </div>
              </div>
              <div className={styles.clientListWrapper}>
                {loadingClients ? (
                  <p className={styles.muted}>Loading clients...</p>
                ) : clients.length === 0 ? (
                  <p className={styles.muted}>No clients found.</p>
                ) : filteredClients.length === 0 ? (
                  <p className={styles.muted}>No matches.</p>
                ) : (
                  <ul className={styles.clientList}>
                    {filteredClients.map((c) => (
                      <li key={c._id} className={styles.clientItem}>
                        <label className={styles.clientCheckboxLabel}>
                          <input type="checkbox" checked={selected.includes(c._id)} onChange={() => onToggle(c._id)} />
                          <span className={styles.clientName}>{c.name || c.email}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className={styles.twoCol}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Title (optional)</label>
              <input
                maxLength={TITLE_MAX}
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly update"
              />
              <div className={styles.counterRow}>
                <div className={styles.counterBar}><div className={styles.counterBarFill} style={{width: `${titlePct}%`}} /></div>
                <span className={styles.counterText}>{title.length}/{TITLE_MAX}</span>
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Type</label>
              <select
                className={styles.select}
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="info">Info</option>
                <option value="order">Order</option>
                <option value="plan">Plan</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Message</label>
            <textarea
              maxLength={MESSAGE_MAX}
              className={`${styles.textarea}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message. URLs become clickable (https://example.com)."
            />
            <div className={styles.counterRow}>
              <div className={styles.counterBar}><div className={styles.counterBarFill} style={{width: `${messagePct}%`}} /></div>
              <span className={styles.counterText}>{message.length}/{MESSAGE_MAX}</span>
            </div>
            <div className={styles.hint}>{message.trim() ? "URLs will auto-link when viewed by recipients." : "Message required."}</div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              disabled={submitting || !message.trim() || (mode === "specific" && !selected.length)}
            >
              {submitting ? "Sending..." : "Send"}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                setTitle("");
                setMessage("");
                setSelected([]);
                setClientSearch("");
              }}
              disabled={submitting}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
