"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PlanFormPortal({ children }: { children: React.ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Only access document in useEffect to avoid SSR/hydration issues
    const target = document.getElementById("modal-root") ?? document.body;
    setContainer(target);
  }, []);

  if (!container) return null;
  return createPortal(children, container);
}
