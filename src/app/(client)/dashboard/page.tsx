import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBookingsForClient } from "@/lib/queries/bookings";
import { BookingCard } from "@/components/bookings/booking-card";
import { QuickRebook } from "@/components/bookings/quick-rebook";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle,
  Clock,
  Settings,
  Heart,
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { ServiceCategory } from "@/types";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const bookings = await getBookingsForClient(user.id);

  const upcoming = bookings.filter((b) =>
    ["pending", "accepted", "in_progress"].includes(b.status)
  );
  const past = bookings.filter((b) =>
    ["completed", "cancelled", "declined"].includes(b.status)
  );
  const completedCount = bookings.filter(
    (b) => b.status === "completed"
  ).length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  // Build quick-rebook data from completed bookings
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const seenContractors = new Set<string>();
  const quickRebookItems = completedBookings
    .filter((b) => {
      if (seenContractors.has(b.contractor_id)) return false;
      seenContractors.add(b.contractor_id);
      return true;
    })
    .slice(0, 4)
    .map((b) => ({
      contractorId: b.contractor_id,
      contractorName: b.contractors?.profiles?.full_name || "Contractor",
      businessName: b.contractors?.business_name || null,
      avatarUrl: b.contractors?.profiles?.avatar_url || null,
      rating: b.contractors?.rating_avg || 0,
      reviewCount: b.contractors?.review_count || 0,
      serviceName: b.services?.name || "Service",
      serviceCategory: (b.services?.category || "pool") as ServiceCategory,
      lastBookingDate: b.scheduled_date,
    }));

  // Empty state — brand new user with no bookings
  if (bookings.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

        <div className="mt-12 flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100">
              <Sparkles className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="absolute -inset-4 animate-ping rounded-3xl bg-emerald-400 opacity-10" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">
            Welcome to Curb!
          </h2>
          <p className="mt-2 max-w-md text-gray-500">
            You haven&apos;t booked any services yet. Explore nearby pros for
            pool, landscaping, and cleaning services.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
            >
              <MapPin size={16} />
              Find Pros Near You
            </Link>
            <Link
              href="/favorites"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Heart size={16} />
              My Favorites
            </Link>
          </div>
        </div>

        {/* Quick start cards */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Discover",
              desc: "Browse trusted pros on an interactive map",
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: Calendar,
              title: "Book",
              desc: "Schedule a service in a few taps",
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              icon: CheckCircle,
              title: "Relax",
              desc: "Track progress and rate your experience",
              color: "bg-purple-50 text-purple-600",
            },
          ].map((step) => (
            <Card key={step.title}>
              <CardContent className="p-5 text-center">
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${step.color}`}
                >
                  <step.icon size={22} />
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <div className="flex items-center gap-1">
          <Link
            href="/favorites"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Heart size={16} />
            <span className="hidden sm:inline">Favorites</span>
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Explore</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="card-hover">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-xl font-bold text-gray-900">
                {upcoming.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {completedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Bookings
          </h2>
          {upcoming.length > 0 && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {upcoming.length} active
            </span>
          )}
        </div>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                otherParty={{
                  name:
                    booking.contractors?.profiles?.full_name || "Contractor",
                  avatar_url:
                    booking.contractors?.profiles?.avatar_url || null,
                }}
                href={`/dashboard/bookings/${booking.id}`}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar size={32} className="mx-auto text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-500">
                No upcoming bookings
              </p>
              <Link
                href="/explore"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Book a service
                <ArrowRight size={14} />
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quick Rebook */}
      <QuickRebook items={quickRebookItems} />

      {/* Past */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Past Bookings
        </h2>
        {past.length > 0 ? (
          <div className="space-y-3">
            {past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                otherParty={{
                  name:
                    booking.contractors?.profiles?.full_name || "Contractor",
                  avatar_url:
                    booking.contractors?.profiles?.avatar_url || null,
                }}
                href={`/dashboard/bookings/${booking.id}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No past bookings yet.</p>
        )}
      </section>
    </div>
  );
}
