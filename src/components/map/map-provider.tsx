"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";

export function MapProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 text-gray-600">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
          <MapPin className="h-8 w-8 text-emerald-600" />
        </div>
        <p className="text-lg font-semibold text-gray-800">Map View</p>
        <p className="mt-1 text-sm text-gray-500 text-center max-w-xs">
          Interactive map showing nearby service professionals will appear here.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      {children}
    </APIProvider>
  );
}
