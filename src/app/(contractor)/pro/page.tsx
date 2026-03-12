import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getContractorByProfileId } from "@/lib/queries/contractors";
import { getBookingsForContractor } from "@/lib/queries/bookings";
import { getReviewsForContractor } from "@/lib/queries/reviews";
import { BookingCard } from "@/components/bookings/booking-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  Star,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowRight,
  Wrench,
  Camera,
  BarChart3,
  Eye,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { BookingStatus } from "@/types";

export default async function ContractorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const contractor = await getContractorByProfileId(user.id);
  if (!contractor) redirect("/explore");

  const [bookings, reviews] = await Promise.all([
    getBookingsForContractor(contractor.id),
    getReviewsForContractor(contractor.id),
  ]);

  const pending = bookings.filter((b) => b.status === "pending");
  const active = bookings.filter((b) =>
    ["accepted", "in_progress"].includes(b.status)
  );
  const completed = bookings.filter((b) => b.status === "completed");

  // Revenue calculation
  const totalRevenue = completed.reduce(
    (sum, b) => sum + (b.final_price || b.quoted_price || 0),
    0
  );

  // This month's bookings
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthBookings = bookings.filter(
    (b) => new Date(b.created_at) >= monthStart
  );
  const thisMonthRevenue = thisMonthBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.final_price || b.quoted_price || 0), 0);

  // Today's jobs
  const todayStr = now.toISOString().split("T")[0];
  const todaysJobs = bookings.filter(
    (b) =>
      b.scheduled_date === todayStr &&
      !["cancelled", "declined"].includes(b.status)
  );

  // Recent reviews
  const recentReviews = reviews.slice(0, 3);

  // Completion rate
  const finalizedBookings = bookings.filter((b) =>
    ["completed", "cancelled", "declined"].includes(b.status)
  );
  const completionRate =
    finalizedBookings.length > 0
      ? Math.round(
          (completed.length / finalizedBookings.length) * 100
        )
      : 100;

  // Profile completeness
  const profileItems = [
    !!contractor.business_name,
    !!contractor.bio,
    !!contractor.hourly_rate,
    contractor.years_experience > 0,
    !!(contractor.contractor_services && contractor.contractor_services.length > 0),
  ];
  const profileCompleteness = Math.round(
    (profileItems.filter(Boolean).length / profileItems.length) * 100
  );

  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting},{" "}
            {contractor.business_name ||
              contractor.profiles.full_name?.split(" ")[0] ||
              "Pro"}{" "}
            <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/pro/bookings"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Calendar size={16} />
            View All Bookings
          </Link>
        </div>
      </div>

      {/* Profile Completeness Banner */}
      {profileCompleteness < 100 && (
        <div className="overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Complete your profile</p>
                <p className="text-sm text-emerald-100">
                  Profiles that are 100% complete get 3x more bookings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 sm:w-32">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-100">Progress</span>
                  <span className="font-bold">{profileCompleteness}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${profileCompleteness}%` }}
                  />
                </div>
              </div>
              <Link
                href="/pro/profile"
                className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                Complete
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-md shadow-emerald-200">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-2.5">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-emerald-600">
                  {formatCurrency(thisMonthRevenue)}
                </span>{" "}
                this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-md shadow-blue-200">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Jobs Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completed.length}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-2.5">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-blue-600">
                  {completionRate}%
                </span>{" "}
                completion rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contractor.rating_avg > 0
                    ? contractor.rating_avg.toFixed(1)
                    : "New"}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-2.5">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-amber-600">
                  {contractor.review_count}
                </span>{" "}
                review{contractor.review_count !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md shadow-yellow-200">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pending.length}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-2.5">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-yellow-600">
                  {active.length}
                </span>{" "}
                active job{active.length !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Column — Today + Pending */}
        <div className="space-y-8 lg:col-span-2">
          {/* Today's Schedule */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Calendar size={20} className="text-emerald-600" />
                  Today&apos;s Schedule
                </h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {todaysJobs.length} job{todaysJobs.length !== 1 ? "s" : ""}
                </span>
              </div>
              {todaysJobs.length > 0 ? (
                <div className="space-y-3">
                  {todaysJobs.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/pro/bookings/${booking.id}`}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Clock size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {booking.services?.name || "Service"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {booking.profiles?.full_name || "Client"} &middot;{" "}
                          {booking.scheduled_time || "TBD"} &middot; {booking.address}
                        </p>
                      </div>
                      <StatusPill status={booking.status} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 py-8 text-center">
                  <Calendar
                    size={32}
                    className="mx-auto text-gray-300"
                  />
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    No jobs scheduled for today
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Keep your availability up to date to get more bookings
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <AlertCircle size={20} className="text-yellow-500" />
                  Pending Requests
                </h2>
                {pending.length > 0 && (
                  <Link
                    href="/pro/bookings"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    View all
                  </Link>
                )}
              </div>
              {pending.length > 0 ? (
                <div className="space-y-3">
                  {pending.slice(0, 5).map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      otherParty={{
                        name: booking.profiles?.full_name || "Client",
                        avatar_url: booking.profiles?.avatar_url || null,
                      }}
                      href={`/pro/bookings/${booking.id}`}
                    />
                  ))}
                  {pending.length > 5 && (
                    <Link
                      href="/pro/bookings"
                      className="flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                    >
                      See {pending.length - 5} more
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 py-8 text-center">
                  <CheckCircle
                    size={32}
                    className="mx-auto text-gray-300"
                  />
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    All caught up!
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    No pending requests right now
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Jobs */}
          {active.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <TrendingUp size={20} className="text-blue-600" />
                    Active Jobs
                  </h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {active.length} in progress
                  </span>
                </div>
                <div className="space-y-3">
                  {active.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      otherParty={{
                        name: booking.profiles?.full_name || "Client",
                        avatar_url: booking.profiles?.avatar_url || null,
                      }}
                      href={`/pro/bookings/${booking.id}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  {
                    href: "/pro/profile",
                    icon: UserCheck,
                    label: "Edit Profile",
                    color: "text-emerald-600 bg-emerald-50",
                  },
                  {
                    href: "/pro/services",
                    icon: Wrench,
                    label: "Manage Services",
                    color: "text-blue-600 bg-blue-50",
                  },
                  {
                    href: "/pro/availability",
                    icon: Calendar,
                    label: "Set Availability",
                    color: "text-purple-600 bg-purple-50",
                  },
                  {
                    href: "/pro/portfolio",
                    icon: Camera,
                    label: "Add Photos",
                    color: "text-amber-600 bg-amber-50",
                  },
                  {
                    href: "/pro/analytics",
                    icon: BarChart3,
                    label: "View Analytics",
                    color: "text-indigo-600 bg-indigo-50",
                  },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}
                    >
                      <action.icon size={18} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {action.label}
                    </span>
                    <ArrowRight
                      size={14}
                      className="ml-auto text-gray-400"
                    />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Snapshot */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Performance
              </h3>
              <div className="space-y-4">
                <PerformanceRow
                  icon={<Eye size={16} />}
                  label="Completion Rate"
                  value={`${completionRate}%`}
                  barPercent={completionRate}
                  barColor="bg-emerald-500"
                />
                <PerformanceRow
                  icon={<Star size={16} />}
                  label="Avg Rating"
                  value={
                    contractor.rating_avg > 0
                      ? `${contractor.rating_avg.toFixed(1)} / 5`
                      : "No reviews"
                  }
                  barPercent={
                    contractor.rating_avg > 0
                      ? (contractor.rating_avg / 5) * 100
                      : 0
                  }
                  barColor="bg-amber-400"
                />
                <PerformanceRow
                  icon={<TrendingUp size={16} />}
                  label="This Month"
                  value={`${thisMonthBookings.length} bookings`}
                  barPercent={Math.min(
                    (thisMonthBookings.length / 20) * 100,
                    100
                  )}
                  barColor="bg-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Recent Reviews
                </h3>
                <Link
                  href="/pro/reviews"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View all
                </Link>
              </div>
              {recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {review.profiles?.full_name || "Client"}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star
                            size={12}
                            className="fill-amber-400 text-amber-400"
                          />
                          <span className="text-xs font-medium text-gray-600">
                            {review.rating}
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {review.comment}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {formatRelativeTime(review.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <Star size={24} className="mx-auto text-gray-300" />
                  <p className="mt-2 text-xs text-gray-500">
                    No reviews yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: {
      label: "Pending",
      classes: "bg-yellow-100 text-yellow-700",
    },
    accepted: {
      label: "Accepted",
      classes: "bg-blue-100 text-blue-700",
    },
    in_progress: {
      label: "In Progress",
      classes: "bg-indigo-100 text-indigo-700",
    },
    completed: {
      label: "Done",
      classes: "bg-green-100 text-green-700",
    },
  };
  const c = config[status] || {
    label: status,
    classes: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.classes}`}
    >
      {c.label}
    </span>
  );
}

function PerformanceRow({
  icon,
  label,
  value,
  barPercent,
  barColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  barPercent: number;
  barColor: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-gray-600">
          {icon}
          {label}
        </span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${Math.max(barPercent, 3)}%` }}
        />
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
