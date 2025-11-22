import React from "react";
import AuthGuard from "@/components/shared/AuthGuard";

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthGuard />
      {children}
    </>
  );
}
