"use client";

import React, { useMemo, useState } from "react";
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from "@/lib/queries/notifications";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";

const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function renderMessageWithLinks(text: string) {
  if (!text) return null;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  text.replace(urlPattern, (match, _group, offset) => {
    if (offset > lastIndex) {
      nodes.push(text.slice(lastIndex, offset));
    }

    const href = match.startsWith("http") ? match : `https://${match}`;
    nodes.push(
      <a
        key={`link-${offset}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 underline break-words"
      >
        {match}
      </a>
    );

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length ? nodes : [text];
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const { data, isLoading, isError } = useNotifications(page);
  const markAll = useMarkAllAsRead();
  const markOne = useMarkAsRead();
  const role = useAuthStore((s) => s.user?.role);

  const list = useMemo(() => {
    if (!data) return [];
    if (tab === "unread") return data.data.filter((n) => !n.readAt);
    return data.data;
  }, [data, tab]);

  return (
    <main className="client-page">
      <div className="client-page__inner">
        <header className="client-page__header">
          <div className="flex items-center gap-3">
            <h1 className="client-page__title">Notifications</h1>
            {data?.unread ? (
              <span className="client-pill client-pill--danger">{data.unread} unread</span>
            ) : null}
          </div>
          <p className="client-page__subtitle">Stay up to date with orders, plans, and system updates.</p>
        </header>

        {/* Actions + Tabs */}
        <div className="client-card">
          <div className="notification-chip-row" role="group" aria-label="Notification filters and actions">
            <button
              className={`client-button client-button--outline ${tab === "all" ? "notification-chip-row__active" : ""}`}
              onClick={() => setTab("all")}
              type="button"
            >
              All
            </button>
            <button
              className={`client-button client-button--outline ${tab === "unread" ? "notification-chip-row__active" : ""}`}
              onClick={() => setTab("unread")}
              type="button"
            >
              Unread
            </button>
            {(role === "admin" || role === "coach") && (
              <Link
                href={role === "admin" ? "/admin/notifications" : "/coach/notifications"}
                className="client-button client-button--outline notification-chip-row__cta"
              >
                Send notification
              </Link>
            )}
            <button
              className="client-button client-button--outline notification-chip-row__cta"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              type="button"
            >
              {markAll.isPending ? "Marking..." : "Mark all as read"}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <section className="client-page__sections">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="client-card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/5" />
                <div className="h-3 bg-gray-100 rounded w-4/5 mt-3" />
              </div>
            ))}
          </section>
        )}

        {isError && (
          <div className="client-card">
            <p className="text-red-600">Failed to load notifications.</p>
          </div>
        )}

        {/* Empty state */}
        {data && list.length === 0 && (
          <div className="client-card text-center">
            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-gray-100 text-gray-500 grid place-items-center">🔔</div>
            <p className="font-medium text-gray-800">No {tab === "unread" ? "unread " : ""}notifications</p>
            <p className="text-sm text-gray-500">You're all caught up. We'll let you know when something changes.</p>
          </div>
        )}

        {/* List */}
        {data && list.length > 0 && (
          <section className="client-page__sections">
            {list.map((n) => (
              <div key={n._id} className="client-card">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 h-9 w-9 grid place-items-center rounded-full client-pill--info" style={{ background: "#e0f2fe", color: "#075985" }}>
                    {n.type === "order" ? "🛒" : n.type === "plan" ? "📄" : n.type === "system" ? "⚙️" : "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{n.title || n.type.toUpperCase()}</p>
                      {!n.readAt && (
                        <span className="client-pill client-pill--success">new</span>
                      )}
                      <span className="text-xs text-gray-500 ml-auto whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 break-words whitespace-pre-wrap notification-message">
                      {renderMessageWithLinks(n.message)}
                    </p>
                    <div className="notification-item__actions">
                      {!n.readAt && (
                        <button
                          className="client-button client-button--ghost"
                          onClick={() => markOne.mutate(n._id)}
                          type="button"
                        >
                          Mark as read
                        </button>
                      )}
                      {n.meta?.orderId && (
                        <Link
                          href={`/coach/orders?id=${n.meta.orderId}`}
                          className="client-button client-button--ghost"
                        >
                          View order
                        </Link>
                      )}
                      {n.meta?.requestId && (
                        <Link
                          href={`/coach/plan-requests?id=${n.meta.requestId}`}
                          className="client-button client-button--ghost"
                        >
                          View request
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Pagination */}
        {data && data.pagination && (
          <div className="client-card">
            <div className="notification-pagination">
              <button
                className="client-button client-button--outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                type="button"
              >
                Previous
              </button>
              <div className="notification-pagination__status">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </div>
              <button
                className="client-button client-button--outline"
                onClick={() =>
                  setPage((p) => (data.pagination.page < data.pagination.totalPages ? p + 1 : p))
                }
                disabled={data.pagination.page >= data.pagination.totalPages}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
