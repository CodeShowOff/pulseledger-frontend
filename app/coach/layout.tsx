import React from "react";
import RoleGuard from "@/components/shared/RoleGuard";
import CoachSubscriptionGuard from "@/components/coach/CoachSubscriptionGuard";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoleGuard role="coach" />
      <CoachSubscriptionGuard>
        <main className="coach-content">
          <div className="coach-content__inner">{children}</div>
        </main>
      </CoachSubscriptionGuard>
    </>
  );
}
