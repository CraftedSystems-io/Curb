"use client";

import { useEffect } from "react";
import { useUser } from "./use-user";
import { registerPushNotifications } from "@/lib/capacitor/push-notifications";

/**
 * Hook that registers for push notifications after user login.
 * Call this in authenticated layout components.
 * No-op on web — only activates inside the native Capacitor shell.
 */
export function usePushNotifications() {
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      registerPushNotifications(user.id);
    }
  }, [user?.id]);
}
