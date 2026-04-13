"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PLANS, getTrialDaysLeft } from "@/lib/billing";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";
import {
  Zap,
  Crown,
  Building2,
  Check,
  AlertTriangle,
  Clock,
  CreditCard,
  Loader2,
} from "lucide-react";

const PLAN_ICONS: Record<SubscriptionPlan, typeof Zap> = {
  starter: Zap,
  professional: Crown,
  enterprise: Building2,
};

interface BillingData {
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("contractors")
        .select(
          "subscription_plan, subscription_status, stripe_customer_id, trial_ends_at, current_period_end"
        )
        .eq("profile_id", user.id)
        .single();

      if (data) setBilling(data as BillingData);
      setLoading(false);
    }
    load();
  }, []);

  async function handleCheckout(priceId: string, plan: string) {
    setActionLoading(plan);
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkout", priceId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setActionLoading(null);
  }

  async function handlePortal() {
    setActionLoading("portal");
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "portal" }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!billing) return null;

  const trialDays = getTrialDaysLeft(billing.trial_ends_at);
  const isActive = billing.subscription_status === "active";
  const isTrialing = billing.subscription_status === "trialing" && trialDays > 0;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>Billing</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 6 }}>
          Manage your subscription and billing details
        </p>
      </div>

      {/* Status Banner */}
      {isActive && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
          }}
        >
          <Check className="h-5 w-5 text-emerald-600" />
          <div>
            <p style={{ fontWeight: 600, color: "#065f46" }}>
              {PLANS[billing.subscription_plan].name} plan active
            </p>
            {billing.current_period_end && (
              <p style={{ fontSize: 13, color: "#047857", marginTop: 2 }}>
                Next billing date:{" "}
                {new Date(billing.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
          {billing.stripe_customer_id && (
            <button
              onClick={handlePortal}
              disabled={actionLoading === "portal"}
              style={{
                marginLeft: "auto",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: "#059669",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              {actionLoading === "portal" ? "Redirecting..." : "Manage Subscription"}
            </button>
          )}
        </div>
      )}

      {isTrialing && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            marginBottom: 32,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <Clock className="h-5 w-5 text-blue-600" />
            <p style={{ fontWeight: 600, color: "#1e40af" }}>
              Free trial: {trialDays} day{trialDays !== 1 ? "s" : ""} remaining
            </p>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 999,
              background: "#dbeafe",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: "#3b82f6",
                width: `${((14 - trialDays) / 14) * 100}%`,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      )}

      {billing.subscription_status === "past_due" && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#fef3c7",
            border: "1px solid #fcd34d",
          }}
        >
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p style={{ fontWeight: 600, color: "#92400e" }}>Payment failed</p>
            <p style={{ fontSize: 13, color: "#a16207", marginTop: 2 }}>
              Please update your payment method to keep your account active.
            </p>
          </div>
          {billing.stripe_customer_id && (
            <button
              onClick={handlePortal}
              style={{
                marginLeft: "auto",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: "#d97706",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Update Payment
            </button>
          )}
        </div>
      )}

      {/* Plans Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {(Object.entries(PLANS) as [SubscriptionPlan, (typeof PLANS)[SubscriptionPlan]][]).map(
          ([key, plan]) => {
            const Icon = PLAN_ICONS[key];
            const isCurrent = billing.subscription_plan === key;
            const isPro = key === "professional";

            return (
              <div
                key={key}
                style={{
                  position: "relative",
                  padding: 32,
                  borderRadius: 16,
                  border: isPro ? "2px solid #059669" : "1px solid #e5e7eb",
                  background: isPro ? "#f0fdf4" : "white",
                  boxShadow: isPro ? "0 8px 30px -8px rgba(5, 150, 105, 0.15)" : undefined,
                }}
              >
                {isPro && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "4px 16px",
                      borderRadius: 999,
                      background: "#059669",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isPro ? "#059669" : "#f3f4f6",
                    }}
                  >
                    <Icon size={20} color={isPro ? "white" : "#4b5563"} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                    {plan.name}
                  </h3>
                </div>

                <div style={{ marginTop: 20, display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: "#111827" }}>
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: 14, color: "#6b7280" }}>/month</span>
                  )}
                </div>

                <div style={{ marginTop: 24 }}>
                  {isCurrent && isActive ? (
                    <button
                      onClick={handlePortal}
                      disabled={!!actionLoading}
                      style={{
                        width: "100%",
                        padding: "12px 0",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        background: "#f3f4f6",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <CreditCard size={16} />
                      Manage Subscription
                    </button>
                  ) : key === "starter" ? (
                    <div
                      style={{
                        width: "100%",
                        padding: "12px 0",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        background: "#f9fafb",
                        color: "#9ca3af",
                        textAlign: "center",
                      }}
                    >
                      {isCurrent ? "Current Plan" : "Free Forever"}
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        handleCheckout(
                          key === "professional"
                            ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!
                            : process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID!,
                          key
                        )
                      }
                      disabled={!!actionLoading}
                      style={{
                        width: "100%",
                        padding: "12px 0",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        background: "#059669",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {actionLoading === key
                        ? "Redirecting..."
                        : isCurrent
                          ? "Renew"
                          : "Subscribe"}
                    </button>
                  )}
                </div>

                <ul style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}
                    >
                      <Check
                        size={16}
                        style={{
                          flexShrink: 0,
                          marginTop: 2,
                          color: isPro ? "#059669" : "#9ca3af",
                        }}
                      />
                      <span style={{ color: "#374151" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
