import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger";

const badgeVariantClasses: Record<BadgeVariant, string> = {
  default: "bg-indigo-50 text-indigo-700 border-indigo-100",
  secondary: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-rose-50 text-rose-700 border-rose-100",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        badgeVariantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
