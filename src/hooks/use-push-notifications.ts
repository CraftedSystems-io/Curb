"use client";

import { useEffect } from "react";
import { useUser } from "./use-user";
import { registerPushNotifications } from "@/lib/notifications";

/**
 * Hook that registers for Web Push notifications after user login.
 */
export function usePushNotifications() {
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      registerPushNotifications(user.id);
    }
  }, [user?.id]);
}
