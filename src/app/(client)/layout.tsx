import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PushInit } from "@/components/pwa/push-init";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PushInit />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <InstallPrompt />
    </div>
  );
}
