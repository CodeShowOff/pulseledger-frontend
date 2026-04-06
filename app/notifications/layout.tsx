import React from "react";
import AuthGuard from "@/components/shared/AuthGuard";
import { MotionProvider } from "@/lib/motion";

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthGuard />
      <MotionProvider>{children}</MotionProvider>
    </>
  );
}
