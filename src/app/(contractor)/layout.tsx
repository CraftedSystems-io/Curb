import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PushInit } from "@/components/pwa/push-init";
import { BillingGuard } from "@/components/layout/billing-guard";

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PushInit />
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-4 pb-20 sm:p-6 lg:p-8 lg:pb-8">
          <BillingGuard>{children}</BillingGuard>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
