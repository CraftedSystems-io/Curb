"use client";

import { isNative, isPluginAvailable } from "./platform";

export type HapticStyle = "light" | "medium" | "heavy";

/**
 * Trigger haptic impact feedback. No-op on web.
 */
export async function hapticFeedback(
  style: HapticStyle = "medium"
): Promise<void> {
  if (!isNative || !isPluginAvailable("Haptics")) return;

  const mod = await import("@capacitor/haptics");

  const styleMap = {
    light: mod.ImpactStyle.Light,
    medium: mod.ImpactStyle.Medium,
    heavy: mod.ImpactStyle.Heavy,
  } as const;

  await mod.Haptics.impact({ style: styleMap[style] });
}

/**
 * Trigger a notification-style haptic (success/warning/error). No-op on web.
 */
export async function hapticNotification(
  type: "success" | "warning" | "error" = "success"
): Promise<void> {
  if (!isNative || !isPluginAvailable("Haptics")) return;

  const mod = await import("@capacitor/haptics");

  const typeMap = {
    success: mod.NotificationType.Success,
    warning: mod.NotificationType.Warning,
    error: mod.NotificationType.Error,
  } as const;

  await mod.Haptics.notification({ type: typeMap[type] });
}

/**
 * Trigger a selection-change haptic (like a picker wheel tick). No-op on web.
 */
export async function hapticSelection(): Promise<void> {
  if (!isNative || !isPluginAvailable("Haptics")) return;

  const { Haptics } = await import("@capacitor/haptics");
  await Haptics.selectionStart();
  await Haptics.selectionChanged();
  await Haptics.selectionEnd();
}
