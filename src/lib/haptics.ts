"use client";

export type HapticStyle = "light" | "medium" | "heavy";

/**
 * Trigger haptic feedback using the Web Vibration API.
 * Falls back to no-op on unsupported browsers (Safari/iOS).
 */
export function hapticFeedback(style: HapticStyle = "medium"): void {
  if (!navigator.vibrate) return;

  const patterns: Record<HapticStyle, number> = {
    light: 10,
    medium: 25,
    heavy: 50,
  };

  navigator.vibrate(patterns[style]);
}

/**
 * Trigger a notification-style haptic.
 */
export function hapticNotification(
  type: "success" | "warning" | "error" = "success"
): void {
  if (!navigator.vibrate) return;

  const patterns: Record<string, number[]> = {
    success: [15, 50, 15],
    warning: [25, 40, 25],
    error: [50, 30, 50, 30, 50],
  };

  navigator.vibrate(patterns[type]);
}
