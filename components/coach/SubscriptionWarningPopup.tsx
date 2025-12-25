"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { AlertCircle, X } from "lucide-react";

interface SubscriptionStatus {
  status: "trial" | "active" | "expired" | "suspended";
  isValid: boolean;
  daysRemaining: number;
  trialEndsAt: string;
  subscriptionExpiresAt: string | null;
  platformFee: number;
}

export default function SubscriptionWarningPopup() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["platformSubscription"],
    queryFn: async () => {
      const res = await api.get("/platform-subscription/status");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (!subscription) return;

    // Only show popup if 3 days or less remaining and not expired
    if (subscription.daysRemaining > 3 || subscription.status === "expired") {
      return;
    }

    // Check if we've shown the popup today
    const lastShown = localStorage.getItem("subscriptionWarningShownAt");
    const today = new Date().toDateString();

    if (lastShown === today) {
      return;
    }

    // Show popup after 2 seconds delay
    const timer = setTimeout(() => {
      setShowPopup(true);
      localStorage.setItem("subscriptionWarningShownAt", today);
    }, 2000);

    return () => clearTimeout(timer);
  }, [subscription]);

  const handlePayNow = () => {
    setShowPopup(false);
    router.push("/coach/platform-fee");
  };

  const handleRemindLater = () => {
    setShowPopup(false);
  };

  if (!showPopup || !subscription) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "1rem",
        animation: "fadeIn 0.3s ease-out",
      }}
      onClick={handleRemindLater}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "1rem",
          maxWidth: "500px",
          width: "100%",
          padding: "2rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleRemindLater}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <X size={24} color="#6b7280" />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: subscription.daysRemaining <= 1 ? "#fee2e2" : "#fef3c7",
            marginBottom: "1.5rem",
            margin: "0 auto 1.5rem",
          }}
        >
          <AlertCircle
            size={36}
            color={subscription.daysRemaining <= 1 ? "#dc2626" : "#d97706"}
          />
        </div>

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "1rem",
            color: subscription.daysRemaining <= 1 ? "#991b1b" : "#92400e",
          }}
        >
          {subscription.status === "trial" ? "Free Trial Ending Soon" : "Subscription Expiring Soon"}
        </h2>

        <p
          style={{
            fontSize: "1rem",
            textAlign: "center",
            color: "#4b5563",
            lineHeight: "1.6",
            marginBottom: "0.5rem",
          }}
        >
          Your {subscription.status === "trial" ? "free trial" : "subscription"} will expire in{" "}
          <strong style={{ color: subscription.daysRemaining <= 1 ? "#dc2626" : "#d97706", fontSize: "1.125rem" }}>
            {subscription.daysRemaining} day{subscription.daysRemaining !== 1 ? "s" : ""}
          </strong>
        </p>

        <p
          style={{
            fontSize: "0.875rem",
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "2rem",
          }}
        >
          Pay <strong>₹{subscription.platformFee}</strong> now to continue accessing PulseLedger platform without any interruption.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}>
          <button
            onClick={handlePayNow}
            className="btn btn--primary"
            style={{
              width: "100%",
              backgroundColor: subscription.daysRemaining <= 1 ? "#dc2626" : "#d97706",
              borderColor: subscription.daysRemaining <= 1 ? "#dc2626" : "#d97706",
              fontSize: "1rem",
              padding: "0.75rem 1.5rem",
            }}
          >
            Pay Now
          </button>
          <button
            onClick={handleRemindLater}
            className="btn btn--ghost"
            style={{
              width: "100%",
              fontSize: "0.875rem",
            }}
          >
            Remind Me Tomorrow
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
