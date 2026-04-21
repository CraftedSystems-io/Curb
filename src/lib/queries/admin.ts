import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/billing";
import type { SubscriptionPlan } from "@/types";

export interface PlatformMetrics {
  mrr: number;
  activeSubscribers: number;
  trialingSubscribers: number;
  pastDueSubscribers: number;
  canceledSubscribers: number;
  totalVendors: number;
  verifiedVendors: number;
  totalClients: number;
  gmvTotal: number;
  gmvThisMonth: number;
  gmvLastMonth: number;
  bookingsTotal: number;
  bookingsThisMonth: number;
  avgRating: number;
  churn30d: number;
}

export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const supabase = await createClient();

  const [
    { data: contractors },
    { count: totalClients },
    { data: completedBookings },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("contractors")
      .select("subscription_plan, subscription_status, is_verified, rating_avg, updated_at"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
    supabase
      .from("bookings")
      .select("final_price, quoted_price, scheduled_date, created_at")
      .eq("status", "completed"),
    supabase.from("reviews").select("rating"),
  ]);

  const pros = contractors ?? [];
  const active = pros.filter((p) => p.subscription_status === "active");
  const mrr = active.reduce(
    (s, p) => s + (PLANS[p.subscription_plan as SubscriptionPlan]?.price ?? 0),
    0
  );

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const completed = completedBookings ?? [];
  const gmvTotal = completed.reduce(
    (s, b) => s + Number(b.final_price ?? b.quoted_price ?? 0),
    0
  );
  const gmvThisMonth = completed
    .filter((b) => new Date(b.scheduled_date) >= thisMonthStart)
    .reduce((s, b) => s + Number(b.final_price ?? b.quoted_price ?? 0), 0);
  const gmvLastMonth = completed
    .filter((b) => {
      const d = new Date(b.scheduled_date);
      return d >= lastMonthStart && d < thisMonthStart;
    })
    .reduce((s, b) => s + Number(b.final_price ?? b.quoted_price ?? 0), 0);

  const { count: bookingsTotal } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });
  const { count: bookingsThisMonth } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thisMonthStart.toISOString());

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000);
  const churn30d = pros.filter(
    (p) =>
      p.subscription_status === "canceled" &&
      p.updated_at &&
      new Date(p.updated_at) >= thirtyDaysAgo
  ).length;

  const avgRating =
    (reviews ?? []).length > 0
      ? (reviews ?? []).reduce((s, r) => s + Number(r.rating), 0) /
        (reviews ?? []).length
      : 0;

  return {
    mrr,
    activeSubscribers: active.length,
    trialingSubscribers: pros.filter((p) => p.subscription_status === "trialing").length,
    pastDueSubscribers: pros.filter((p) => p.subscription_status === "past_due").length,
    canceledSubscribers: pros.filter((p) => p.subscription_status === "canceled").length,
    totalVendors: pros.length,
    verifiedVendors: pros.filter((p) => p.is_verified).length,
    totalClients: totalClients ?? 0,
    gmvTotal,
    gmvThisMonth,
    gmvLastMonth,
    bookingsTotal: bookingsTotal ?? 0,
    bookingsThisMonth: bookingsThisMonth ?? 0,
    avgRating,
    churn30d,
  };
}

export interface MonthlyRevenue {
  key: string;
  label: string;
  gmv: number;
  bookings: number;
}

export async function getMonthlyRevenue(months = 12): Promise<MonthlyRevenue[]> {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (months - 1));
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("bookings")
    .select("final_price, quoted_price, scheduled_date")
    .eq("status", "completed")
    .gte("scheduled_date", startDate.toISOString().split("T")[0]);

  const buckets: MonthlyRevenue[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      gmv: 0,
      bookings: 0,
    });
  }

  for (const b of data ?? []) {
    const d = new Date(b.scheduled_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.find((x) => x.key === key);
    if (bucket) {
      bucket.gmv += Number(b.final_price ?? b.quoted_price ?? 0);
      bucket.bookings += 1;
    }
  }
  return buckets;
}

export interface PendingAction {
  id: string;
  kind: "unverified_vendor" | "stuck_pending" | "past_due_subscription" | "new_signup";
  title: string;
  description: string;
  href: string;
  createdAt: string;
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const supabase = await createClient();
  const actions: PendingAction[] = [];

  const { data: unverified } = await supabase
    .from("contractors")
    .select("id, business_name, created_at, profiles!contractors_profile_id_fkey(full_name, email)")
    .eq("is_verified", false)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(10);

  for (const v of (unverified ?? []) as Array<{ id: string; business_name: string | null; created_at: string; profiles?: { full_name?: string; email?: string } }>) {
    actions.push({
      id: `unverified-${v.id}`,
      kind: "unverified_vendor",
      title: `Verify ${v.business_name || v.profiles?.full_name}`,
      description: v.profiles?.email ?? "Pending verification",
      href: `/admin/vendors`,
      createdAt: v.created_at,
    });
  }

  const stuckDate = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const { data: stuck } = await supabase
    .from("bookings")
    .select("id, job_number, created_at, profiles!bookings_client_id_fkey(full_name), contractors(business_name)")
    .eq("stage", "inquiry")
    .lt("created_at", stuckDate)
    .order("created_at", { ascending: true })
    .limit(10);

  for (const b of (stuck ?? []) as Array<{ id: string; job_number: string | null; created_at: string; profiles?: { full_name?: string }; contractors?: { business_name?: string } }>) {
    actions.push({
      id: `stuck-${b.id}`,
      kind: "stuck_pending",
      title: `${b.job_number ?? "Booking"} stuck in Inquiry > 48h`,
      description: `${b.profiles?.full_name ?? "Client"} → ${b.contractors?.business_name ?? "Pro"}`,
      href: `/admin/bookings`,
      createdAt: b.created_at,
    });
  }

  const { data: pastDue } = await supabase
    .from("contractors")
    .select("id, business_name, updated_at, profiles!contractors_profile_id_fkey(email)")
    .eq("subscription_status", "past_due")
    .order("updated_at", { ascending: false });

  for (const p of (pastDue ?? []) as Array<{ id: string; business_name: string | null; updated_at: string; profiles?: { email?: string } }>) {
    actions.push({
      id: `pastdue-${p.id}`,
      kind: "past_due_subscription",
      title: `Past-due subscription: ${p.business_name}`,
      description: p.profiles?.email ?? "",
      href: `/admin/vendors`,
      createdAt: p.updated_at,
    });
  }

  return actions;
}

export interface ActivityEntry {
  id: string;
  kind: "booking" | "signup_client" | "signup_vendor" | "event";
  title: string;
  subtitle: string;
  at: string;
  href?: string;
}

export async function getPlatformActivity(limit = 20): Promise<ActivityEntry[]> {
  const supabase = await createClient();

  const [events, signups, vendors, bookings] = await Promise.all([
    supabase
      .from("booking_events")
      .select("id, booking_id, event_type, title, created_at, bookings(job_number)")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .eq("role", "client")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("contractors")
      .select("id, business_name, created_at, profiles!contractors_profile_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("bookings")
      .select("id, job_number, created_at, profiles!bookings_client_id_fkey(full_name), contractors(business_name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const out: ActivityEntry[] = [];

  for (const e of (events.data ?? []) as Array<{ id: string; booking_id: string; title: string; created_at: string; bookings?: { job_number?: string } }>) {
    out.push({
      id: `ev-${e.id}`,
      kind: "event",
      title: e.title,
      subtitle: e.bookings?.job_number ?? "Project",
      at: e.created_at,
      href: `/admin/bookings`,
    });
  }
  for (const s of (signups.data ?? []) as Array<{ id: string; full_name: string; created_at: string }>) {
    out.push({
      id: `cl-${s.id}`,
      kind: "signup_client",
      title: `${s.full_name} signed up`,
      subtitle: "New client",
      at: s.created_at,
      href: `/admin/clients`,
    });
  }
  for (const v of (vendors.data ?? []) as Array<{ id: string; business_name: string | null; created_at: string; profiles?: { full_name?: string } }>) {
    out.push({
      id: `vn-${v.id}`,
      kind: "signup_vendor",
      title: `${v.business_name || v.profiles?.full_name} joined`,
      subtitle: "New vendor",
      at: v.created_at,
      href: `/admin/vendors`,
    });
  }
  for (const b of (bookings.data ?? []) as Array<{ id: string; job_number: string | null; created_at: string; profiles?: { full_name?: string }; contractors?: { business_name?: string } }>) {
    out.push({
      id: `bk-${b.id}`,
      kind: "booking",
      title: `${b.job_number ?? "Booking"} created`,
      subtitle: `${b.profiles?.full_name ?? "Client"} → ${b.contractors?.business_name ?? "Pro"}`,
      at: b.created_at,
      href: `/admin/bookings`,
    });
  }

  return out.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, limit);
}

export async function getTopPerformers(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contractors")
    .select(
      `id, business_name, tier, rating_avg, review_count, subscription_plan, subscription_status,
       profiles!contractors_profile_id_fkey(full_name, avatar_url)`
    )
    .eq("is_active", true)
    .gt("review_count", 0)
    .order("rating_avg", { ascending: false })
    .order("review_count", { ascending: false })
    .limit(limit);
  return data ?? [];
}
