import { createClient } from "@/lib/supabase/server";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServiceAreasPage() {
  const supabase = await createClient();

  const { data: contractors } = await supabase
    .from("contractors")
    .select("id, business_name, service_radius_m, is_active, profiles!contractors_profile_id_fkey(full_name)")
    .eq("is_active", true)
    .order("service_radius_m", { ascending: false });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>Service Areas</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 6 }}>
          Vendor coverage and service radius
        </p>
      </div>

      <div style={{ borderRadius: 14, border: "1px solid #e5e7eb", background: "white", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              {["Vendor", "Service Radius", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 20px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(contractors || []).map((c: Record<string, unknown>) => (
              <tr key={c.id as string} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MapPin size={16} color="#059669" />
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {(c.business_name as string) || (c.profiles as Record<string, string>)?.full_name || "Unknown"}
                    </p>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: "#374151" }}>
                  {((c.service_radius_m as number) / 1609.34).toFixed(1)} miles
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "#ecfdf5",
                      color: "#065f46",
                    }}
                  >
                    Active
                  </span>
                </td>
              </tr>
            ))}
            {(!contractors || contractors.length === 0) && (
              <tr>
                <td colSpan={3} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  No active vendors
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
