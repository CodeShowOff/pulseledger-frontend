// src/app/(client)/orders/page.tsx
"use client";

import ClientOrdersTable from "@/components/client/ClientOrdersTable";

export default function ClientOrdersPage() {
  return (
    <div className="client-page">
      <div className="client-page__inner">
        <header className="client-page__header">
          <h1 className="client-page__title">My Orders</h1>
          <p className="client-page__subtitle">
            Review your payments and any purchases linked to your plans.
          </p>
        </header>

        <div className="client-page__sections">
          <div className="client-card">
            <ClientOrdersTable />
          </div>
        </div>
      </div>
    </div>
  );
}
