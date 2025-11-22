// components/admin/AdminSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Package, ClipboardList, Mail, Bug, MessageSquare, DollarSign, Settings } from "lucide-react";

const links = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/platform-subscriptions",
    label: "Platform Subscriptions",
    icon: DollarSign,
  },
  {
    href: "/admin/subscriptions",
    label: "Client Subscriptions",
    icon: CreditCard,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/admin/plans",
    label: "Plans",
    icon: ClipboardList,
  },
  {
    href: "/admin/contact-submissions",
    label: "Contact Submissions",
    icon: Mail,
  },
  {
    href: "/admin/bug-reports",
    label: "Bug Reports",
    icon: Bug,
  },
  {
    href: "/admin/feedback-submissions",
    label: "Feedback",
    icon: MessageSquare,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <h2>Admin Panel</h2>
      </div>

      <nav className="admin-sidebar__nav">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={
                "admin-sidebar__link" + (active ? " admin-sidebar__link--active" : "")
              }
            >
              <Icon className="admin-sidebar__link-icon" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
