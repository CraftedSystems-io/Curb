"use client";

import { useEffect } from "react";
import { initializeNativeApp } from "@/lib/capacitor/app-init";

/**
 * Client component that initializes native Capacitor plugins on mount.
 * Renders nothing — just runs the init side effect.
 * Placed in the root layout so it runs once on app load.
 */
export function NativeInit() {
  useEffect(() => {
    initializeNativeApp();
  }, []);

  return null;
}
