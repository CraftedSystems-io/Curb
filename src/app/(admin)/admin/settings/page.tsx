export default function AdminSettingsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>Settings</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 6 }}>
          Platform configuration
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ padding: 28, borderRadius: 14, background: "white", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
            Platform Info
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Platform</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Curb</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Version</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>2.0.0</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Service Categories</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Pool, Landscaping, Maid</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Default Area</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Los Angeles, CA</span>
            </div>
          </div>
        </div>

        <div style={{ padding: 28, borderRadius: 14, background: "white", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
            Stripe Configuration
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            Manage your Stripe integration in the Stripe dashboard.
          </p>
          <div style={{ marginTop: 16 }}>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 10,
                background: "#635bff",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Open Stripe Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
