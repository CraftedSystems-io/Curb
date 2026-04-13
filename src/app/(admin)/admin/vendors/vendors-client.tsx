"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Shield,
  ShieldOff,
} from "lucide-react";

interface Vendor {
  id: string;
  business_name: string | null;
  bio: string | null;
  hourly_rate: number | null;
  rating_avg: number;
  review_count: number;
  is_active: boolean;
  is_verified: boolean;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profiles: any;
}

export function VendorsClient({ vendors }: { vendors: Vendor[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending" | "inactive">("all");

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      !search ||
      v.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.profiles?.email?.toLowerCase().includes(search.toLowerCase());

    if (filter === "verified") return matchesSearch && v.is_verified;
    if (filter === "pending") return matchesSearch && !v.is_verified;
    if (filter === "inactive") return matchesSearch && !v.is_active;
    return matchesSearch;
  });

  async function toggleVerified(id: string, current: boolean) {
    await fetch("/api/admin/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_verified: !current }),
    });
    window.location.reload();
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch("/api/admin/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !current }),
    });
    window.location.reload();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>Vendors</h1>
          <p style={{ fontSize: 15, color: "#6b7280", marginTop: 6 }}>
            {vendors.length} total vendor{vendors.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
          />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
        {(["all", "verified", "pending", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: "1px solid",
              borderColor: filter === f ? "#059669" : "#e5e7eb",
              background: filter === f ? "#ecfdf5" : "white",
              color: filter === f ? "#065f46" : "#6b7280",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ borderRadius: 14, border: "1px solid #e5e7eb", background: "white", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              {["Vendor", "Contact", "Rating", "Plan", "Status", "Actions"].map((h) => (
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
            {filtered.map((v) => (
              <tr key={v.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {v.business_name || v.profiles?.full_name || "Unnamed"}
                  </p>
                  {v.business_name && (
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {v.profiles?.full_name}
                    </p>
                  )}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 13, color: "#374151" }}>{v.profiles?.email}</p>
                  {v.profiles?.phone && (
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{v.profiles.phone}</p>
                  )}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{v.rating_avg.toFixed(1)}</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>({v.review_count})</span>
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: v.subscription_plan === "professional" ? "#ecfdf5" : v.subscription_plan === "enterprise" ? "#eff6ff" : "#f9fafb",
                      color: v.subscription_plan === "professional" ? "#065f46" : v.subscription_plan === "enterprise" ? "#1e40af" : "#6b7280",
                      textTransform: "capitalize",
                    }}
                  >
                    {v.subscription_plan}
                  </span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {v.is_verified ? (
                      <CheckCircle2 size={16} color="#059669" />
                    ) : (
                      <XCircle size={16} color="#ef4444" />
                    )}
                    <span style={{ fontSize: 13, color: v.is_verified ? "#065f46" : "#991b1b" }}>
                      {v.is_verified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => toggleVerified(v.id, v.is_verified)}
                      title={v.is_verified ? "Remove verification" : "Verify vendor"}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: v.is_verified ? "#991b1b" : "#065f46",
                      }}
                    >
                      {v.is_verified ? <ShieldOff size={14} /> : <Shield size={14} />}
                      {v.is_verified ? "Unverify" : "Verify"}
                    </button>
                    <button
                      onClick={() => toggleActive(v.id, v.is_active)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "white",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        color: v.is_active ? "#991b1b" : "#065f46",
                      }}
                    >
                      {v.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
