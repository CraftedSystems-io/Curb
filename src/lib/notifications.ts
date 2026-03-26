"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Register for Web Push notifications via the service worker.
 * Requests permission, subscribes to push, and stores the subscription in Supabase.
 */
export async function registerPushNotifications(
  userId: string
): Promise<void> {
  // Check support
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  // Check / request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe with VAPID public key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn("VAPID public key not configured — skipping push registration");
        return;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });
    }

    // Store subscription in Supabase
    const supabase = createClient();
    await supabase.rpc("upsert_push_subscription", {
      p_user_id: userId,
      p_subscription: JSON.stringify(subscription),
      p_platform: "web",
    });
  } catch (err) {
    console.warn("Push registration failed:", err);
  }
}

/**
 * Unsubscribe from push notifications.
 */
export async function unregisterPushNotifications(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
  } catch {
    // Silently fail
  }
}

/** Convert VAPID key from base64 URL to Uint8Array */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
