"use client";

import CartSummary from "@/components/client/CartSummary";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/store";

type Voucher = {
  code: string;
  name: string;
  discountPercent: number;
};

export default function MyCartPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { selectedVoucherCode, setVoucher } = useCartStore((s) => ({
    selectedVoucherCode: s.selectedVoucherCode,
    setVoucher: s.setVoucher,
  }));

  const vouchersQuery = useQuery<{ success: boolean; data: Voucher[] }>({
    queryKey: ["clientVouchers"],
    queryFn: async () => {
      const res = await api.get("/vouchers/available");
      return res.data;
    },
    staleTime: 60_000,
  });

  return (
    <div className="client-page">
      <div className="client-page__inner">
        <header
          className="client-page__header"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
            width: "100%",
            textAlign: "left",
          }}
        >
          <div>
            <h1 className="client-page__title">My Cart</h1>
            <p className="client-page__subtitle">
              Review items you have added from your coach and submit your order.
            </p>
          </div>
          {role === "client" && (
            <div style={{ minWidth: 220 }}>
              <select
                className="auth-form__input"
                value={selectedVoucherCode || ""}
                onChange={(e) => {
                  const code = e.target.value || null;
                  if (!code) {
                    setVoucher(null, null);
                    return;
                  }
                  const v = vouchersQuery.data?.data?.find((x) => x.code === code) || null;
                  setVoucher(v?.code || null, v?.discountPercent ?? null);
                }}
              >
                <option value="">Apply Voucher</option>
                {vouchersQuery.data?.data?.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.name} ({v.discountPercent}% off)
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>
        <div className="client-page__sections">
          <div className="client-card">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
