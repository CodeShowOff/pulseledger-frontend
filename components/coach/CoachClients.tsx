"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Search, User } from "lucide-react";
import api from "@/lib/axios";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { Input } from "@/components/ui/input";
import CompactPagination from "@/components/shared/CompactPagination";
import styles from "./CoachClients.module.css";

type Client = {
  _id: string;
  fullName: string;
  avatarUrl?: string | null;
};

const CLIENTS_PER_PAGE = 20;

const fetchClients = async (search = "") => {
  const params = new URLSearchParams({ page: "1", limit: "100" });
  if (search.trim()) params.set("search", search.trim());
  const res = await api.get(`/coach/clients?${params.toString()}`);
  return res.data;
};

export default function CoachClients() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["coachClients", debouncedSearch],
    queryFn: () => fetchClients(debouncedSearch),
    placeholderData: (previousData) => previousData,
  });

  const clients: Client[] = data?.data ?? [];

  const totalPages = Math.max(1, Math.ceil(clients.length / CLIENTS_PER_PAGE));
  const paginatedClients = clients.slice(
    (currentPage - 1) * CLIENTS_PER_PAGE,
    currentPage * CLIENTS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageInfoText = useMemo(() => {
    if (!clients.length) return "No results";
    const start = (currentPage - 1) * CLIENTS_PER_PAGE + 1;
    const end = Math.min(currentPage * CLIENTS_PER_PAGE, clients.length);
    return `${start}-${end} of ${clients.length}`;
  }, [clients.length, currentPage]);

  if (isLoading && !data) {
    return (
      <div className={styles.statusCard}>
        <p className={styles.statusText}>Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.statusCard} ${styles.statusError}`}>
        <p className={styles.statusText}>Error loading clients. Please try again.</p>
      </div>
    );
  }

  return (
    <div className={styles.clientsRoot}>
      <div className={styles.listBlock}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name"
              className={styles.searchInput}
            />
            {isFetching ? (
              <span className={styles.searchStatus}>Updating...</span>
            ) : null}
          </div>
        </div>
        {clients.length ? (
          <div className={styles.pageInfoRow}>
            <span className={styles.pageText}>{pageInfoText}</span>
          </div>
        ) : null}
        <div className={styles.listShell}>
          <div className={styles.list}>
            {paginatedClients.map((client) => {
              return (
                <div
                  key={client._id}
                  className={styles.listItem}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/coach/clients/${client._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/coach/clients/${client._id}`);
                    }
                  }}
                  aria-label={`Open ${client.fullName} profile`}
                >
                  <div className={styles.avatar}>
                    {client.avatarUrl ? (
                      <Image
                        src={client.avatarUrl}
                        alt={`${client.fullName} profile`}
                        width={44}
                        height={44}
                        sizes="44px"
                        loading="lazy"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className={styles.details}>
                    <p className={styles.clientName}>{client.fullName}</p>
                  </div>
                  <div className={styles.actions}>
                    <Link
                      href={`/coach/chat?clientId=${client._id}`}
                      className={styles.chatButton}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Chat with ${client.fullName}`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!clients.length ? (
        <div className={styles.statusCard}>
          <p className={styles.statusText}>No clients match the current filters.</p>
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className={styles.paginationInner}>
          <div className={styles.pageControls}>
            <CompactPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
