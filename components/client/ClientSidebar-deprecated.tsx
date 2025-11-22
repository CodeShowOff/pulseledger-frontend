// src/components/client/ClientSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LogOut } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/client/dashboard" },
  { name: "Coach Profile", href: "/client/coach" },
  { name: "Progress", href: "/client/progress" },
  { name: "Orders", href: "/client/orders" },
  { name: "Subscriptions", href: "/client/subscriptions" },
  { name: "Products", href: "/client/products" },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col">
      <div className="px-6 py-4 text-xl font-bold border-b">Client Panel</div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded-md text-sm font-medium transition ${
              pathname?.startsWith(item.href)
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-3 border-t text-red-600 hover:bg-red-50 text-sm font-medium"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </aside>
  );
}
