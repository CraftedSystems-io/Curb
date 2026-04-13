import { createClient } from "@/lib/supabase/server";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  const supabase = await createClient();

  const { data: completedBookings } = await supabase
    .from("bookings")
    .select("final_price, quoted_price, created_at, contractors(business_name, subscription_plan)")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const { data: contractors } = await supabase
    .from("contractors")
    .select("subscription_plan, subscription_status");

  const totalRevenue = (completedBookings || []).reduce(
    (sum, b) => sum + (b.final_price || b.quoted_price || 0),
    0
  );

  const planCounts = {
    starter: 0,
    professional: 0,
    enterprise: 0,
  };
  (contractors || []).forEach((c: { subscription_plan: string; subscription_status: string }) => {
    if (c.subscription_status === "active" || c.subscription_status === "trialing") {
      const plan = c.subscription_plan as keyof typeof planCounts;
      if (plan in planCounts) planCounts[plan]++;
    }
  });

  const mrr = planCounts.professional * 29 + planCounts.enterprise * 79;

  const stats = [
    { label: "Monthly Recurring Revenue", value: `$${mrr.toLocaleString()}`, icon: DollarSign, color: "#059669" },
    { label: "Total Platform GMV", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "#3b82f6" },
    { label: "Pro Subscribers", value: planCounts.professional, icon: CreditCard, color: "#8b5cf6" },
    { label: "Enterprise Subscribers", value: planCounts.enterprise, icon: Users, color: "#f59e0b" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>Revenue</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 6 }}>
          Subscription and platform revenue
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                padding: 28,
                borderRadius: 14,
                background: "white",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>{stat.label}</span>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${stat.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={stat.color} />
                </div>
              </div>
              <p style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Subscriber Breakdown */}
      <div style={{ padding: 28, borderRadius: 14, background: "white", border: "1px solid #e5e7eb", marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
          Subscription Breakdown
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { plan: "Starter", count: planCounts.starter, price: "Free", color: "#6b7280" },
            { plan: "Professional", count: planCounts.professional, price: "$29/mo", color: "#059669" },
            { plan: "Enterprise", count: planCounts.enterprise, price: "$79/mo", color: "#3b82f6" },
          ].map((tier) => (
            <div
              key={tier.plan}
              style={{
                padding: 24,
                borderRadius: 12,
                background: "#f9fafb",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 36, fontWeight: 900, color: tier.color }}>{tier.count}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginTop: 8 }}>
                {tier.plan}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{tier.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Completed Bookings */}
      <div style={{ padding: 28, borderRadius: 14, background: "white", border: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
          Recent Completed Bookings
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(completedBookings || []).slice(0, 15).map((b, i) => (
            <div
              key={i}
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
                  {(b.contractors as unknown as Record<string, string>)?.business_name || "Unknown Vendor"}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  {new Date(b.created_at).toLocaleDateString()}
                </p>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}>
                ${(b.final_price || b.quoted_price || 0).toLocaleString()}
              </p>
            </div>
          ))}
          {(!completedBookings || completedBookings.length === 0) && (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: 20, fontSize: 14 }}>
              No completed bookings yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
