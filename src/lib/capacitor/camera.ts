"use client";

import { isNative, isPluginAvailable } from "./platform";

interface PhotoResult {
  dataUrl: string;
  format: string;
}

/**
 * Take a photo using the native camera or pick from gallery.
 * Returns null on web (caller should fall back to <input type="file">).
 *
 * Used by the contractor portfolio photo upload at:
 * src/app/(contractor)/pro/portfolio/portfolio-manager.tsx
 */
export async function takePhoto(
  source: "camera" | "gallery" = "camera"
): Promise<PhotoResult | null> {
  if (!isNative || !isPluginAvailable("Camera")) {
    return null;
  }

  const { Camera, CameraResultType, CameraSource } = await import(
    "@capacitor/camera"
  );

  try {
    const image = await Camera.getPhoto({
      quality: 85,
      resultType: CameraResultType.DataUrl,
      source:
        source === "camera" ? CameraSource.Camera : CameraSource.Photos,
      width: 1200,
      height: 1200,
      correctOrientation: true,
    });

    return {
      dataUrl: image.dataUrl || "",
      format: image.format,
    };
  } catch {
    // User cancelled or permission denied
    return null;
  }
}
