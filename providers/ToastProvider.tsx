"use client";

import { Toaster } from "sonner";
import React from "react";

export default function ToastProvider() {
  return (
    <Toaster
      theme="light"
      position="bottom-right"
      richColors={false}
      closeButton={false}
      duration={2400}
      expand={false}
      visibleToasts={2}
      offset={16}
      mobileOffset={{ bottom: 76, left: 12, right: 12 }}
      toastOptions={{
        className: "fitcoach-toast",
        descriptionClassName: "fitcoach-toast__description",
        classNames: {
          title: "fitcoach-toast__title",
          success: "fitcoach-toast--success",
          error: "fitcoach-toast--error",
          info: "fitcoach-toast--info",
          warning: "fitcoach-toast--warning",
        },
      }}
    />
  );
}
