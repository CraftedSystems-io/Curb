import Link from "next/link";
import {
  MapPin,
  Waves,
  TreePine,
  Sparkles,
  ArrowRight,
  Search,
  Calendar,
  Star,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  MessageCircle,
  ChevronRight,
  DollarSign,
  MapPinned,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// AnimatedCounter removed — no fake stats

const services = [
  {
    icon: Waves,
    title: "Pool Services",
    description:
      "Chemical balancing, skimming, filter maintenance, equipment repair, and resurfacing.",
    color: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    borderColor: "group-hover:border-blue-200",
    features: ["Weekly cleaning", "Chemical balance", "Equipment repair"],
  },
  {
    icon: TreePine,
    title: "Landscaping",
    description:
      "Professional lawn mowing, garden design, tree trimming, and irrigation systems.",
    color: "bg-green-50 text-green-600 group-hover:bg-green-100",
    borderColor: "group-hover:border-green-200",
    features: ["Lawn mowing", "Garden design", "Tree trimming"],
  },
  {
    icon: Sparkles,
    title: "Maid Services",
    description:
      "Standard cleaning, deep cleaning, and full move-in/move-out property cleaning.",
    color: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    borderColor: "group-hover:border-purple-200",
    features: ["Standard clean", "Deep clean", "Move-in/out"],
  },
];

const steps = [
  {
    icon: Search,
    title: "Browse the Map",
    description:
      "Open the explore page and see verified service professionals near your location in real time.",
  },
  {
    icon: Calendar,
    title: "Book Instantly",
    description:
      "Pick a service, choose a date, and send a booking request. Get responses in minutes, not days.",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description:
      "After the job is done, leave a review to help others find the best pros in their area.",
  },
];

const perks = [
  {
    icon: Shield,
    title: "Verified Pros",
    description: "Every contractor is vetted and verified before joining the platform.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "No phone tag. Book services in seconds with real-time availability.",
  },
  {
    icon: MessageCircle,
    title: "In-App Messaging",
    description: "Chat directly with your service pro. No need to share personal numbers.",
  },
  {
    icon: Clock,
    title: "Transparent Pricing",
    description: "See prices upfront before you book. No hidden fees, no surprises.",
  },
  {
    icon: TrendingUp,
    title: "Track Everything",
    description: "Real-time booking updates, service history, and spending insights.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Honest reviews from real customers help you pick the right pro every time.",
  },
];

const earlyAccessPerks = [
  {
    title: "Be First in Your Area",
    description: "Early adopters get priority placement and visibility as the platform grows in their neighborhood.",
  },
  {
    title: "Shape the Product",
    description: "Your feedback directly influences what we build next. Join our community of founding members.",
  },
  {
    title: "Lock in Free Access",
    description: "Sign up now and get free access to all features during our launch period. No credit card required.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-emerald-900/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Curb</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/90 hover:bg-white/10 hover:text-white"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="white"
                size="sm"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-700 pt-16">
        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-emerald-400 blur-[128px]" />
          <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-teal-400 blur-[128px]" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300 blur-[200px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-200 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live pros available in your area
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
              Home services,{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                reimagined
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-emerald-100/90 sm:text-xl">
              See verified pool, landscaping, and cleaning pros on a live map.
              Book instantly. Chat in-app. No more calling around.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/explore">
                <Button
                  variant="white"
                  size="lg"
                  className="group px-8 shadow-xl shadow-emerald-900/30"
                >
                  Find a Pro Near Me
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/signup?role=contractor">
                <Button
                  size="lg"
                  variant="white-outline"
                >
                  Join as a Contractor
                </Button>
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-emerald-200/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm">Free to browse</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm">Verified professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm">Real-time availability</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative -mb-1">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path
              d="M0 80h1440V30c-200 30-400 50-720 50S200 60 0 30v50z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Two-Audience Value Prop — Immediately shows what Curb does for BOTH sides */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* For Homeowners */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 transition-all hover:shadow-xl sm:p-10">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-100/50 blur-2xl transition-all group-hover:bg-emerald-200/60" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  <MapPinned className="h-3.5 w-3.5" />
                  For Homeowners
                </div>
                <h3 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Book a pro in under 60 seconds
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  No more calling around or waiting for callbacks. Open the map, see who&apos;s nearby, pick a service, and book — all from your phone.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Live map of pros near you", "Transparent prices upfront", "In-app messaging & tracking", "Verified reviews you can trust"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/explore">
                    <Button variant="primary" className="group/btn">
                      Browse Pros Near Me
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* For Contractors */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 transition-all hover:shadow-xl sm:p-10">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-100/50 blur-2xl transition-all group-hover:bg-amber-200/60" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
                  <DollarSign className="h-3.5 w-3.5" />
                  For Contractors
                </div>
                <h3 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Fill your schedule, grow your revenue
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Stop chasing leads. Curb puts you on the map — literally. Nearby homeowners find you, book you, and pay you. All from one dashboard.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Get discovered by nearby clients", "Fill dead time between jobs", "Manage bookings & routes", "Get paid faster, grow faster"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/signup?role=contractor">
                    <Button className="bg-amber-500 text-white hover:bg-amber-600 group/btn">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6">
          {[
            { icon: "🗺️", label: "Live Map Discovery" },
            { icon: "⚡", label: "Instant Booking" },
            { icon: "💬", label: "In-App Messaging" },
            { icon: "⭐", label: "Verified Reviews" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-3xl sm:text-4xl">{item.icon}</p>
              <p className="mt-2 text-sm font-medium text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Booked in 3 simple steps
            </h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+40px)] top-8 hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-emerald-300 to-transparent sm:block" />
                )}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Our Services
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Three industries, one platform
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-600">
              Whether you need your pool sparkling, your lawn pristine, or your
              home spotless — Curb connects you with the best.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className={`group rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-xl ${service.borderColor}`}
              >
                <div
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${service.color}`}
                >
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {service.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {service.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/explore"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Browse Pros
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Curb */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Why Curb
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Built for the way you live
            </h2>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="flex gap-4 rounded-xl border border-gray-100 p-6 transition-all hover:border-emerald-100 hover:bg-emerald-50/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <perk.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{perk.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Now Launching
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Get in early
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-600">
              Curb is launching now. Be among the first homeowners and service professionals to join the platform in your area.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {earlyAccessPerks.map((perk) => (
              <div
                key={perk.title}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {perk.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {perk.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contractor CTA */}
      <section className="relative overflow-hidden bg-emerald-900 py-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-emerald-400 blur-[200px]" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-teal-400 blur-[150px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
            For Contractors
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
            Grow your business with Curb
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-200">
            Fill your empty time slots, pick up new recurring clients, and manage your
            entire operation from one dashboard. No more missed calls.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { metric: "📍", label: "Appear on the live map" },
              { metric: "📅", label: "Manage your schedule" },
              { metric: "💼", label: "Grow your client base" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-emerald-700/50 bg-emerald-800/50 p-6 backdrop-blur"
              >
                <p className="text-2xl">{item.metric}</p>
                <p className="mt-1 text-sm text-emerald-300">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/signup?role=contractor">
              <Button
                variant="white"
                size="lg"
                className="px-10 shadow-xl shadow-emerald-900/50"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join homeowners and service pros discovering a better way to connect.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="px-10 shadow-lg shadow-emerald-500/20">
                Create Free Account
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="secondary">
                Browse the Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Curb</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <Link href="/explore" className="hover:text-gray-900">
                Explore
              </Link>
              <Link
                href="/signup?role=contractor"
                className="hover:text-gray-900"
              >
                For Contractors
              </Link>
              <Link href="/login" className="hover:text-gray-900">
                Log In
              </Link>
              <Link href="/privacy" className="hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-900">
                Terms of Service
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              Built by Crafted Systems
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
