"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Wrench,
  Calendar,
  ClipboardList,
  Star,
  Camera,
  BarChart3,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/pro", label: "Overview", icon: LayoutDashboard },
  { href: "/pro/profile", label: "Profile", icon: UserCircle },
  { href: "/pro/services", label: "Services", icon: Wrench },
  { href: "/pro/availability", label: "Availability", icon: Calendar },
  { href: "/pro/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/pro/reviews", label: "Reviews", icon: Star },
  { href: "/pro/portfolio", label: "Portfolio", icon: Camera },
  { href: "/pro/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
