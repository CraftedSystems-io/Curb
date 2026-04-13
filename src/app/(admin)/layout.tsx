import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main style={{ flex: 1, background: "#f9fafb", padding: 32, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
