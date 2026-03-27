import React from "react";
import RoleGuard from "@/components/shared/RoleGuard";
import CoachSubscriptionGuard from "@/components/coach/CoachSubscriptionGuard";
import styles from "./coach-layout.module.css";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoleGuard role="coach" />
      <CoachSubscriptionGuard>
        <main className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </CoachSubscriptionGuard>
    </>
  );
}
