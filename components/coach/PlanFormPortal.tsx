"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PlanFormPortal({ children }: { children: React.ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;
    return document.getElementById("modal-root") ?? document.body;
  });

  useEffect(() => {
    if (!container && typeof document !== "undefined") {
      const target = document.getElementById("modal-root") ?? document.body;
      setContainer(target);
    }
  }, [container]);

  if (!container) return null;
  return createPortal(children, container);
}
