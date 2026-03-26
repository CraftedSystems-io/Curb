"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentPosition } from "@/lib/geolocation";

interface GeoPosition {
  lat: number;
  lng: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
}

/**
 * Hook for getting the user's current location via the browser Geolocation API.
 */
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    getCurrentPosition()
      .then((pos) => {
        setPosition(pos);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to get location");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { position, error, loading, requestLocation };
}
