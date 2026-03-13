"use client";

import { isNative, isPluginAvailable } from "./platform";

/**
 * Configure keyboard behavior for iOS.
 * Handles proper scrolling and resizing when the keyboard appears
 * over form inputs — critical for the booking form, login, signup, etc.
 */
export async function configureKeyboard(): Promise<void> {
  if (!isNative || !isPluginAvailable("Keyboard")) return;

  const mod = await import("@capacitor/keyboard");

  await mod.Keyboard.setResizeMode({ mode: mod.KeyboardResize.Body });
  await mod.Keyboard.setScroll({ isDisabled: false });
}

/**
 * Programmatically hide the keyboard. Useful after form submission.
 */
export async function hideKeyboard(): Promise<void> {
  if (!isNative || !isPluginAvailable("Keyboard")) return;
  const mod = await import("@capacitor/keyboard");
  await mod.Keyboard.hide();
}
