import React from "react";
import RoleGuard from "@/components/shared/RoleGuard";
import CoachSubscriptionGuard from "@/components/coach/CoachSubscriptionGuard";
import { MotionProvider } from "@/lib/motion";
import styles from "./coach-layout.module.css";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoleGuard role="coach" />
      <CoachSubscriptionGuard>
        <main className={styles.content}>
          <div className={styles.contentInner}>
            <MotionProvider>{children}</MotionProvider>
          </div>
        </main>
      </CoachSubscriptionGuard>
    </>
  );
}
