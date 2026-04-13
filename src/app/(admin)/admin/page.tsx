import { createClient } from "@/lib/supabase/server";
import {
  Users,
  UserCheck,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Star,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all stats in parallel
  const [
    { count: totalVendors },
    { count: activeVendors },
    { count: totalClients },
    { count: totalBookings },
    { count: pendingBookings },
    { count: completedBookings },
    { data: recentBookings },
    { data: recentVendors },
    { data: topVendors },
  ] = await Promise.all([
    supabase.from("contractors").select("*", { count: "exact", head: true }),
    supabase.from("contractors").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase
      .from("bookings")
      .select("id, status, scheduled_date, final_price, quoted_price, created_at, profiles!bookings_client_id_fkey(full_name), contractors(business_name)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("contractors")
      .select("id, business_name, is_verified, is_active, subscription_plan, rating_avg, review_count, created_at, profiles!contractors_profile_id_fkey(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contractors")
      .select("id, business_name, rating_avg, review_count, subscription_plan, profiles!contractors_profile_id_fkey(full_name)")
      .order("rating_avg", { ascending: false })
      .limit(5),
  ]);

  // Calculate revenue from completed bookings
  const { data: revenueData } = await supabase
    .from("bookings")
    .select("final_price, quoted_price")
    .eq("status", "completed");

  const totalRevenue = (revenueData || []).reduce(
    (sum, b) => sum + (b.final_price || b.quoted_price || 0),
    0
  );

  const stats = [
    { label: "Total Vendors", value: totalVendors || 0, icon: UserCheck, color: "#059669" },
    { label: "Active Vendors", value: activeVendors || 0, icon: CheckCircle2, color: "#10b981" },
    { label: "Total Clients", value: totalClients || 0, icon: Users, color: "#3b82f6" },
    { label: "Total Bookings", value: totalBookings || 0, icon: ClipboardList, color: "#8b5cf6" },
    { label: "Pending Bookings", value: pendingBookings || 0, icon: AlertCircle, color: "#f59e0b" },
    { label: "Completed", value: completedBookings || 0, icon: TrendingUp, color: "#059669" },
    { label: "Platform Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "#059669" },
    { label: "Avg Rating", value: topVendors?.length ? (topVendors.reduce((s, v) => s + v.rating_avg, 0) / topVendors.length).toFixed(1) : "N/A", icon: Star, color: "#f59e0b" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>Platform Dashboard</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 6 }}>
          Overview of all vendors, clients, and bookings on Curb
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                padding: 24,
                borderRadius: 14,
                background: "white",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>{stat.label}</span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${stat.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={stat.color} />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent Bookings */}
        <div style={{ padding: 24, borderRadius: 14, background: "white", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
            Recent Bookings
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(recentBookings || []).map((booking: Record<string, unknown>) => (
              <div
                key={booking.id as string}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "#f9fafb",
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {(booking.profiles as Record<string, string>)?.full_name || "Unknown Client"}
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {(booking.contractors as Record<string, string>)?.business_name || "Unknown Vendor"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        booking.status === "completed"
                          ? "#ecfdf5"
                          : booking.status === "pending"
                            ? "#fef3c7"
                            : "#eff6ff",
                      color:
                        booking.status === "completed"
                          ? "#065f46"
                          : booking.status === "pending"
                            ? "#92400e"
                            : "#1e40af",
                    }}
                  >
                    {(booking.status as string).replace("_", " ")}
                  </span>
                  {(booking.final_price || booking.quoted_price) ? (
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginTop: 4 }}>
                      ${((booking.final_price || booking.quoted_price) as number).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            {(!recentBookings || recentBookings.length === 0) && (
              <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: 20 }}>
                No bookings yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Vendors */}
        <div style={{ padding: 24, borderRadius: 14, background: "white", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
            Recent Vendors
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(recentVendors || []).map((vendor: Record<string, unknown>) => (
              <div
                key={vendor.id as string}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "#f9fafb",
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {(vendor.business_name as string) || (vendor.profiles as Record<string, string>)?.full_name || "Unknown"}
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {(vendor.profiles as Record<string, string>)?.email}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: vendor.is_verified ? "#ecfdf5" : "#fef3c7",
                      color: vendor.is_verified ? "#065f46" : "#92400e",
                    }}
                  >
                    {vendor.is_verified ? "Verified" : "Pending"}
                  </span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "#eff6ff",
                      color: "#1e40af",
                      textTransform: "capitalize",
                    }}
                  >
                    {vendor.subscription_plan as string}
                  </span>
                </div>
              </div>
            ))}
            {(!recentVendors || recentVendors.length === 0) && (
              <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: 20 }}>
                No vendors yet
              </p>
            )}
          </div>
        </div>

        {/* Top Vendors */}
        <div style={{ padding: 24, borderRadius: 14, background: "white", border: "1px solid #e5e7eb", gridColumn: "span 2" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
            Top Rated Vendors
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            {(topVendors || []).map((vendor: Record<string, unknown>, i: number) => (
              <div
                key={vendor.id as string}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  background: "#f9fafb",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    background: "#059669",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                  {(vendor.business_name as string) || (vendor.profiles as Record<string, string>)?.full_name || "Unknown"}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 6 }}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    {(vendor.rating_avg as number).toFixed(1)}
                  </span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    ({vendor.review_count as number})
                  </span>
                </div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: "#ecfdf5",
                    color: "#065f46",
                    textTransform: "capitalize",
                  }}
                >
                  {vendor.subscription_plan as string}
                </span>
              </div>
            ))}
            {(!topVendors || topVendors.length === 0) && (
              <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: 20, gridColumn: "span 5" }}>
                No vendors yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
