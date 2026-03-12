import Link from "next/link";
import { MapPin, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      {/* Animated 404 */}
      <div className="relative mb-8">
        <div className="text-[120px] font-black text-gray-100 leading-none sm:text-[180px]">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200">
            <MapPin className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-center text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
        >
          <Home size={16} />
          Go Home
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
        >
          <Search size={16} />
          Explore Services
        </Link>
      </div>
    </div>
  );
}
