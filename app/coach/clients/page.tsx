// src/app/(coach)/clients/page.tsx
"use client";

import React from "react";
import CoachClients from "@/components/coach/CoachClients";
import Link from "next/link";

export default function CoachClientsPage() {
  return (
    <div>
      <section className="admin-page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="admin-page-header__title coach-page-header__title">My Clients</h1>
            <p className="admin-page-header__subtitle coach-page-header__subtitle">
              View and manage all clients linked to your coaching account.
            </p>
          </div>
          <Link href="/coach/received-requests" className="btn btn--primary">
            Received Requests
          </Link>
        </div>
      </section>

      <div className="admin-card">
        <CoachClients />
      </div>
    </div>
  );
}
