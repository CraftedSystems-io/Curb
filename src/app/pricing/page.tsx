"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Crown, Building2, ArrowRight, MapPin } from "lucide-react";

const plans = [
  {
    key: "starter" as const,
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For solo contractors getting started",
    icon: Zap,
    features: [
      "Contractor profile + map presence",
      "Up to 50 bookings per month",
      "1 team",
      "Basic messaging",
      "Client reviews and ratings",
      "Basic invoicing",
    ],
    cta: "Start 14 Day Free Trial",
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
  },
  {
    key: "professional" as const,
    name: "Pro",
    price: "$59",
    period: "/month",
    description: "For growing contractor teams",
    icon: Crown,
    features: [
      "Everything in Starter",
      "Unlimited bookings",
      "Up to 5 teams",
      "Priority map placement",
      "Portfolio photo gallery",
      "Estimates and quick invoicing",
      "Availability calendar",
      "Analytics dashboard",
    ],
    cta: "Start 14 Day Free Trial",
    popular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
  {
    key: "enterprise" as const,
    name: "Max",
    price: "$99",
    period: "/month",
    description: "For established contractor businesses",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Unlimited teams",
      "Route optimization",
      "Custom branding",
      "API access",
      "Priority support",
      "White label options",
      "Dedicated account manager",
    ],
    cta: "Start 14 Day Free Trial",
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(priceId: string, key: string) {
    setLoading(key);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout", priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/signup?role=contractor";
      }
    } catch {
      window.location.href = "/signup?role=contractor";
    }
    setLoading(null);
  }

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid #e5e7eb",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            height: 64,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPin size={20} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>Curb</span>
          </Link>
          <Link
            href="/signup"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "#059669",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      <section style={{ padding: "64px 24px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-flex",
              padding: "6px 16px",
              borderRadius: 999,
              background: "#ecfdf5",
              fontSize: 14,
              fontWeight: 500,
              color: "#047857",
            }}
          >
            14 day free trial on every plan
          </span>
          <h1 style={{ marginTop: 24, fontSize: 48, fontWeight: 900, color: "#111827", lineHeight: 1.1 }}>
            Find more jobs,
            <br />
            <span className="gradient-text">get paid faster</span>
          </h1>
          <p style={{ margin: "16px auto 0", maxWidth: 560, fontSize: 18, color: "#6b7280", lineHeight: 1.6 }}>
            Contractors set their service area, show up on the map, and close more jobs.
            Start your 14 day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                style={{
                  position: "relative",
                  padding: 32,
                  borderRadius: 20,
                  border: plan.popular ? "2px solid #059669" : "1px solid #e5e7eb",
                  background: plan.popular ? "rgba(236, 253, 245, 0.3)" : "white",
                  boxShadow: plan.popular ? "0 8px 30px -8px rgba(5, 150, 105, 0.15)" : undefined,
                  transition: "box-shadow 0.2s",
                }}
              >
                {plan.popular && (
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
                      background: plan.popular ? "#059669" : "#f3f4f6",
                    }}
                  >
                    <Icon size={20} color={plan.popular ? "white" : "#4b5563"} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{plan.name}</h3>
                </div>

                <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>{plan.description}</p>

                <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: "#111827" }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "#6b7280" }}>{plan.period}</span>
                </div>

                <button
                  onClick={() => plan.priceId && handleSubscribe(plan.priceId, plan.key)}
                  disabled={loading === plan.key || !plan.priceId}
                  style={{
                    marginTop: 24,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px 0",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: plan.priceId ? "pointer" : "not-allowed",
                    background: plan.popular ? "#059669" : "#f3f4f6",
                    color: plan.popular ? "white" : "#374151",
                    opacity: plan.priceId ? 1 : 0.5,
                  }}
                >
                  {loading === plan.key ? "Redirecting..." : plan.cta}
                  {loading !== plan.key && <ArrowRight size={14} />}
                </button>

                <ul style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
                  {plan.features.map((feature) => (
                    <li key={feature} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <Check
                        size={16}
                        style={{
                          flexShrink: 0,
                          marginTop: 2,
                          color: plan.popular ? "#059669" : "#9ca3af",
                        }}
                      />
                      <span style={{ fontSize: 14, color: "#374151" }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ borderTop: "1px solid #f3f4f6", background: "#f9fafb", padding: "64px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>
            For Homeowners: Always Free
          </h2>
          <p style={{ marginTop: 16, fontSize: 18, color: "#6b7280", lineHeight: 1.6 }}>
            Finding and booking trusted service pros on Curb is completely free for
            homeowners. No fees, no subscriptions, no catches.
          </p>
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            {[
              "Browse unlimited pros",
              "Real time messaging",
              "Transparent pricing",
              "Verified reviews",
              "Instant booking",
              "Secure payments",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "white",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Check size={14} color="#059669" />
                <span style={{ fontSize: 14, color: "#374151" }}>{item}</span>
              </div>
            ))}
          </div>
          <Link
            href="/signup?role=client"
            style={{
              marginTop: 32,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              borderRadius: 12,
              background: "#059669",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign Up Free
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: "#111827" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              {
                q: "Is there really a 14 day free trial?",
                a: "Yes. Every plan starts with a 14 day free trial. Your card is collected upfront but not charged until the trial ends. Cancel anytime during the trial at no cost.",
              },
              {
                q: "Can I switch plans later?",
                a: "Yes. Upgrade or downgrade anytime from your billing dashboard. Prorated charges and credits are handled automatically.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. No contracts, no cancellation fees. Cancel from your dashboard at any time and keep using Curb until the end of your billing cycle.",
              },
              {
                q: "Do homeowners pay any fees?",
                a: "Never. Curb is completely free for homeowners. There are no booking fees, service fees, or hidden charges.",
              },
              {
                q: "How does payment processing work?",
                a: "We use Stripe for secure payment processing. Funds are deposited directly to your bank account within 2 to 3 business days.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                style={{
                  padding: 24,
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{faq.q}</h3>
                <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#059669", padding: "64px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "white" }}>
            Ready to grow your business?
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, color: "#a7f3d0", lineHeight: 1.6 }}>
            Join contractors already using Curb to find homeowners
            and run their business.
          </p>
          <Link
            href="/signup?role=contractor"
            style={{
              marginTop: 32,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 12,
              background: "white",
              color: "#065f46",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Start 14 Day Free Trial
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
