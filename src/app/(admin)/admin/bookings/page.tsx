import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS_CONFIG } from "@/lib/utils/constants";
import type { BookingStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_date, scheduled_time, address, quoted_price, final_price, created_at, profiles!bookings_client_id_fkey(full_name, email), contractors(business_name), services(name, category)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>Bookings</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 6 }}>
          All platform bookings
        </p>
      </div>

      <div style={{ borderRadius: 14, border: "1px solid #e5e7eb", background: "white", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              {["Client", "Vendor", "Service", "Date", "Price", "Status"].map((h) => (
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
            {(bookings || []).map((b: Record<string, unknown>) => {
              const status = b.status as BookingStatus;
              const config = BOOKING_STATUS_CONFIG[status];
              return (
                <tr key={b.id as string} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {(b.profiles as Record<string, string>)?.full_name || "Unknown"}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {(b.profiles as Record<string, string>)?.email}
                    </p>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 14, color: "#374151" }}>
                    {(b.contractors as Record<string, string>)?.business_name || "Unknown"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: "#f0fdf4",
                        color: "#065f46",
                        textTransform: "capitalize",
                      }}
                    >
                      {(b.services as Record<string, string>)?.category || "N/A"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#374151" }}>
                    {b.scheduled_date
                      ? new Date(b.scheduled_date as string).toLocaleDateString()
                      : "TBD"}
                    {b.scheduled_time ? (
                      <span style={{ color: "#6b7280", marginLeft: 6 }}>
                        {b.scheduled_time as string}
                      </span>
                    ) : null}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {(b.final_price || b.quoted_price)
                      ? `$${((b.final_price || b.quoted_price) as number).toLocaleString()}`
                      : "TBD"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                      className={config?.color || "bg-gray-100 text-gray-800"}
                    >
                      {config?.label || status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {(!bookings || bookings.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  No bookings yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
