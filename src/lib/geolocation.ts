"use client";

interface GeoPosition {
  lat: number;
  lng: number;
}

/**
 * Get current position using the browser Geolocation API.
 */
export async function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}

/**
 * Watch position continuously. Returns a watch ID string.
 */
export function watchPosition(
  callback: (pos: GeoPosition) => void,
  errorCallback?: (err: Error) => void
): string {
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      callback({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    },
    (err) => errorCallback?.(new Error(err.message)),
    { enableHighAccuracy: true }
  );

  return String(watchId);
}

/**
 * Clear a position watch by ID.
 */
export function clearWatch(watchId: string): void {
  navigator.geolocation.clearWatch(parseInt(watchId, 10));
}
