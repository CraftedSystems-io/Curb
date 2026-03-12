"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>

      <h1 className="mt-6 text-2xl font-bold text-gray-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-center text-gray-500">
        An unexpected error occurred. Our team has been notified and is working
        on a fix.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
        >
          <RotateCcw size={16} />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
        >
          <Home size={16} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
