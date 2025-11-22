"use client";

import { Toaster } from "sonner";
import React from "react";

export default function ToastProvider() {
  return <Toaster position="top-right" richColors closeButton />;
}
