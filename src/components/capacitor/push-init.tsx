"use client";

import { usePushNotifications } from "@/hooks/use-push-notifications";

/**
 * Client component that registers for push notifications
 * after the user is authenticated. Renders nothing.
 * Place inside authenticated layout components.
 */
export function PushInit() {
  usePushNotifications();
  return null;
}
