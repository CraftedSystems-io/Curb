import Link from "next/link";
import { Check, Zap, Crown, Building2, ArrowRight, MapPin } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for getting started",
    icon: Zap,
    color: "emerald",
    features: [
      "Create your contractor profile",
      "Get discovered by nearby clients",
      "Accept up to 10 bookings/month",
      "Basic messaging",
      "Client reviews & ratings",
    ],
    cta: "Get Started",
    href: "/signup?role=contractor",
    popular: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "For growing service businesses",
    icon: Crown,
    color: "emerald",
    features: [
      "Everything in Starter",
      "Unlimited bookings",
      "Priority placement on map",
      "Portfolio photo gallery",
      "Analytics dashboard",
      "Quick invoicing",
      "Availability calendar",
      "Custom service pricing",
    ],
    cta: "Start Free Trial",
    href: "/signup?role=contractor",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$79",
    period: "/month",
    description: "For teams and larger operations",
    icon: Building2,
    color: "gray",
    features: [
      "Everything in Professional",
      "Multiple team members",
      "Advanced route optimization",
      "Custom branding",
      "API access",
      "Priority support",
      "White-label options",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    href: "/signup?role=contractor",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Curb</span>
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            Simple pricing, no surprises
          </span>
          <h1 className="mt-6 text-4xl font-black text-gray-900 sm:text-5xl">
            Grow your business
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              with the right plan
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Start free and scale as your business grows. No hidden fees,
            no long-term contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? "border-emerald-200 bg-emerald-50/30 shadow-xl shadow-emerald-100/50"
                  : "border-gray-200 bg-white"
              } p-8 transition-shadow hover:shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    plan.popular ? "bg-emerald-600" : "bg-gray-100"
                  }`}
                >
                  <plan.icon
                    className={`h-5 w-5 ${
                      plan.popular ? "text-white" : "text-gray-600"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {plan.name}
                </h3>
              </div>

              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-gray-500">{plan.period}</span>
                )}
              </div>

              <Link
                href={plan.href}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
                <ArrowRight size={14} />
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        plan.popular ? "text-emerald-600" : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Client section */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            For Clients: Always Free
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Discovering and booking service pros on Curb is completely free for
            homeowners. No fees, no subscriptions, no catches.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {[
              "Browse unlimited pros",
              "Real-time messaging",
              "Transparent pricing",
              "Verified reviews",
              "Instant booking",
              "Secure payments",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm"
              >
                <Check size={14} className="text-emerald-600" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <Link
            href="/signup?role=client"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
          >
            Sign Up Free
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 space-y-6">
            {[
              {
                q: "Can I try the Professional plan for free?",
                a: "Yes! We offer a 14-day free trial of the Professional plan. No credit card required to start.",
              },
              {
                q: "What happens when I reach the Starter plan limit?",
                a: "You can still receive bookings, but you won't be able to accept new ones until the next month. Upgrade anytime to remove limits.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. No contracts, no cancellation fees. Cancel from your dashboard at any time and keep using Curb until the end of your billing cycle.",
              },
              {
                q: "Do clients pay any fees?",
                a: "Never. Curb is completely free for clients. There are no booking fees, service fees, or hidden charges.",
              },
              {
                q: "How does payment processing work?",
                a: "We use Stripe for secure payment processing. Funds are deposited directly to your bank account within 2-3 business days.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-gray-200 p-6"
              >
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-emerald-600 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to grow your business?
          </h2>
          <p className="mt-4 text-emerald-100">
            Join thousands of service professionals already using Curb to find
            clients and manage their business.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-emerald-700 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
          >
            Get Started for Free
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
