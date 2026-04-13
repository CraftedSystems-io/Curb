"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isLockedOut } from "@/lib/billing";
import type { SubscriptionStatus } from "@/types/database";
import { Loader2 } from "lucide-react";

export function BillingGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [locked, setLocked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function check() {
      // Allow billing page through always
      if (pathname === "/pro/billing") {
        setChecking(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setChecking(false);
        return;
      }

      const { data } = await supabase
        .from("contractors")
        .select("subscription_status, trial_ends_at")
        .eq("profile_id", user.id)
        .single();

      if (data) {
        const status = data.subscription_status as SubscriptionStatus;
        if (isLockedOut(status, data.trial_ends_at)) {
          setLocked(true);
          router.replace("/pro/billing");
        }
      }

      setChecking(false);
    }
    check();
  }, [pathname, router]);

  if (checking) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (locked && pathname !== "/pro/billing") return null;

  return <>{children}</>;
}
