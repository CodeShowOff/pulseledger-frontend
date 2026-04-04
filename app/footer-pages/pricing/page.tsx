"use client";

import React from "react";
import Link from "next/link";
import { Check, Shield, Zap, Users, TrendingUp, Calendar } from "lucide-react";

export default function PricingPage() {
  return (
    <main className="client-page footer-page">
      <div className="client-page__header">
        <h1 className="client-page__title">Platform Pricing</h1>
        <p className="client-page__subtitle">
          Client app is free to use. Coaches get 30 days free, then choose ₹99 or ₹199 per month.
        </p>
      </div>

      <div className="client-page__sections">
        <div
          className="client-card"
          style={{
            marginBottom: "1.5rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)",
            border: "1px solid #c7d2fe",
          }}
        >
          <h2 className="client-card__title" style={{ marginBottom: "0.5rem" }}>
            Client App Pricing
          </h2>
          <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
            The FitCoach client app is free for clients. Coach subscription covers platform usage.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {/* Trial Plan */}
          <div
            className="client-card"
            style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              border: "2px solid #bae6fd",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "60px",
                  height: "60px",
                  background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                  borderRadius: "50%",
                  marginBottom: "1rem",
                }}
              >
                <Zap size={28} color="#fff" />
              </div>
              <h2 className="client-card__title" style={{ marginBottom: "0.5rem" }}>
                Free Trial
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                For coaches getting started
              </p>
            </div>

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: "#1e40af" }}>
                Free
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                for 30 days
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
              {[
                "Unlimited active clients",
                "All Coach Basic features included",
                "Plans, chat, reminders, and progress tracking",
                "No payment required for 30 days",
              ].map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "#3b82f6",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: "0.9rem", color: "#475569" }}>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/register"
              className="client-button"
              style={{
                width: "100%",
                textAlign: "center",
                background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
              }}
            >
              Start 30-Day Trial
            </Link>
          </div>

          {/* Monthly Plan */}
          <div
            className="client-card"
            style={{
              background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
              border: "2px solid #d8b4fe",
              position: "relative",
            }}
          >
            {/* Popular Badge */}
            <div
              style={{
                position: "absolute",
                top: "-12px",
                right: "20px",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "#fff",
                padding: "0.375rem 1rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)",
              }}
            >
              Popular
            </div>

            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "60px",
                  height: "60px",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  borderRadius: "50%",
                  marginBottom: "1rem",
                }}
              >
                <TrendingUp size={28} color="#fff" />
              </div>
              <h2 className="client-card__title" style={{ marginBottom: "0.5rem" }}>
                Coach Basic
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                Standard platform fee
              </p>
            </div>

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: "#6b21a8" }}>
                ₹99
                <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#94a3b8" }}>
                  /month
                </span>
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Billed monthly
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
              {[
                "Unlimited active clients",
                "Same core feature set as the free trial",
                "No feature restrictions on core tools",
                "Plans, chat, reminders, and progress tracking",
                "Continuous access for ₹99/month",
              ].map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "#7c3aed",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: "0.9rem", color: "#475569" }}>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/register"
              className="client-button"
              style={{
                width: "100%",
                textAlign: "center",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              }}
            >
              Choose ₹99 Plan
            </Link>
          </div>

          {/* Pro Plan */}
          <div
            className="client-card"
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              border: "2px solid #86efac",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-12px",
                right: "20px",
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                color: "#fff",
                padding: "0.375rem 1rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.35)",
              }}
            >
              Advanced
            </div>

            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "60px",
                  height: "60px",
                  background: "linear-gradient(135deg, #16a34a, #22c55e)",
                  borderRadius: "50%",
                  marginBottom: "1rem",
                }}
              >
                <Users size={28} color="#fff" />
              </div>
              <h2 className="client-card__title" style={{ marginBottom: "0.5rem" }}>
                Coach Pro
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                Added insights and premium support
              </p>
            </div>

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: "#166534" }}>
                ₹199
                <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#94a3b8" }}>
                  /month
                </span>
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Billed monthly
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
              {[
                "Everything in Coach Basic",
                "Unlimited active clients",
                "AI features",
                "Summary reports",
                "Priority customer support",
              ].map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "#16a34a",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: "0.9rem", color: "#475569" }}>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/register"
              className="client-button"
              style={{
                width: "100%",
                textAlign: "center",
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
              }}
            >
              Choose ₹199 Plan
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="client-card" style={{ marginBottom: "2rem" }}>
          <h2 className="client-card__title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Calendar size={24} color="#2563eb" />
            How It Works
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
              marginTop: "2rem",
            }}
          >
            {[
              {
                step: "1",
                title: "Start Free Trial",
                description: "Register as a coach and get 30 days of free access to all core features.",
              },
              {
                step: "2",
                title: "Build Your Coaching",
                description: "Add clients, create workout & diet plans, track progress, and grow your coaching business.",
              },
              {
                step: "3",
                title: "Choose ₹99 or ₹199 Plan",
                description: "After trial, continue with Coach Basic (₹99) or Coach Pro (₹199).",
              },
              {
                step: "4",
                title: "Upload Payment Proof",
                description: "Submit payment via admin QR and upload screenshot for approval and activation.",
              },
            ].map((item) => (
              <div key={item.step}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    color: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    marginBottom: "1rem",
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: "1.6" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        <div className="client-card" style={{ marginBottom: "2rem" }}>
          <h2 className="client-card__title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Shield size={24} color="#2563eb" />
            Payment Details
          </h2>

          <div style={{ marginTop: "1.5rem" }}>
            <h3 className="client-card__subsection-title">Payment Process</h3>
            <ul className="client-list">
              <li>
                <strong>Payment Method:</strong> UPI or bank transfer via admin-provided QR code
              </li>
              <li>
                <strong>Amount:</strong> ₹99/month (Coach Basic) or ₹199/month (Coach Pro)
              </li>
              <li>
                <strong>Payment Proof:</strong> Upload screenshot of successful payment transaction
              </li>
              <li>
                <strong>Approval:</strong> Admin reviews and approves payment within 24-48 hours
              </li>
              <li>
                <strong>Activation:</strong> Subscription activated immediately after approval
              </li>
            </ul>

            <h3 className="client-card__subsection-title" style={{ marginTop: "2rem" }}>
              Subscription Status
            </h3>
            <ul className="client-list">
              <li>
                <strong>Trial:</strong> Free 30-day trial with full core coach access
              </li>
              <li>
                <strong>Active:</strong> Paid Basic or Pro subscription with valid monthly access
              </li>
              <li>
                <strong>Expired:</strong> Subscription period ended, renewal required
              </li>
              <li>
                <strong>Pending:</strong> Payment submitted and awaiting admin approval
              </li>
            </ul>

            <h3 className="client-card__subsection-title" style={{ marginTop: "2rem" }}>
              Important Notes
            </h3>
            <ul className="client-list">
              <li>Trial starts automatically upon coach registration</li>
              <li>Clients can use the app for free under their coach</li>
              <li>No credit card required for trial period</li>
              <li>Choose ₹99 Basic or ₹199 Pro after trial ends</li>
              <li>Notifications sent 3 days and 1 day before expiration</li>
              <li>Access blocked after subscription expires</li>
              <li>Payment history available in your dashboard</li>
              <li>Contact support for payment or technical issues</li>
            </ul>
          </div>
        </div>

        {/* Why Choose FitCoach */}
        <div className="client-card">
          <h2 className="client-card__title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Users size={24} color="#2563eb" />
            Why Choose FitCoach?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginTop: "2rem",
            }}
          >
            {[
              {
                icon: <Shield size={24} color="#3b82f6" />,
                title: "Secure & Reliable",
                description: "Your data is protected with industry-standard security measures.",
              },
              {
                icon: <TrendingUp size={24} color="#7c3aed" />,
                title: "Grow Your Business",
                description: "All-in-one platform to manage clients and scale your coaching.",
              },
              {
                icon: <Users size={24} color="#10b981" />,
                title: "Client Management",
                description: "Track progress, create plans, and communicate with clients easily.",
              },
              {
                icon: <Zap size={24} color="#f59e0b" />,
                title: "Easy to Use",
                description: "Intuitive interface designed for coaches, not developers.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "1.5rem",
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ marginBottom: "1rem" }}>{item.icon}</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: "1.6" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div
          style={{
            marginTop: "3rem",
            padding: "3rem 2rem",
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            borderRadius: "1rem",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "1rem" }}>
            Ready to Start Coaching?
          </h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "2rem", opacity: 0.95 }}>
            Start your 30-day trial, then continue with the plan that matches your coaching needs.
          </p>
          <Link
            href="/auth/register"
            className="client-button"
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#2563eb",
              padding: "1rem 2.5rem",
              fontSize: "1.1rem",
              fontWeight: "700",
            }}
          >
            Start Your Free 30-Day Trial
          </Link>
        </div>
      </div>
    </main>
  );
}
