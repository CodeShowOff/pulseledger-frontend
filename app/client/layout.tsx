// src/app/(client)/layout.tsx
import React from "react";
import RoleGuard from "@/components/shared/RoleGuard";
import { MotionProvider } from "@/lib/motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoleGuard role="client" />
      <div className="client-page">
        <div className="client-page__inner">
          <MotionProvider>{children}</MotionProvider>
        </div>
      </div>
    </>
  );
}
