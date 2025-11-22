"use client";

import React, { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/lib/cartStore";
import { toast } from "sonner";
import clsx from "clsx";
import { useRouter } from "next/navigation";

const currency = (value: number) => `₹${value.toFixed(2)}`;

const CartSummary = React.memo(function CartSummary() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { items, coachId, updateQuantity, removeItem, clearCart, selectedVoucherCode, selectedVoucherPercent } = useCartStore(
    (state) => ({
      items: state.items,
      coachId: state.coachId,
      updateQuantity: state.updateQuantity,
      removeItem: state.removeItem,
			clearCart: state.clearCart,
			selectedVoucherCode: state.selectedVoucherCode,
			selectedVoucherPercent: state.selectedVoucherPercent,
    })
  );

	const total = useMemo(
		() => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
		[items]
	);

	const discountAmount = useMemo(
		() =>
			selectedVoucherPercent
				? Math.round((total * selectedVoucherPercent) / 100)
				: 0,
		[total, selectedVoucherPercent]
	);

	const finalAmount = useMemo(
		() => Math.max(0, total - discountAmount),
		[total, discountAmount]
	);

  const handleCheckout = useCallback(() => {
    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }
		router.push("/client/checkout");
  }, [items.length, router]);

  return (
    <aside>
      <div className="client-card__header" style={{ marginBottom: "0.75rem" }}>
        <div>
          <p className="client-card__title">My Cart</p>
          <p className="client-card__subtitle" style={{ fontSize: "0.78rem" }}>
            {coachId
              ? "Orders are sent directly to your coach."
              : "Add products from your coach to create an order."}
          </p>
        </div>
      </div>
      {items.length === 0 ? (
				<p className="client-card__subtitle">You have not added any products yet.</p>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
					<div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
						{items.map((item) => (
							<div
								key={item.productId}
								className="client-card"
								style={{ boxShadow: "none", padding: "0.75rem 0.8rem" }}
							>
								<div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
									<div>
										<p className="client-card__title" style={{ fontSize: "0.9rem" }}>
											{item.name}
										</p>
										<p className="client-card__subtitle" style={{ fontSize: "0.78rem" }}>
											{currency(item.price)}
										</p>
										<div
											style={{
												marginTop: "0.45rem",
												display: "flex",
												alignItems: "center",
												gap: "0.5rem",
												fontSize: "0.78rem",
											}}
										>
											<span style={{ color: "#6b7280" }}>Qty:</span>
											<div
												style={{
													display: "inline-flex",
													alignItems: "center",
													borderRadius: "999px",
													border: "1px solid #e5e7eb",
													overflow: "hidden",
												}}
											>
												<button
													type="button"
													style={{
														padding: "0.15rem 0.55rem",
														border: "none",
														background: "transparent",
														cursor: "pointer",
													}}
													onClick={() =>
														updateQuantity(item.productId, item.quantity - 1)
													}
													aria-label="Decrease quantity"
												>
													−
												</button>
												<span
													style={{
														padding: "0.15rem 0.65rem",
														borderLeft: "1px solid #e5e7eb",
														borderRight: "1px solid #e5e7eb",
													}}
												>
													{item.quantity}
												</span>
												<button
													type="button"
													style={{
														padding: "0.15rem 0.55rem",
														border: "none",
														background: "transparent",
														cursor: "pointer",
													}}
													onClick={() =>
														updateQuantity(item.productId, item.quantity + 1)
													}
													aria-label="Increase quantity"
												>
													+
												</button>
											</div>
											<button
												type="button"
												className="client-button client-button--danger"
												onClick={() => removeItem(item.productId)}
												style={{
													backgroundColor: "transparent",
													color: "#dc2626",
													borderColor: "transparent",
													padding: "0.2rem 0.4rem",
												}}
											>
												Remove
											</button>
										</div>
									</div>
									<div
										style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111827" }}
									>
										{currency(item.price * item.quantity)}
									</div>
								</div>
							</div>
						))}
					</div>
					<div
						style={{
							marginTop: "0.4rem",
							paddingTop: "0.6rem",
							borderTop: "1px solid #e5e7eb",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							fontSize: "0.9rem",
						}}
					>
						<span style={{ fontWeight: 500 }}>Total</span>
						<span style={{ fontWeight: 600 }}>{currency(total)}</span>
					</div>
					{selectedVoucherCode && (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 4,
								fontSize: "0.85rem",
								color: "#047857",
							}}
						>
							<span>Voucher applied: {selectedVoucherCode} ({selectedVoucherPercent}% off)</span>
							<span>Discount: -{currency(discountAmount)}</span>
						</div>
					)}
					<div
						style={{
							marginTop: "0.25rem",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							fontSize: "0.9rem",
						}}
					>
						<span style={{ fontWeight: 500 }}>Final total</span>
						<span style={{ fontWeight: 600 }}>{currency(finalAmount)}</span>
					</div>
					<button
						type="button"
						className="client-button"
						onClick={handleCheckout}
						style={{ width: "100%", marginTop: "0.4rem" }}
					>
						Checkout
					</button>
					<button
						type="button"
						className="client-button client-button--outline"
						onClick={clearCart}
						disabled={!items.length}
						style={{ width: "100%" }}
					>
						Clear Cart
					</button>
				</div>
			)}
		</aside>
	);
});

export default CartSummary;
