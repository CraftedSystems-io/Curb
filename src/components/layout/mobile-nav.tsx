"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/pro", label: "Home", icon: LayoutDashboard },
  { href: "/pro/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/pro/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/pro/profile", label: "Profile", icon: UserCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs",
                isActive ? "text-emerald-600" : "text-gray-500"
              )}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
