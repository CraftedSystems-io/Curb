import { createClient } from "@/lib/supabase/server";
import { Search, Mail, Phone, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  // Get booking counts per client
  const { data: bookingCounts } = await supabase
    .from("bookings")
    .select("client_id");

  const countMap: Record<string, number> = {};
  (bookingCounts || []).forEach((b: { client_id: string }) => {
    countMap[b.client_id] = (countMap[b.client_id] || 0) + 1;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>Clients</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 6 }}>
          {(clients || []).length} registered client{(clients || []).length !== 1 ? "s" : ""}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {(clients || []).map((client) => (
          <div
            key={client.id}
            style={{
              padding: 24,
              borderRadius: 14,
              background: "white",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#3b82f6",
                }}
              >
                {client.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                  {client.full_name || "Unknown"}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280" }}>
                  {countMap[client.id] || 0} booking{(countMap[client.id] || 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" }}>
                <Mail size={14} />
                {client.email}
              </div>
              {client.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" }}>
                  <Phone size={14} />
                  {client.phone}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" }}>
                <Calendar size={14} />
                Joined {new Date(client.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}

        {(!clients || clients.length === 0) && (
          <div style={{ gridColumn: "span 3", padding: 60, textAlign: "center" }}>
            <Search size={40} color="#d1d5db" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: "#6b7280" }}>No clients yet</p>
            <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 4 }}>
              Clients will appear here when they sign up
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
