import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ServiceWorkerRegistrar } from "@/components/pwa/sw-registrar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curb - Find Trusted Service Pros",
  description:
    "Connect with pool, landscaping, and maid service professionals in your area.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Curb",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen antialiased">
        <ServiceWorkerRegistrar />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
