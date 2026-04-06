"use client";

import { LazyMotion, MotionConfig, domAnimation, m } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const LOW_END_ANDROID_MAX_CORES = 6;
const LOW_END_ANDROID_MAX_MEMORY_GB = 4;

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number;
};

function isLowEndAndroidDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  if (!/Android/i.test(navigator.userAgent)) {
    return false;
  }

  const deviceMemory = (navigator as NavigatorWithDeviceMemory).deviceMemory;
  const memoryConstrained = typeof deviceMemory === "number" && deviceMemory <= LOW_END_ANDROID_MAX_MEMORY_GB;

  const cpuCores = navigator.hardwareConcurrency;
  const cpuConstrained = typeof cpuCores === "number" && cpuCores > 0 && cpuCores <= LOW_END_ANDROID_MAX_CORES;

  return memoryConstrained || cpuConstrained;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [forceReducedMotion, setForceReducedMotion] = useState(false);

  useEffect(() => {
    setForceReducedMotion(isLowEndAndroidDevice());
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={forceReducedMotion ? "always" : "user"}>{children}</MotionConfig>
    </LazyMotion>
  );
}

export const motion = m;
