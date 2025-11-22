"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function AdminCoachDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [clientsPage, setClientsPage] = useState(1);
  const [plansPage, setPlansPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);

  const { data: coach, isLoading: loadingCoach, error: coachError } = useQuery({
    queryKey: ["adminCoach", id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}`);
      const userData = res.data.data;
      // Ensure we're only viewing coach data
      if (userData?.role !== "coach") {
        throw new Error("Invalid user type");
      }
      return userData;
    },
    enabled: Boolean(id),
    retry: false,
  });

  const { data: allClientsData, isLoading: loadingClients } = useQuery({
    queryKey: ["adminAllClients"],
    queryFn: async () => {
      const res = await api.get(`/admin/users?role=client&limit=500`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  // Filter clients for this coach
  const coachClients = allClientsData?.data?.filter((client: any) => 
    client.coachId === id || client.coachId?._id === id
  ) || [];
  const clientsPerPage = 10;
  const clientsStart = (clientsPage - 1) * clientsPerPage;
  const clients = coachClients.slice(clientsStart, clientsStart + clientsPerPage);
  const clientsPagination = {
    page: clientsPage,
    totalPages: Math.ceil(coachClients.length / clientsPerPage),
    total: coachClients.length
  };

  const { data: plansData, isLoading: loadingPlans } = useQuery({
    queryKey: ["adminCoachPlans", id, plansPage],
    queryFn: async () => {
      const res = await api.get(`/admin/plans?coachId=${id}&page=${plansPage}&limit=10`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["adminCoachProducts", id, productsPage],
    queryFn: async () => {
      const res = await api.get(`/admin/products?coachId=${id}&page=${productsPage}&limit=10`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString();
  };

  if (loadingCoach) return <p>Loading coach details...</p>;
  if (coachError) {
    return (
      <div className="admin-card">
        <p className="admin-page-header__subtitle" style={{ color: "#dc2626" }}>
          {coachError instanceof Error && coachError.message === "Invalid user type" 
            ? "Invalid user type. This page is for coaches only."
            : "Access denied or coach not found."}
        </p>
        <Link href="/admin/users" className="btn btn--outline" style={{ marginTop: "1rem" }}>
          ← Back to Users
        </Link>
      </div>
    );
  }
  if (!coach)
    return (
      <div className="admin-card">
        <p className="admin-page-header__subtitle">Coach not found.</p>
        <Link href="/admin/users" className="btn btn--outline" style={{ marginTop: "1rem" }}>
          ← Back to Users
        </Link>
      </div>
    );

  const plans = plansData?.data || [];
  const plansPagination = plansData?.pagination;
  const products = productsData?.data || [];
  const productsPagination = productsData?.pagination;

  return (
    <div>
      <section className="admin-page-header">
        <div className="admin-page-header__actions" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 className="admin-page-header__title">
              Coach Profile
            </h1>
            <p className="admin-page-header__subtitle">
              Complete profile and business overview for {coach.fullName}
            </p>
          </div>
          <Link href="/admin/users" className="btn btn--outline">
            ← Back to Users
          </Link>
        </div>
      </section>

      {/* Profile Photo & Basic Info */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          {coach.avatarUrl ? (
            <Image
              src={coach.avatarUrl}
              alt={coach.fullName}
              width={120}
              height={120}
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #e5e7eb",
                filter: "brightness(1.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: "600",
                color: "#6b7280",
              }}
            >
              {coach.fullName?.charAt(0)?.toUpperCase() || "C"}
            </div>
          )}
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h2 className="admin-card__title" style={{ marginBottom: "0.5rem" }}>
              {coach.fullName}
            </h2>
            <p className="admin-page-header__subtitle">{coach.email}</p>
            <p className="admin-page-header__subtitle">Phone: {coach.phone || "-"}</p>
            {coach.whatsappNumber && (
              <p className="admin-page-header__subtitle">WhatsApp: {coach.whatsappNumber}</p>
            )}
            {coach.referralCode && (
              <p className="admin-page-header__subtitle">Referral Code: <span style={{ fontWeight: "600" }}>{coach.referralCode}</span></p>
            )}
            <p className="admin-page-header__subtitle" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
              Member since: {formatDate(coach.createdAt)}
            </p>
            <p className="admin-page-header__subtitle" style={{ fontSize: "0.85rem" }}>
              Status: <span className={coach.isActive ? "badge badge--success" : "badge badge--danger"}>{coach.isActive ? "Active" : "Inactive"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card-grid" style={{ alignItems: "flex-start", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {/* Professional Information */}
        <div className="admin-card">
          <h2 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
            Professional Information
          </h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <div>
              <p className="admin-card__label">Specialization</p>
              <p className="admin-page-header__subtitle">{coach.specialization || "-"}</p>
            </div>
            <div>
              <p className="admin-card__label">Experience</p>
              <p className="admin-page-header__subtitle">{coach.experienceYears ? `${coach.experienceYears} years` : "-"}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="admin-card">
          <h2 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
            Address
          </h2>
          {coach.address && (coach.address.line1 || coach.address.city || coach.address.state) ? (
            <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.9rem" }}>
              {coach.address.phoneNumber && <p>{coach.address.phoneNumber}</p>}
              {coach.address.line1 && <p>{coach.address.line1}</p>}
              {coach.address.line2 && <p>{coach.address.line2}</p>}
              {coach.address.neighborhood && <p>{coach.address.neighborhood}</p>}
              <p>
                {[coach.address.city, coach.address.state, coach.address.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {coach.address.country && <p>{coach.address.country}</p>}
            </div>
          ) : (
            <p className="admin-page-header__subtitle">No address provided</p>
          )}
        </div>

        {/* Statistics */}
        <div className="admin-card">
          <h2 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
            Statistics
          </h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <div>
              <p className="admin-card__label">Total Clients</p>
              <p className="admin-card__value">{coachClients.length}</p>
            </div>
            <div>
              <p className="admin-card__label">Total Plans</p>
              <p className="admin-card__value">{plansPagination?.total || 0}</p>
            </div>
            <div>
              <p className="admin-card__label">Total Products</p>
              <p className="admin-card__value">{productsPagination?.total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h3 className="admin-card__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Clients ({coachClients.length})
        </h3>
        {loadingClients ? (
          <p className="admin-page-header__subtitle">Loading clients...</p>
        ) : clients.length ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%", minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client: any) => (
                    <tr key={client._id}>
                      <td>{client.fullName}</td>
                      <td style={{ fontSize: "0.85rem", color: "#6b7280" }}>{client.email}</td>
                      <td>{client.phone || "-"}</td>
                      <td style={{ fontSize: "0.85rem" }}>{formatDate(client.createdAt)}</td>
                      <td>
                        <span className={client.isActive ? "badge badge--success" : "badge badge--danger"}>
                          {client.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {clientsPagination.totalPages > 1 && (
              <div className="admin-pagination" style={{ marginTop: "1rem" }}>
                <p className="admin-page-header__subtitle">
                  Page {clientsPagination.page} of {clientsPagination.totalPages}
                </p>
                <div className="admin-pagination__controls">
                  <button
                    type="button"
                    disabled={clientsPagination.page <= 1}
                    onClick={() => setClientsPage((p) => Math.max(1, p - 1))}
                    className="btn btn--outline"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={clientsPagination.page >= clientsPagination.totalPages}
                    onClick={() => setClientsPage((p) => p + 1)}
                    className="btn btn--outline"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="admin-page-header__subtitle">No clients yet.</p>
        )}
      </div>

      {/* Plans List */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h3 className="admin-card__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Plans
        </h3>
        {loadingPlans ? (
          <p className="admin-page-header__subtitle">Loading plans...</p>
        ) : plans.length ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%", minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan: any) => (
                    <tr key={plan._id}>
                      <td>{plan.title}</td>
                      <td>{plan.durationWeeks ? `${plan.durationWeeks} weeks` : "-"}</td>
                      <td>₹{plan.price?.toFixed(2) || "0.00"}</td>
                      <td style={{ fontSize: "0.85rem" }}>{formatDate(plan.createdAt)}</td>
                      <td>
                        {(() => {
                          const status: string = plan.status || "paused";
                          const isActive = status === "active";
                          const label =
                            status === "completed"
                              ? "Completed"
                              : status === "paused"
                              ? "Paused"
                              : "Active";
                          const badgeClass = isActive
                            ? "badge badge--success"
                            : status === "completed"
                            ? "badge badge--info"
                            : "badge badge--danger";

                          return <span className={badgeClass}>{label}</span>;
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {plansPagination && plansPagination.totalPages > 1 && (
              <div className="admin-pagination" style={{ marginTop: "1rem" }}>
                <p className="admin-page-header__subtitle">
                  Page {plansPagination.page} of {plansPagination.totalPages}
                </p>
                <div className="admin-pagination__controls">
                  <button
                    type="button"
                    disabled={plansPagination.page <= 1}
                    onClick={() => setPlansPage((p) => Math.max(1, p - 1))}
                    className="btn btn--outline"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={plansPagination.page >= plansPagination.totalPages}
                    onClick={() => setPlansPage((p) => p + 1)}
                    className="btn btn--outline"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="admin-page-header__subtitle">No plans yet.</p>
        )}
      </div>

      {/* Products List */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h3 className="admin-card__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Products
        </h3>
        {loadingProducts ? (
          <p className="admin-page-header__subtitle">Loading products...</p>
        ) : products.length ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%", minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>MRP</th>
                    <th>Price</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.category || "-"}</td>
                      <td>₹{product.mrp?.toFixed(2) || "0.00"}</td>
                      <td>₹{product.price?.toFixed(2) || "0.00"}</td>
                      <td style={{ fontSize: "0.85rem" }}>{formatDate(product.createdAt)}</td>
                      <td>
                        <span className={product.isActive ? "badge badge--success" : "badge badge--danger"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {productsPagination && productsPagination.totalPages > 1 && (
              <div className="admin-pagination" style={{ marginTop: "1rem" }}>
                <p className="admin-page-header__subtitle">
                  Page {productsPagination.page} of {productsPagination.totalPages}
                </p>
                <div className="admin-pagination__controls">
                  <button
                    type="button"
                    disabled={productsPagination.page <= 1}
                    onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                    className="btn btn--outline"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={productsPagination.page >= productsPagination.totalPages}
                    onClick={() => setProductsPage((p) => p + 1)}
                    className="btn btn--outline"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="admin-page-header__subtitle">No products yet.</p>
        )}
      </div>
    </div>
  );
}
