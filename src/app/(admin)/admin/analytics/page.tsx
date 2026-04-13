import { createClient } from "@/lib/supabase/server";
import { BarChart3, Users, TrendingUp, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Bookings by status
  const { data: bookings } = await supabase
    .from("bookings")
    .select("status, created_at");

  const statusCounts: Record<string, number> = {};
  (bookings || []).forEach((b: { status: string }) => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });

  // Vendors by plan
  const { data: contractors } = await supabase
    .from("contractors")
    .select("subscription_plan, is_verified, created_at");

  const planCounts: Record<string, number> = {};
  let verifiedCount = 0;
  (contractors || []).forEach((c: { subscription_plan: string; is_verified: boolean }) => {
    planCounts[c.subscription_plan] = (planCounts[c.subscription_plan] || 0) + 1;
    if (c.is_verified) verifiedCount++;
  });

  // Signups this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count: newClients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "client")
    .gte("created_at", monthStart.toISOString());

  const { count: newVendors } = await supabase
    .from("contractors")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthStart.toISOString());

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>Analytics</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 6 }}>
          Platform metrics and insights
        </p>
      </div>

      {/* This Month */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
        {[
          { label: "New Clients (this month)", value: newClients || 0, icon: Users, color: "#3b82f6" },
          { label: "New Vendors (this month)", value: newVendors || 0, icon: TrendingUp, color: "#059669" },
          { label: "Total Bookings", value: (bookings || []).length, icon: Calendar, color: "#8b5cf6" },
          { label: "Verified Vendors", value: verifiedCount, icon: BarChart3, color: "#f59e0b" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ padding: 24, borderRadius: 14, background: "white", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>{s.label}</span>
                <Icon size={18} color={s.color} />
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Booking Status Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ padding: 28, borderRadius: 14, background: "white", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
            Bookings by Status
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#374151", textTransform: "capitalize" }}>
                  {status.replace("_", " ")}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 120, height: 8, borderRadius: 999, background: "#f3f4f6" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background: "#059669",
                        width: `${(count / (bookings || []).length) * 100}%`,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", minWidth: 30, textAlign: "right" }}>
                    {count}
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(statusCounts).length === 0 && (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No data</p>
            )}
          </div>
        </div>

        <div style={{ padding: 28, borderRadius: 14, background: "white", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
            Vendors by Plan
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(planCounts).map(([plan, count]) => (
              <div key={plan} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#374151", textTransform: "capitalize" }}>{plan}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 120, height: 8, borderRadius: 999, background: "#f3f4f6" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background: "#3b82f6",
                        width: `${(count / (contractors || []).length) * 100}%`,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", minWidth: 30, textAlign: "right" }}>
                    {count}
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(planCounts).length === 0 && (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
