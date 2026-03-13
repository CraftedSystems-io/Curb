"use client";

import { isNative } from "./platform";
import { configureStatusBar } from "./status-bar";
import { configureKeyboard } from "./keyboard";

/**
 * Initialize all native Capacitor plugins.
 * Called once from the NativeInit component in the root layout.
 * No-op when running in a regular browser.
 */
export async function initializeNativeApp(): Promise<void> {
  if (!isNative) return;

  // Configure status bar appearance (edge-to-edge, dark text)
  await configureStatusBar();

  // Configure keyboard behavior for form inputs
  await configureKeyboard();

  // Set up app lifecycle listeners
  const { App } = await import("@capacitor/app");

  // Handle hardware back button (mainly Android, but good practice)
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    }
  });

  // Handle deep links (curb:// or universal links)
  App.addListener("appUrlOpen", ({ url }) => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname;
      if (path) {
        window.location.href = path;
      }
    } catch {
      // Invalid URL, ignore
    }
  });
}
