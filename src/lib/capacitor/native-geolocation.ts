"use client";

import { isNative, isPluginAvailable } from "./platform";

interface GeoPosition {
  lat: number;
  lng: number;
}

/**
 * Get current position using native GPS when available,
 * falling back to browser geolocation API.
 *
 * On iOS: Uses CLLocationManager via Capacitor (more accurate, background-capable)
 * On web: Uses navigator.geolocation (standard browser API)
 */
export async function getCurrentPosition(): Promise<GeoPosition> {
  if (isNative && isPluginAvailable("Geolocation")) {
    const { Geolocation } = await import("@capacitor/geolocation");

    // Request permissions first on native
    const permStatus = await Geolocation.checkPermissions();
    if (permStatus.location !== "granted") {
      await Geolocation.requestPermissions();
    }

    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
  }

  // Fallback: browser geolocation API
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });
}

/**
 * Watch position continuously. Returns an ID that can be used to clear the watch.
 * On native, uses CLLocationManager for background-capable tracking.
 */
export async function watchPosition(
  callback: (pos: GeoPosition) => void,
  errorCallback?: (err: Error) => void
): Promise<string> {
  if (isNative && isPluginAvailable("Geolocation")) {
    const { Geolocation } = await import("@capacitor/geolocation");

    const watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position, err) => {
        if (err) {
          errorCallback?.(new Error(err.message));
          return;
        }
        if (position) {
          callback({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      }
    );

    return watchId;
  }

  // Fallback: browser watch
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      callback({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    },
    (err) => errorCallback?.(new Error(err.message)),
    { enableHighAccuracy: false }
  );

  return String(watchId);
}

/**
 * Clear a position watch by ID.
 */
export async function clearWatch(watchId: string): Promise<void> {
  if (isNative && isPluginAvailable("Geolocation")) {
    const { Geolocation } = await import("@capacitor/geolocation");
    await Geolocation.clearWatch({ id: watchId });
    return;
  }

  navigator.geolocation.clearWatch(parseInt(watchId, 10));
}
