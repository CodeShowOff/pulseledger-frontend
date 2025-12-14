"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Simple types for clients and API responses
 type CoachClient = {
  _id: string;
  fullName: string;
  email: string;
};

export default function CoachCreateVoucherPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    code: "",
    name: "",
    discountPercent: 10,
    appliesToAllClients: true,
    clientIds: [] as string[],
  });
  const [validFrom, setValidFrom] = useState<string>("");
  const [validTo, setValidTo] = useState<string>("");

  const [clientSearch, setClientSearch] = useState("");
  const [page, setPage] = useState(1);

  const coachClientsQuery = useQuery<{ data: CoachClient[]; pagination?: { page: number; totalPages: number } }>(
    {
      queryKey: ["coachClientsForVouchers", page, clientSearch],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (clientSearch) params.set("search", clientSearch);
        const res = await api.get(`/coach/clients?${params.toString()}`);
        return res.data;
      },
    }
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        code: form.code,
        name: form.name,
        discountPercent: form.discountPercent,
        appliesToAllClients: form.appliesToAllClients,
      };
      if (!form.appliesToAllClients) payload.clientIds = form.clientIds;
      if (validFrom) payload.validFrom = new Date(validFrom);
      if (validTo) payload.validTo = new Date(validTo);
      await api.post("/vouchers", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachVouchers"] });
      // Return to products page where vouchers are listed
      router.push("/coach/products");
    },
  });

  return (
    <div className="admin-page">
      <section className="admin-page-header">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="admin-page-header__title">Create Voucher</h1>
          </div>
          <Link href="/coach/products" className="btn btn--outline">Back</Link>
        </div>
      </section>

      <div className="admin-card max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="admin-card__label">Voucher Code</label>
            <input
              className="auth-form__input"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="admin-card__label">Name</label>
            <input
              className="auth-form__input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="admin-card__label">Discount (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              className="auth-form__input"
              value={form.discountPercent}
              onChange={(e) => setForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="appliesAll"
              type="checkbox"
              checked={form.appliesToAllClients}
              onChange={(e) => setForm((f) => ({ ...f, appliesToAllClients: e.target.checked }))}
            />
            <label htmlFor="appliesAll" className="text-sm">Apply to all current clients</label>
          </div>

          {!form.appliesToAllClients && (
            <div className="space-y-2 border rounded p-3">
              <div>
                <label className="admin-card__label">Search clients</label>
                <input
                  className="auth-form__input"
                  placeholder="Search by name or email"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="max-h-64 overflow-y-auto border rounded">
                {coachClientsQuery.isLoading ? (
                  <p className="p-2 text-sm text-gray-500">Loading clients...</p>
                ) : coachClientsQuery.data?.data?.length ? (
                  coachClientsQuery.data.data.map((c) => {
                    const checked = form.clientIds.includes(c._id);
                    return (
                      <label key={c._id} className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setForm((f) => ({
                              ...f,
                              clientIds: checked ? f.clientIds.filter((id) => id !== c._id) : [...f.clientIds, c._id],
                            }));
                          }}
                        />
                        <span>
                          {c.fullName} <span className="text-gray-500">({c.email})</span>
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="p-2 text-sm text-gray-500">No clients found.</p>
                )}
              </div>

              {coachClientsQuery.data?.pagination && (
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <span>Page {coachClientsQuery.data.pagination.page} of {coachClientsQuery.data.pagination.totalPages}</span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      className="px-2 py-1 border rounded disabled:opacity-50"
                      disabled={coachClientsQuery.data.pagination.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 border rounded disabled:opacity-50"
                      disabled={coachClientsQuery.data.pagination.page >= coachClientsQuery.data.pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Select one or more clients. Only selected clients will see and use this voucher.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="admin-card__label">Valid From</label>
              <input
                type="date"
                className="auth-form__input"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-card__label">Valid To</label>
              <input
                type="date"
                className="auth-form__input"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Link href="/coach/products" className="btn btn--outline">Cancel</Link>
            <button type="submit" disabled={createMutation.status === "pending"} className="btn btn--primary">
              {createMutation.status === "pending" ? "Creating..." : "Create Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
