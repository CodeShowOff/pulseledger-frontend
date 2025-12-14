"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import Link from "next/link";
import React, { useMemo, useState } from "react";

type Voucher = {
  _id: string;
  code: string;
  name: string;
  discountPercent: number;
  appliesToAllClients: boolean;
  isActive: boolean;
  validFrom?: string | null;
  validTo?: string | null;
};

export default function CoachVouchersPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Voucher | null>(null);

  const vouchersQuery = useQuery<{ success: boolean; data: Voucher[] }>({
    queryKey: ["coachVouchers"],
    queryFn: async () => {
      const res = await api.get("/vouchers/coach");
      return res.data;
    },
  });

  const toggleVoucherMutation = useMutation({
    mutationFn: async (voucher: Voucher) => {
      await api.patch(`/vouchers/${voucher._id}`, { isActive: !voucher.isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachVouchers"] });
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: async (voucher: Voucher) => {
      await api.delete(`/vouchers/${voucher._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachVouchers"] });
    },
  });

  const formatDateInput = (value?: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    // yyyy-mm-dd
    return d.toISOString().slice(0, 10);
  };

  const EditValidityModal = ({ voucher, onClose }: { voucher: Voucher; onClose: () => void }) => {
    const [isActive, setIsActive] = useState(!!voucher.isActive);
    const [validFrom, setValidFrom] = useState<string>(formatDateInput(voucher.validFrom));
    const [validTo, setValidTo] = useState<string>(formatDateInput(voucher.validTo));

    const patchMutation = useMutation({
      mutationFn: async () => {
        const payload: Record<string, any> = { isActive };
        if (validFrom) payload.validFrom = new Date(validFrom);
        if (validTo) payload.validTo = new Date(validTo);
        await api.patch(`/vouchers/${voucher._id}`, payload);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["coachVouchers"] });
        onClose();
      },
    });

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white w-full max-w-md rounded-md shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Edit Voucher</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input id="ev_isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <label htmlFor="ev_isActive" className="text-sm">Active</label>
            </div>
            <div>
              <label className="block text-sm font-medium">Valid From</label>
              <input type="date" className="mt-1 w-full rounded border p-2" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Valid To</label>
              <input type="date" className="mt-1 w-full rounded border p-2" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="button" disabled={patchMutation.status === "pending"} onClick={() => patchMutation.mutate()} className="px-4 py-2 rounded bg-blue-600 text-white">
              {patchMutation.status === "pending" ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <section className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 className="admin-page-header__title coach-page-header__title">Vouchers</h1>
          </div>
          <div>
            <Link href="/coach/vouchers/create" className="btn btn--primary">Create Voucher</Link>
          </div>
        </div>
      </section>

      <div className="admin-card">
        {vouchersQuery.isLoading ? (
          <p className="admin-page-header__subtitle">Loading vouchers...</p>
        ) : vouchersQuery.data?.data?.length ? (
          <div className="admin-card-grid" style={{ rowGap: "0.75rem" }}>
            {vouchersQuery.data.data.map((v) => (
              <div key={v._id} className="admin-card" style={{ padding: "0.75rem" }}>
                <p className="admin-card__title">{v.name}</p>
                <p className="admin-page-header__subtitle">Code: {v.code}</p>
                <p className="admin-page-header__subtitle">Discount: {v.discountPercent}%</p>
                <p className="admin-page-header__subtitle">
                  {v.appliesToAllClients ? "Applies to all clients" : "Specific clients"}
                </p>
                <p
                  className="admin-page-header__subtitle"
                  style={{ color: v.isActive ? "#059669" : "#dc2626", fontWeight: 500 }}
                >
                  {v.isActive ? "Active" : "Inactive"}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="btn btn--outline"
                    disabled={toggleVoucherMutation.status === "pending"}
                    onClick={() => toggleVoucherMutation.mutate(v)}
                  >
                    {v.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setEditing(v)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger"
                    disabled={deleteVoucherMutation.status === "pending"}
                    onClick={() => {
                      if (confirm(`Delete voucher ${v.code}? This cannot be undone.`)) {
                        deleteVoucherMutation.mutate(v);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-page-header__subtitle">No vouchers created yet.</p>
        )}
      </div>

      {editing && (
        <EditValidityModal voucher={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
