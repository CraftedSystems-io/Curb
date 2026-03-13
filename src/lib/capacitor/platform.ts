"use client";

import { Capacitor } from "@capacitor/core";

/** True when running inside the native Capacitor shell (iOS or Android) */
export const isNative = Capacitor.isNativePlatform();

/** True when running on iOS within Capacitor */
export const isIOS = Capacitor.getPlatform() === "ios";

/** True when running on Android within Capacitor */
export const isAndroid = Capacitor.getPlatform() === "android";

/** True when running in a regular browser (not native) */
export const isWeb = Capacitor.getPlatform() === "web";

/**
 * Check if a specific Capacitor plugin is available on this platform.
 * Useful for graceful degradation — returns false on web.
 */
export function isPluginAvailable(pluginName: string): boolean {
  return Capacitor.isPluginAvailable(pluginName);
}
