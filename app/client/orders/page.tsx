// src/app/(client)/orders/page.tsx
"use client";

import ClientOrdersTable from "@/components/client/ClientOrdersTable";

export default function ClientOrdersPage() {
  return (
    <div className="client-page__sections">
      <header className="client-page__header">
        <h1 className="client-page__title">My Orders</h1>
      </header>

      <div className="client-card">
        <ClientOrdersTable />
      </div>
    </div>
  );
}
