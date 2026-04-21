import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Store,
  Users,
  ClipboardList,
  Star,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  getPlatformMetrics,
  getMonthlyRevenue,
  getPendingActions,
  getPlatformActivity,
  getTopPerformers,
} from "@/lib/queries/admin";
import { RevenueTrendChart } from "@/components/admin/revenue-trend-chart";
import { PendingActionsQueue } from "@/components/admin/pending-actions-queue";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { TierBadge } from "@/components/ui/tier-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils/format";
import type { ProTier } from "@/types";

export const dynamic = "force-dynamic";

export default async function PlatformOwnerDashboard() {
  const [metrics, monthly, actions, activity, top] = await Promise.all([
    getPlatformMetrics(),
    getMonthlyRevenue(12),
    getPendingActions(),
    getPlatformActivity(25),
    getTopPerformers(5),
  ]);

  const arr = metrics.mrr * 12;
  const gmvDelta =
    metrics.gmvLastMonth > 0
      ? ((metrics.gmvThisMonth - metrics.gmvLastMonth) / metrics.gmvLastMonth) * 100
      : metrics.gmvThisMonth > 0
        ? 100
        : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Platform Owner
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Curb HQ</h1>
          <p className="mt-1 text-sm text-gray-500">
            Live marketplace health — subscriptions, GMV, vendor roster, pending ops.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/vendors"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Store className="h-4 w-4" />
            Vendors
          </Link>
          <Link
            href="/admin/revenue"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <DollarSign className="h-4 w-4" />
            Revenue detail
          </Link>
        </div>
      </div>

      {/* Hero KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HeroKpi
          label="MRR"
          value={formatCurrency(metrics.mrr)}
          sub={`${formatCurrency(arr)} ARR`}
          icon={<Zap className="h-6 w-6" />}
          gradient="from-emerald-500 to-emerald-700"
        />
        <HeroKpi
          label="GMV this month"
          value={formatCurrency(metrics.gmvThisMonth)}
          sub={
            gmvDelta !== 0
              ? `${gmvDelta > 0 ? "+" : ""}${gmvDelta.toFixed(1)}% vs last month`
              : "No change vs last month"
          }
          subIcon={
            gmvDelta >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )
          }
          icon={<DollarSign className="h-6 w-6" />}
          gradient="from-blue-500 to-indigo-700"
        />
        <HeroKpi
          label="Active subscribers"
          value={metrics.activeSubscribers.toString()}
          sub={`${metrics.trialingSubscribers} trialing · ${metrics.pastDueSubscribers} past-due`}
          icon={<Store className="h-6 w-6" />}
          gradient="from-violet-500 to-purple-700"
        />
        <HeroKpi
          label="Completed bookings"
          value={metrics.bookingsTotal.toString()}
          sub={`${metrics.bookingsThisMonth} this month`}
          icon={<ClipboardList className="h-6 w-6" />}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Second row KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniKpi
          label="Total vendors"
          value={metrics.totalVendors.toString()}
          sub={`${metrics.verifiedVendors} verified`}
        />
        <MiniKpi
          label="Total clients"
          value={metrics.totalClients.toString()}
        />
        <MiniKpi
          label="Platform avg rating"
          value={metrics.avgRating > 0 ? metrics.avgRating.toFixed(2) : "—"}
          sub="Out of 5"
          icon={<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
        />
        <MiniKpi
          label="Churn (30d)"
          value={metrics.churn30d.toString()}
          sub="Canceled subscriptions"
          tone={metrics.churn30d > 0 ? "warn" : "ok"}
        />
      </div>

      {/* Revenue chart */}
      <RevenueTrendChart data={monthly} />

      {/* Pending + activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PendingActionsQueue actions={actions} />
        <ActivityFeed entries={activity} />
      </div>

      {/* Subscription funnel + top performers */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Subscription health
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Status breakdown across all vendor subscriptions
          </p>
          <div className="mt-4 space-y-3">
            <SubRow
              label="Active"
              count={metrics.activeSubscribers}
              total={metrics.totalVendors}
              color="bg-emerald-500"
            />
            <SubRow
              label="Trialing"
              count={metrics.trialingSubscribers}
              total={metrics.totalVendors}
              color="bg-blue-500"
            />
            <SubRow
              label="Past-due"
              count={metrics.pastDueSubscribers}
              total={metrics.totalVendors}
              color="bg-amber-500"
            />
            <SubRow
              label="Canceled"
              count={metrics.canceledSubscribers}
              total={metrics.totalVendors}
              color="bg-gray-400"
            />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Top performers
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Highest-rated active vendors with reviews
              </p>
            </div>
            <Link
              href="/admin/vendors"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              All vendors
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {top.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                No rated vendors yet.
              </p>
            ) : (
              top.map((v) => {
                const profile = v.profiles as
                  | { full_name?: string; avatar_url?: string | null }
                  | undefined;
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3"
                  >
                    <Avatar
                      src={profile?.avatar_url ?? null}
                      name={v.business_name ?? profile?.full_name ?? "Vendor"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {v.business_name ?? profile?.full_name ?? "Vendor"}
                        </p>
                        {v.tier && (
                          <TierBadge tier={v.tier as ProTier} size="xs" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 capitalize">
                        {v.subscription_plan} · {v.subscription_status}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-gray-900">
                        {Number(v.rating_avg).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({v.review_count})
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <QuickLink href="/admin/vendors" label="Vendors" icon={<Store className="h-4 w-4" />} />
        <QuickLink href="/admin/clients" label="Clients" icon={<Users className="h-4 w-4" />} />
        <QuickLink href="/admin/bookings" label="Bookings" icon={<ClipboardList className="h-4 w-4" />} />
        <QuickLink href="/admin/revenue" label="Revenue" icon={<DollarSign className="h-4 w-4" />} />
        <QuickLink href="/admin/analytics" label="Analytics" icon={<TrendingUp className="h-4 w-4" />} />
        <QuickLink href="/admin/service-areas" label="Service areas" icon={<Star className="h-4 w-4" />} />
      </div>
    </div>
  );
}

function HeroKpi({
  label,
  value,
  sub,
  subIcon,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  sub: string;
  subIcon?: React.ReactNode;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-0 shadow-md">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-white/80">
              {label}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-white">{value}</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-white/90">
              {subIcon}
              {sub}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniKpi({
  label,
  value,
  sub,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "neutral" | "ok" | "warn";
}) {
  const toneClass =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "warn"
        ? "text-amber-700"
        : "text-gray-900";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
      {sub && (
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          {icon}
          {sub}
        </p>
      )}
    </div>
  );
}

function SubRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{count}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
    >
      {icon}
      {label}
    </Link>
  );
}
