"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Users, UserCheck } from "lucide-react";
import Link from "next/link";

type UserType = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
};

type ApiResponse = {
  data: UserType[];
  pagination: { total: number; page: number; totalPages: number };
};

const fetchUsers = async (role: string, page = 1, search = ""): Promise<ApiResponse> => {
  const params = new URLSearchParams();
  params.append("role", role);
  params.append("page", page.toString());
  if (search.trim()) {
    params.append("search", search.trim());
  }
  const res = await api.get(`/admin/users?${params.toString()}`);
  return res.data;
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const queryClient = useQueryClient();

  // Separate pagination for coaches and clients
  const [pageCoaches, setPageCoaches] = useState(1);
  const [pageClients, setPageClients] = useState(1);

  // Debounce search so we don't spam the API on every keypress
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const {
    data: coachesData = { data: [], pagination: { total: 0, page: 1, totalPages: 1 } },
    isLoading: loadingCoaches,
    error: errorCoaches,
  } = useQuery({
    queryKey: ["adminUsers", "coach", pageCoaches, debouncedSearch],
    queryFn: () => fetchUsers("coach", pageCoaches, debouncedSearch),
  });

  const {
    data: clientsData = { data: [], pagination: { total: 0, page: 1, totalPages: 1 } },
    isLoading: loadingClients,
    error: errorClients,
  } = useQuery({
    queryKey: ["adminUsers", "client", pageClients, debouncedSearch],
    queryFn: () => fetchUsers("client", pageClients, debouncedSearch),
  });

  const coaches: UserType[] = coachesData.data ?? [];
  const clients: UserType[] = clientsData.data ?? [];
  const coachesPagination = coachesData.pagination;
  const clientsPagination = clientsData.pagination;

  const toggleStatus = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/users/${id}/status`),
    onSuccess: () => {
      toast.success("User status updated");
      // Invalidate both role sections
      queryClient.invalidateQueries({ queryKey: ["adminUsers"], exact: false });
    },
    onError: () => toast.error("Failed to update status"),
  });

  return (
    <div>
      <header className="admin-page-header">
        <h1 className="admin-page-header__title">Users</h1>
        <p className="admin-page-header__subtitle">
          Manage all coaches and clients, and control their active status.
        </p>
        <div style={{ marginTop: "0.75rem", maxWidth: 360 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Reset pagination when starting a new search
              setPageCoaches(1);
              setPageClients(1);
            }}
            placeholder="Search by name or email..."
            className="admin-search-input"
            style={{ width: "100%", padding: "0.5rem 0.75rem" }}
          />
        </div>
      </header>

      {/* Coaches Section */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 className="admin-card__label" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textTransform: "none" }}>
          <UserCheck className="admin-card__icon" /> Coaches
        </h2>
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {errorCoaches && (
                  <tr>
                    <td colSpan={4} style={{ padding: "0.75rem", textAlign: "center", color: "#dc2626" }}>
                      Failed to load coaches
                    </td>
                  </tr>
                )}
                {coaches.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#dbeafe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <UserCheck size={20} style={{ color: "#2563eb" }} />
                        </div>
                        <span>{u.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: "#6b7280" }}>{u.email}</td>
                    <td>
                      <span className={u.isActive ? "badge badge--success" : "badge badge--danger"}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <Link href={`/admin/coaches/${u._id}`} className="btn btn--primary" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
                          View Profile
                        </Link>
                        <button
                          onClick={() => toggleStatus.mutate(u._id)}
                          className="btn btn--outline"
                          style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
                          disabled={toggleStatus.isPending}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loadingCoaches && coaches.length === 0 && !errorCoaches && (
                  <tr>
                    <td colSpan={4} style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                      No coaches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <div>
              Page {coachesPagination.page} of {coachesPagination.totalPages}
            </div>
            <div className="admin-pagination__actions">
              <button
                disabled={coachesPagination.page <= 1}
                onClick={() => setPageCoaches((p) => Math.max(1, p - 1))}
                className="btn btn--outline"
              >
                Prev
              </button>
              <button
                disabled={coachesPagination.page >= coachesPagination.totalPages}
                onClick={() => setPageCoaches((p) => Math.min(coachesPagination.totalPages, p + 1))}
                className="btn btn--outline"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section>
        <h2 className="admin-card__label" style={{ textTransform: "none" }}>Clients</h2>
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {errorClients && (
                  <tr>
                    <td colSpan={4} style={{ padding: "0.75rem", textAlign: "center", color: "#dc2626" }}>
                      Failed to load clients
                    </td>
                  </tr>
                )}
                {clients.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#e0f2fe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <Users size={20} style={{ color: "#0284c7" }} />
                        </div>
                        <span>{u.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: "#6b7280" }}>{u.email}</td>
                    <td>
                      <span className={u.isActive ? "badge badge--success" : "badge badge--danger"}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <Link href={`/admin/clients/${u._id}`} className="btn btn--primary" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
                          View Profile
                        </Link>
                        <button
                          onClick={() => toggleStatus.mutate(u._id)}
                          className="btn btn--outline"
                          style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
                          disabled={toggleStatus.isPending}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loadingClients && clients.length === 0 && !errorClients && (
                  <tr>
                    <td colSpan={4} style={{ padding: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <div>
              Page {clientsPagination.page} of {clientsPagination.totalPages}
            </div>
            <div className="admin-pagination__actions">
              <button
                disabled={clientsPagination.page <= 1}
                onClick={() => setPageClients((p) => Math.max(1, p - 1))}
                className="btn btn--outline"
              >
                Prev
              </button>
              <button
                disabled={clientsPagination.page >= clientsPagination.totalPages}
                onClick={() => setPageClients((p) => Math.min(clientsPagination.totalPages, p + 1))}
                className="btn btn--outline"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
