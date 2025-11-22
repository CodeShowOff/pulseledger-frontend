import React from "react";
import AuthGuard from "@/components/shared/AuthGuard";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthGuard />
      {children}
    </>
  );
}
