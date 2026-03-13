import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { NativeInit } from "@/components/capacitor/native-init";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curb - Find Trusted Service Pros",
  description:
    "Connect with pool, landscaping, and maid service professionals in your area.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Curb",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <NativeInit />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
