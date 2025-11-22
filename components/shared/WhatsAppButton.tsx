// src/components/common/WhatsAppButton.tsx
"use client";

import React, { useCallback } from "react";

function normalizeForWa(number?: string | null) {
  if (!number) return null;
  // remove spaces, parentheses, dashes, plus sign
  return number.replace(/[^\d]/g, "");
}

type Props = {
  phone?: string | null; // E.164 ideally e.g. "+919876543210"
  prefill?: string; // optional message
  label?: string;
  className?: string;
};

const WhatsAppButton = React.memo(function WhatsAppButton({ phone, prefill = "", label = "WhatsApp", className = "" }: Props) {
  const handleClick = useCallback(() => {
    const cleaned = normalizeForWa(phone);
    if (!cleaned) {
      alert("Phone number not available");
      return;
    }
    const text = encodeURIComponent(prefill);
    const url = `https://wa.me/${cleaned}${prefill ? `?text=${text}` : ""}`;
    window.open(url, "_blank", "noreferrer");
  }, [phone, prefill]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md bg-green-600 text-white ${className}`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.52 3.48A11.86 11.86 0 0012 .25a11.9 11.9 0 00-10.43 6.16 11.4 11.4 0 00-1 4.42A11.85 11.85 0 007 21.75V24l3.01-1.24A11.82 11.82 0 0012 23.25c5.33 0 9.78-3.98 10.5-9.25a11.37 11.37 0 00-2-10.52z" />
      </svg>
      <span>{label}</span>
    </button>
  );
});

export default WhatsAppButton;
