// app/admin/layout.tsx
import React from "react";
import RoleGuard from "@/components/shared/RoleGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RoleGuard role="admin" />
      <main className="admin-content">
        <div className="admin-content__inner">{children}</div>
      </main>
    </>
  );
}
