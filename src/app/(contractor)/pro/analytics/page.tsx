import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getContractorByProfileId } from "@/lib/queries/contractors";
import { getBookingsForContractor } from "@/lib/queries/bookings";
import { getReviewsForContractor } from "@/lib/queries/reviews";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { BOOKING_STATUS_CONFIG } from "@/lib/utils/constants";
import type { BookingStatus } from "@/types";
import {
  DollarSign,
  Briefcase,
  Star,
  Clock,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ContractorAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const contractor = await getContractorByProfileId(user.id);
  if (!contractor) redirect("/explore");

  const bookings = await getBookingsForContractor(contractor.id);
  const reviews = await getReviewsForContractor(contractor.id);

  // ── Compute Summary Stats ──────────────────────────────────────────
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + (b.final_price ?? b.quoted_price ?? 0),
    0
  );
  const jobsCompleted = completedBookings.length;
  const ratingAvg = contractor.rating_avg;
  const reviewCount = contractor.review_count;

  // Calculate average response time from booking creation to status update
  const responseTimesHours = bookings
    .filter((b) => b.status !== "pending")
    .map((b) => {
      const created = new Date(b.created_at).getTime();
      const updated = new Date(b.status_updated_at).getTime();
      return (updated - created) / (1000 * 60 * 60);
    })
    .filter((h) => h > 0 && h < 168); // filter outliers > 1 week

  const avgResponseTime =
    responseTimesHours.length > 0
      ? responseTimesHours.reduce((a, b) => a + b, 0) / responseTimesHours.length
      : 0;

  // ── Monthly Revenue (last 6 months) ────────────────────────────────
  const now = new Date();
  const months: { key: string; label: string; revenue: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: getMonthKey(d), label: getMonthLabel(d), revenue: 0 });
  }

  for (const booking of completedBookings) {
    const d = new Date(booking.scheduled_date);
    const key = getMonthKey(d);
    const month = months.find((m) => m.key === key);
    if (month) {
      month.revenue += booking.final_price ?? booking.quoted_price ?? 0;
    }
  }

  const maxRevenue = Math.max(...months.map((m) => m.revenue), 1);

  // ── Booking Status Breakdown ───────────────────────────────────────
  const statusCounts: Record<BookingStatus, number> = {
    pending: 0,
    accepted: 0,
    declined: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const booking of bookings) {
    const status = booking.status as BookingStatus;
    if (status in statusCounts) {
      statusCounts[status]++;
    }
  }

  const totalBookings = bookings.length || 1;
  const statusEntries = (
    Object.entries(statusCounts) as [BookingStatus, number][]
  ).filter(([, count]) => count > 0);

  // Colors for the stacked bar
  const statusBarColors: Record<BookingStatus, string> = {
    pending: "bg-yellow-400",
    accepted: "bg-blue-400",
    declined: "bg-red-400",
    in_progress: "bg-indigo-400",
    completed: "bg-emerald-400",
    cancelled: "bg-gray-400",
  };

  const statusDotColors: Record<BookingStatus, string> = {
    pending: "bg-yellow-400",
    accepted: "bg-blue-400",
    declined: "bg-red-400",
    in_progress: "bg-indigo-400",
    completed: "bg-emerald-400",
    cancelled: "bg-gray-400",
  };

  // ── Rating Distribution ────────────────────────────────────────────
  const ratingDist = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
  for (const review of reviews) {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDist[review.rating - 1]++;
    }
  }
  // ── Recent Activity ────────────────────────────────────────────────
  const recentBookings = bookings.slice(0, 10);

  // ── Revenue change calculation ─────────────────────────────────────
  const currentMonthRevenue = months[5]?.revenue ?? 0;
  const lastMonthRevenue = months[4]?.revenue ?? 0;
  const revenueChange =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : currentMonthRevenue > 0
        ? 100
        : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your performance, revenue, and client satisfaction
        </p>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700" />
          <CardContent className="relative py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">
                  Total Revenue
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {formatCurrency(totalRevenue)}
                </p>
                {revenueChange !== 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-200" />
                    <span className="text-xs font-medium text-emerald-100">
                      {revenueChange > 0 ? "+" : ""}
                      {revenueChange.toFixed(1)}% vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Completed */}
        <Card className="relative overflow-hidden border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700" />
          <CardContent className="relative py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">
                  Jobs Completed
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {jobsCompleted}
                </p>
                <p className="mt-2 text-xs font-medium text-blue-100">
                  {bookings.length} total bookings
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card className="relative overflow-hidden border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600" />
          <CardContent className="relative py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-100">
                  Average Rating
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {ratingAvg > 0 ? ratingAvg.toFixed(1) : "N/A"}
                  {ratingAvg > 0 && (
                    <span className="text-base font-normal text-amber-200">
                      /5
                    </span>
                  )}
                </p>
                <p className="mt-2 text-xs font-medium text-amber-100">
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card className="relative overflow-hidden border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-700" />
          <CardContent className="relative py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-violet-100">
                  Response Time
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {avgResponseTime > 0 ? (
                    <>
                      {avgResponseTime < 1
                        ? `${Math.round(avgResponseTime * 60)}m`
                        : `${avgResponseTime.toFixed(1)}h`}
                    </>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p className="mt-2 text-xs font-medium text-violet-100">
                  Avg. time to respond
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Revenue Overview + Booking Status ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart (spans 2 cols) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Revenue Overview
                </h2>
              </div>
              <span className="text-sm text-gray-500">Last 6 months</span>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {/* Bar Chart */}
            <div className="flex items-end gap-3" style={{ height: "220px" }}>
              {months.map((month) => {
                const heightPercent =
                  maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                return (
                  <div
                    key={month.key}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    {/* Amount label */}
                    <span className="text-xs font-medium text-gray-500">
                      {month.revenue > 0
                        ? formatCurrency(month.revenue).replace(".00", "")
                        : "$0"}
                    </span>
                    {/* Bar */}
                    <div className="relative w-full flex-1 overflow-hidden rounded-t-lg bg-gray-100">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-700"
                        style={{
                          height: `${Math.max(heightPercent, 2)}%`,
                        }}
                      />
                    </div>
                    {/* Month label */}
                    <span className="text-xs font-medium text-gray-600">
                      {month.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Booking Status Breakdown */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Booking Status
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-5">
                {/* Stacked horizontal bar */}
                <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
                  {statusEntries.map(([status, count]) => (
                    <div
                      key={status}
                      className={`${statusBarColors[status]} transition-all duration-500`}
                      style={{
                        width: `${(count / totalBookings) * 100}%`,
                      }}
                      title={`${BOOKING_STATUS_CONFIG[status].label}: ${count}`}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  {statusEntries.map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${statusDotColors[status]}`}
                        />
                        <span className="text-sm text-gray-600">
                          {BOOKING_STATUS_CONFIG[status].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {count}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({((count / totalBookings) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                No bookings yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Rating Distribution + Recent Activity ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rating Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Rating Distribution
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDist[star - 1];
                  const percentage =
                    reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex w-8 items-center justify-end gap-0.5">
                        <span className="text-sm font-medium text-gray-700">
                          {star}
                        </span>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                            style={{
                              width: `${Math.max(
                                percentage > 0 ? percentage : 0,
                                percentage > 0 ? 4 : 0
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="w-8 text-right text-sm font-medium text-gray-500">
                        {count}
                      </span>
                    </div>
                  );
                })}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-amber-50 py-3">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold text-gray-900">
                    {ratingAvg.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    out of 5 ({reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                No reviews yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h2>
              </div>
              <Link
                href="/pro/bookings"
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {recentBookings.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentBookings.map((booking) => {
                  const clientName =
                    (booking as any).profiles?.full_name ?? "Client";
                  const clientAvatar =
                    (booking as any).profiles?.avatar_url ?? null;
                  const serviceName =
                    (booking as any).services?.name ?? "Service";
                  const amount =
                    booking.final_price ?? booking.quoted_price ?? 0;

                  return (
                    <Link
                      key={booking.id}
                      href={`/pro/bookings/${booking.id}`}
                      className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-gray-50"
                    >
                      <Avatar
                        name={clientName}
                        src={clientAvatar}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-gray-900">
                            {serviceName}
                          </span>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {clientName} &middot;{" "}
                          {formatDate(booking.scheduled_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {amount > 0 ? formatCurrency(amount) : "--"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="px-6 py-8 text-center text-sm text-gray-500">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
