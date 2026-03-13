"use client";

import { isNative, isPluginAvailable } from "./platform";

/**
 * Configure the iOS status bar on app launch.
 * Sets light style (dark text) and overlays the WebView under the status bar
 * for edge-to-edge design.
 */
export async function configureStatusBar(): Promise<void> {
  if (!isNative || !isPluginAvailable("StatusBar")) return;

  const mod = await import("@capacitor/status-bar");

  await mod.StatusBar.setStyle({ style: mod.Style.Light });
  await mod.StatusBar.setOverlaysWebView({ overlay: true });
}

/**
 * Set status bar to dark mode (light text on dark background).
 * Use on screens with dark headers (e.g., hero sections).
 */
export async function setStatusBarDark(): Promise<void> {
  if (!isNative || !isPluginAvailable("StatusBar")) return;
  const mod = await import("@capacitor/status-bar");
  await mod.StatusBar.setStyle({ style: mod.Style.Dark });
}

/**
 * Set status bar to light mode (dark text on light background).
 * Use on screens with white/light headers.
 */
export async function setStatusBarLight(): Promise<void> {
  if (!isNative || !isPluginAvailable("StatusBar")) return;
  const mod = await import("@capacitor/status-bar");
  await mod.StatusBar.setStyle({ style: mod.Style.Light });
}
