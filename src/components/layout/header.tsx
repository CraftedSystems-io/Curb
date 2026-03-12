"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Menu, X, LogOut, LayoutDashboard, Heart, Settings, ClipboardList } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Header() {
  const { user, profile, loading } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const dashboardLink =
    profile?.role === "contractor" ? "/pro" : "/explore";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Curb</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 md:flex">
          {!loading && user ? (
            <>
              <Link
                href={dashboardLink}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LayoutDashboard size={16} />
                {profile?.role === "contractor"
                  ? "Dashboard"
                  : "Explore"}
              </Link>
              {profile?.role === "client" && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ClipboardList size={16} />
                    Bookings
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Heart size={16} />
                    Favorites
                  </Link>
                </>
              )}
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name || "User"}
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-700">
                  {profile?.full_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : !loading ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          ) : null}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name || "User"}
                  size="sm"
                />
                <span className="text-sm font-medium">
                  {profile?.full_name}
                </span>
              </div>
              <Link
                href={dashboardLink}
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {profile?.role === "contractor"
                  ? "Dashboard"
                  : "Explore"}
              </Link>
              {profile?.role === "client" && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ClipboardList size={16} />
                    My Bookings
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart size={16} />
                    Favorites
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
