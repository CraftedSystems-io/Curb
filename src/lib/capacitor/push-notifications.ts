"use client";

import { isNative, isIOS, isPluginAvailable } from "./platform";
import { createClient } from "@/lib/supabase/client";

/**
 * Register for push notifications on native platforms.
 * 1. Requests permission from the user (iOS system dialog)
 * 2. Registers with APNs to get a device token
 * 3. Stores the token in Supabase for server-side push sending
 *
 * No-op on web — the existing in-app notification system
 * (Supabase Realtime) handles web notifications.
 */
export async function registerPushNotifications(
  userId: string
): Promise<void> {
  if (!isNative || !isPluginAvailable("PushNotifications")) return;

  const { PushNotifications } = await import("@capacitor/push-notifications");

  // Check / request permission
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === "prompt") {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== "granted") {
    console.warn("Push notification permission not granted");
    return;
  }

  // Register with APNs/FCM
  await PushNotifications.register();

  // Listen for the device token
  PushNotifications.addListener("registration", async (token) => {
    // Store the token in Supabase
    const supabase = createClient();
    await supabase.rpc("upsert_device_token", {
      p_user_id: userId,
      p_token: token.value,
      p_platform: isIOS ? "ios" : "android",
    });
  });

  // Handle registration errors
  PushNotifications.addListener("registrationError", (err) => {
    console.error("Push registration error:", err);
  });

  // Handle incoming notifications when app is in foreground
  PushNotifications.addListener(
    "pushNotificationReceived",
    (notification) => {
      // The existing Supabase Realtime notification system handles
      // in-app UI updates. This listener is for badge updates, etc.
      console.log("Push received in foreground:", notification.title);
    }
  );

  // Handle notification taps (app opened from notification)
  PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (action) => {
      const data = action.notification.data;
      // Navigate to the relevant page based on notification payload
      if (data?.link) {
        window.location.href = data.link;
      }
    }
  );
}

/**
 * Remove all push notification listeners. Call on logout.
 */
export async function unregisterPushNotifications(): Promise<void> {
  if (!isNative || !isPluginAvailable("PushNotifications")) return;

  const { PushNotifications } = await import("@capacitor/push-notifications");
  await PushNotifications.removeAllListeners();
}
